
import React, { useState, useEffect } from 'react';
import { Enemy, PlayerPosition } from '@/types/game';
import Player from './player/Player';
import Projectiles from './projectiles/Projectiles';
import Enemies from './enemies/Enemies';
import GameHUD from './hud/GameHUD';
import Controls from './controls/GameControls';

interface GameAreaProps {
  enemies: Enemy[];
  playerPosition: PlayerPosition;
  characterImage: string;
  characterName: string;
  onAreaClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  onShoot: () => void;
  score: number;
}

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
  onShoot,
  score,
}) => {
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [lastShotTime, setLastShotTime] = useState(0);

  const handleShoot = () => {
    if (Date.now() - lastShotTime < 300) return;
    
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
    onShoot();
  };

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

  useEffect(() => {
    if (projectiles.length === 0) return;
    
    const interval = setInterval(() => {
      setProjectiles(prevProjectiles => 
        prevProjectiles
          .map(p => ({
            ...p,
            progress: p.progress + 0.05
          }))
          .filter(p => p.progress < 1)
      );
    }, 16);
    
    return () => clearInterval(interval);
  }, [projectiles.length]);

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
      
      <Player 
        position={playerPosition}
        characterImage={characterImage}
        characterName={characterName}
      />
      
      <Projectiles 
        projectiles={projectiles}
        playerPosition={playerPosition}
      />
      
      <Enemies 
        enemies={enemies}
        playerPosition={playerPosition}
      />
      
      <GameHUD score={score} />
      
      <Controls onShoot={handleShoot} />
    </div>
  );
};

export default GameArea;
