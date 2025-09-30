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
  Globe,
  Lock
} from 'lucide-react-native';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { storageService } from '../../services/storageService';
import { router } from 'expo-router';
import { getThemeColors } from '../../constants/colors';
import { ThemedAlert } from '../../components/ThemedAlert';
import { useThemedAlert } from '../../hooks/useThemedAlert';

export default function SettingsScreen() {
  const { state, updatePreferences, clearCache } = useApp();
  const { user, userProfile, signOut, updateUserProfile, loading: authLoading } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [cacheSize, setCacheSize] = useState('0 KB');
  
  const isDarkMode = state.preferences.darkMode;
  const colors = getThemeColors(isDarkMode);
  const { alertConfig, isVisible, showAlert, hideAlert } = useThemedAlert();
  
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
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, isDarkMode && styles.loadingTextDark]}>Loading...</Text>
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
    showAlert({
      title: 'Clear Cache',
      message: 'This will remove all cached updates. You may need to refresh to see new content.',
      type: 'warning',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: async () => {
            await clearCache();
            await loadCacheSize();
            showAlert({
              title: 'Success',
              message: 'Cache cleared successfully',
              type: 'success',
              buttons: [{ text: 'OK', style: 'default' }]
            });
          }
        },
      ]
    });
  };

  const handleSignOut = () => {
    showAlert({
      title: 'Sign Out',
      message: 'Are you sure you want to sign out from Twin City Updates?',
      type: 'warning',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Settings: Starting sign out...');
              
              // Sign out from auth service
              await signOut();
              
              console.log('Settings: Sign out successful, navigating to login...');
              
              // Navigate to login screen
              router.replace('/auth/login');
              
            } catch (error) {
              console.error('Settings: Error signing out:', error);
              showAlert({
                title: 'Error',
                message: 'Failed to sign out. Please try again.',
                type: 'error',
                buttons: [{ text: 'OK', style: 'default' }]
              });
              
              // Even if there's an error, try to navigate to login
              try {
                router.replace('/auth/login');
              } catch (navError) {
                console.error('Settings: Navigation error:', navError);
              }
            }
          }
        },
      ]
    });
  };

  const handleLanguageChange = () => {
    showAlert({
      title: t('settings.language'),
      message: 'Choose your preferred language for the app',
      type: 'info',
      buttons: [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('settings.language.english'), 
          style: 'default',
          onPress: () => {
            setLanguage('en');
            showAlert({
              title: 'Language Updated',
              message: 'App language changed to English',
              type: 'success',
              buttons: [{ text: 'OK', style: 'default' }]
            });
          }
        },
        { 
          text: t('settings.language.urdu'), 
          style: 'default',
          onPress: () => {
            setLanguage('ur');
            showAlert({
              title: 'زبان اپ ڈیٹ ہوگئی',
              message: 'ایپ کی زبان اردو میں تبدیل ہوگئی',
              type: 'success',
              buttons: [{ text: 'ٹھیک ہے', style: 'default' }]
            });
          }
        },
      ]
    });
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
              true: colors.primary
            }}
            thumbColor={switchValue ? '#ffffff' : '#f3f4f6'}
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
      
      

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Appearance Section */}
        <SectionHeader title="Appearance" />
        <View style={[styles.section, isDarkMode && styles.sectionDark]}>
          <SettingItem
            icon={<Globe size={20} color={colors.primary} />}
            title={t('settings.language')}
            subtitle={language === 'en' ? t('settings.language.english') : t('settings.language.urdu')}
            hasChevron
            onPress={handleLanguageChange}
          />
          <SettingItem
            icon={<Moon size={20} color={colors.primary} />}
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
            icon={<Bell size={20} color={colors.primary} />}
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
            icon={<Wifi size={20} color={colors.primary} />}
            title="Offline Mode"
            subtitle="Cache updates for offline viewing"
            hasSwitch
            switchValue={state.preferences.offlineMode}
            onSwitchChange={(value) => handlePreferenceChange('offlineMode', value)}
          />
          <SettingItem
            icon={<RefreshCw size={20} color={colors.primary} />}
            title="Auto Refresh"
            subtitle={`Automatically refresh feed every ${state.preferences.refreshInterval} minutes`}
            hasSwitch
            switchValue={state.preferences.autoRefresh}
            onSwitchChange={(value) => handlePreferenceChange('autoRefresh', value)}
          />
          <SettingItem
            icon={<Database size={20} color={colors.primary} />}
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
            icon={<User size={20} color={colors.primary} />}
            title="Edit Profile"
            subtitle={userProfile?.displayName || user?.email || "Update your profile information"}
            hasChevron
            onPress={() => router.push('/(drawer)/edit-profile' as any)}
          />
          <SettingItem
            icon={<LogOut size={20} color={colors.status.error} />}
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
            icon={<Info size={20} color={colors.primary} />}
            title="Twin City Updates"
            subtitle="Version 1.0.0"
            hasChevron
            onPress={() => {
              showAlert({
                title: 'Twin City Updates',
                message: 'Version 1.0.0\n\nStay connected with news and updates for Islamabad & Rawalpindi.\n\nDeveloped with ❤️ for the Twin Cities',
                type: 'info',
                buttons: [{ text: 'OK', style: 'default' }]
              });
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

      {/* Themed Alert Modal */}
      {alertConfig && (
        <ThemedAlert
          visible={isVisible}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          buttons={alertConfig.buttons}
          onDismiss={hideAlert}
          isDarkMode={isDarkMode}
        />
      )}
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
    paddingTop: 4,
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
    backgroundColor: '#f3f0ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingIconDark: {
    backgroundColor: '#1e1b4b',
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
    color: '#8b5cf6',
    marginBottom: 4,
  },
  footerTextDark: {
    color: '#a78bfa',
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
  loadingTextDark: {
    color: '#9ca3af',
  },
});
