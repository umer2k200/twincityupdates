import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'en' | 'ur';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation keys and their values
const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.saved': 'Saved',
    'nav.weather': 'Weather',
    'nav.notifications': 'Notifications',
    'nav.settings': 'Settings',
    
    // Settings
    'settings.title': 'Settings',
    'settings.language': 'Language',
    'settings.darkMode': 'Dark Mode',
    'settings.cache': 'Cache',
    'settings.about': 'About',
    'settings.signOut': 'Sign Out',
    'settings.language.english': 'English',
    'settings.language.urdu': 'Urdu',
    'settings.cache.clear': 'Clear Cache',
    'settings.cache.size': 'Cache Size',
    'settings.about.version': 'Version',
    'settings.about.build': 'Build',
    
    // Home
    'home.title': 'Twin City Updates',
    'home.subtitle': 'Stay informed with the latest news',
    'home.categories': 'Categories',
    'home.loading': 'Loading...',
    'home.refresh': 'Pull to refresh',
    'home.noNews': 'No news available',
    
    // Notifications
    'notifications.title': 'Notifications',
    'notifications.markAllRead': 'Mark all read',
    'notifications.noNotifications': 'No Notifications',
    'notifications.allCaughtUp': 'You\'re all caught up! Check back later for new updates.',
    
    // Saved News
    'saved.title': 'Saved News',
    'saved.clearAll': 'Clear All',
    'saved.noSavedNews': 'No Saved News',
    'saved.noSavedNewsDesc': 'You haven\'t saved any news yet. Save articles from the home screen to see them here.',
    
    // News Detail
    'newsDetail.share': 'Share',
    'newsDetail.externalLink': 'External Link',
    'newsDetail.back': 'Back',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.retry': 'Retry',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.close': 'Close',
  },
  ur: {
    // Navigation
    'nav.home': 'ہوم',
    'nav.saved': 'محفوظ',
    'nav.weather': 'موسم',
    'nav.notifications': 'اطلاعات',
    'nav.settings': 'ترتیبات',
    
    // Settings
    'settings.title': 'ترتیبات',
    'settings.language': 'زبان',
    'settings.darkMode': 'ڈارک موڈ',
    'settings.cache': 'کیش',
    'settings.about': 'کے بارے میں',
    'settings.signOut': 'سائن آؤٹ',
    'settings.language.english': 'انگریزی',
    'settings.language.urdu': 'اردو',
    'settings.cache.clear': 'کیش صاف کریں',
    'settings.cache.size': 'کیش کا سائز',
    'settings.about.version': 'ورژن',
    'settings.about.build': 'بلڈ',
    
    // Home
    'home.title': 'ٹوئن سٹی اپڈیٹس',
    'home.subtitle': 'تازہ ترین خبروں سے باخبر رہیں',
    'home.categories': 'کیٹگریز',
    'home.loading': 'لوڈ ہو رہا ہے...',
    'home.refresh': 'ریفریش کے لیے کھینچیں',
    'home.noNews': 'کوئی خبر دستیاب نہیں',
    
    // Notifications
    'notifications.title': 'اطلاعات',
    'notifications.markAllRead': 'سب پڑھے ہوئے نشان زد کریں',
    'notifications.noNotifications': 'کوئی اطلاع نہیں',
    'notifications.allCaughtUp': 'آپ سب کچھ دیکھ چکے ہیں! نئی اپڈیٹس کے لیے بعد میں دوبارہ چیک کریں۔',
    
    // Saved News
    'saved.title': 'محفوظ خبریں',
    'saved.clearAll': 'سب صاف کریں',
    'saved.noSavedNews': 'کوئی محفوظ خبر نہیں',
    'saved.noSavedNewsDesc': 'آپ نے ابھی تک کوئی خبر محفوظ نہیں کی۔ ہوم اسکرین سے مضامین محفوظ کریں تاکہ وہ یہاں نظر آئیں۔',
    
    // News Detail
    'newsDetail.share': 'شیئر کریں',
    'newsDetail.externalLink': 'بیرونی لنک',
    'newsDetail.back': 'واپس',
    
    // Common
    'common.loading': 'لوڈ ہو رہا ہے...',
    'common.error': 'خرابی',
    'common.retry': 'دوبارہ کوشش کریں',
    'common.cancel': 'منسوخ',
    'common.confirm': 'تصدیق',
    'common.save': 'محفوظ',
    'common.delete': 'حذف',
    'common.edit': 'ترمیم',
    'common.close': 'بند',
  },
};

const LANGUAGE_STORAGE_KEY = 'app_language';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ur')) {
        setLanguageState(savedLanguage as Language);
      }
    } catch (error) {
      console.error('Error loading language:', error);
    }
  };

  const setLanguage = async (newLanguage: Language) => {
    try {
      setLanguageState(newLanguage);
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, newLanguage);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
