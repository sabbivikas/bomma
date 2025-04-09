
import React from 'react';

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
  return (
    <div 
      className={`aspect-square bg-gray-50 flex items-center justify-center overflow-hidden ${is3D ? 'cursor-pointer' : ''}`}
      onClick={is3D ? on3DView : undefined}
    >
      <img 
        src={imageUrl} 
        alt={prompt}
        className={`object-contain max-h-full max-w-full transform transition-transform duration-300 ${isHovered ? 'scale-105' : 'scale-100'}`}
      />
    </div>
  );
};

export default DoodleCardImage;
