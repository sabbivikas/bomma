
import React from 'react';
import { Boxes } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { getThemeConfig } from '@/utils/themeConfig';

interface DoodleCardImageProps {
  imageUrl: string;
  prompt: string;
  is3D: boolean;
  isHovered: boolean;
  on3DView: () => void;
}

const DoodleCardImage: React.FC<DoodleCardImageProps> = ({ 
  imageUrl, 
  prompt, 
  is3D, 
  isHovered, 
  on3DView 
}) => {
  const { theme } = useTheme();
  const visualThemeConfig = getThemeConfig(theme.visualTheme);
  
  return (
    <div 
      className={`aspect-square ${visualThemeConfig?.backgroundStyle || 'bg-gradient-to-b from-blue-50/50 to-purple-50/50'} flex items-center justify-center overflow-hidden rounded-sm transition-all duration-300 ${is3D ? 'cursor-pointer' : ''}`}
      onClick={is3D ? on3DView : undefined}
    >
      <img 
        src={imageUrl} 
        alt={prompt}
        className={`object-contain max-h-full max-w-full transform transition-transform duration-300 ${isHovered ? 'scale-105' : 'scale-100'}`}
      />
      
      {is3D && (
        <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm rounded-full p-1 shadow-sm border border-gray-200">
          <Boxes size={16} className="text-purple-500" />
        </div>
      )}
    </div>
  );
};

export default DoodleCardImage;
