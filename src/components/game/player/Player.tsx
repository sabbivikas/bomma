
import React from 'react';
import { Crosshair } from 'lucide-react';
import { PlayerPosition } from '@/types/game';

interface PlayerProps {
  position: PlayerPosition;
  characterImage: string;
  characterName: string;
}

const Player: React.FC<PlayerProps> = ({ position, characterImage, characterName }) => {
  return (
    <div 
      className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10 transition-all duration-200"
      style={{ 
        left: `${position.x}%`, 
        top: `${position.y}%`,
      }}
    >
      <div className="relative">
        <img 
          src={characterImage} 
          alt={characterName} 
          className="w-16 h-16 object-contain"
        />
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex items-center justify-center">
          <Crosshair className="text-red-400 w-6 h-6 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default Player;
