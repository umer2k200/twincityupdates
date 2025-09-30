import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}

interface NotificationContextType {
  unreadCount: number;
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  loadNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const NOTIFICATIONS_KEY = '@notifications';

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    const count = notifications.filter(n => !n.isRead).length;
    setUnreadCount(count);
  }, [notifications]);

  const loadNotifications = async () => {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setNotifications(parsed);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const saveNotifications = async (notifs: Notification[]) => {
    try {
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifs));
      setNotifications(notifs);
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  };

  const addNotification = async (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    
    const updated = [newNotification, ...notifications];
    await saveNotifications(updated);
  };

  const markAsRead = async (id: string) => {
    const updated = notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    );
    await saveNotifications(updated);
  };

  const markAllAsRead = async () => {
    const updated = notifications.map(n => ({ ...n, isRead: true }));
    await saveNotifications(updated);
  };

  const deleteNotification = async (id: string) => {
    const updated = notifications.filter(n => n.id !== id);
    await saveNotifications(updated);
  };

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        notifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        loadNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};
