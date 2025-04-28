
import React from 'react';
import { Target } from 'lucide-react';
import { Enemy, PlayerPosition } from '@/types/game';

interface EnemiesProps {
  enemies: Enemy[];
  playerPosition: PlayerPosition;
}

const Enemies: React.FC<EnemiesProps> = ({ enemies, playerPosition }) => {
  return (
    <>
      {/* Targeting Lines */}
      <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
        {enemies.slice(0, 3).map((enemy) => (
          <line 
            key={`target-${enemy.id}`}
            x1={`${playerPosition.x}%`} 
            y1={`${playerPosition.y}%`}
            x2={`${enemy.x}%`} 
            y2={`${enemy.y}%`}
            stroke="rgba(239, 68, 68, 0.2)"
            strokeWidth="1"
            strokeDasharray="5,5"
          />
        ))}
      </svg>

      {/* Enemy Sprites */}
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
    </>
  );
};

export default Enemies;
