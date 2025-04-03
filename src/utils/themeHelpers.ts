
import { ThemeState } from '@/types/theme';
import { getThemeConfig } from './themeConfig';

// Determine if a theme is a dark theme
export const isDarkTheme = (theme: ThemeState): boolean => {
  const visualTheme = theme.visualTheme;
  return visualTheme === 'darkFantasy';
};

// Get theme specific styles for components
export const getButtonStyles = (theme: ThemeState): string => {
  const { visualTheme, seasonalTheme } = theme;
  const visual = getThemeConfig(visualTheme);
  const seasonal = seasonalTheme !== 'none' ? getThemeConfig(seasonalTheme) : null;

  if (!visual) return '';

  // Special button styles for themes
  switch (visualTheme) {
    case 'darkFantasy':
      return 'bg-purple-800 hover:bg-purple-700 text-white border border-purple-600';
    case 'vintage':
      return 'bg-amber-700 hover:bg-amber-600 text-amber-50 border border-amber-900';
    case 'comic':
      return 'bg-black hover:bg-gray-800 text-white border-2 border-black sketchy-button';
    default:
      // Default style or seasonal override
      if (seasonal && seasonal.id !== 'none') {
        switch (seasonal.id) {
          case 'christmas':
            return 'bg-red-600 hover:bg-red-500 text-white border border-red-700';
          case 'halloween':
            return 'bg-orange-500 hover:bg-orange-400 text-black border border-orange-600';
          default:
            return `${seasonal.accentColor} hover:opacity-90 text-white`;
        }
      }
      return '';
  }
};

// Get theme specific card styles
export const getCardStyles = (theme: ThemeState): string => {
  const { visualTheme, seasonalTheme } = theme;
  const visual = getThemeConfig(visualTheme);
  
  if (!visual) return '';

  // Default card styles based on theme
  switch (visualTheme) {
    case 'darkFantasy':
      return 'bg-gray-800 text-gray-100 border border-gray-700';
    case 'vintage':
      return 'bg-amber-50 text-amber-900 border border-amber-200';
    case 'comic':
      return 'bg-white text-black border-2 border-black sketchy-box';
    case 'ghibli':
      return 'bg-white/80 backdrop-blur-sm border border-blue-100';
    default:
      return 'bg-white border border-gray-200';
  }
};

// Get seasonal greeting message
export const getSeasonalGreeting = (theme: ThemeState): string | null => {
  const { seasonalTheme } = theme;
  
  switch (seasonalTheme) {
    case 'spring':
      return 'Welcome to Spring! 🌸';
    case 'summer':
      return 'Enjoy Summer Vibes! ☀️';
    case 'autumn':
      return 'Autumn is in the air! 🍂';
    case 'winter':
      return 'Winter Wonderland! ❄️';
    case 'halloween':
      return 'Spooky Season! 👻';
    case 'christmas':
      return 'Happy Holidays! 🎄';
    default:
      return null;
  }
};
