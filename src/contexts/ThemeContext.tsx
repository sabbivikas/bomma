
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { VisualTheme, SeasonalTheme, ThemeState } from '@/types/theme';

interface ThemeContextType {
  theme: ThemeState;
  setVisualTheme: (theme: VisualTheme) => void;
  setSeasonalTheme: (theme: SeasonalTheme) => void;
}

const defaultTheme: ThemeState = {
  visualTheme: 'default',
  seasonalTheme: 'none',
};

const ThemeContext = createContext<ThemeContextType>({
  theme: defaultTheme,
  setVisualTheme: () => {},
  setSeasonalTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setTheme] = useState<ThemeState>(() => {
    // Try to get theme from localStorage
    const savedTheme = localStorage.getItem('bomma-theme');
    return savedTheme ? JSON.parse(savedTheme) : defaultTheme;
  });

  const setVisualTheme = (visualTheme: VisualTheme) => {
    const newTheme = { ...theme, visualTheme };
    setTheme(newTheme);
    localStorage.setItem('bomma-theme', JSON.stringify(newTheme));
  };

  const setSeasonalTheme = (seasonalTheme: SeasonalTheme) => {
    const newTheme = { ...theme, seasonalTheme };
    setTheme(newTheme);
    localStorage.setItem('bomma-theme', JSON.stringify(newTheme));
  };

  return (
    <ThemeContext.Provider value={{ theme, setVisualTheme, setSeasonalTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
