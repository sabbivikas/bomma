
import React from 'react';
import { Enemy, PlayerPosition } from '@/types/game';

interface GameAreaProps {
  enemies: Enemy[];
  playerPosition: PlayerPosition;
  characterImage: string;
  characterName: string;
  onAreaClick: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const GameArea: React.FC<GameAreaProps> = ({
  enemies,
  playerPosition,
  characterImage,
  characterName,
  onAreaClick,
}) => {
  return (
    <div className="w-full h-[350px] relative bg-black/20 rounded-lg border border-purple-800/30 mb-4 cursor-crosshair" onClick={onAreaClick}>
      <div 
        className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
        style={{ 
          left: `${playerPosition.x}%`, 
          top: `${playerPosition.y}%`,
        }}
      >
        <img 
          src={characterImage} 
          alt={characterName} 
          className="w-12 h-12 object-contain"
        />
      </div>
      
      {enemies.map((enemy) => (
        <div 
          key={enemy.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
          style={{ 
            left: `${enemy.x}%`, 
            top: `${enemy.y}%`,
            width: `${enemy.size}px`,
            height: `${enemy.size}px`,
          }}
        >
          <div className="w-full h-full rounded-full bg-red-500 border border-red-700 flex items-center justify-center text-white text-xs">
            {enemy.type.charAt(0).toUpperCase()}
          </div>
        </div>
      ))}
      
      <div className="absolute bottom-2 left-2 text-xs text-gray-400">
        Click in the area to move
      </div>
    </div>
  );
};

export default GameArea;
