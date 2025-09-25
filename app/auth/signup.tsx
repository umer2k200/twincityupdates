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
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';

export default function SignupScreen() {
  const { signUpWithEmail, signInWithGoogle, loading } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const validateForm = () => {
    if (!displayName.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return false;
    }
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return false;
    }
    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter a password');
      return false;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    return true;
  };

  const getFirebaseErrorMessage = (error: any) => {
    const errorCode = error?.code || '';
    
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'This email is already registered. Please try logging in instead.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters long.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/operation-not-allowed':
        return 'Email/password authentication is not enabled. Please contact support.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection and try again.';
      default:
        return error?.message || 'An unexpected error occurred. Please try again.';
    }
  };

  const handleEmailSignup = async () => {
    if (!validateForm()) return;

    try {
      await signUpWithEmail(email.trim(), password, displayName.trim());
      
      // Show success message and redirect to login
      Alert.alert(
        'Account Created Successfully!',
        'Your account has been created. Please sign in with your credentials.',
        [
          {
            text: 'Go to Login',
            onPress: () => router.replace('/auth/login')
          }
        ]
      );
    } catch (error: any) {
      const errorMessage = getFirebaseErrorMessage(error);
      
      // Special handling for email already in use
      if (error?.code === 'auth/email-already-in-use') {
        Alert.alert(
          'Account Already Exists', 
          errorMessage,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Go to Login', 
              onPress: () => router.push('/auth/login')
            }
          ]
        );
      } else {
        Alert.alert('Signup Failed', errorMessage);
      }
    }
  };

  const handleGoogleSignup = async () => {
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
        Alert.alert('Google Signup Failed', error.message || 'An error occurred during Google signup');
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
              Create Account
            </Text>
            <Text style={[styles.subtitle, isDarkMode && styles.subtitleDark]}>
              Join Twin City Updates to stay connected with your community
            </Text>
          </View>

          {/* Signup Form */}
          <View style={styles.form}>
            {/* Display Name Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, isDarkMode && styles.inputLabelDark]}>
                Full Name
              </Text>
              <View style={[styles.inputWrapper, isDarkMode && styles.inputWrapperDark]}>
                <User size={20} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
                <TextInput
                  style={[styles.input, isDarkMode && styles.inputDark]}
                  placeholder="Enter your full name"
                  placeholderTextColor={isDarkMode ? '#6b7280' : '#9ca3af'}
                  value={displayName}
                  onChangeText={setDisplayName}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
            </View>

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
                  placeholder="Create a password"
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

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, isDarkMode && styles.inputLabelDark]}>
                Confirm Password
              </Text>
              <View style={[styles.inputWrapper, isDarkMode && styles.inputWrapperDark]}>
                <Lock size={20} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
                <TextInput
                  style={[styles.input, isDarkMode && styles.inputDark]}
                  placeholder="Confirm your password"
                  placeholderTextColor={isDarkMode ? '#6b7280' : '#9ca3af'}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeButton}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
                  ) : (
                    <Eye size={20} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Signup Button */}
            <TouchableOpacity
              style={[styles.signupButton, loading && styles.signupButtonDisabled]}
              onPress={handleEmailSignup}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.signupButtonText}>Create Account</Text>
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
              onPress={handleGoogleSignup}
              disabled={loading}
            >
              <Text style={[styles.googleButtonText, isDarkMode && styles.googleButtonTextDark]}>
                Continue with Google
              </Text>
            </TouchableOpacity>

            {/* Sign In Link */}
            <View style={styles.signInContainer}>
              <Text style={[styles.signInText, isDarkMode && styles.signInTextDark]}>
                Already have an account?{' '}
              </Text>
              <Link href="/auth/login" asChild>
                <TouchableOpacity>
                  <Text style={styles.signInLink}>Sign In</Text>
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
    marginBottom: 32,
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
    marginBottom: 20,
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
  signupButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  signupButtonDisabled: {
    opacity: 0.6,
  },
  signupButtonText: {
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
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInText: {
    fontSize: 14,
    color: '#6b7280',
  },
  signInTextDark: {
    color: '#9ca3af',
  },
  signInLink: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
  },
});
