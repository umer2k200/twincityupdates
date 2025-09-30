import { Drawer } from 'expo-router/drawer';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Chrome as Home, Settings, User, LogOut, Bell, Bookmark, Cloud, Mail, MapPin, Edit3 } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { router, usePathname } from 'expo-router';
import { getThemeColors } from '../../constants/colors';

const { width } = Dimensions.get('window');

function CustomDrawerContent(props: any) {
  const { user, userProfile, signOut } = useAuth();
  const { state } = useApp();
  const { t } = useLanguage();
  const isDarkMode = state.preferences.darkMode;
  const colors = getThemeColors(isDarkMode);
  const styles = createStyles(isDarkMode);
  const pathname = usePathname();

  const handleSignOut = async () => {
    try {
      console.log('Drawer: Starting sign out...');
      
      // Sign out from auth service
      await signOut();
      
      console.log('Drawer: Sign out successful, navigating to login...');
      
      // Force navigation to login screen
      router.replace('/auth/login');
      
    } catch (error) {
      console.error('Drawer: Error signing out:', error);
      
      // Even if there's an error, try to navigate to login
      // This ensures the user can still get to the login screen
      try {
        router.replace('/auth/login');
      } catch (navError) {
        console.error('Drawer: Navigation error:', navError);
      }
    }
  };

  // Helper function to check if a route is active
  const isRouteActive = (routeName: string) => {
    if (routeName === 'index') {
      return pathname === '/(drawer)' || pathname === '/(drawer)/' || pathname === '/(drawer)/index';
    }
    return pathname === `/(drawer)/${routeName}`;
  };

  return (
    <DrawerContentScrollView {...props} style={styles.drawerContent}>
      {/* Modern Profile Header */}
      <View style={styles.drawerHeader}>
        {/* Background Pattern */}
        <View style={styles.headerBackground} />
        
        {/* Profile Section - Vertical Layout */}
        <View style={styles.profileSection}>
          {/* Avatar at the top */}
          <View style={styles.avatarContainer}>
            {userProfile?.photoURL ? (
              <Image 
                source={{ uri: userProfile.photoURL }} 
                style={styles.avatar}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <User size={40} color={colors.primary} />
              </View>
            )}
            {/* Online Status Indicator */}
            <View style={styles.onlineIndicator} />
            
            
          </View>
          {/* Edit Profile Button - Bottom Right of Avatar */}
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => router.push('/(drawer)/edit-profile')}
          >
              <Edit3 size={16} color={colors.primary} />
            </TouchableOpacity>
          
          {/* User Name */}
          <Text style={styles.userName}>
            {userProfile?.displayName || user?.email?.split('@')[0] || 'User'}
          </Text>
          
          {/* User Email */}
          <Text style={styles.userEmail}>
            {user?.email}
          </Text>
        </View>
        
      
      </View>

      <View style={styles.drawerItems}>
        <DrawerItem
          label={t('nav.home')}
          icon={({ color, size }) => <Home size={size} color={color} />}
          activeTintColor={colors.primary}
          inactiveTintColor={colors.text.secondary}
          labelStyle={[
            styles.drawerLabel,
            isRouteActive('index') && styles.activeDrawerLabel
          ]}
          style={[
            styles.drawerItem,
            isRouteActive('index') && styles.activeDrawerItem
          ]}
          onPress={() => {
            props.navigation.navigate('index');
          }}
        />

            <DrawerItem
              label={t('nav.saved')}
              icon={({ color, size }) => <Bookmark size={size} color={color} />}
              activeTintColor={colors.primary}
              inactiveTintColor={colors.text.secondary}
          labelStyle={[
            styles.drawerLabel,
            isRouteActive('saved') && styles.activeDrawerLabel
          ]}
          style={[
            styles.drawerItem,
            isRouteActive('saved') && styles.activeDrawerItem
          ]}
              onPress={() => {
                props.navigation.navigate('saved');
              }}
            />

            <DrawerItem
              label={t('nav.weather')}
              icon={({ color, size }) => <Cloud size={size} color={color} />}
              activeTintColor={colors.primary}
              inactiveTintColor={colors.text.secondary}
          labelStyle={[
            styles.drawerLabel,
            isRouteActive('weather') && styles.activeDrawerLabel
          ]}
          style={[
            styles.drawerItem,
            isRouteActive('weather') && styles.activeDrawerItem
          ]}
              onPress={() => {
                props.navigation.navigate('weather');
              }}
            />

            <DrawerItem
              label={t('nav.notifications')}
              icon={({ color, size }) => <Bell size={size} color={color} />}
              activeTintColor={colors.primary}
              inactiveTintColor={colors.text.secondary}
          labelStyle={[
            styles.drawerLabel,
            isRouteActive('notifications') && styles.activeDrawerLabel
          ]}
          style={[
            styles.drawerItem,
            isRouteActive('notifications') && styles.activeDrawerItem
          ]}
              onPress={() => {
                props.navigation.navigate('notifications');
              }}
            />

            <DrawerItem
              label={t('nav.settings')}
              icon={({ color, size }) => <Settings size={size} color={color} />}
              activeTintColor={colors.primary}
              inactiveTintColor={colors.text.secondary}
          labelStyle={[
            styles.drawerLabel,
            isRouteActive('settings') && styles.activeDrawerLabel
          ]}
          style={[
            styles.drawerItem,
            isRouteActive('settings') && styles.activeDrawerItem
          ]}
              onPress={() => {
                props.navigation.navigate('settings');
              }}
            />
      </View>

      <View style={styles.drawerFooter}>
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
        >
          <LogOut size={20} color={colors.status.error} />
          <Text style={styles.signOutText}>
            {t('settings.signOut')}
          </Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
}

export default function DrawerLayout() {
  const { state } = useApp();
  const { unreadCount } = useNotifications();
  const isDarkMode = state.preferences.darkMode;
  const colors = getThemeColors(isDarkMode);
  const styles = createStyles(isDarkMode);

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text.primary,
        headerTitleStyle: {
          fontWeight: '600',
          color: colors.text.primary,
        },
        drawerStyle: {
          backgroundColor: colors.background,
          width: 300,
        },
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.text.secondary,
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: '500',
        },
      }}
    >
      <Drawer.Screen
        name="index"
        options={({ navigation }) => ({
          title: 'Home',
          headerTitle: 'Twin City Updates',
          headerRight: () => (
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => {
                // Navigate to notifications screen
                router.push('/(drawer)/notifications');
              }}
            >
              <Bell 
                size={24} 
                color={colors.text.primary} 
              />
              {/* Notification badge */}
              {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          ),
        })}
      />
      <Drawer.Screen
        name="saved"
        options={{
          title: 'Saved News',
          headerTitle: 'Saved News',
        }}
      />
      <Drawer.Screen
        name="weather"
        options={{
          title: 'Weather',
          headerTitle: 'Weather',
        }}
      />
      <Drawer.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          headerTitle: 'Notifications',
        }}
      />
      <Drawer.Screen
        name="settings"
        options={({ navigation }) => ({
          title: 'Settings',
          headerTitle: 'Settings',
          headerRight: () => (
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => {
                // Navigate to notifications screen
                router.push('/(drawer)/notifications');
              }}
            >
              <Bell 
                size={24} 
                color={colors.text.primary} 
              />
              {/* Notification badge */}
              {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          ),
        })}
      />
      <Drawer.Screen
        name="edit-profile"
        options={{
          title: 'Edit Profile',
          headerTitle: 'Edit Profile',
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="news-detail"
        options={{
          title: 'News Detail',
          headerTitle: 'News Detail',
          headerShown: false, // Hide header since we have custom header in the component
        }}
      />
    </Drawer>
  );
}

const createStyles = (isDarkMode: boolean) => {
  const colors = getThemeColors(isDarkMode);
  
  return StyleSheet.create({
  drawerContent: {
    flex: 1,
    backgroundColor: colors.background,
  },
  drawerHeader: {
    padding: 0,
    paddingBottom: 10,
    backgroundColor: colors.backgroundSecondary,
    position: 'relative',
    overflow: 'hidden',
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: colors.primary,
    opacity: 0.1,
  },
  profileSection: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#ffffff',
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.background,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.status.online,
    borderWidth: 2,
    borderColor: colors.background,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 12,
    textAlign: 'center',
  },
  editButton: {
    position: 'absolute',
    bottom: 128,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appInfo: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  appName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8b5cf6',
    marginBottom: 2,
  },
  appNameDark: {
    color: '#a78bfa',
  },
  appVersion: {
    fontSize: 12,
    color: '#6b7280',
  },
  appVersionDark: {
    color: '#9ca3af',
  },
  drawerItems: {
    flex: 1,
    paddingTop: 10,
  },
  drawerItem: {
    marginVertical: 2,
    marginHorizontal: 8,
  },
  drawerLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
  },
  activeDrawerLabel: {
    fontWeight: '700',
    color: colors.primary,
  },
  activeDrawerItem: {
    backgroundColor: colors.primary + '15', // 15% opacity
    borderRadius: 12,
    marginHorizontal: 8,
  },
  drawerFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: colors.status.error + '10', // 10% opacity
  },
  signOutText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
    color: colors.status.error,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
    marginRight: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: colors.status.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  badgeText: {
    color: colors.text.inverse,
    fontSize: 12,
    fontWeight: '600',
  },
  });
};
