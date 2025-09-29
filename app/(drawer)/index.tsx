import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  Wifi, 
  WifiOff,
  AlertCircle,
  AlertTriangle,
  Clock,
  MapPin,
  Phone,
  ExternalLink
} from 'lucide-react-native';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { UpdateCard } from '../../components/UpdateCard';
import { SearchBar } from '../../components/SearchBar';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { alertService, Alert } from '../../services/alertService';
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
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(true);
  
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
      loadAlerts();
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

  const loadAlerts = async () => {
    try {
      setAlertsLoading(true);
      const activeAlerts = await alertService.getActiveAlerts();
      setAlerts(activeAlerts);
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setAlertsLoading(false);
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
    await loadAlerts();
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

  const renderAlertBanner = () => {
    if (alertsLoading) {
      return (
        <View style={[styles.alertBanner, isDarkMode && styles.alertBannerDark]}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.alertLoadingText, isDarkMode && styles.alertLoadingTextDark]}>
            Loading alerts...
          </Text>
        </View>
      );
    }

    if (alerts.length === 0) {
      return null;
    }

    // Show only the highest priority alert as banner
    const topAlert = alerts[0];

    return (
      <View style={[
        styles.alertBanner, 
        isDarkMode && styles.alertBannerDark,
        { borderLeftColor: topAlert.color }
      ]}>
        <View style={styles.alertHeader}>
          <View style={styles.alertTitleRow}>
            <Text style={styles.alertIcon}>{topAlert.icon}</Text>
            <View style={styles.alertTitleContainer}>
              <View style={styles.alertBadgeContainer}>
                <Text style={[
                  styles.alertBadge,
                  { backgroundColor: topAlert.color }
                ]}>
                  {alertService.getPriorityLabel(topAlert.priority)}
                </Text>
                <Text style={[
                  styles.alertTypeBadge,
                  isDarkMode && styles.alertTypeBadgeDark
                ]}>
                  {alertService.getTypeLabel(topAlert.type)}
                </Text>
              </View>
              <Text style={[styles.alertTitle, isDarkMode && styles.alertTitleDark]}>
                {topAlert.title}
              </Text>
            </View>
          </View>
          {topAlert.endTime && (
            <View style={styles.alertTimeContainer}>
              <Clock size={12} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
              <Text style={[styles.alertTime, isDarkMode && styles.alertTimeDark]}>
                {alertService.getTimeRemaining(topAlert.endTime)}
              </Text>
            </View>
          )}
        </View>
        
        <Text style={[styles.alertDescription, isDarkMode && styles.alertDescriptionDark]}>
          {topAlert.description}
        </Text>
        
        {topAlert.location && (
          <View style={styles.alertLocationContainer}>
            <MapPin size={12} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
            <Text style={[styles.alertLocation, isDarkMode && styles.alertLocationDark]}>
              {topAlert.location}
            </Text>
          </View>
        )}

        {topAlert.actions && topAlert.actions.length > 0 && (
          <View style={styles.alertActions}>
            {topAlert.actions.slice(0, 2).map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[
                  styles.alertActionButton,
                  isDarkMode && styles.alertActionButtonDark
                ]}
                onPress={() => {
                  if (action.type === 'phone') {
                    // Handle phone call
                    console.log('Call:', action.action);
                  } else if (action.type === 'link') {
                    // Handle navigation to different screens
                    if (action.action === 'weather') {
                      router.push('/(drawer)/weather');
                    } else if (action.action === 'emergency') {
                      // Handle emergency info
                      console.log('Emergency info:', action.action);
                    }
                  }
                }}
              >
                {action.type === 'phone' ? (
                  <Phone size={12} color={topAlert.color} />
                ) : (
                  <ExternalLink size={12} color={topAlert.color} />
                )}
                <Text style={[
                  styles.alertActionText,
                  { color: topAlert.color }
                ]}>
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

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
          {['all', 'whatsapp', 'twitter', 'facebook'].map((filter) => (
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

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
      <StatusBar 
        barStyle={isDarkMode ? "light-content" : "dark-content"} 
        backgroundColor={isDarkMode ? "#111827" : "#ffffff"} 
      />
      
      {/* Alert Banner */}
      {renderAlertBanner()}
      
      <FlatList
        data={state.filteredUpdates}
        renderItem={renderUpdateCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
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
