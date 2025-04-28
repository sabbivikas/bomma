
import { useState } from 'react';
import { Enemy } from '@/types/game';
import { Game } from '@/components/GameCard';
import { useToast } from '@/hooks/use-toast';

export const useEnemyLogic = (game: Game) => {
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const { toast } = useToast();

  const getEnemyTypeForGame = (genre: string) => {
    switch(genre) {
      case 'Action Shooter': return 'drone';
      case 'Mech Combat': return 'robot';
      case 'Beat-em-up': return 'fighter';
      case 'FPS': return 'alien';
      default: return 'enemy';
    }
  };

  const spawnEnemies = () => {
    const newEnemies: Enemy[] = [];
    const count = game.difficulty === 'easy' ? 3 : game.difficulty === 'medium' ? 5 : 7;
    
    for (let i = 0; i < count; i++) {
      const enemyType = getEnemyTypeForGame(game.genre);
      newEnemies.push({
        id: Date.now() + i,
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10,
        health: game.difficulty === 'easy' ? 1 : game.difficulty === 'medium' ? 2 : 3,
        type: enemyType,
        size: Math.random() * 10 + 20,
      });
    }
    
    setEnemies(newEnemies);
  };

  return {
    enemies,
    setEnemies,
    spawnEnemies,
    getEnemyTypeForGame
  };
};
