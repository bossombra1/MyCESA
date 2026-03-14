import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const THEMES = {
  light: {
    nom: 'light',
    bg: '#F5F7F5',
    card: '#FFFFFF',
    cardBorder: '#E2E8F0',
    text: '#1E293B',
    textSub: '#64748B',
    textMuted: '#94A3B8',
    header: '#2E7D32',
    hero: '#2E7D32',
    input: '#F8FAFC',
    inputBorder: '#E2E8F0',
    drawer: '#FFFFFF',
    drawerBorder: '#F1F5F9',
    overlay: 'rgba(0,0,0,0.5)',
    statusBar: 'light-content',
    tabBar: '#FFFFFF',
    section: '#FFFFFF',
    empty: '#F0FDF4',
    emptyTxt: '#2E7D32',
  },
  dark: {
    nom: 'dark',
    bg: '#0F172A',
    card: '#1E293B',
    cardBorder: '#334155',
    text: '#F1F5F9',
    textSub: '#94A3B8',
    textMuted: '#64748B',
    header: '#1E293B',
    hero: '#1E293B',
    input: '#0F172A',
    inputBorder: '#334155',
    drawer: '#1E293B',
    drawerBorder: '#334155',
    overlay: 'rgba(0,0,0,0.7)',
    statusBar: 'light-content',
    tabBar: '#1E293B',
    section: '#1E293B',
    empty: '#1E3A2F',
    emptyTxt: '#4ADE80',
  },
};

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('theme').then(val => {
      if (val === 'dark') setIsDark(true);
    });
  }, []);

  const toggleTheme = async () => {
    const next = !isDark;
    setIsDark(next);
    await AsyncStorage.setItem('theme', next ? 'dark' : 'light');
  };

  const theme = isDark ? THEMES.dark : THEMES.light;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);