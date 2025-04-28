import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Enemy, PlayerPosition } from '@/types/game';
import { Game } from '@/components/GameCard';

export const useGameLogic = (game: Game, characterName: string) => {
  const { toast } = useToast();
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [playerPosition, setPlayerPosition] = useState<PlayerPosition>({ x: 50, y: 50 });
  const [health, setHealth] = useState(100);
  const [gameOver, setGameOver] = useState(false);
  const [lastShotTime, setLastShotTime] = useState(0);

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

  const getEnemyNameForGame = (genre: string) => {
    switch(genre) {
      case 'Action Shooter': return 'drone';
      case 'Mech Combat': return 'enemy mech';
      case 'Beat-em-up': return 'fighter';
      case 'FPS': return 'alien';
      default: return 'enemy';
    }
  };

  // New function to shoot at enemies and score points
  const shootAtClosestEnemy = () => {
    if (gameOver || !gameStarted || enemies.length === 0) return;
    
    // Rate limiting to prevent too rapid shooting
    if (Date.now() - lastShotTime < 300) return;
    setLastShotTime(Date.now());
    
    const points = game.difficulty === 'easy' ? 5 : game.difficulty === 'medium' ? 10 : 15;
    
    // Find closest enemy to shoot
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
        const earnedPoints = points * defeatedCount;
        setScore(prevScore => prevScore + earnedPoints);
        
        const enemyName = getEnemyNameForGame(game.genre);
        const message = defeatedCount === 1
          ? `${characterName} shot down a ${enemyName}! +${earnedPoints} points`
          : `${characterName} defeated ${defeatedCount} ${enemyName}s! +${earnedPoints} points`;
        
        // Play sound effect for successful hit
        const audio = new Audio('/laser.mp3');
        audio.volume = 0.3;
        audio.play().catch(() => {}); // Ignore autoplay errors
        
        toast({
          title: 'Target Eliminated',
          description: message,
          variant: 'success',
        });
      }
      
      setEnemies(remainingEnemies);
      
      if (remainingEnemies.length === 0) {
        toast({
          title: 'Wave Cleared',
          description: `All enemies eliminated! Next wave incoming...`,
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
        setHealth(prevHealth => {
          const newHealth = prevHealth - 5;
          if (newHealth <= 0) {
            setGameOver(true);
            clearInterval(enemyMovement);
            toast({
              title: 'Game Over',
              description: `${characterName} was defeated! Final score: ${score}`,
              variant: 'destructive',
            });
            return 0;
          }
          return newHealth;
        });
      }
    }, 500);
    
    return () => clearInterval(enemyMovement);
  }, [gameStarted, enemies, playerPosition, gameOver, characterName, score, toast]);

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
    shootAtClosestEnemy  // Export the new shooting function
  };
};
