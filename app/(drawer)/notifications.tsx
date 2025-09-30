import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Bell, 
  BellOff, 
  AlertCircle, 
  CheckCircle, 
  Info, 
  AlertTriangle,
  Clock,
  Trash2,
  Check
} from 'lucide-react-native';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { router } from 'expo-router';
import { getThemeColors } from '../../constants/colors';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}

const NOTIFICATIONS_KEY = '@notifications';

export default function NotificationsScreen() {
  const { user, loading: authLoading } = useAuth();
  const { state } = useApp();
  const { 
    notifications, 
    loadNotifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isDarkMode = state.preferences.darkMode;
  const colors = getThemeColors(isDarkMode);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth/login');
      return;
    }

    if (user) {
      loadNotificationsData();
    }
  }, [user, authLoading]);

  const loadNotificationsData = async () => {
    try {
      setLoading(true);
      await loadNotifications();
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const getNotificationIcon = (type: string) => {
    const iconProps = { size: 20 };
    
    switch (type) {
      case 'warning':
        return <AlertTriangle {...iconProps} color="#f59e0b" />;
      case 'error':
        return <AlertCircle {...iconProps} color="#ef4444" />;
      case 'success':
        return <CheckCircle {...iconProps} color="#10b981" />;
      case 'info':
      default:
        return <Info {...iconProps} color="#3b82f6" />;
    }
  };


  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  // Show loading screen while checking authentication
  if (authLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    return null;
  }

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationCard,
        isDarkMode && styles.notificationCardDark,
        !item.isRead && styles.unreadNotification,
        !item.isRead && isDarkMode && styles.unreadNotificationDark,
      ]}
      onPress={() => {
        if (!item.isRead) {
          markAsRead(item.id);
        }
      }}
      activeOpacity={0.7}
    >
      <View style={styles.notificationHeader}>
        <View style={styles.notificationIcon}>
          {getNotificationIcon(item.type)}
        </View>
        <View style={styles.notificationContent}>
          <View style={styles.notificationTitleRow}>
            <Text style={[styles.notificationTitle, isDarkMode && styles.notificationTitleDark]}>
              {item.title}
            </Text>
            {!item.isRead && <View style={styles.unreadDot} />}
          </View>
          <Text style={[styles.notificationMessage, isDarkMode && styles.notificationMessageDark]}>
            {item.message}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteNotification(item.id)}
        >
          <Trash2 size={16} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.notificationFooter}>
        <View style={styles.timestampContainer}>
          <Clock size={12} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
          <Text style={[styles.timestamp, isDarkMode && styles.timestampDark]}>
            {formatTimestamp(item.timestamp)}
          </Text>
        </View>
        {!item.isRead && (
          <TouchableOpacity
            style={[styles.markReadButton, isDarkMode && styles.markReadButtonDark]}
            onPress={() => markAsRead(item.id)}
          >
            <Check size={12} color={colors.primary} />
            <Text style={[styles.markReadText, { color: colors.primary }]}>Mark as read</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={[styles.emptyState, isDarkMode && styles.emptyStateDark]}>
      <BellOff size={64} color={isDarkMode ? '#6b7280' : '#9ca3af'} />
      <Text style={[styles.emptyStateTitle, isDarkMode && styles.emptyStateTitleDark]}>
        No Notifications
      </Text>
      <Text style={[styles.emptyStateText, isDarkMode && styles.emptyStateTextDark]}>
        You're all caught up! New notifications will appear here.
      </Text>
    </View>
  );

  const renderHeader = () => {
    const unreadCount = notifications.filter(n => !n.isRead).length;
    
    return (
      <View style={[styles.header, isDarkMode && styles.headerDark]}>
        <View style={styles.headerContent}>
          <Text style={[styles.headerSubtitle, isDarkMode && styles.headerSubtitleDark]}>
            {unreadCount} {unreadCount === 1 ? 'unread' : 'unread'} notification{unreadCount !== 1 ? 's' : ''}
          </Text>
        </View>
        
        {unreadCount > 0 && (
          <TouchableOpacity
            style={[styles.markAllReadButton, isDarkMode && styles.markAllReadButtonDark]}
            onPress={markAllAsRead}
          >
            <Check size={16} color={colors.primary} />
            <Text style={[styles.markAllReadText, { color: colors.primary }]}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, isDarkMode && styles.loadingTextDark]}>Loading notifications...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={isDarkMode ? "#111827" : "#ffffff"}
      />

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  containerDark: {
    backgroundColor: '#111827',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  loadingTextDark: {
    color: '#9ca3af',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerDark: {
    backgroundColor: '#1f2937',
    borderBottomColor: '#374151',
  },
  headerContent: {
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerTitleDark: {
    color: '#f9fafb',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  headerSubtitleDark: {
    color: '#9ca3af',
  },
  markAllReadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  markAllReadButtonDark: {
    backgroundColor: '#1e40af',
    borderColor: '#3b82f6',
  },
  markAllReadText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  listContent: {
    paddingBottom: 20,
  },
  notificationCard: {
    marginHorizontal: 16,
    marginVertical: 4,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  notificationCardDark: {
    backgroundColor: '#1f2937',
    shadowOpacity: 0.3,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
    backgroundColor: '#f8fafc',
  },
  unreadNotificationDark: {
    backgroundColor: '#111827',
    borderLeftColor: '#60a5fa',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  notificationIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  notificationTitleDark: {
    color: '#f9fafb',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563eb',
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  notificationMessageDark: {
    color: '#9ca3af',
  },
  deleteButton: {
    padding: 4,
    marginLeft: 8,
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#9ca3af',
  },
  timestampDark: {
    color: '#6b7280',
  },
  markReadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  markReadButtonDark: {
    backgroundColor: '#1e40af',
  },
  markReadText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#2563eb',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyStateDark: {
    // Dark mode styles
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateTitleDark: {
    color: '#d1d5db',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  emptyStateTextDark: {
    color: '#9ca3af',
  },
});
