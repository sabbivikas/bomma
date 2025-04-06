
import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { getThemeConfig } from '@/utils/themeConfig';
import { VisualTheme, SeasonalTheme } from '@/types/theme';

interface ThemePreviewProps {
  className?: string;
}

const ThemePreview: React.FC<ThemePreviewProps> = ({ className = '' }) => {
  const { theme } = useTheme();
  const visualThemeConfig = getThemeConfig(theme.visualTheme);
  const seasonalThemeConfig = theme.seasonalTheme !== 'none' ? getThemeConfig(theme.seasonalTheme) : null;
  
  if (!visualThemeConfig) return null;
  
  return (
    <div className={`rounded-lg overflow-hidden shadow-md ${className}`}>
      <div 
        className={`p-4 h-24 ${visualThemeConfig.backgroundStyle}`}
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
          <h4 className={`font-bold ${visualThemeConfig.textStyle}`}>Theme Preview</h4>
          <div 
            className={`mt-2 w-16 h-6 rounded ${visualThemeConfig.accentColor}`}
          />
        </div>
      </div>
      
      <div className="bg-white p-4 border-t border-gray-200">
        <p className="text-sm font-medium">
          {visualThemeConfig.name} 
          {seasonalThemeConfig && seasonalThemeConfig.id !== 'none' ? ` + ${seasonalThemeConfig.name}` : ''}
        </p>
      </div>
    </div>
  );
};

export default ThemePreview;
