import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeSettings } from '../types';

interface ThemeContextType {
  theme: ThemeSettings;
  updateTheme: (newTheme: Partial<ThemeSettings>) => void;
  resetTheme: () => void;
}

const defaultTheme: ThemeSettings = {
  accentColor: '#2563eb', // blue-600
  backgroundType: 'solid',
  backgroundValue: 'transparent',
  darkMode: false,
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeSettings>(() => {
    const saved = localStorage.getItem('appTheme');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return defaultTheme;
      }
    }
    return defaultTheme;
  });

  useEffect(() => {
    localStorage.setItem('appTheme', JSON.stringify(theme));
    
    // Apply dark mode
    if (theme.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Apply accent color as CSS variable
    document.documentElement.style.setProperty('--accent-color', theme.accentColor);
    
    // Apply background theme
    const mainContent = document.getElementById('main-content-area');
    if (mainContent) {
      if (theme.backgroundType === 'solid') {
        mainContent.style.backgroundColor = theme.backgroundValue;
        mainContent.style.backgroundImage = 'none';
      } else if (theme.backgroundType === 'gradient') {
        mainContent.style.backgroundImage = theme.backgroundValue;
        mainContent.style.backgroundColor = 'transparent';
      } else if (theme.backgroundType === 'pattern') {
        mainContent.style.backgroundImage = `url("${theme.backgroundValue}")`;
        mainContent.style.backgroundRepeat = 'repeat';
        mainContent.style.backgroundColor = 'transparent';
      } else if (theme.backgroundType === 'image') {
        mainContent.style.backgroundImage = `url("${theme.backgroundValue}")`;
        mainContent.style.backgroundSize = 'cover';
        mainContent.style.backgroundPosition = 'center';
        mainContent.style.backgroundAttachment = 'fixed';
        mainContent.style.backgroundColor = 'transparent';
      }
    }
  }, [theme]);

  const updateTheme = (newTheme: Partial<ThemeSettings>) => {
    setTheme(prev => ({ ...prev, ...newTheme }));
  };

  const resetTheme = () => {
    setTheme(defaultTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme, resetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
