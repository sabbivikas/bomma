
import React from 'react';
import { Enemy, PlayerPosition } from '@/types/game';
import { Target, Crosshair, Rocket } from 'lucide-react';

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
      className="w-full h-[450px] relative overflow-hidden rounded-lg border-2 border-purple-600/50 mb-4 cursor-crosshair"
      onClick={onAreaClick}
      style={{
        background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
        backgroundSize: 'cover',
      }}
    >
      {/* Cyber Grid */}
      <div 
        className="absolute inset-0" 
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(124, 58, 237, 0.1) 1px, transparent 1px)',
          backgroundSize: '30px 30px',
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
            className="w-16 h-16 object-contain"
          />
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex items-center justify-center">
            <Crosshair className="text-purple-400 w-6 h-6 animate-pulse" />
          </div>
        </div>
      </div>
      
      {/* Enemies */}
      {enemies.map((enemy) => (
        <div 
          key={enemy.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2"
          style={{ 
            left: `${enemy.x}%`, 
            top: `${enemy.y}%`,
          }}
        >
          <Target className="w-12 h-12 text-red-500 animate-pulse" />
          <div className="h-1 w-12 bg-gray-800 rounded-full mt-1">
            <div 
              className="h-full bg-red-500 rounded-full transition-all duration-200"
              style={{ width: `${(enemy.health / 3) * 100}%` }}
            />
          </div>
        </div>
      ))}
      
      {/* HUD Elements */}
      <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-sm px-4 py-2 rounded-lg border border-purple-500/30">
        <div className="text-purple-300 font-bold text-xl">Score: 10</div>
      </div>
      
      {/* Energy Shield */}
      <div className="absolute top-4 right-4 w-48">
        <div className="text-sm text-purple-300 mb-1">Shield Energy</div>
        <div className="h-2 bg-black/40 rounded-full overflow-hidden">
          <div className="h-full w-3/4 bg-gradient-to-r from-purple-600 to-purple-400" />
        </div>
      </div>
      
      {/* Movement Controls */}
      <div className="absolute bottom-4 left-4 flex gap-2">
        <button className="w-14 h-14 bg-purple-600/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-purple-600/30 border border-purple-500/30 text-white">
          ←
        </button>
        <button className="w-14 h-14 bg-purple-600/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-purple-600/30 border border-purple-500/30 text-white">
          →
        </button>
      </div>
      
      {/* Weapon Controls */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        <button className="w-20 h-20 bg-red-500/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-red-500/30 border-2 border-red-500/30">
          <Rocket className="w-10 h-10 text-red-400" />
        </button>
      </div>
    </div>
  );
};

export default GameArea;
