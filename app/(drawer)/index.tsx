import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  ActivityIndicator,
  SectionList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  Wifi, 
  WifiOff,
  AlertCircle
} from 'lucide-react-native';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { UpdateCard } from '../../components/UpdateCard';
import { SearchBar } from '../../components/SearchBar';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getThemeColors } from '../../constants/colors';

const SAVED_NEWS_KEY = 'saved_news';

export default function HomeScreen() {
  const { user, loading: authLoading } = useAuth();
  const { 
    state, 
    fetchUpdates, 
    refreshUpdates, 
    setSearchQuery, 
    setActiveFilter 
  } = useApp();
  const { t } = useLanguage();
  
  const [showFilters, setShowFilters] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [savedNewsIds, setSavedNewsIds] = useState<Set<string>>(new Set());
  const [newsVisible, setNewsVisible] = useState(10);
  const [tweetsVisible, setTweetsVisible] = useState(10);
  
  const isDarkMode = state.preferences.darkMode;
  const colors = getThemeColors(isDarkMode);
  
  // Category options
  const categories = [
    { id: 'all', name: 'All', icon: '📱' },
    { id: 'traffic', name: 'Traffic', icon: '🚗' },
    { id: 'travel', name: 'Travel', icon: '✈️' },
    { id: 'event', name: 'Events', icon: '🎉' },
    { id: 'emergencies', name: 'Emergencies', icon: '🚨' },
    { id: 'weather', name: 'Weather', icon: '🌤️' },
    { id: 'news', name: 'News', icon: '📰' },
    { id: 'community', name: 'Community', icon: '👥' },
    { id: 'business', name: 'Business', icon: '💼' },
  ];
  
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth/login');
      return;
    }
    
    if (user) {
      fetchUpdates();
      loadSavedNewsIds();
    }
  }, [user, authLoading]);

  const loadSavedNewsIds = async () => {
    try {
      const savedData = await AsyncStorage.getItem(SAVED_NEWS_KEY);
      if (savedData) {
        const savedNews = JSON.parse(savedData);
        const ids = new Set<string>(savedNews.map((news: any) => news.id));
        setSavedNewsIds(ids);
      }
    } catch (error) {
      console.error('Error loading saved news IDs:', error);
    }
  };


  const handleSaveNews = async (newsItem: any) => {
    try {
      const isCurrentlySaved = savedNewsIds.has(newsItem.id);
      
      if (isCurrentlySaved) {
        // Remove from saved
        const savedData = await AsyncStorage.getItem(SAVED_NEWS_KEY);
        if (savedData) {
          const savedNews = JSON.parse(savedData);
          const updatedSaved = savedNews.filter((news: any) => news.id !== newsItem.id);
          await AsyncStorage.setItem(SAVED_NEWS_KEY, JSON.stringify(updatedSaved));
        }
        
        // Update local state
        const newSavedIds = new Set(savedNewsIds);
        newSavedIds.delete(newsItem.id);
        setSavedNewsIds(newSavedIds);
      } else {
        // Add to saved
        const savedData = await AsyncStorage.getItem(SAVED_NEWS_KEY);
        const savedNews = savedData ? JSON.parse(savedData) : [];
        savedNews.push(newsItem);
        await AsyncStorage.setItem(SAVED_NEWS_KEY, JSON.stringify(savedNews));
        
        // Update local state
        const newSavedIds = new Set(savedNewsIds);
        newSavedIds.add(newsItem.id);
        setSavedNewsIds(newSavedIds);
      }
    } catch (error) {
      console.error('Error saving/unsaving news:', error);
    }
  };
  
  // Show loading screen while checking authentication
  if (authLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }
  
  // Redirect if not authenticated
  if (!user) {
    return null;
  }

  const handleRefresh = async () => {
    await refreshUpdates();
    // reset pagination on refresh
    setNewsVisible(10);
    setTweetsVisible(10);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    setShowFilters(false);
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setShowCategories(false);
  };

  const renderUpdateCard = ({ item }: { item: any }) => (
    <UpdateCard 
      update={item} 
      isDarkMode={isDarkMode}
      showSaveButton={true}
      isSaved={savedNewsIds.has(item.id)}
      onPress={() => {
        // Navigate to news detail screen
        router.push({
          pathname: '/(drawer)/news-detail',
          params: {
            newsData: JSON.stringify(item)
          }
        });
      }}
      onSave={() => handleSaveNews(item)}
    />
  );

  const renderEmptyState = () => (
    <View style={[styles.emptyState, isDarkMode && styles.emptyStateDark]}>
      <AlertCircle size={48} color={isDarkMode ? '#6b7280' : '#9ca3af'} />
      <Text style={[styles.emptyStateTitle, isDarkMode && styles.emptyStateTitleDark]}>
        No Updates Found
      </Text>
      <Text style={[styles.emptyStateText, isDarkMode && styles.emptyStateTextDark]}>
        {state.searchQuery 
          ? 'Try adjusting your search terms or filters'
          : 'Pull down to refresh or check your connection'
        }
      </Text>
    </View>
  );


  const renderHeader = () => (
    <View style={styles.header}>
      {/* <Text style={[styles.headerTitle, isDarkMode && styles.headerTitleDark]}>
        Twin City Updatesss
      </Text>
      <Text style={[styles.headerSubtitle, isDarkMode && styles.headerSubtitleDark]}>
        Stay connected with your community
      </Text> */}
      
      <SearchBar
        value={state.searchQuery}
        onChangeText={handleSearch}
        placeholder="Search updates and articles..."
        isDarkMode={isDarkMode}
      />
      
      <View style={styles.filterContainer}>
        <View style={styles.filterButtons}>
          <TouchableOpacity 
            style={[styles.filterButton, isDarkMode && styles.filterButtonDark]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} color={isDarkMode ? '#f9fafb' : '#374151'} />
            <Text style={[styles.filterButtonText, isDarkMode && styles.filterButtonTextDark]}>
              Source
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.filterButton, isDarkMode && styles.filterButtonDark]}
            onPress={() => setShowCategories(!showCategories)}
          >
            <Text style={[styles.filterButtonText, isDarkMode && styles.filterButtonTextDark]}>
              📱
            </Text>
            <Text style={[styles.filterButtonText, isDarkMode && styles.filterButtonTextDark]}>
              {t('home.categories')}
            </Text>
          </TouchableOpacity>
        </View>
        
        {state.isOffline && (
          <View style={styles.offlineIndicator}>
            <WifiOff size={16} color="#ef4444" />
            <Text style={styles.offlineText}>Offline</Text>
          </View>
        )}
      </View>
      
      {showFilters && (
        <View style={[styles.filters, isDarkMode && styles.filtersDark]}>
          {['all', 'news', 'twitter'].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterOption,
                state.activeFilter === filter && styles.filterOptionActive,
                isDarkMode && styles.filterOptionDark,
                state.activeFilter === filter && isDarkMode && styles.filterOptionActiveDark
              ]}
              onPress={() => handleFilterChange(filter)}
            >
              <Text style={[
                styles.filterOptionText,
                state.activeFilter === filter && styles.filterOptionTextActive,
                isDarkMode && styles.filterOptionTextDark,
                state.activeFilter === filter && isDarkMode && styles.filterOptionTextActiveDark
              ]}>
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      
      {showCategories && (
        <View style={[styles.categoryFilters, isDarkMode && styles.categoryFiltersDark]}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryOption,
                activeCategory === category.id && styles.categoryOptionActive,
                isDarkMode && styles.categoryOptionDark,
                activeCategory === category.id && isDarkMode && styles.categoryOptionActiveDark
              ]}
              onPress={() => handleCategoryChange(category.id)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={[
                styles.categoryOptionText,
                activeCategory === category.id && styles.categoryOptionTextActive,
                isDarkMode && styles.categoryOptionTextDark,
                activeCategory === category.id && isDarkMode && styles.categoryOptionTextActiveDark
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const renderFooter = () => {
    if (state.loading) {
      return (
        <View style={styles.loadingFooter}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.loadingFooterText, isDarkMode && styles.loadingTextDark]}>
            Loading updates...
          </Text>
        </View>
      );
    }
    
    if (state.lastRefreshTime) {
      return (
        <View style={styles.footer}>
          <Text style={[styles.footerText, isDarkMode && styles.footerTextDark]}>
            Last updated: {state.lastRefreshTime.toLocaleTimeString()}
          </Text>
        </View>
      );
    }
    
    return null;
  };

  // Split data per section and counts
  const newsAll = state.filteredUpdates.filter((u: any) => u.source === 'news');
  const tweetsAll = state.filteredUpdates.filter((u: any) => u.source === 'twitter');
  const sections = [
    { title: `News (${newsAll.length})`, key: 'news', total: newsAll.length, data: newsAll.slice(0, newsVisible) },
    { title: `Tweets (${tweetsAll.length})`, key: 'tweets', total: tweetsAll.length, data: tweetsAll.slice(0, tweetsVisible) },
  ].filter(section => section.data.length > 0 || section.total > 0);

  const renderSectionFooter = ({ section }: any) => {
    const isNews = section.key === 'news';
    const visible = isNews ? newsVisible : tweetsVisible;
    if (visible >= section.total) return null;
    return (
      <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
        <TouchableOpacity
          style={[styles.filterButton, isDarkMode && styles.filterButtonDark]}
          onPress={() => isNews ? setNewsVisible(visible + 10) : setTweetsVisible(visible + 10)}
        >
          <Text style={[styles.filterButtonText, isDarkMode && styles.filterButtonTextDark]}>Load more</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
      <StatusBar 
        barStyle={isDarkMode ? "light-content" : "dark-content"} 
        backgroundColor={isDarkMode ? "#111827" : "#ffffff"} 
      />
      
      <SectionList
        sections={sections}
        renderItem={renderUpdateCard}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section }) => (
          <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 6 }}>
            <Text style={{
              fontSize: 18,
              fontWeight: '700',
              color: isDarkMode ? '#f9fafb' : '#111827'
            }}>
              {section.title}
            </Text>
          </View>
        )}
        renderSectionFooter={renderSectionFooter}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        stickySectionHeadersEnabled={false}
        refreshControl={
          <RefreshControl
            refreshing={state.refreshing}
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
  header: {
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  headerTitleDark: {
    color: '#f9fafb',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 20,
  },
  headerSubtitleDark: {
    color: '#9ca3af',
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  filterButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterButtonDark: {
    backgroundColor: '#1f2937',
    borderColor: '#374151',
  },
  filterButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  filterButtonTextDark: {
    color: '#f9fafb',
  },
  offlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  offlineText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '600',
    color: '#dc2626',
  },
  filters: {
    flexDirection: 'row',
    marginTop: 12,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filtersDark: {
    backgroundColor: '#1f2937',
    borderColor: '#374151',
  },
  filterOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  filterOptionActive: {
    backgroundColor: '#eff6ff',
  },
  filterOptionDark: {
    // Default dark style
  },
  filterOptionActiveDark: {
    backgroundColor: '#1e40af',
  },
  filterOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  filterOptionTextActive: {
    color: '#2563eb',
    fontWeight: '600',
  },
  filterOptionTextDark: {
    color: '#9ca3af',
  },
  filterOptionTextActiveDark: {
    color: '#60a5fa',
  },
  categoryFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 6,
  },
  categoryFiltersDark: {
    backgroundColor: '#1f2937',
    borderColor: '#374151',
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minWidth: 80,
    justifyContent: 'center',
  },
  categoryOptionActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#2563eb',
  },
  categoryOptionDark: {
    backgroundColor: '#374151',
    borderColor: '#4b5563',
  },
  categoryOptionActiveDark: {
    backgroundColor: '#1e40af',
    borderColor: '#3b82f6',
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryOptionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  categoryOptionTextActive: {
    color: '#2563eb',
    fontWeight: '600',
  },
  categoryOptionTextDark: {
    color: '#9ca3af',
  },
  categoryOptionTextActiveDark: {
    color: '#60a5fa',
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateDark: {
    // Dark mode styles
  },
  emptyStateTitle: {
    fontSize: 20,
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
  loadingFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingFooterText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6b7280',
  },
  loadingTextDark: {
    color: '#9ca3af',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  footerTextDark: {
    color: '#6b7280',
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
  // Alert Banner Styles
  alertBanner: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 12,
    borderLeftWidth: 4,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alertBannerDark: {
    backgroundColor: '#1f2937',
  },
  alertLoadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6b7280',
  },
  alertLoadingTextDark: {
    color: '#9ca3af',
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  alertTitleRow: {
    flexDirection: 'row',
    flex: 1,
  },
  alertIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  alertTitleContainer: {
    flex: 1,
  },
  alertBadgeContainer: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  alertBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
  },
  alertTypeBadge: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6b7280',
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
  },
  alertTypeBadgeDark: {
    color: '#9ca3af',
    backgroundColor: '#374151',
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  alertTitleDark: {
    color: '#f9fafb',
  },
  alertTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertTime: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  alertTimeDark: {
    color: '#9ca3af',
  },
  alertDescription: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 8,
  },
  alertDescriptionDark: {
    color: '#d1d5db',
  },
  alertLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertLocation: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  alertLocationDark: {
    color: '#9ca3af',
  },
  alertActions: {
    flexDirection: 'row',
    gap: 8,
  },
  alertActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
  },
  alertActionButtonDark: {
    backgroundColor: '#374151',
  },
  alertActionText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});
