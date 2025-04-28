
import React from 'react';
import { PlayerPosition } from '@/types/game';

interface Projectile {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  progress: number;
}

interface ProjectilesProps {
  projectiles: Projectile[];
  playerPosition: PlayerPosition;
}

const Projectiles: React.FC<ProjectilesProps> = ({ projectiles, playerPosition }) => {
  return (
    <>
      {projectiles.map(projectile => {
        const currentX = playerPosition.x + (projectile.targetX - playerPosition.x) * projectile.progress;
        const currentY = playerPosition.y + (projectile.targetY - playerPosition.y) * projectile.progress;
        
        return (
          <div 
            key={projectile.id}
            className="absolute w-3 h-3 rounded-full bg-red-500 z-20 shadow-lg shadow-red-500/50"
            style={{
              left: `${currentX}%`,
              top: `${currentY}%`,
              transform: 'translate(-50%, -50%)',
              filter: 'drop-shadow(0 0 5px rgba(239, 68, 68, 0.8))'
            }}
          >
            <div className="w-full h-full animate-ping bg-red-300 rounded-full opacity-75"></div>
          </div>
        );
      })}
    </>
  );
};

export default Projectiles;
