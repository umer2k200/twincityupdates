// Twin City Updates - Theme Configuration
import { getThemeColors, Colors } from './colors';

export const createTheme = (isDarkMode: boolean) => {
  const colors = getThemeColors(isDarkMode);
  
  return {
    colors,
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
    },
    borderRadius: {
      sm: 4,
      md: 8,
      lg: 12,
      xl: 16,
      full: 9999,
    },
    shadows: {
      sm: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      },
      md: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
      },
      lg: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
      },
    },
    typography: {
      h1: {
        fontSize: 32,
        fontWeight: 'bold' as const,
        lineHeight: 40,
      },
      h2: {
        fontSize: 24,
        fontWeight: 'bold' as const,
        lineHeight: 32,
      },
      h3: {
        fontSize: 20,
        fontWeight: '600' as const,
        lineHeight: 28,
      },
      body: {
        fontSize: 16,
        fontWeight: '400' as const,
        lineHeight: 24,
      },
      caption: {
        fontSize: 14,
        fontWeight: '400' as const,
        lineHeight: 20,
      },
      small: {
        fontSize: 12,
        fontWeight: '400' as const,
        lineHeight: 16,
      },
    },
  };
};

export { Colors };
export default createTheme;
