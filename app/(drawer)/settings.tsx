import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Switch,
  StatusBar,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Moon, 
  Bell, 
  Wifi, 
  RefreshCw, 
  Info, 
  ChevronRight,
  User,
  Shield,
  Database,
  Trash2,
  LogOut,
  Globe
} from 'lucide-react-native';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { storageService } from '../../services/storageService';
import { router } from 'expo-router';

export default function SettingsScreen() {
  const { state, updatePreferences, clearCache } = useApp();
  const { user, userProfile, signOut, loading: authLoading } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [cacheSize, setCacheSize] = useState('0 KB');
  
  const isDarkMode = state.preferences.darkMode;
  
  const loadCacheSize = async () => {
    const size = await storageService.getCacheSize();
    setCacheSize(size);
  };
  
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth/login');
      return;
    }
    
    if (user) {
      loadCacheSize();
    }
  }, [user, authLoading]);
  
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
  
  const handlePreferenceChange = async (key: keyof typeof state.preferences, value: any) => {
    const newPreferences = {
      ...state.preferences,
      [key]: value,
    };
    await updatePreferences(newPreferences);
  };
  
  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will remove all cached updates. You may need to refresh to see new content.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: async () => {
            await clearCache();
            await loadCacheSize();
            Alert.alert('Success', 'Cache cleared successfully');
          }
        },
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          }
        },
      ]
    );
  };

  const handleLanguageChange = () => {
    Alert.alert(
      t('settings.language'),
      'Choose your preferred language',
      [
        { 
          text: t('common.cancel'), 
          style: 'cancel' 
        },
        { 
          text: t('settings.language.english'), 
          onPress: () => setLanguage('en')
        },
        { 
          text: t('settings.language.urdu'), 
          onPress: () => setLanguage('ur')
        },
      ]
    );
  };

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    hasSwitch, 
    switchValue, 
    onSwitchChange, 
    hasChevron = false,
    onPress 
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    hasSwitch?: boolean;
    switchValue?: boolean;
    onSwitchChange?: (value: boolean) => void;
    hasChevron?: boolean;
    onPress?: () => void;
  }) => (
    <TouchableOpacity 
      style={[styles.settingItem, isDarkMode && styles.settingItemDark]} 
      onPress={onPress}
      disabled={hasSwitch}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.settingIcon, isDarkMode && styles.settingIconDark]}>
          {icon}
        </View>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, isDarkMode && styles.settingTitleDark]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.settingSubtitle, isDarkMode && styles.settingSubtitleDark]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.settingRight}>
        {hasSwitch && (
          <Switch
            value={switchValue}
            onValueChange={onSwitchChange}
            trackColor={{ 
              false: isDarkMode ? '#4b5563' : '#d1d5db', 
              true: isDarkMode ? '#3b82f6' : '#60a5fa' 
            }}
            thumbColor={switchValue ? (isDarkMode ? '#60a5fa' : '#2563eb') : '#f3f4f6'}
          />
        )}
        {hasChevron && (
          <ChevronRight 
            size={20} 
            color={isDarkMode ? "#9ca3af" : "#6b7280"} 
          />
        )}
      </View>
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <Text style={[styles.sectionHeader, isDarkMode && styles.sectionHeaderDark]}>
      {title}
    </Text>
  );

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
      <StatusBar 
        barStyle={isDarkMode ? "light-content" : "dark-content"} 
        backgroundColor={isDarkMode ? "#111827" : "#ffffff"} 
      />
      
      {/* Header */}
      <View style={[styles.header, isDarkMode && styles.headerDark]}>
        <Text style={[styles.headerTitle, isDarkMode && styles.headerTitleDark]}>
          Settings
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Appearance Section */}
        <SectionHeader title="Appearance" />
        <View style={[styles.section, isDarkMode && styles.sectionDark]}>
          <SettingItem
            icon={<Globe size={20} color={isDarkMode ? "#60a5fa" : "#2563eb"} />}
            title={t('settings.language')}
            subtitle={language === 'en' ? t('settings.language.english') : t('settings.language.urdu')}
            hasChevron
            onPress={handleLanguageChange}
          />
          <SettingItem
            icon={<Moon size={20} color={isDarkMode ? "#60a5fa" : "#2563eb"} />}
            title={t('settings.darkMode')}
            subtitle="Switch between light and dark themes"
            hasSwitch
            switchValue={state.preferences.darkMode}
            onSwitchChange={(value) => handlePreferenceChange('darkMode', value)}
          />
        </View>

        {/* Notifications Section */}
        <SectionHeader title="Notifications" />
        <View style={[styles.section, isDarkMode && styles.sectionDark]}>
          <SettingItem
            icon={<Bell size={20} color={isDarkMode ? "#60a5fa" : "#2563eb"} />}
            title="Push Notifications"
            subtitle="Get notified about new updates"
            hasSwitch
            switchValue={state.preferences.pushNotifications}
            onSwitchChange={(value) => handlePreferenceChange('pushNotifications', value)}
          />
        </View>

        {/* Data & Storage Section */}
        <SectionHeader title="Data & Storage" />
        <View style={[styles.section, isDarkMode && styles.sectionDark]}>
          <SettingItem
            icon={<Wifi size={20} color={isDarkMode ? "#60a5fa" : "#2563eb"} />}
            title="Offline Mode"
            subtitle="Cache updates for offline viewing"
            hasSwitch
            switchValue={state.preferences.offlineMode}
            onSwitchChange={(value) => handlePreferenceChange('offlineMode', value)}
          />
          <SettingItem
            icon={<RefreshCw size={20} color={isDarkMode ? "#60a5fa" : "#2563eb"} />}
            title="Auto Refresh"
            subtitle={`Automatically refresh feed every ${state.preferences.refreshInterval} minutes`}
            hasSwitch
            switchValue={state.preferences.autoRefresh}
            onSwitchChange={(value) => handlePreferenceChange('autoRefresh', value)}
          />
          <SettingItem
            icon={<Database size={20} color={isDarkMode ? "#60a5fa" : "#2563eb"} />}
            title="Clear Cache"
            subtitle={`Current size: ${cacheSize}`}
            hasChevron
            onPress={handleClearCache}
          />
        </View>

        {/* Account Section */}
        <SectionHeader title="Account" />
        <View style={[styles.section, isDarkMode && styles.sectionDark]}>
          <SettingItem
            icon={<User size={20} color={isDarkMode ? "#60a5fa" : "#2563eb"} />}
            title="Profile"
            subtitle={userProfile?.displayName || user?.email || "Manage your account settings"}
            hasChevron
            onPress={() => {
              console.log('Profile pressed');
            }}
          />
          <SettingItem
            icon={<Shield size={20} color={isDarkMode ? "#60a5fa" : "#2563eb"} />}
            title="Privacy"
            subtitle="Control your data and privacy"
            hasChevron
            onPress={() => {
              console.log('Privacy pressed');
            }}
          />
          <SettingItem
            icon={<LogOut size={20} color="#ef4444" />}
            title="Sign Out"
            subtitle="Sign out of your account"
            hasChevron
            onPress={handleSignOut}
          />
        </View>

        {/* About Section */}
        <SectionHeader title="About" />
        <View style={[styles.section, isDarkMode && styles.sectionDark]}>
          <SettingItem
            icon={<Info size={20} color={isDarkMode ? "#60a5fa" : "#2563eb"} />}
            title="App Information"
            subtitle="Version 1.0.0"
            hasChevron
            onPress={() => {
              console.log('App info pressed');
            }}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, isDarkMode && styles.footerTextDark]}>
            Twin City Updates
          </Text>
          <Text style={[styles.footerSubtext, isDarkMode && styles.footerSubtextDark]}>
            Stay connected with your local community
          </Text>
        </View>
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerDark: {
    backgroundColor: '#1f2937',
    borderBottomColor: '#374151',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerTitleDark: {
    color: '#f9fafb',
  },
  content: {
    flex: 1,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
  },
  sectionHeaderDark: {
    color: '#d1d5db',
  },
  section: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionDark: {
    backgroundColor: '#1f2937',
    shadowOpacity: 0.3,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingItemDark: {
    borderBottomColor: '#374151',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingIconDark: {
    backgroundColor: '#374151',
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  settingTitleDark: {
    color: '#f9fafb',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  settingSubtitleDark: {
    color: '#9ca3af',
  },
  settingRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 4,
  },
  footerTextDark: {
    color: '#60a5fa',
  },
  footerSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  footerSubtextDark: {
    color: '#9ca3af',
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
});
