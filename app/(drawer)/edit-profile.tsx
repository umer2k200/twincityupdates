import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Mail, Lock, Shield, Save } from 'lucide-react-native';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { router } from 'expo-router';
import { getThemeColors } from '../../constants/colors';
import { ThemedAlert } from '../../components/ThemedAlert';
import { useThemedAlert } from '../../hooks/useThemedAlert';

export default function EditProfileScreen() {
  const { state } = useApp();
  const { user, userProfile, updateUserProfile } = useAuth();
  const isDarkMode = state.preferences.darkMode;
  const colors = getThemeColors(isDarkMode);
  const { alertConfig, isVisible, showAlert, hideAlert } = useThemedAlert();

  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async () => {
    if (!displayName.trim()) {
      showAlert({
        title: 'Name Required',
        message: 'Please enter your display name',
        type: 'warning',
        buttons: [{ text: 'OK', style: 'default' }]
      });
      return;
    }

    try {
      setSaving(true);
      await updateUserProfile({ displayName: displayName.trim() });
      
      showAlert({
        title: 'Profile Updated',
        message: 'Your profile has been updated successfully!',
        type: 'success',
        buttons: [
          { 
            text: 'Done', 
            style: 'default',
            onPress: () => router.back()
          }
        ]
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      showAlert({
        title: 'Update Failed',
        message: 'Failed to update profile. Please try again.',
        type: 'error',
        buttons: [{ text: 'OK', style: 'default' }]
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showAlert({
        title: 'All Fields Required',
        message: 'Please fill in all password fields',
        type: 'warning',
        buttons: [{ text: 'OK', style: 'default' }]
      });
      return;
    }

    if (newPassword.length < 6) {
      showAlert({
        title: 'Weak Password',
        message: 'New password must be at least 6 characters long',
        type: 'warning',
        buttons: [{ text: 'OK', style: 'default' }]
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      showAlert({
        title: 'Password Mismatch',
        message: 'New passwords do not match',
        type: 'error',
        buttons: [{ text: 'OK', style: 'default' }]
      });
      return;
    }

    showAlert({
      title: 'Change Password',
      message: 'Password change functionality requires re-authentication. This feature will be available in the next update.',
      type: 'info',
      buttons: [{ text: 'OK', style: 'default' }]
    });
  };

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={isDarkMode ? "#111827" : "#ffffff"}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Information Section */}
        <View style={[styles.section, isDarkMode && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>
            Profile Information
          </Text>

          {/* Display Name */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, isDarkMode && styles.labelDark]}>
              Display Name
            </Text>
            <View style={[styles.inputWrapper, isDarkMode && styles.inputWrapperDark]}>
              <User size={20} color={colors.primary} />
              <TextInput
                style={[styles.input, isDarkMode && styles.inputDark]}
                placeholder="Enter your name"
                placeholderTextColor={isDarkMode ? '#6b7280' : '#9ca3af'}
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Email (Read-only) */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, isDarkMode && styles.labelDark]}>
              Email Address
            </Text>
            <View style={[styles.inputWrapper, styles.inputDisabled, isDarkMode && styles.inputWrapperDark]}>
              <Mail size={20} color={colors.text.tertiary} />
              <TextInput
                style={[styles.input, styles.inputDisabledText, isDarkMode && styles.inputDark]}
                value={user?.email || ''}
                editable={false}
              />
            </View>
            <Text style={[styles.helperText, isDarkMode && styles.helperTextDark]}>
              Email cannot be changed
            </Text>
          </View>

          {/* Save Profile Button */}
          <TouchableOpacity
            style={[styles.saveButton, isDarkMode && styles.saveButtonDark, saving && styles.saveButtonDisabled]}
            onPress={handleSaveProfile}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <>
                <Save size={20} color="#ffffff" />
                <Text style={styles.saveButtonText}>Save Profile</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Security Section */}
        <View style={[styles.section, isDarkMode && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>
            Security
          </Text>

          {/* Current Password */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, isDarkMode && styles.labelDark]}>
              Current Password
            </Text>
            <View style={[styles.inputWrapper, isDarkMode && styles.inputWrapperDark]}>
              <Lock size={20} color={colors.primary} />
              <TextInput
                style={[styles.input, isDarkMode && styles.inputDark]}
                placeholder="Enter current password"
                placeholderTextColor={isDarkMode ? '#6b7280' : '#9ca3af'}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* New Password */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, isDarkMode && styles.labelDark]}>
              New Password
            </Text>
            <View style={[styles.inputWrapper, isDarkMode && styles.inputWrapperDark]}>
              <Lock size={20} color={colors.primary} />
              <TextInput
                style={[styles.input, isDarkMode && styles.inputDark]}
                placeholder="Enter new password (min 6 characters)"
                placeholderTextColor={isDarkMode ? '#6b7280' : '#9ca3af'}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Confirm New Password */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, isDarkMode && styles.labelDark]}>
              Confirm New Password
            </Text>
            <View style={[styles.inputWrapper, isDarkMode && styles.inputWrapperDark]}>
              <Lock size={20} color={colors.primary} />
              <TextInput
                style={[styles.input, isDarkMode && styles.inputDark]}
                placeholder="Confirm new password"
                placeholderTextColor={isDarkMode ? '#6b7280' : '#9ca3af'}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Change Password Button */}
          <TouchableOpacity
            style={[styles.changePasswordButton, isDarkMode && styles.changePasswordButtonDark]}
            onPress={handleChangePassword}
          >
            <Shield size={20} color={colors.primary} />
            <Text style={[styles.changePasswordText, isDarkMode && styles.changePasswordTextDark]}>
              Change Password
            </Text>
          </TouchableOpacity>
        </View>

        {/* Account Info */}
        <View style={[styles.infoSection, isDarkMode && styles.infoSectionDark]}>
          <Text style={[styles.infoText, isDarkMode && styles.infoTextDark]}>
            Your account is secured with Firebase Authentication
          </Text>
          <Text style={[styles.infoSubtext, isDarkMode && styles.infoSubtextDark]}>
            Account ID: {user?.uid.substring(0, 8)}...
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
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionDark: {
    backgroundColor: '#1f2937',
    shadowOpacity: 0.3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 20,
  },
  sectionTitleDark: {
    color: '#f9fafb',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  labelDark: {
    color: '#d1d5db',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  inputWrapperDark: {
    backgroundColor: '#111827',
    borderColor: '#374151',
  },
  inputDisabled: {
    opacity: 0.6,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  inputDark: {
    color: '#f9fafb',
  },
  inputDisabledText: {
    color: '#6b7280',
  },
  helperText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  helperTextDark: {
    color: '#9ca3af',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8b5cf6',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 10,
    gap: 8,
  },
  saveButtonDark: {
    backgroundColor: '#7c3aed',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  changePasswordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f0ff',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 10,
    gap: 8,
    borderWidth: 2,
    borderColor: '#8b5cf6',
  },
  changePasswordButtonDark: {
    backgroundColor: '#1e1b4b',
    borderColor: '#a78bfa',
  },
  changePasswordText: {
    color: '#8b5cf6',
    fontSize: 16,
    fontWeight: '600',
  },
  changePasswordTextDark: {
    color: '#a78bfa',
  },
  infoSection: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 40,
    padding: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
  },
  infoSectionDark: {
    backgroundColor: '#374151',
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 4,
  },
  infoTextDark: {
    color: '#9ca3af',
  },
  infoSubtext: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
  infoSubtextDark: {
    color: '#6b7280',
  },
});
