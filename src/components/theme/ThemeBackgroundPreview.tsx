
import React from 'react';
import { VisualTheme, SeasonalTheme } from '@/types/theme';
import { getThemeConfig } from '@/utils/themeConfig';

interface ThemeBackgroundPreviewProps {
  visualTheme: VisualTheme;
  seasonalTheme: SeasonalTheme;
  children?: React.ReactNode;
  className?: string;
}

const ThemeBackgroundPreview: React.FC<ThemeBackgroundPreviewProps> = ({
  visualTheme,
  seasonalTheme,
  children,
  className = ''
}) => {
  const visualThemeConfig = getThemeConfig(visualTheme);
  const seasonalThemeConfig = seasonalTheme !== 'none' ? getThemeConfig(seasonalTheme) : null;
  
  if (!visualThemeConfig) return null;
  
  return (
    <div 
      className={`${visualThemeConfig.backgroundStyle} ${className}`}
      style={seasonalThemeConfig && seasonalThemeConfig.id !== 'none' ? { 
        position: 'relative', 
        overflow: 'hidden'
      } : {}}
    >
      {seasonalThemeConfig && seasonalThemeConfig.id !== 'none' && (
        <div 
          className="absolute inset-0 opacity-40"
          style={{ 
            backgroundImage: `url('/themes/${seasonalThemeConfig.id}-pattern.svg')`, 
            backgroundSize: 'cover',
            mixBlendMode: 'overlay'
          }}
        />
      )}
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default ThemeBackgroundPreview;
