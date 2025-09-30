import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithCredential,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

// Conditionally import GoogleSignin only when needed
let GoogleSignin: any = null;
try {
  GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin;
} catch (error) {
  console.log('Google Sign-in not available in development mode');
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Date;
  lastLoginAt: Date;
  preferences: {
    darkMode: boolean;
    notifications: boolean;
    language: string;
  };
}

class AuthService {
  private googleProvider: GoogleAuthProvider;

  constructor() {
    this.googleProvider = new GoogleAuthProvider();
    this.configureGoogleSignIn();
  }

  private configureGoogleSignIn() {
    if (GoogleSignin) {
      GoogleSignin.configure({
        // Web Client ID from Firebase Console (you'll need to get this from Firebase Console > Authentication > Sign-in method > Google)
        webClientId: '126914622699-nuqctqlg3bude3avvroeoabdglt8ati9.apps.googleusercontent.com',
        offlineAccess: true,
        hostedDomain: '',
        forceCodeForRefreshToken: true,
      });
    }
  }

  // Email/Password Sign Up
  async signUpWithEmail(email: string, password: string, displayName: string): Promise<UserProfile> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update display name using the correct Firebase v9 method
      await updateProfile(user, { displayName });

      // Create user profile in Firestore
      const userProfile: any = {
        uid: user.uid,
        email: user.email!,
        displayName,
        createdAt: new Date(),
        lastLoginAt: new Date(),
        preferences: {
          darkMode: false,
          notifications: true,
          language: 'en'
        }
      };

      // Only add photoURL if it exists
      if (user.photoURL) {
        userProfile.photoURL = user.photoURL;
      }

      await setDoc(doc(db, 'users', user.uid), userProfile);
      return userProfile;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  }

  // Email/Password Sign In
  async signInWithEmail(email: string, password: string): Promise<UserProfile> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update last login time
      await setDoc(doc(db, 'users', user.uid), {
        lastLoginAt: new Date()
      }, { merge: true });

      // Get user profile from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
      } else {
        // Create profile if it doesn't exist (for existing users)
        const userProfile: any = {
          uid: user.uid,
          email: user.email!,
          displayName: user.displayName || 'User',
          createdAt: new Date(),
          lastLoginAt: new Date(),
          preferences: {
            darkMode: false,
            notifications: true,
            language: 'en'
          }
        };

        // Only add photoURL if it exists
        if (user.photoURL) {
          userProfile.photoURL = user.photoURL;
        }

        await setDoc(doc(db, 'users', user.uid), userProfile);
        return userProfile;
      }
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }

  // Google Sign In
  async signInWithGoogle(): Promise<UserProfile> {
    if (!GoogleSignin) {
      throw new Error('Google Sign-in is not available in development mode. Please build the app to use Google Sign-in.');
    }

    try {
      // Check if device supports Google Play
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      
      // Get the users ID token
      const { idToken } = await GoogleSignin.signIn();
      
      // Create a Google credential with the token
      const googleCredential = GoogleAuthProvider.credential(idToken);
      
      // Sign-in the user with the credential
      const userCredential = await signInWithCredential(auth, googleCredential);
      const user = userCredential.user;

      // Check if user profile exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        // Update last login time
        await setDoc(doc(db, 'users', user.uid), {
          lastLoginAt: new Date()
        }, { merge: true });
        return userDoc.data() as UserProfile;
      } else {
        // Create new user profile
        const userProfile: any = {
          uid: user.uid,
          email: user.email!,
          displayName: user.displayName || 'User',
          createdAt: new Date(),
          lastLoginAt: new Date(),
          preferences: {
            darkMode: false,
            notifications: true,
            language: 'en'
          }
        };

        // Only add photoURL if it exists
        if (user.photoURL) {
          userProfile.photoURL = user.photoURL;
        }

        await setDoc(doc(db, 'users', user.uid), userProfile);
        return userProfile;
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  }

  // Sign Out
  async signOut(): Promise<void> {
    try {
      console.log('Starting sign out process...');
      
      // Sign out from Google if signed in with Google and GoogleSignin is available
      if (GoogleSignin) {
        try {
          const isSignedIn = await GoogleSignin.isSignedIn();
          if (isSignedIn) {
            console.log('Signing out from Google...');
            await GoogleSignin.signOut();
            console.log('Google sign out successful');
          }
        } catch (googleError) {
          console.error('Error signing out from Google:', googleError);
          // Continue with Firebase sign out even if Google sign out fails
        }
      }
      
      // Sign out from Firebase
      console.log('Signing out from Firebase...');
      await signOut(auth);
      console.log('Firebase sign out successful');
      
      // Clear any local storage that might persist user data
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userData');
        console.log('Local storage cleared');
      } catch (storageError) {
        console.error('Error clearing local storage:', storageError);
        // Not critical, continue
      }
      
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  // Get current user
  getCurrentUser(): User | null {
    return auth.currentUser;
  }

  // Listen to auth state changes
  onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  // Update user profile
  async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      await setDoc(doc(db, 'users', uid), updates, { merge: true });
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Get user profile from Firestore
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();
