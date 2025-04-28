
import React from 'react';
import { Skull, Ghost, ArrowDownToLine, Swords, Target } from 'lucide-react';
import { Enemy, PlayerPosition } from '@/types/game';

interface EnemiesProps {
  enemies: Enemy[];
  playerPosition: PlayerPosition;
}

const getEnemyIcon = (type: string) => {
  switch(type) {
    case 'drone':
      return <Ghost className="w-12 h-12 text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.4)]" />;
    case 'robot':
      return <ArrowDownToLine className="w-12 h-12 text-red-400 drop-shadow-[0_0_10px_rgba(239,68,68,0.4)]" />;
    case 'fighter':
      return <Swords className="w-12 h-12 text-yellow-400 drop-shadow-[0_0_10px_rgba(234,179,8,0.4)]" />;
    case 'alien':
      return <Skull className="w-12 h-12 text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.4)]" />;
    default:
      return <Target className="w-12 h-12 text-red-500" />;
  }
};

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
          className="absolute transform -translate-x-1/2 -translate-y-1/2 animate-pulse hover:scale-110 transition-transform"
          style={{ 
            left: `${enemy.x}%`, 
            top: `${enemy.y}%`,
          }}
        >
          {getEnemyIcon(enemy.type)}
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
