
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Game } from '@/components/GameCard';
import { useEnemyLogic } from './game/useEnemyLogic';
import { usePlayerLogic } from './game/usePlayerLogic';
import { useScoringLogic } from './game/useScoringLogic';

export const useGameLogic = (game: Game, characterName: string) => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const { toast } = useToast();

  const { 
    enemies, 
    setEnemies, 
    spawnEnemies 
  } = useEnemyLogic(game);

  const {
    playerPosition,
    setPlayerPosition,
    health,
    setHealth,
    lastShotTime,
    setLastShotTime,
    handleDamage
  } = usePlayerLogic();

  const {
    score,
    setScore,
    updateScore
  } = useScoringLogic(game, characterName);

  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setHealth(100);
    setGameOver(false);
    setEnemies([]);
    spawnEnemies();
    
    toast({
      title: 'Game Started',
      description: `${characterName} has entered ${game.title}!`,
      variant: 'success',
    });
  };

  const handleAction = () => {
    if (gameOver) return;
    shootAtClosestEnemy();
  };

  const shootAtClosestEnemy = () => {
    if (gameOver || !gameStarted || enemies.length === 0) return;
    
    if (Date.now() - lastShotTime < 300) return;
    setLastShotTime(Date.now());
    
    let closestEnemy = null;
    let closestDistance = Infinity;
    
    enemies.forEach(enemy => {
      const distance = Math.sqrt(
        Math.pow(playerPosition.x - enemy.x, 2) + 
        Math.pow(playerPosition.y - enemy.y, 2)
      );
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestEnemy = enemy;
      }
    });
    
    if (closestEnemy) {
      const updatedEnemies = enemies.map(enemy => {
        if (enemy.id === closestEnemy!.id) {
          return { ...enemy, health: enemy.health - 1 };
        }
        return enemy;
      });
      
      const remainingEnemies = updatedEnemies.filter(enemy => enemy.health > 0);
      const defeatedCount = updatedEnemies.length - remainingEnemies.length;
      
      if (defeatedCount > 0) {
        updateScore(defeatedCount);
        
        const audio = new Audio('/laser.mp3');
        audio.volume = 0.3;
        audio.play().catch(() => {});
      }
      
      setEnemies(remainingEnemies);
      
      if (remainingEnemies.length === 0) {
        toast({
          title: 'Wave Cleared',
          description: 'All enemies eliminated! Next wave incoming...',
          variant: 'success',
        });
        
        setTimeout(() => {
          spawnEnemies();
        }, 2000);
      }
    }
  };

  useEffect(() => {
    if (!gameStarted || gameOver) return;
    
    const enemyMovement = setInterval(() => {
      setEnemies(prevEnemies => {
        return prevEnemies.map(enemy => {
          const dx = (playerPosition.x - enemy.x) / 20;
          const dy = (playerPosition.y - enemy.y) / 20;
          
          return {
            ...enemy,
            x: enemy.x + dx,
            y: enemy.y + dy,
          };
        });
      });
      
      const enemyDamage = enemies.some(enemy => {
        const distance = Math.sqrt(
          Math.pow(playerPosition.x - enemy.x, 2) + 
          Math.pow(playerPosition.y - enemy.y, 2)
        );
        return distance < 15;
      });
      
      if (enemyDamage) {
        const isDead = handleDamage(5);
        if (isDead) {
          setGameOver(true);
          clearInterval(enemyMovement);
          toast({
            title: 'Game Over',
            description: `${characterName} was defeated! Final score: ${score}`,
            variant: 'destructive',
          });
        }
      }
    }, 500);
    
    return () => clearInterval(enemyMovement);
  }, [gameStarted, enemies, playerPosition, gameOver, characterName, score]);

  return {
    score,
    gameStarted,
    enemies,
    playerPosition,
    health,
    gameOver,
    startGame,
    handleAction,
    setPlayerPosition,
    shootAtClosestEnemy
  };
};
