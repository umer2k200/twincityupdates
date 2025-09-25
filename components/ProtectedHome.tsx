import React from 'react';
import { AuthGuard } from './AuthGuard';
import HomeScreen from '../app/(tabs)/index';

export function ProtectedHome() {
  return (
    <AuthGuard>
      <HomeScreen />
    </AuthGuard>
  );
}
