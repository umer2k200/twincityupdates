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
  AlertCircle 
} from 'lucide-react-native';
import { useApp } from '../../contexts/AppContext';
import { UpdateCard } from '../../components/UpdateCard';
import { SearchBar } from '../../components/SearchBar';

export default function HomeScreen() {
  const { 
    state, 
    fetchUpdates, 
    refreshUpdates, 
    setSearchQuery, 
    setActiveFilter 
  } = useApp();
  
  const [showFilters, setShowFilters] = useState(false);
  
  const isDarkMode = state.preferences.darkMode;
  
  useEffect(() => {
    fetchUpdates();
  }, []);

  const handleRefresh = async () => {
    await refreshUpdates();
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    setShowFilters(false);
  };

  const renderUpdateCard = ({ item }: { item: any }) => (
    <UpdateCard 
      update={item} 
      isDarkMode={isDarkMode}
      onPress={() => {
        // Handle card press - could navigate to detail screen
        console.log('Update pressed:', item.id);
      }}
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
      <Text style={[styles.headerTitle, isDarkMode && styles.headerTitleDark]}>
        Twin City Updates
      </Text>
      <Text style={[styles.headerSubtitle, isDarkMode && styles.headerSubtitleDark]}>
        Stay connected with your community
      </Text>
      
      <SearchBar
        value={state.searchQuery}
        onChangeText={handleSearch}
        placeholder="Search updates..."
        isDarkMode={isDarkMode}
      />
      
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterButton, isDarkMode && styles.filterButtonDark]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={18} color={isDarkMode ? '#f9fafb' : '#374151'} />
          <Text style={[styles.filterButtonText, isDarkMode && styles.filterButtonTextDark]}>
            Filter
          </Text>
        </TouchableOpacity>
        
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
    </View>
  );

  const renderFooter = () => {
    if (state.loading) {
      return (
        <View style={styles.loadingFooter}>
          <ActivityIndicator size="small" color={isDarkMode ? '#60a5fa' : '#2563eb'} />
          <Text style={[styles.loadingText, isDarkMode && styles.loadingTextDark]}>
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
            tintColor={isDarkMode ? '#60a5fa' : '#2563eb'}
            colors={[isDarkMode ? '#60a5fa' : '#2563eb']}
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
    paddingTop: 16,
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
  loadingText: {
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
});