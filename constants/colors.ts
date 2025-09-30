// Twin City Updates - Purple Theme Colors
// Based on the app icon with purple background and white building

export const Colors = {
  // Primary Purple Colors (from your icon)
  primary: {
    50: '#f3f0ff',   // Very light purple
    100: '#e9e5ff',  // Light purple
    200: '#d6ceff',  // Lighter purple
    300: '#b8a8ff',  // Light purple
    400: '#9c7bff',  // Medium light purple
    500: '#8b5cf6',  // Main purple (closest to your icon)
    600: '#7c3aed',  // Darker purple
    700: '#6d28d9',  // Dark purple
    800: '#5b21b6',  // Darker purple
    900: '#4c1d95',  // Very dark purple
  },

  // Secondary Colors (complementary to purple)
  secondary: {
    50: '#f0f9ff',   // Very light blue
    100: '#e0f2fe',  // Light blue
    200: '#bae6fd',  // Lighter blue
    300: '#7dd3fc',  // Light blue
    400: '#38bdf8',  // Medium light blue
    500: '#0ea5e9',  // Main blue
    600: '#0284c7',  // Darker blue
    700: '#0369a1',  // Dark blue
    800: '#075985',  // Darker blue
    900: '#0c4a6e',  // Very dark blue
  },

  // Accent Colors
  accent: {
    success: '#10b981',  // Green
    warning: '#f59e0b',  // Orange
    error: '#ef4444',    // Red
    info: '#3b82f6',     // Blue
  },

  // Neutral Colors
  neutral: {
    50: '#f9fafb',   // Very light gray
    100: '#f3f4f6',  // Light gray
    200: '#e5e7eb',  // Lighter gray
    300: '#d1d5db',  // Light gray
    400: '#9ca3af',  // Medium light gray
    500: '#6b7280',  // Medium gray
    600: '#4b5563',  // Darker gray
    700: '#374151',  // Dark gray
    800: '#1f2937',  // Darker gray
    900: '#111827',  // Very dark gray
  },

  // Background Colors
  background: {
    light: '#ffffff',
    dark: '#111827',
    lightSecondary: '#f9fafb',
    darkSecondary: '#1f2937',
  },

  // Text Colors
  text: {
    light: {
      primary: '#111827',
      secondary: '#6b7280',
      tertiary: '#9ca3af',
      inverse: '#ffffff',
    },
    dark: {
      primary: '#f9fafb',
      secondary: '#d1d5db',
      tertiary: '#9ca3af',
      inverse: '#111827',
    },
  },

  // Status Colors
  status: {
    online: '#10b981',
    offline: '#ef4444',
    loading: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },

  // Social Media Colors (keep these for brand recognition)
  social: {
    twitter: '#1da1f2',
    facebook: '#1877f2',
    whatsapp: '#25d366',
  },
};

// Theme-specific color getters
export const getThemeColors = (isDarkMode: boolean) => ({
  primary: isDarkMode ? Colors.primary[400] : Colors.primary[600],
  primaryLight: isDarkMode ? Colors.primary[300] : Colors.primary[500],
  primaryDark: isDarkMode ? Colors.primary[500] : Colors.primary[700],
  
  secondary: isDarkMode ? Colors.secondary[400] : Colors.secondary[600],
  secondaryLight: isDarkMode ? Colors.secondary[300] : Colors.secondary[500],
  secondaryDark: isDarkMode ? Colors.secondary[500] : Colors.secondary[700],
  
  background: isDarkMode ? Colors.background.dark : Colors.background.light,
  backgroundSecondary: isDarkMode ? Colors.background.darkSecondary : Colors.background.lightSecondary,
  
  text: isDarkMode ? Colors.text.dark : Colors.text.light,
  
  border: isDarkMode ? Colors.neutral[700] : Colors.neutral[200],
  borderLight: isDarkMode ? Colors.neutral[600] : Colors.neutral[300],
  
  shadow: isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)',
  
  status: Colors.status,
});

export default Colors;
