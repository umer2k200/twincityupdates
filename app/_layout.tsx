import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AppProvider } from '../contexts/AppContext';
import { AuthProvider } from '../contexts/AuthContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import { NotificationProvider } from '../contexts/NotificationContext';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <AuthProvider>
      <LanguageProvider>
        <NotificationProvider>
          <AppProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
              <Stack.Screen name="auth" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
          </AppProvider>
        </NotificationProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}