import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBvC5tUsWmlzalaO3YvOwl3nuUZy-wSh50",
  authDomain: "twin-city-updates.firebaseapp.com",
  projectId: "twin-city-updates",
  storageBucket: "twin-city-updates.firebasestorage.app",
  messagingSenderId: "126914622699",
  appId: "1:126914622699:android:309b6c74033cf90bc9faae"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with conditional persistence
let auth;
try {
  // Try to use React Native persistence if available
  const { getReactNativePersistence } = require('firebase/auth');
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (error) {
  // Fallback to standard auth for web/development
  console.log('Using standard Firebase Auth (no persistence in development)');
  auth = getAuth(app);
}

// Initialize Firestore
const db = getFirestore(app);

export { auth, db };
export default app;
