import { ThemeConfig } from '@/types/theme';

// Visual Themes
export const visualThemes: ThemeConfig[] = [
  {
    id: 'white',
    name: 'White',
    description: 'Clean white background',
    category: 'visual',
    backgroundStyle: 'bg-white',
    textStyle: 'font-elegant text-black',
    accentColor: 'bg-gray-300',
    borderStyle: 'border-gray-200',
  },
  {
    id: 'default',
    name: 'Default',
    description: 'The standard Bomma theme',
    category: 'visual',
    backgroundStyle: 'bg-gradient-to-b from-[#E0F7FA] via-[#B3E5FC] to-[#D1C4E9]',
    textStyle: 'font-elegant text-black',
    accentColor: 'bg-purple-500',
    borderStyle: 'border-gray-200',
  },
  {
    id: 'ghibli',
    name: 'Ghibli Dreams',
    description: 'Dreamy and whimsical like Studio Ghibli films',
    category: 'visual',
    backgroundStyle: 'bg-gradient-to-b from-[#E6F0FD] via-[#D3ECFD] to-[#FCE8E6]',
    textStyle: 'font-elegant text-[#58626C]',
    accentColor: 'bg-[#7BB0F9]',
    borderStyle: 'border-[#D8E3F4]',
  },
  {
    id: 'darkFantasy',
    name: 'Dark Fantasy',
    description: 'Mysterious and magical dark theme',
    category: 'visual',
    backgroundStyle: 'bg-gradient-to-b from-[#1A1B26] via-[#292A37] to-[#3A3C4E]',
    textStyle: 'font-elegant text-[#D5D6E0]',
    accentColor: 'bg-[#BB9AF7]',
    borderStyle: 'border-[#414868]',
  },
  {
    id: 'vintage',
    name: 'Vintage',
    description: 'Old-school nostalgic feel',
    category: 'visual',
    backgroundStyle: 'bg-gradient-to-b from-[#F3E7D3] via-[#EBD9B4] to-[#D9C9A3]',
    textStyle: 'font-elegant text-[#5F4B32]',
    accentColor: 'bg-[#A98467]',
    borderStyle: 'border-[#D9C9A3]',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean and simple interface',
    category: 'visual',
    backgroundStyle: 'bg-white',
    textStyle: 'font-elegant text-gray-900',
    accentColor: 'bg-black',
    borderStyle: 'border-gray-100',
  },
  {
    id: 'comic',
    name: 'Comic Book',
    description: 'Bold comic book style',
    category: 'visual',
    backgroundStyle: 'bg-gradient-to-b from-[#FFF8DC] via-[#FFFACD] to-[#FAFAD2]',
    textStyle: 'font-funky text-[#333]',
    accentColor: 'bg-[#FF5252]',
    borderStyle: 'border-dashed border-[#333] border-2',
  }
];

// Seasonal Themes
export const seasonalThemes: ThemeConfig[] = [
  {
    id: 'none',
    name: 'None',
    description: 'No seasonal theme',
    category: 'seasonal',
    backgroundStyle: '',
    textStyle: '',
    accentColor: '',
    borderStyle: '',
  },
  {
    id: 'spring',
    name: 'Spring',
    description: 'Fresh blooms and gentle colors',
    category: 'seasonal',
    backgroundStyle: 'bg-gradient-to-b from-[#E9F5E3] via-[#F0FFF4] to-[#E3F5F9]',
    textStyle: 'text-[#2E7D32]',
    accentColor: 'bg-[#81C784]',
    borderStyle: 'border-[#C8E6C9]',
  },
  {
    id: 'summer',
    name: 'Summer',
    description: 'Bright and sunny vibes',
    category: 'seasonal',
    backgroundStyle: 'bg-gradient-to-b from-[#FFECB3] via-[#FFE0B2] to-[#BBDEFB]',
    textStyle: 'text-[#EF6C00]',
    accentColor: 'bg-[#FFB74D]',
    borderStyle: 'border-[#FFCC80]',
  },
  {
    id: 'autumn',
    name: 'Autumn',
    description: 'Warm and cozy fall colors',
    category: 'seasonal',
    backgroundStyle: 'bg-gradient-to-b from-[#FBE9E7] via-[#FFCCBC] to-[#D7CCC8]',
    textStyle: 'text-[#6D4C41]',
    accentColor: 'bg-[#FF8A65]',
    borderStyle: 'border-[#FFAB91]',
  },
  {
    id: 'winter',
    name: 'Winter',
    description: 'Cold and crisp winter feel',
    category: 'seasonal',
    backgroundStyle: 'bg-gradient-to-b from-[#E3F2FD] via-[#BBDEFB] to-[#E1F5FE]',
    textStyle: 'text-[#0277BD]',
    accentColor: 'bg-[#4FC3F7]',
    borderStyle: 'border-[#B3E5FC]',
  },
  {
    id: 'halloween',
    name: 'Halloween',
    description: 'Spooky Halloween theme',
    category: 'seasonal',
    backgroundStyle: 'bg-gradient-to-b from-[#2C2C2C] via-[#3D3D3D] to-[#4A148C]',
    textStyle: 'text-orange-500',
    accentColor: 'bg-[#FF6D00]',
    borderStyle: 'border-[#6A1B9A]',
  },
  {
    id: 'christmas',
    name: 'Christmas',
    description: 'Festive Christmas theme',
    category: 'seasonal',
    backgroundStyle: 'bg-gradient-to-b from-[#B71C1C] via-[#D32F2F] to-[#388E3C]',
    textStyle: 'text-[#FFEBEE]',
    accentColor: 'bg-[#4CAF50]',
    borderStyle: 'border-[#C8E6C9]',
  }
];

// Helper function to get theme configuration
export const getThemeConfig = (id: string): ThemeConfig | undefined => {
  return [...visualThemes, ...seasonalThemes].find(theme => theme.id === id);
};

// Helper function to get theme CSS classes
export const getThemeClasses = (visualTheme: string, seasonalTheme: string): string => {
  const visual = getThemeConfig(visualTheme);
  const seasonal = getThemeConfig(seasonalTheme);
  
  if (!visual) return '';
  
  // Combine visual theme with seasonal overlay if applicable
  if (seasonal && seasonal.id !== 'none') {
    return `${visual.backgroundStyle} ${visual.textStyle} ${seasonal.accentColor} ${seasonal.borderStyle}`;
  }
  
  return `${visual.backgroundStyle} ${visual.textStyle} ${visual.accentColor} ${visual.borderStyle}`;
};
