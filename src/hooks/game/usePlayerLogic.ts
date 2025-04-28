
import { useState } from 'react';
import { PlayerPosition } from '@/types/game';

export const usePlayerLogic = () => {
  const [playerPosition, setPlayerPosition] = useState<PlayerPosition>({ x: 50, y: 50 });
  const [health, setHealth] = useState(100);
  const [lastShotTime, setLastShotTime] = useState(0);

  const handleDamage = (amount: number): boolean => {
    setHealth(prevHealth => {
      const newHealth = prevHealth - amount;
      return newHealth <= 0 ? 0 : newHealth;
    });
    return health <= 0;
  };

  return {
    playerPosition,
    setPlayerPosition,
    health,
    setHealth,
    lastShotTime,
    setLastShotTime,
    handleDamage
  };
};
