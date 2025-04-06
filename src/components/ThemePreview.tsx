
import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { getThemeConfig } from '@/utils/themeConfig';
import ThemeBackgroundPreview from './theme/ThemeBackgroundPreview';
import ThemeLabel from './theme/ThemeLabel';
import { VisualTheme, SeasonalTheme } from '@/types/theme';

interface ThemePreviewProps {
  visualTheme: VisualTheme;
  seasonalTheme: SeasonalTheme;
  className?: string;
  onClick?: () => void;
}

const ThemePreview: React.FC<ThemePreviewProps> = ({ 
  visualTheme,
  seasonalTheme,
  className = '',
  onClick
}) => {
  const visualThemeConfig = getThemeConfig(visualTheme);
  
  if (!visualThemeConfig) return null;
  
  return (
    <div 
      className={`rounded-lg overflow-hidden shadow-md ${className}`}
      onClick={onClick}
    >
      <ThemeBackgroundPreview 
        visualTheme={visualTheme}
        seasonalTheme={seasonalTheme}
        className="p-4 h-24"
      >
        <h4 className={`font-bold ${visualThemeConfig.textStyle}`}>Theme Preview</h4>
        <div 
          className={`mt-2 w-16 h-6 rounded ${visualThemeConfig.accentColor}`}
        />
      </ThemeBackgroundPreview>
      
      <div className="bg-white p-4 border-t border-gray-200">
        <ThemeLabel 
          visualTheme={visualTheme}
          seasonalTheme={seasonalTheme}
        />
      </div>
    </div>
  );
};

export default ThemePreview;
