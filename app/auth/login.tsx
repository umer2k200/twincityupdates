import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginScreen() {
  const { signInWithEmail, signInWithGoogle, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const getFirebaseErrorMessage = (error: any) => {
    const errorCode = error?.code || '';
    
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No account found with this email. Please check your email or create a new account.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection and try again.';
      case 'auth/operation-not-allowed':
        return 'Email/password authentication is not enabled. Please contact support.';
      default:
        return error?.message || 'An unexpected error occurred. Please try again.';
    }
  };

  const handleEmailLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await signInWithEmail(email.trim(), password);
      router.replace('/(drawer)');
    } catch (error: any) {
      const errorMessage = getFirebaseErrorMessage(error);
      
      // Special handling for user not found
      if (error?.code === 'auth/user-not-found') {
        Alert.alert(
          'Account Not Found', 
          errorMessage,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Create Account', 
              onPress: () => router.push('/auth/signup')
            }
          ]
        );
      } else {
        Alert.alert('Login Failed', errorMessage);
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      router.replace('/(drawer)');
    } catch (error: any) {
      if (error.message?.includes('development mode')) {
        Alert.alert(
          'Google Sign-in Not Available', 
          'Google Sign-in is only available in the built APK. Please use email/password authentication for now.'
        );
      } else {
        Alert.alert('Google Login Failed', error.message || 'An error occurred during Google login');
      }
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
      <StatusBar 
        barStyle={isDarkMode ? "light-content" : "dark-content"} 
        backgroundColor={isDarkMode ? "#111827" : "#ffffff"} 
      />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, isDarkMode && styles.titleDark]}>
              Welcome Back
            </Text>
            <Text style={[styles.subtitle, isDarkMode && styles.subtitleDark]}>
              Sign in to continue to Twin City Updates
            </Text>
          </View>

          {/* Login Form */}
          <View style={styles.form}>
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, isDarkMode && styles.inputLabelDark]}>
                Email
              </Text>
              <View style={[styles.inputWrapper, isDarkMode && styles.inputWrapperDark]}>
                <Mail size={20} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
                <TextInput
                  style={[styles.input, isDarkMode && styles.inputDark]}
                  placeholder="Enter your email"
                  placeholderTextColor={isDarkMode ? '#6b7280' : '#9ca3af'}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, isDarkMode && styles.inputLabelDark]}>
                Password
              </Text>
              <View style={[styles.inputWrapper, isDarkMode && styles.inputWrapperDark]}>
                <Lock size={20} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
                <TextInput
                  style={[styles.input, isDarkMode && styles.inputDark]}
                  placeholder="Enter your password"
                  placeholderTextColor={isDarkMode ? '#6b7280' : '#9ca3af'}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
                  ) : (
                    <Eye size={20} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleEmailLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={[styles.dividerLine, isDarkMode && styles.dividerLineDark]} />
              <Text style={[styles.dividerText, isDarkMode && styles.dividerTextDark]}>
                or
              </Text>
              <View style={[styles.dividerLine, isDarkMode && styles.dividerLineDark]} />
            </View>

            {/* Google Sign In Button */}
            <TouchableOpacity
              style={[styles.googleButton, isDarkMode && styles.googleButtonDark]}
              onPress={handleGoogleLogin}
              disabled={loading}
            >
              <Text style={[styles.googleButtonText, isDarkMode && styles.googleButtonTextDark]}>
                Continue with Google
              </Text>
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View style={styles.signUpContainer}>
              <Text style={[styles.signUpText, isDarkMode && styles.signUpTextDark]}>
                Don't have an account?{' '}
              </Text>
              <Link href="/auth/signup" asChild>
                <TouchableOpacity>
                  <Text style={styles.signUpLink}>Sign Up</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    marginTop: 20,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  titleDark: {
    color: '#f9fafb',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  subtitleDark: {
    color: '#9ca3af',
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputLabelDark: {
    color: '#d1d5db',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  inputWrapperDark: {
    backgroundColor: '#1f2937',
    borderColor: '#374151',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    marginLeft: 12,
  },
  inputDark: {
    color: '#f9fafb',
  },
  eyeButton: {
    padding: 4,
  },
  loginButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerLineDark: {
    backgroundColor: '#374151',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#6b7280',
  },
  dividerTextDark: {
    color: '#9ca3af',
  },
  googleButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  googleButtonDark: {
    backgroundColor: '#1f2937',
    borderColor: '#374151',
  },
  googleButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  googleButtonTextDark: {
    color: '#f9fafb',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    fontSize: 14,
    color: '#6b7280',
  },
  signUpTextDark: {
    color: '#9ca3af',
  },
  signUpLink: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
  },
});
