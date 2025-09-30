import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bookmark, BookmarkCheck, Trash2, Share2 } from 'lucide-react-native';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { UpdateCard } from '../../components/UpdateCard';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SAVED_NEWS_KEY = 'saved_news';

export default function SavedNewsScreen() {
  const { user, loading: authLoading } = useAuth();
  const { state } = useApp();
  const [savedNews, setSavedNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isDarkMode = state.preferences.darkMode;

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth/login');
      return;
    }

    if (user) {
      loadSavedNews();
    }
  }, [user, authLoading]);

  const loadSavedNews = async () => {
    try {
      setLoading(true);
      const savedData = await AsyncStorage.getItem(SAVED_NEWS_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setSavedNews(parsedData);
      }
    } catch (error) {
      console.error('Error loading saved news:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromSaved = async (newsId: string) => {
    Alert.alert(
      'Remove from Saved',
      'Are you sure you want to remove this news from your saved items?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedSaved = savedNews.filter(news => news.id !== newsId);
              setSavedNews(updatedSaved);
              await AsyncStorage.setItem(SAVED_NEWS_KEY, JSON.stringify(updatedSaved));
            } catch (error) {
              console.error('Error removing saved news:', error);
              Alert.alert('Error', 'Failed to remove news from saved items');
            }
          }
        },
      ]
    );
  };

  const clearAllSaved = () => {
    Alert.alert(
      'Clear All Saved News',
      'Are you sure you want to remove all saved news? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              setSavedNews([]);
              await AsyncStorage.removeItem(SAVED_NEWS_KEY);
            } catch (error) {
              console.error('Error clearing saved news:', error);
              Alert.alert('Error', 'Failed to clear saved news');
            }
          }
        },
      ]
    );
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

  const renderSavedCard = ({ item }: { item: any }) => (
    <View style={styles.cardContainer}>
      <UpdateCard
        update={item}
        isDarkMode={isDarkMode}
        onPress={() => {
          // Navigate to news detail screen
          router.push({
            pathname: '/(drawer)/news-detail',
            params: {
              newsData: JSON.stringify(item)
            }
          });
        }}
      />
      
      {/* Action buttons */}
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.removeButton]}
          onPress={() => removeFromSaved(item.id)}
        >
          <Trash2 size={16} color="#ef4444" />
          <Text style={styles.removeButtonText}>Remove</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.shareButton]}
          onPress={async () => {
            try {
              const { Share } = await import('react-native');
              const shareContent = {
                title: item.title || 'Twin City Updates',
                message: `${item.title}\n\n${item.content}\n\nSource: ${item.source}\nTime: ${item.timestamp}\n\nShared from Twin City Updates app`,
                url: item.mediaUrl || 'https://twincityupdates.com'
              };

              const result = await Share.share(shareContent);
              
              if (result.action === Share.sharedAction) {
                console.log('Content shared successfully');
              } else if (result.action === Share.dismissedAction) {
                console.log('Share dismissed');
              }
            } catch (error) {
              console.error('Error sharing content:', error);
              Alert.alert('Error', 'Failed to share content. Please try again.');
            }
          }}
        >
          <Share2 size={16} color="#2563eb" />
          <Text style={styles.shareButtonText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={[styles.emptyState, isDarkMode && styles.emptyStateDark]}>
      <Bookmark size={64} color={isDarkMode ? '#6b7280' : '#9ca3af'} />
      <Text style={[styles.emptyStateTitle, isDarkMode && styles.emptyStateTitleDark]}>
        No Saved News
      </Text>
      <Text style={[styles.emptyStateText, isDarkMode && styles.emptyStateTextDark]}>
        News you save from the home screen will appear here
      </Text>
      <TouchableOpacity
        style={[styles.browseButton, isDarkMode && styles.browseButtonDark]}
        onPress={() => router.navigate('/(drawer)')}
      >
        <Text style={[styles.browseButtonText, isDarkMode && styles.browseButtonTextDark]}>
          Browse News
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={[styles.header, isDarkMode && styles.headerDark]}>
      <View style={styles.headerContent}>
        <Text style={[styles.headerSubtitle, isDarkMode && styles.headerSubtitleDark]}>
          {savedNews.length} {savedNews.length === 1 ? 'item' : 'items'} saved
        </Text>
      </View>
      
      {savedNews.length > 0 && (
        <TouchableOpacity
          style={[styles.clearButton, isDarkMode && styles.clearButtonDark]}
          onPress={clearAllSaved}
        >
          <Trash2 size={16} color="#ef4444" />
          <Text style={styles.clearButtonText}>Clear All</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading saved news...</Text>
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
        data={savedNews}
        renderItem={renderSavedCard}
        keyExtractor={(item) => item.id}
        // ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
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
  header: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerDark: {
    backgroundColor: '#1f2937',
    borderBottomColor: '#374151',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  clearButtonDark: {
    backgroundColor: '#374151',
    borderColor: '#4b5563',
  },
  clearButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
  },
  listContent: {
    paddingBottom: 20,
  },
  cardContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  removeButton: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  removeButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
  },
  shareButton: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  shareButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
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
    marginBottom: 24,
  },
  emptyStateTextDark: {
    color: '#9ca3af',
  },
  browseButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  browseButtonDark: {
    backgroundColor: '#1e40af',
  },
  browseButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  browseButtonTextDark: {
    color: '#f9fafb',
  },
});
