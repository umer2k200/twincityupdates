import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Search, X } from 'lucide-react-native';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  isDarkMode?: boolean;
}

export function SearchBar({ 
  value, 
  onChangeText, 
  placeholder = "Search updates...",
  isDarkMode = false 
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(animation, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    if (!value) {
      setIsFocused(false);
      Animated.timing(animation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const handleClear = () => {
    onChangeText('');
    setIsFocused(false);
    Animated.timing(animation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const containerStyles = [
    styles.container,
    isDarkMode && styles.containerDark,
    isFocused && (isDarkMode ? styles.containerFocusedDark : styles.containerFocused),
  ];

  const inputStyles = [
    styles.input,
    isDarkMode && styles.inputDark,
  ];

  return (
    <Animated.View style={containerStyles}>
      <Search 
        size={20} 
        color={isDarkMode ? '#9ca3af' : '#6b7280'} 
        style={styles.searchIcon} 
      />
      <TextInput
        style={inputStyles}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={isDarkMode ? '#6b7280' : '#9ca3af'}
        onFocus={handleFocus}
        onBlur={handleBlur}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
          <X size={18} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  containerDark: {
    backgroundColor: '#374151',
  },
  containerFocused: {
    borderColor: '#2563eb',
    backgroundColor: '#ffffff',
    shadowColor: '#2563eb',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  containerFocusedDark: {
    borderColor: '#60a5fa',
    backgroundColor: '#1f2937',
    shadowColor: '#60a5fa',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingVertical: 4,
  },
  inputDark: {
    color: '#f9fafb',
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
});