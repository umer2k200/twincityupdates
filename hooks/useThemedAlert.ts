import { useState } from 'react';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AlertConfig {
  title: string;
  message: string;
  buttons?: AlertButton[];
  type?: 'info' | 'success' | 'warning' | 'error';
}

export const useThemedAlert = () => {
  const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const showAlert = (config: AlertConfig) => {
    setAlertConfig(config);
    setIsVisible(true);
  };

  const hideAlert = () => {
    setIsVisible(false);
    setTimeout(() => {
      setAlertConfig(null);
    }, 300);
  };

  return {
    alertConfig,
    isVisible,
    showAlert,
    hideAlert,
  };
};
