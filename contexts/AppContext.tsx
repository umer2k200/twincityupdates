import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { SocialUpdate, apiService } from '../services/apiService';
import { storageService, UserPreferences } from '../services/storageService';

interface AppState {
  updates: SocialUpdate[];
  filteredUpdates: SocialUpdate[];
  loading: boolean;
  refreshing: boolean;
  searchQuery: string;
  activeFilter: string;
  preferences: UserPreferences;
  isOffline: boolean;
  lastRefreshTime: Date | null;
}

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_REFRESHING'; payload: boolean }
  | { type: 'SET_UPDATES'; payload: SocialUpdate[] }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_ACTIVE_FILTER'; payload: string }
  | { type: 'SET_PREFERENCES'; payload: UserPreferences }
  | { type: 'SET_OFFLINE'; payload: boolean }
  | { type: 'SET_LAST_REFRESH'; payload: Date | null }
  | { type: 'APPLY_FILTERS' };

const initialState: AppState = {
  updates: [],
  filteredUpdates: [],
  loading: true,
  refreshing: false,
  searchQuery: '',
  activeFilter: 'all',
  preferences: {
    darkMode: false,
    pushNotifications: true,
    offlineMode: true,
    autoRefresh: true,
    refreshInterval: 5,
  },
  isOffline: false,
  lastRefreshTime: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_REFRESHING':
      return { ...state, refreshing: action.payload };
    case 'SET_UPDATES':
      return { ...state, updates: action.payload };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'SET_ACTIVE_FILTER':
      return { ...state, activeFilter: action.payload };
    case 'SET_PREFERENCES':
      return { ...state, preferences: action.payload };
    case 'SET_OFFLINE':
      return { ...state, isOffline: action.payload };
    case 'SET_LAST_REFRESH':
      return { ...state, lastRefreshTime: action.payload };
    case 'APPLY_FILTERS':
      let filtered = state.updates;
      
      // Apply source filter
      if (state.activeFilter !== 'all') {
        filtered = apiService.filterUpdatesBySource(filtered, state.activeFilter);
      }
      
      // Apply search filter
      if (state.searchQuery.trim()) {
        filtered = apiService.searchUpdates(filtered, state.searchQuery);
      }
      
      return { ...state, filteredUpdates: filtered };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  fetchUpdates: () => Promise<void>;
  refreshUpdates: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  setActiveFilter: (filter: string) => void;
  updatePreferences: (preferences: UserPreferences) => Promise<void>;
  clearCache: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load initial data and preferences
  useEffect(() => {
    loadInitialData();
  }, []);

  // Apply filters when search query or active filter changes
  useEffect(() => {
    dispatch({ type: 'APPLY_FILTERS' });
  }, [state.updates, state.searchQuery, state.activeFilter]);

  // Auto-refresh functionality
  useEffect(() => {
    if (state.preferences.autoRefresh && !state.isOffline) {
      const interval = setInterval(() => {
        refreshUpdates();
      }, state.preferences.refreshInterval * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [state.preferences.autoRefresh, state.preferences.refreshInterval, state.isOffline]);

  const loadInitialData = async () => {
    try {
      // Load user preferences
      const preferences = await storageService.getUserPreferences();
      dispatch({ type: 'SET_PREFERENCES', payload: preferences });

      // Load cached updates if offline mode is enabled
      if (preferences.offlineMode) {
        const cachedUpdates = await storageService.getCachedUpdates();
        const lastRefresh = await storageService.getLastRefreshTime();
        
        if (cachedUpdates.length > 0) {
          dispatch({ type: 'SET_UPDATES', payload: cachedUpdates });
          dispatch({ type: 'SET_LAST_REFRESH', payload: lastRefresh });
        }
      }

      // Fetch fresh updates
      await fetchUpdates();
    } catch (error) {
      console.error('Error loading initial data:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const fetchUpdates = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const updates = await apiService.fetchAllUpdates();
      dispatch({ type: 'SET_UPDATES', payload: updates });
      
      // Cache updates if offline mode is enabled
      if (state.preferences.offlineMode) {
        await storageService.cacheUpdates(updates);
        dispatch({ type: 'SET_LAST_REFRESH', payload: new Date() });
      }
      
      dispatch({ type: 'SET_OFFLINE', payload: false });
    } catch (error) {
      console.error('Error fetching updates:', error);
      dispatch({ type: 'SET_OFFLINE', payload: true });
      
      // Load cached updates if available
      if (state.preferences.offlineMode) {
        const cachedUpdates = await storageService.getCachedUpdates();
        if (cachedUpdates.length > 0) {
          dispatch({ type: 'SET_UPDATES', payload: cachedUpdates });
        }
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const refreshUpdates = async () => {
    try {
      dispatch({ type: 'SET_REFRESHING', payload: true });
      
      const updates = await apiService.fetchAllUpdates();
      dispatch({ type: 'SET_UPDATES', payload: updates });
      
      // Cache updates if offline mode is enabled
      if (state.preferences.offlineMode) {
        await storageService.cacheUpdates(updates);
        dispatch({ type: 'SET_LAST_REFRESH', payload: new Date() });
      }
      
      dispatch({ type: 'SET_OFFLINE', payload: false });
    } catch (error) {
      console.error('Error refreshing updates:', error);
      dispatch({ type: 'SET_OFFLINE', payload: true });
    } finally {
      dispatch({ type: 'SET_REFRESHING', payload: false });
    }
  };

  const setSearchQuery = (query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  };

  const setActiveFilter = (filter: string) => {
    dispatch({ type: 'SET_ACTIVE_FILTER', payload: filter });
  };

  const updatePreferences = async (preferences: UserPreferences) => {
    try {
      await storageService.saveUserPreferences(preferences);
      dispatch({ type: 'SET_PREFERENCES', payload: preferences });
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  const clearCache = async () => {
    try {
      await storageService.clearCache();
      // Reload from cache (which should now be empty)
      const cachedUpdates = await storageService.getCachedUpdates();
      dispatch({ type: 'SET_UPDATES', payload: cachedUpdates });
      dispatch({ type: 'SET_LAST_REFRESH', payload: null });
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  };

  const contextValue: AppContextType = {
    state,
    fetchUpdates,
    refreshUpdates,
    setSearchQuery,
    setActiveFilter,
    updatePreferences,
    clearCache,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}