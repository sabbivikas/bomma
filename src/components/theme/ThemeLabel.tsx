
import React from 'react';
import { VisualTheme, SeasonalTheme } from '@/types/theme';
import { getThemeConfig } from '@/utils/themeConfig';

interface ThemeLabelProps {
  visualTheme: VisualTheme;
  seasonalTheme: SeasonalTheme;
  className?: string;
}

const ThemeLabel: React.FC<ThemeLabelProps> = ({ 
  visualTheme, 
  seasonalTheme, 
  className = '' 
}) => {
  const visualThemeConfig = getThemeConfig(visualTheme);
  const seasonalThemeConfig = seasonalTheme !== 'none' ? getThemeConfig(seasonalTheme) : null;
  
  if (!visualThemeConfig) return null;
  
  return (
    <p className={`text-sm font-medium ${className}`}>
      {visualThemeConfig.name} 
      {seasonalThemeConfig && seasonalThemeConfig.id !== 'none' ? ` + ${seasonalThemeConfig.name}` : ''}
    </p>
  );
};

export default ThemeLabel;
