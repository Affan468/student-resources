import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Saved preference in localStorage ('light', 'dark', or null/system)
  const [themeMode, setThemeModeState] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
    return 'system';
  });

  // Effective theme: 'light' or 'dark'
  const [effectiveTheme, setEffectiveTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  // Update DOM and state when themeMode changes or system preference changes
  useEffect(() => {
    const root = document.documentElement;

    const computeEffectiveTheme = (mode) => {
      if (mode === 'light') return 'light';
      if (mode === 'dark') return 'dark';
      // System mode default
      if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return 'light';
    };

    const currentEffective = computeEffectiveTheme(themeMode);
    setEffectiveTheme(currentEffective);

    if (currentEffective === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }

    // Listen for OS system theme changes if mode is 'system'
    if (themeMode === 'system' && typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e) => {
        const newEffective = e.matches ? 'dark' : 'light';
        setEffectiveTheme(newEffective);
        if (newEffective === 'dark') {
          root.classList.add('dark');
          root.style.colorScheme = 'dark';
        } else {
          root.classList.remove('dark');
          root.style.colorScheme = 'light';
        }
      };

      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
      } else {
        mediaQuery.addListener(handleChange);
      }

      return () => {
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener('change', handleChange);
        } else {
          mediaQuery.removeListener(handleChange);
        }
      };
    }
  }, [themeMode]);

  // Set explicit mode ('light', 'dark', or 'system')
  const setThemeMode = (mode) => {
    setThemeModeState(mode);
    if (mode === 'light' || mode === 'dark') {
      localStorage.setItem('theme', mode);
    } else {
      localStorage.removeItem('theme');
    }
  };

  // Toggle between light and dark manually
  const toggleTheme = () => {
    if (effectiveTheme === 'dark') {
      setThemeMode('light');
    } else {
      setThemeMode('dark');
    }
  };

  const isDark = effectiveTheme === 'dark';

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        effectiveTheme,
        isDark,
        setThemeMode,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
