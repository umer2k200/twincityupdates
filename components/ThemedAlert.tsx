import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react-native';
import { getThemeColors } from '../constants/colors';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface ThemedAlertProps {
  visible: boolean;
  title: string;
  message: string;
  buttons?: AlertButton[];
  type?: 'info' | 'success' | 'warning' | 'error';
  onDismiss?: () => void;
  isDarkMode?: boolean;
}

export const ThemedAlert: React.FC<ThemedAlertProps> = ({
  visible,
  title,
  message,
  buttons = [{ text: 'OK', style: 'default' }],
  type = 'info',
  onDismiss,
  isDarkMode = false,
}) => {
  const colors = getThemeColors(isDarkMode);

  const getIcon = () => {
    const iconProps = { size: 48 };
    switch (type) {
      case 'success':
        return <CheckCircle {...iconProps} color={colors.status.success} />;
      case 'warning':
        return <AlertTriangle {...iconProps} color={colors.status.warning} />;
      case 'error':
        return <AlertCircle {...iconProps} color={colors.status.error} />;
      case 'info':
      default:
        return <Info {...iconProps} color={colors.primary} />;
    }
  };

  const handleButtonPress = (button: AlertButton) => {
    if (button.onPress) {
      button.onPress();
    }
    if (onDismiss) {
      onDismiss();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={[styles.alertContainer, isDarkMode && styles.alertContainerDark]}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            {getIcon()}
          </View>

          {/* Title */}
          <Text style={[styles.title, isDarkMode && styles.titleDark]}>
            {title}
          </Text>

          {/* Message */}
          <Text style={[styles.message, isDarkMode && styles.messageDark]}>
            {message}
          </Text>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.button,
                  button.style === 'cancel' && styles.cancelButton,
                  button.style === 'destructive' && styles.destructiveButton,
                  button.style === 'default' && styles.defaultButton,
                  isDarkMode && button.style === 'cancel' && styles.cancelButtonDark,
                  isDarkMode && button.style === 'destructive' && styles.destructiveButtonDark,
                  isDarkMode && button.style === 'default' && styles.defaultButtonDark,
                  buttons.length === 1 && styles.singleButton,
                ]}
                onPress={() => handleButtonPress(button)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.buttonText,
                    button.style === 'cancel' && styles.cancelButtonText,
                    button.style === 'destructive' && styles.destructiveButtonText,
                    button.style === 'default' && styles.defaultButtonText,
                    isDarkMode && button.style === 'cancel' && styles.cancelButtonTextDark,
                    isDarkMode && button.style === 'default' && styles.defaultButtonTextDark,
                  ]}
                >
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  alertContainerDark: {
    backgroundColor: '#1f2937',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  titleDark: {
    color: '#f9fafb',
  },
  message: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  messageDark: {
    color: '#9ca3af',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  singleButton: {
    flex: 1,
  },
  defaultButton: {
    backgroundColor: '#8b5cf6',
  },
  defaultButtonDark: {
    backgroundColor: '#7c3aed',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cancelButtonDark: {
    backgroundColor: '#374151',
    borderColor: '#4b5563',
  },
  destructiveButton: {
    backgroundColor: '#ef4444',
  },
  destructiveButtonDark: {
    backgroundColor: '#dc2626',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  defaultButtonText: {
    color: '#ffffff',
  },
  defaultButtonTextDark: {
    color: '#ffffff',
  },
  cancelButtonText: {
    color: '#374151',
  },
  cancelButtonTextDark: {
    color: '#f9fafb',
  },
  destructiveButtonText: {
    color: '#ffffff',
  },
});
