
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
      className="w-full h-[350px] relative bg-black rounded-lg border border-purple-400 mb-4 cursor-crosshair overflow-hidden" 
      onClick={onAreaClick}
      style={{
        backgroundImage: 'radial-gradient(circle at center, rgba(76, 29, 149, 0.3) 0%, rgba(0, 0, 0, 0.9) 100%)',
      }}
    >
      {/* Game grid background */}
      <div className="absolute inset-0" style={{
        backgroundImage: 'linear-gradient(rgba(76, 29, 149, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(76, 29, 149, 0.1) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }} />
      
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
          className="absolute transform -translate-x-1/2 -translate-y-1/2"
          style={{ 
            left: `${enemy.x}%`, 
            top: `${enemy.y}%`,
            width: `${enemy.size}px`,
            height: `${enemy.size}px`,
          }}
        >
          <div className="w-full h-full rounded-full bg-red-500 border-2 border-red-300 flex items-center justify-center text-white text-xs animate-pulse shadow-lg shadow-red-500/50">
            {enemy.type === 'plane' ? '✈️' : enemy.type === 'asteroid' ? '☄️' : '👾'}
          </div>
        </div>
      ))}
      
      <div className="absolute bottom-2 left-2 text-xs text-purple-300">
        Move & Attack
      </div>
    </div>
  );
};

export default GameArea;
