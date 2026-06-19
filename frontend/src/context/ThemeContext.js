import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

// Light theme colors
const lightColors = {
  primary: '#FF6B35',
  secondary: '#4ECDC4',
  accent: '#FFE66D',
  background: '#FFFFFF',
  surface: '#F8F9FA',
  text: '#1A1A2E',
  textSecondary: '#6C757D',
  textLight: '#ADB5BD',
  border: '#E9ECEF',
  error: '#DC3545',
  success: '#28A745',
  warning: '#FFC107',
  info: '#17A2B8',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',
  card: '#FFFFFF',
  gradient: {
    primary: ['#FF6B35', '#FF8E53'],
    secondary: ['#4ECDC4', '#44A08D'],
    story: ['#F58529', '#DD2A7B', '#8134AF', '#515BD4'],
  },
};

// Dark theme colors
const darkColors = {
  primary: '#FF6B35',
  secondary: '#4ECDC4',
  accent: '#FFE66D',
  background: '#121212',
  surface: '#1E1E1E',
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textLight: '#808080',
  border: '#2C2C2C',
  error: '#FF6B6B',
  success: '#4CAF50',
  warning: '#FFB74D',
  info: '#4FC3F7',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.7)',
  card: '#1E1E1E',
  gradient: {
    primary: ['#FF6B35', '#FF8E53'],
    secondary: ['#4ECDC4', '#44A08D'],
    story: ['#F58529', '#DD2A7B', '#8134AF', '#515BD4'],
  },
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [colors, setColors] = useState(lightColors);

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme === 'dark') {
        setIsDarkMode(true);
        setColors(darkColors);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newMode = !isDarkMode;
      setIsDarkMode(newMode);
      setColors(newMode ? darkColors : lightColors);
      await AsyncStorage.setItem('theme', newMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const value = {
    isDarkMode,
    colors,
    toggleTheme,
    lightColors,
    darkColors,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
