import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService, UserProfile } from '../services/authService';
import { User } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (user) => {
      setUser(user);
      
      if (user) {
        try {
          const profile = await authService.getUserProfile(user.uid);
          setUserProfile(profile);
        } catch (error) {
          console.error('Error fetching user profile:', error);
          // If we can't fetch the profile, treat as not authenticated
          setUser(null);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    try {
      setLoading(true);
      const profile = await authService.signUpWithEmail(email, password, displayName);
      
      // Sign out immediately after successful signup so user can login separately
      await authService.signOut();
      setUser(null);
      setUserProfile(null);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true);
      const profile = await authService.signInWithEmail(email, password);
      setUserProfile(profile);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const profile = await authService.signInWithGoogle();
      setUserProfile(profile);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      // Clear user profile and user first
      setUserProfile(null);
      setUser(null);
      
      // Then sign out from Firebase
      await authService.signOut();
      
      // Ensure loading is set to false after successful sign out
      setLoading(false);
    } catch (error) {
      console.error('Sign out error in AuthContext:', error);
      
      // Even if Firebase sign out fails, clear local state
      setUser(null);
      setUserProfile(null);
      setLoading(false);
      
      throw error;
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      await authService.updateUserProfile(user.uid, updates);
      setUserProfile(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    signOut,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
