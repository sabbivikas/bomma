
import React from 'react';
import { Enemy, PlayerPosition } from '@/types/game';
import { Crosshair, Target } from 'lucide-react';

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
      className="w-full h-[350px] relative overflow-hidden rounded-lg border border-purple-500 mb-4 cursor-crosshair"
      onClick={onAreaClick}
      style={{
        backgroundImage: 'linear-gradient(to bottom, #1a1f2c, #2d3748)',
        backgroundSize: '20px 20px',
        backgroundPosition: 'center',
      }}
    >
      {/* Grid Lines */}
      <div 
        className="absolute inset-0" 
        style={{
          backgroundImage: 'linear-gradient(0deg, rgba(102, 51, 153, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(102, 51, 153, 0.1) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />
      
      {/* Player Character */}
      <div 
        className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10 transition-all duration-200"
        style={{ 
          left: `${playerPosition.x}%`, 
          top: `${playerPosition.y}%`,
        }}
      >
        <div className="relative">
          <img 
            src={characterImage} 
            alt={characterName} 
            className="w-12 h-12 object-contain"
          />
          <Crosshair className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 text-purple-400 w-4 h-4" />
        </div>
      </div>
      
      {/* Enemies/Targets */}
      {enemies.map((enemy) => (
        <div 
          key={enemy.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
          style={{ 
            left: `${enemy.x}%`, 
            top: `${enemy.y}%`,
          }}
        >
          <Target className="w-8 h-8 text-red-500" />
        </div>
      ))}
      
      {/* Score Display */}
      <div className="absolute top-4 left-4 text-purple-300 font-bold text-xl bg-black/50 px-3 py-1 rounded-full">
        Score: 10
      </div>
      
      {/* Energy Bar */}
      <div className="absolute top-4 right-4 w-32 h-4 bg-black/50 rounded-full overflow-hidden">
        <div className="h-full bg-purple-500" style={{ width: '75%' }} />
      </div>
      
      {/* Game Controls */}
      <div className="absolute bottom-4 left-4 flex gap-2">
        <button className="w-12 h-12 bg-purple-500/30 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-purple-500/40 text-white">
          ←
        </button>
        <button className="w-12 h-12 bg-purple-500/30 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-purple-500/40 text-white">
          →
        </button>
      </div>
      
      {/* Shoot Button */}
      <button className="absolute bottom-4 right-4 w-16 h-16 bg-red-500/30 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-red-500/40 border-2 border-red-500/50 text-white">
        <Crosshair className="w-8 h-8" />
      </button>
    </div>
  );
};

export default GameArea;
