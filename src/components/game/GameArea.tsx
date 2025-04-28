
import React, { useState, useEffect } from 'react';
import { Enemy, PlayerPosition } from '@/types/game';
import { Target, Crosshair, Rocket } from 'lucide-react';

interface GameAreaProps {
  enemies: Enemy[];
  playerPosition: PlayerPosition;
  characterImage: string;
  characterName: string;
  onAreaClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  onShoot: () => void;  // Add the new shooting function prop
  score: number;  // Add score to show in the HUD
}

// New types for projectiles
interface Projectile {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  progress: number;
}

const GameArea: React.FC<GameAreaProps> = ({
  enemies,
  playerPosition,
  characterImage,
  characterName,
  onAreaClick,
  onShoot,  // Added prop
  score,    // Added prop
}) => {
  // State for projectiles
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [lastShotTime, setLastShotTime] = useState(0);

  // Handle shooting mechanics
  const handleShoot = () => {
    if (Date.now() - lastShotTime < 300) return; // Rate limiting
    
    const closestEnemy = findClosestEnemy();
    if (!closestEnemy) return;
    
    const newProjectile = {
      id: Date.now(),
      x: playerPosition.x,
      y: playerPosition.y,
      targetX: closestEnemy.x,
      targetY: closestEnemy.y,
      progress: 0
    };
    
    setProjectiles([...projectiles, newProjectile]);
    setLastShotTime(Date.now());
    
    // Call the onShoot callback to actually perform the damage and scoring
    onShoot();
  };

  // Find the closest enemy to the player
  const findClosestEnemy = () => {
    if (enemies.length === 0) return null;
    
    let closest = enemies[0];
    let minDistance = calculateDistance(playerPosition, enemies[0]);
    
    enemies.forEach(enemy => {
      const distance = calculateDistance(playerPosition, enemy);
      if (distance < minDistance) {
        minDistance = distance;
        closest = enemy;
      }
    });
    
    return closest;
  };

  const calculateDistance = (pos1: {x: number, y: number}, pos2: {x: number, y: number}) => {
    return Math.sqrt(
      Math.pow(pos1.x - pos2.x, 2) + 
      Math.pow(pos1.y - pos2.y, 2)
    );
  };

  // Update projectiles
  useEffect(() => {
    if (projectiles.length === 0) return;
    
    const interval = setInterval(() => {
      setProjectiles(prevProjectiles => 
        prevProjectiles
          .map(p => ({
            ...p,
            progress: p.progress + 0.05
          }))
          .filter(p => p.progress < 1) // Remove completed projectiles
      );
    }, 16); // ~60fps
    
    return () => clearInterval(interval);
  }, [projectiles.length]);

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        handleShoot();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playerPosition, enemies]);

  return (
    <div 
      className="w-full h-[450px] relative overflow-hidden rounded-lg border-2 border-purple-600/50 mb-4 cursor-crosshair"
      onClick={(e) => {
        onAreaClick(e);
        handleShoot();
      }}
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
            <Crosshair className="text-red-400 w-6 h-6 animate-pulse" />
          </div>
        </div>
      </div>
      
      {/* Projectiles */}
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
      
      {/* Targeting Lines */}
      {enemies.length > 0 && (
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
      )}
      
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
        <div className="text-purple-300 font-bold text-xl">Score: {score}</div>
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
        <button 
          className="w-14 h-14 bg-purple-600/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-purple-600/30 border border-purple-500/30 text-white"
          onClick={(e) => {
            e.stopPropagation();
            // Move left logic
          }}
        >
          ←
        </button>
        <button 
          className="w-14 h-14 bg-purple-600/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-purple-600/30 border border-purple-500/30 text-white"
          onClick={(e) => {
            e.stopPropagation();
            // Move right logic
          }}
        >
          →
        </button>
      </div>
      
      {/* Weapon Controls */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        <button 
          className="w-20 h-20 bg-red-500/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-red-500/30 border-2 border-red-500/30"
          onClick={(e) => {
            e.stopPropagation();
            handleShoot();
          }}
        >
          <Rocket className="w-10 h-10 text-red-400" />
        </button>
      </div>
    </div>
  );
};

export default GameArea;
