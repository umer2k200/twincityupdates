import { Drawer } from 'expo-router/drawer';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Chrome as Home, Settings, User, LogOut, Bell, Bookmark, Cloud } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { router, usePathname } from 'expo-router';

function CustomDrawerContent(props: any) {
  const { user, userProfile, signOut } = useAuth();
  const { state } = useApp();
  const { t } = useLanguage();
  const isDarkMode = state.preferences.darkMode;
  const pathname = usePathname();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
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
    <DrawerContentScrollView {...props} style={[styles.drawerContent, isDarkMode && styles.drawerContentDark]}>
      <View style={[styles.drawerHeader, isDarkMode && styles.drawerHeaderDark]}>
        <View style={styles.userInfo}>
          <User size={40} color={isDarkMode ? "#60a5fa" : "#2563eb"} />
          <View style={styles.userDetails}>
            <Text style={[styles.userName, isDarkMode && styles.userNameDark]}>
              {userProfile?.displayName || user?.email || 'User'}
            </Text>
            <Text style={[styles.userEmail, isDarkMode && styles.userEmailDark]}>
              {user?.email}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.drawerItems}>
        <DrawerItem
          label={t('nav.home')}
          icon={({ color, size }) => <Home size={size} color={color} />}
          activeTintColor={isDarkMode ? "#60a5fa" : "#2563eb"}
          inactiveTintColor={isDarkMode ? "#9ca3af" : "#6b7280"}
          labelStyle={[
            styles.drawerLabel, 
            isDarkMode && styles.drawerLabelDark,
            isRouteActive('index') && styles.activeDrawerLabel,
            isRouteActive('index') && isDarkMode && styles.activeDrawerLabelDark
          ]}
          style={[
            styles.drawerItem,
            isRouteActive('index') && styles.activeDrawerItem,
            isRouteActive('index') && isDarkMode && styles.activeDrawerItemDark
          ]}
          onPress={() => {
            props.navigation.navigate('index');
          }}
        />

            <DrawerItem
              label={t('nav.saved')}
              icon={({ color, size }) => <Bookmark size={size} color={color} />}
              activeTintColor={isDarkMode ? "#60a5fa" : "#2563eb"}
              inactiveTintColor={isDarkMode ? "#9ca3af" : "#6b7280"}
              labelStyle={[
                styles.drawerLabel, 
                isDarkMode && styles.drawerLabelDark,
                isRouteActive('saved') && styles.activeDrawerLabel,
                isRouteActive('saved') && isDarkMode && styles.activeDrawerLabelDark
              ]}
              style={[
                styles.drawerItem,
                isRouteActive('saved') && styles.activeDrawerItem,
                isRouteActive('saved') && isDarkMode && styles.activeDrawerItemDark
              ]}
              onPress={() => {
                props.navigation.navigate('saved');
              }}
            />

            <DrawerItem
              label={t('nav.weather')}
              icon={({ color, size }) => <Cloud size={size} color={color} />}
              activeTintColor={isDarkMode ? "#60a5fa" : "#2563eb"}
              inactiveTintColor={isDarkMode ? "#9ca3af" : "#6b7280"}
              labelStyle={[
                styles.drawerLabel, 
                isDarkMode && styles.drawerLabelDark,
                isRouteActive('weather') && styles.activeDrawerLabel,
                isRouteActive('weather') && isDarkMode && styles.activeDrawerLabelDark
              ]}
              style={[
                styles.drawerItem,
                isRouteActive('weather') && styles.activeDrawerItem,
                isRouteActive('weather') && isDarkMode && styles.activeDrawerItemDark
              ]}
              onPress={() => {
                props.navigation.navigate('weather');
              }}
            />

            <DrawerItem
              label={t('nav.notifications')}
              icon={({ color, size }) => <Bell size={size} color={color} />}
              activeTintColor={isDarkMode ? "#60a5fa" : "#2563eb"}
              inactiveTintColor={isDarkMode ? "#9ca3af" : "#6b7280"}
              labelStyle={[
                styles.drawerLabel, 
                isDarkMode && styles.drawerLabelDark,
                isRouteActive('notifications') && styles.activeDrawerLabel,
                isRouteActive('notifications') && isDarkMode && styles.activeDrawerLabelDark
              ]}
              style={[
                styles.drawerItem,
                isRouteActive('notifications') && styles.activeDrawerItem,
                isRouteActive('notifications') && isDarkMode && styles.activeDrawerItemDark
              ]}
              onPress={() => {
                props.navigation.navigate('notifications');
              }}
            />

            <DrawerItem
              label={t('nav.settings')}
              icon={({ color, size }) => <Settings size={size} color={color} />}
              activeTintColor={isDarkMode ? "#60a5fa" : "#2563eb"}
              inactiveTintColor={isDarkMode ? "#9ca3af" : "#6b7280"}
              labelStyle={[
                styles.drawerLabel, 
                isDarkMode && styles.drawerLabelDark,
                isRouteActive('settings') && styles.activeDrawerLabel,
                isRouteActive('settings') && isDarkMode && styles.activeDrawerLabelDark
              ]}
              style={[
                styles.drawerItem,
                isRouteActive('settings') && styles.activeDrawerItem,
                isRouteActive('settings') && isDarkMode && styles.activeDrawerItemDark
              ]}
              onPress={() => {
                props.navigation.navigate('settings');
              }}
            />
      </View>

      <View style={[styles.drawerFooter, isDarkMode && styles.drawerFooterDark]}>
        <TouchableOpacity
          style={[styles.signOutButton, isDarkMode && styles.signOutButtonDark]}
          onPress={handleSignOut}
        >
          <LogOut size={20} color="#ef4444" />
          <Text style={styles.signOutText}>{t('settings.signOut')}</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
}

export default function DrawerLayout() {
  const { state } = useApp();
  const isDarkMode = state.preferences.darkMode;

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
        },
        headerTintColor: isDarkMode ? '#f9fafb' : '#1f2937',
        headerTitleStyle: {
          fontWeight: '600',
          color: isDarkMode ? '#f9fafb' : '#1f2937',
        },
        drawerStyle: {
          backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
          width: 280,
        },
        drawerActiveTintColor: isDarkMode ? '#60a5fa' : '#2563eb',
        drawerInactiveTintColor: isDarkMode ? '#9ca3af' : '#6b7280',
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
                color={isDarkMode ? '#f9fafb' : '#1f2937'} 
              />
              {/* Notification badge - you can add conditional rendering here */}
              <View style={[styles.notificationBadge, isDarkMode && styles.notificationBadgeDark]}>
                <Text style={[styles.badgeText, isDarkMode && styles.badgeTextDark]}>3</Text>
              </View>
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
                color={isDarkMode ? '#f9fafb' : '#1f2937'} 
              />
              {/* Notification badge - you can add conditional rendering here */}
              <View style={[styles.notificationBadge, isDarkMode && styles.notificationBadgeDark]}>
                <Text style={[styles.badgeText, isDarkMode && styles.badgeTextDark]}>3</Text>
              </View>
            </TouchableOpacity>
          ),
        })}
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

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  drawerContentDark: {
    backgroundColor: '#1f2937',
  },
  drawerHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  drawerHeaderDark: {
    backgroundColor: '#111827',
    borderBottomColor: '#374151',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userDetails: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  userNameDark: {
    color: '#f9fafb',
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
  },
  userEmailDark: {
    color: '#9ca3af',
  },
  drawerItems: {
    flex: 1,
    paddingTop: 10,
  },
  drawerItem: {
    marginVertical: 2,
  },
  drawerLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  drawerLabelDark: {
    color: '#f9fafb',
  },
  activeDrawerLabel: {
    fontWeight: '700',
    color: '#2563eb',
  },
  activeDrawerLabelDark: {
    fontWeight: '700',
    color: '#60a5fa',
  },
  activeDrawerItem: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    marginHorizontal: 8,
  },
  activeDrawerItemDark: {
    backgroundColor: '#1e3a8a',
    borderRadius: 8,
    marginHorizontal: 8,
  },
  drawerFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  drawerFooterDark: {
    borderTopColor: '#374151',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
  },
  signOutButtonDark: {
    backgroundColor: '#374151',
  },
  signOutText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
    color: '#ef4444',
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
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  notificationBadgeDark: {
    borderColor: '#1f2937',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  badgeTextDark: {
    color: '#ffffff',
  },
});
