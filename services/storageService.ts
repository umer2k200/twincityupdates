import AsyncStorage from '@react-native-async-storage/async-storage';
import { SocialUpdate } from './apiService';

const STORAGE_KEYS = {
  CACHED_UPDATES: 'cached_updates',
  LAST_REFRESH: 'last_refresh',
  USER_PREFERENCES: 'user_preferences',
};

export interface UserPreferences {
  darkMode: boolean;
  pushNotifications: boolean;
  offlineMode: boolean;
  autoRefresh: boolean;
  refreshInterval: number; // in minutes
}

const defaultPreferences: UserPreferences = {
  darkMode: false,
  pushNotifications: true,
  offlineMode: true,
  autoRefresh: true,
  refreshInterval: 5,
};

class StorageService {
  // Cache updates for offline mode
  async cacheUpdates(updates: SocialUpdate[]): Promise<void> {
    try {
      // Keep only the latest 20 updates for storage efficiency
      const latestUpdates = updates.slice(0, 20);
      await AsyncStorage.setItem(STORAGE_KEYS.CACHED_UPDATES, JSON.stringify(latestUpdates));
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_REFRESH, new Date().toISOString());
    } catch (error) {
      console.error('Error caching updates:', error);
    }
  }

  // Get cached updates
  async getCachedUpdates(): Promise<SocialUpdate[]> {
    try {
      const cachedData = await AsyncStorage.getItem(STORAGE_KEYS.CACHED_UPDATES);
      return cachedData ? JSON.parse(cachedData) : [];
    } catch (error) {
      console.error('Error getting cached updates:', error);
      return [];
    }
  }

  // Get last refresh time
  async getLastRefreshTime(): Promise<Date | null> {
    try {
      const lastRefresh = await AsyncStorage.getItem(STORAGE_KEYS.LAST_REFRESH);
      return lastRefresh ? new Date(lastRefresh) : null;
    } catch (error) {
      console.error('Error getting last refresh time:', error);
      return null;
    }
  }

  // Save user preferences
  async saveUserPreferences(preferences: UserPreferences): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving user preferences:', error);
    }
  }

  // Get user preferences
  async getUserPreferences(): Promise<UserPreferences> {
    try {
      const preferences = await AsyncStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      return preferences ? JSON.parse(preferences) : defaultPreferences;
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return defaultPreferences;
    }
  }

  // Clear all cached data
  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.CACHED_UPDATES,
        STORAGE_KEYS.LAST_REFRESH,
      ]);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  // Get cache size (for display in settings)
  async getCacheSize(): Promise<string> {
    try {
      const cachedData = await AsyncStorage.getItem(STORAGE_KEYS.CACHED_UPDATES);
      if (!cachedData) return '0 KB';
      
      const sizeInBytes = new Blob([cachedData]).size;
      const sizeInKB = Math.round(sizeInBytes / 1024);
      
      if (sizeInKB < 1024) {
        return `${sizeInKB} KB`;
      } else {
        return `${Math.round(sizeInKB / 1024 * 10) / 10} MB`;
      }
    } catch (error) {
      console.error('Error calculating cache size:', error);
      return '0 KB';
    }
  }
}

export const storageService = new StorageService();