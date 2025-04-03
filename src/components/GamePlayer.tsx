import React, { useRef, useEffect, useState } from 'react';
import { GameAsset, GameConfig } from '@/types/game';
import { useIsMobile } from '@/hooks/use-mobile';

interface GamePlayerProps {
  gameAssets: GameAsset[];
  config: GameConfig;
  isPreview?: boolean;
  onGameOver: () => void;
}

interface GameObject {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  speedX: number;
  speedY: number;
  health: number;
  damage: number;
  type: string;
  asset: GameAsset;
  lastShot?: number;
}

const GamePlayer: React.FC<GamePlayerProps> = ({ gameAssets, config, isPreview = false, onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [score, setScore] = useState(0);
  const [playerLives, setPlayerLives] = useState(config.playerHealth);
  const [gameObjects, setGameObjects] = useState<GameObject[]>([]);
  const [keys, setKeys] = useState<Record<string, boolean>>({});
  const isMobile = useIsMobile();
  
  const gameLoopRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const playerRef = useRef<GameObject | null>(null);
  
  const playerAsset = gameAssets.find(asset => asset.type === 'player');
  const enemyAssets = gameAssets.filter(asset => asset.type === 'enemy');
  const projectileAsset = gameAssets.find(asset => asset.type === 'projectile') || 
    { id: 'default-projectile', type: 'projectile', name: 'Default Laser', imageUrl: '', properties: { speed: 8, damage: 1, health: 1, behavior: 'straight' } };
  
  // Initialize game
  useEffect(() => {
    if (!canvasRef.current || !playerAsset || enemyAssets.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    resizeCanvas();

    // Create player
    const playerObj: GameObject = {
      id: 'player',
      x: canvas.width / 2,
      y: canvas.height - 80,
      width: 50,
      height: 50,
      speedX: playerAsset.properties.speed,
      speedY: 0,
      health: playerAsset.properties.health,
      damage: playerAsset.properties.damage,
      type: 'player',
      asset: playerAsset
    };
    
    playerRef.current = playerObj;
    
    // Create initial enemies
    const initialGameObjects = [playerObj];
    
    for (let i = 0; i < 5; i++) {
      const enemyAsset = enemyAssets[Math.floor(Math.random() * enemyAssets.length)];
      initialGameObjects.push(createEnemy(enemyAsset, canvas.width, i));
    }
    
    setGameObjects(initialGameObjects);
    
    // Start game loop
    if (gameLoopRef.current === null) {
      lastTimeRef.current = performance.now();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
    
    // Add event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('resize', resizeCanvas);
    
    return () => {
      if (gameLoopRef.current !== null) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);
  
  // Handle game over
  useEffect(() => {
    if (playerLives <= 0) {
      setIsPlaying(false);
      setTimeout(() => {
        onGameOver();
      }, 2000);
    }
  }, [playerLives, onGameOver]);
  
  const resizeCanvas = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const container = canvas.parentElement;
    if (!container) return;
    
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
  };
  
  const handleKeyDown = (e: KeyboardEvent) => {
    setKeys(prev => ({ ...prev, [e.code]: true }));
  };
  
  const handleKeyUp = (e: KeyboardEvent) => {
    setKeys(prev => ({ ...prev, [e.code]: false }));
  };
  
  const createEnemy = (enemyAsset: GameAsset, canvasWidth: number, index: number = 0): GameObject => {
    return {
      id: `enemy-${Date.now()}-${Math.random()}`,
      x: Math.random() * (canvasWidth - 40),
      y: -50 - (index * 100),
      width: 40,
      height: 40,
      speedX: enemyAsset.properties.behavior === 'zigzag' ? enemyAsset.properties.speed/2 : 0,
      speedY: enemyAsset.properties.speed/2,
      health: enemyAsset.properties.health,
      damage: enemyAsset.properties.damage,
      type: 'enemy',
      asset: enemyAsset
    };
  };
  
  const createProjectile = (x: number, y: number, isEnemyProjectile: boolean = false): GameObject => {
    return {
      id: `projectile-${Date.now()}-${Math.random()}`,
      x,
      y,
      width: 10,
      height: 20,
      speedX: 0,
      speedY: isEnemyProjectile ? 5 : -10,
      health: 1,
      damage: isEnemyProjectile ? 1 : projectileAsset.properties.damage,
      type: isEnemyProjectile ? 'enemy-projectile' : 'projectile',
      asset: projectileAsset
    };
  };
  
  const gameLoop = (timestamp: number) => {
    if (!canvasRef.current || !isPlaying) return;
    
    const deltaTime = (timestamp - lastTimeRef.current) / 1000;
    lastTimeRef.current = timestamp;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.fillStyle = config.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Update and render game objects
    setGameObjects(prevObjects => {
      const updatedObjects = [...prevObjects];
      const objectsToAdd: GameObject[] = [];
      const objectsToRemove: string[] = [];
      
      // Update player
      const player = updatedObjects.find(obj => obj.type === 'player');
      if (player) {
        // Player movement
        if (keys['ArrowLeft'] || keys['KeyA']) {
          player.x -= player.speedX * config.gameSpeed;
        }
        if (keys['ArrowRight'] || keys['KeyD']) {
          player.x += player.speedX * config.gameSpeed;
        }
        
        // Keep player within bounds
        player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
        
        // Player shooting
        if ((keys['Space'] || keys['KeyW'] || keys['ArrowUp']) && timestamp - (player.lastShot || 0) > 300) {
          player.lastShot = timestamp;
          objectsToAdd.push(createProjectile(player.x + player.width/2 - 5, player.y));
        }
      }
      
      // Update all game objects
      for (const obj of updatedObjects) {
        // Skip objects that should be removed
        if (objectsToRemove.includes(obj.id)) continue;
        
        if (obj.type === 'enemy') {
          // Enemy behavior
          if (obj.asset.properties.behavior === 'zigzag') {
            // Zigzag movement
            if (obj.x <= 0 || obj.x >= canvas.width - obj.width) {
              obj.speedX = -obj.speedX;
            }
            obj.x += obj.speedX * config.gameSpeed;
          } else if (obj.asset.properties.behavior === 'seeking' && player) {
            // Seeking behavior - move towards player
            const dx = player.x - obj.x;
            const direction = dx > 0 ? 1 : -1;
            obj.x += direction * (obj.asset.properties.speed/3) * config.gameSpeed;
          }
          
          // Move down
          obj.y += obj.speedY * config.gameSpeed;
          
          // Enemy shooting
          if (Math.random() < 0.005 * config.gameSpeed) {
            objectsToAdd.push(createProjectile(obj.x + obj.width/2, obj.y + obj.height, true));
          }
          
          // Remove if off screen
          if (obj.y > canvas.height) {
            objectsToRemove.push(obj.id);
          }
        } 
        else if (obj.type === 'projectile' || obj.type === 'enemy-projectile') {
          // Move projectiles
          obj.y += obj.speedY * config.gameSpeed;
          
          // Remove if off screen
          if (obj.y < -obj.height || obj.y > canvas.height) {
            objectsToRemove.push(obj.id);
          }
        }
        
        // Draw the object
        const img = new Image();
        img.src = obj.asset.imageUrl;
        ctx.drawImage(img, obj.x, obj.y, obj.width, obj.height);
      }
      
      // Check collisions
      for (let i = 0; i < updatedObjects.length; i++) {
        const obj1 = updatedObjects[i];
        if (objectsToRemove.includes(obj1.id)) continue;
        
        for (let j = i + 1; j < updatedObjects.length; j++) {
          const obj2 = updatedObjects[j];
          if (objectsToRemove.includes(obj2.id)) continue;
          
          // Check collision between these objects
          if (checkCollision(obj1, obj2)) {
            // Player hit by enemy or enemy projectile
            if (obj1.type === 'player' && (obj2.type === 'enemy' || obj2.type === 'enemy-projectile')) {
              handleCollision(obj1, obj2, objectsToRemove, setPlayerLives, setScore);
            }
            // Enemy hit by player projectile
            else if (obj1.type === 'enemy' && obj2.type === 'projectile') {
              handleCollision(obj1, obj2, objectsToRemove, setPlayerLives, setScore);
            }
            // Player projectile hit by enemy or enemy projectile
            else if (obj1.type === 'projectile' && (obj2.type === 'enemy' || obj2.type === 'enemy-projectile')) {
              handleCollision(obj1, obj2, objectsToRemove, setPlayerLives, setScore);
            }
          }
        }
      }
      
      // Add enemies if needed
      if (updatedObjects.filter(obj => obj.type === 'enemy').length < 5) {
        for (let i = 0; i < 2; i++) {
          const randomEnemyAsset = enemyAssets[Math.floor(Math.random() * enemyAssets.length)];
          objectsToAdd.push(createEnemy(randomEnemyAsset, canvas.width));
        }
      }
      
      // Add new objects and remove destroyed ones
      let newObjects = updatedObjects.filter(obj => !objectsToRemove.includes(obj.id));
      newObjects = [...newObjects, ...objectsToAdd];
      
      return newObjects;
    });

    // Draw UI elements
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${score}`, 10, 20);
    ctx.fillText(`Lives: ${playerLives}`, 10, 40);
    
    // Continue game loop
    if (isPlaying) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
  };
  
  const checkCollision = (obj1: GameObject, obj2: GameObject): boolean => {
    return (
      obj1.x < obj2.x + obj2.width &&
      obj1.x + obj1.width > obj2.x &&
      obj1.y < obj2.y + obj2.height &&
      obj1.y + obj1.height > obj2.y
    );
  };
  
  const handleCollision = (
    obj1: GameObject,
    obj2: GameObject,
    objectsToRemove: string[],
    setPlayerLives: React.Dispatch<React.SetStateAction<number>>,
    setScore: React.Dispatch<React.SetStateAction<number>>
  ) => {
    // Player hit by enemy or enemy projectile
    if (obj1.type === 'player' && (obj2.type === 'enemy' || obj2.type === 'enemy-projectile')) {
      objectsToRemove.push(obj2.id);
      setPlayerLives(prev => prev - 1);
    }
    // Enemy hit by player projectile
    else if (obj1.type === 'enemy' && obj2.type === 'projectile') {
      obj1.health -= obj2.damage;
      objectsToRemove.push(obj2.id);
      
      if (obj1.health <= 0) {
        objectsToRemove.push(obj1.id);
        setScore(prev => prev + 100);
      }
    }
    // Player projectile hit by enemy projectile
    else if (obj1.type === 'projectile' && obj2.type === 'enemy-projectile') {
      objectsToRemove.push(obj1.id);
      objectsToRemove.push(obj2.id);
    }
  };
  
  // Mobile controls
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!playerRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;
    
    playerRef.current.x = touchX - playerRef.current.width / 2;
    
    // Keep player within bounds
    playerRef.current.x = Math.max(0, Math.min(canvas.width - playerRef.current.width, playerRef.current.x));
  };
  
  const handleTouchStart = () => {
    if (!playerRef.current || !isPlaying) return;
    
    // Fire projectile on touch
    setGameObjects(prev => [
      ...prev, 
      createProjectile(playerRef.current!.x + playerRef.current!.width/2 - 5, playerRef.current!.y)
    ]);
  };
  
  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        onTouchMove={isMobile ? handleTouchMove : undefined}
        onTouchStart={isMobile ? handleTouchStart : undefined}
      />
      
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
          <div className="text-center text-white">
            <h2 className="text-xl font-bold">Game Over</h2>
            <p className="mt-2">Your score: {score}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GamePlayer;
