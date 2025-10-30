import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SocialUpdate } from './apiService';

// Storage key aligned with NotificationContext
const NOTIFICATIONS_KEY = '@notifications';

export type InboxNotification = {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  isRead: boolean;
  actionUrl?: string;
  timestamp: string;
};

export async function initNotifications(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const settings = await Notifications.getPermissionsAsync();
  if (!settings.granted) {
    await Notifications.requestPermissionsAsync();
  }
}

export async function sendLocalNotification(title: string, body: string, data?: any): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: { title, body, data },
    trigger: null,
  });
}

export async function addToInbox(title: string, message: string, type: InboxNotification['type'], actionUrl?: string): Promise<void> {
  const newNotif: InboxNotification = {
    id: Date.now().toString(),
    title,
    message,
    type,
    isRead: false,
    actionUrl,
    timestamp: new Date().toISOString(),
  };

  const stored = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
  const list: InboxNotification[] = stored ? JSON.parse(stored) : [];
  list.unshift(newNotif);
  await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(list));
}

export function buildNotificationFromUpdate(update: SocialUpdate): { title: string; message: string; type: InboxNotification['type'] } {
  const isEmergency = update.category === 'emergencies';
  const isTraffic = update.category === 'traffic';

  const title = isEmergency ? 'Emergency Alert' : isTraffic ? 'Traffic Update' : 'New Update';
  const message = update.title || update.content;
  const type: InboxNotification['type'] = isEmergency ? 'error' : isTraffic ? 'warning' : 'info';
  return { title, message, type };
}

export async function notifyOnNewUpdates(previous: SocialUpdate[], current: SocialUpdate[]): Promise<void> {
  const prevIds = new Set(previous.map(u => u.id));
  const newlyAdded = current.filter(u => !prevIds.has(u.id));

  for (const u of newlyAdded) {
    if (u.category === 'emergencies' || u.category === 'traffic') {
      const { title, message, type } = buildNotificationFromUpdate(u);
      await sendLocalNotification(title, message, { id: u.id, sourceUrl: u.sourceUrl });
      await addToInbox(title, message, type, u.sourceUrl);
    }
  }
}


