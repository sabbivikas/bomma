
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
    <div 
      className="w-full h-[350px] relative overflow-hidden rounded-lg border border-teal-400 mb-4 cursor-pointer"
      onClick={onAreaClick}
      style={{
        backgroundImage: 'linear-gradient(to bottom, #33C3F0, #7BD6F4)',
      }}
    >
      {/* Stars */}
      {[...Array(6)].map((_, i) => (
        <div
          key={`star-${i}`}
          className="absolute text-yellow-300 text-2xl animate-pulse"
          style={{
            left: `${Math.random() * 80 + 10}%`,
            top: `${Math.random() * 60 + 10}%`,
          }}
        >
          ⭐
        </div>
      ))}
      
      {/* Platforms */}
      <div className="absolute bottom-0 w-full h-16 bg-teal-500" />
      <div className="absolute bottom-32 left-1/4 w-32 h-8 bg-teal-500" />
      <div className="absolute bottom-64 right-1/4 w-32 h-8 bg-teal-500" />
      
      {/* Player Character */}
      <div 
        className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10 transition-all duration-200"
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
      
      {/* Enemies/Obstacles */}
      {enemies.map((enemy) => (
        <div 
          key={enemy.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2"
          style={{ 
            left: `${enemy.x}%`, 
            top: `${enemy.y}%`,
          }}
        >
          <div className="w-8 h-8 bg-red-500 rotate-45 transform origin-center" />
        </div>
      ))}
      
      {/* Score Display */}
      <div className="absolute top-4 left-4 text-white font-bold text-xl">
        Score: 10
      </div>
      
      {/* Stars Counter */}
      <div className="absolute top-12 left-4 text-white font-bold">
        Stars: 1/6
      </div>
      
      {/* Game Controls */}
      <div className="absolute bottom-4 left-4 flex gap-2">
        <button className="w-12 h-12 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/40">
          ←
        </button>
        <button className="w-12 h-12 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/40">
          →
        </button>
      </div>
    </div>
  );
};

export default GameArea;
