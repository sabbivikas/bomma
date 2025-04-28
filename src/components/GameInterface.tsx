import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Gamepad2, Shield, Crosshair, Swords, Target } from 'lucide-react';
import { Game } from '@/components/GameCard';

interface GameInterfaceProps {
  game: Game;
  characterName: string;
  characterImage: string;
  onExit: () => void;
}

const GameInterface: React.FC<GameInterfaceProps> = ({ game, characterName, characterImage, onExit }) => {
  const { toast } = useToast();
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [playerPosition, setPlayerPosition] = useState({ x: 50, y: 50 });
  const [health, setHealth] = useState(100);
  const [gameOver, setGameOver] = useState(false);
  
  interface Enemy {
    id: number;
    x: number;
    y: number;
    health: number;
    type: string;
    size: number;
  }
  
  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setHealth(100);
    setGameOver(false);
    setEnemies([]);
    
    // Spawn initial enemies
    spawnEnemies();
    
    toast({
      title: 'Game Started',
      description: `${characterName} has entered ${game.title}!`,
      variant: 'success',
    });
  };
  
  // Generate new enemies based on game type
  const spawnEnemies = () => {
    const newEnemies: Enemy[] = [];
    const count = game.difficulty === 'easy' ? 3 : game.difficulty === 'medium' ? 5 : 7;
    
    for (let i = 0; i < count; i++) {
      const enemyType = getEnemyTypeForGame(game.genre);
      newEnemies.push({
        id: Date.now() + i,
        x: Math.random() * 80 + 10, // Between 10% and 90% of the container width
        y: Math.random() * 80 + 10, // Between 10% and 90% of the container height
        health: game.difficulty === 'easy' ? 1 : game.difficulty === 'medium' ? 2 : 3,
        type: enemyType,
        size: Math.random() * 10 + 20, // Size between 20px and 30px
      });
    }
    
    setEnemies(newEnemies);
  };
  
  const getEnemyTypeForGame = (genre: string) => {
    switch(genre) {
      case 'Dungeon Crawler': return 'monster';
      case 'Flying Action': return 'plane';
      case 'Street Fighting': return 'fighter';
      case 'Fantasy RPG': return 'dragon';
      case 'Mech Combat': return 'robot';
      case 'Stealth Action': return 'guard';
      case 'Platformer': return 'goomba';
      case 'Runner': return 'robot';
      case 'Tower Defense': return 'invader';
      default: return 'enemy';
    }
  };
  
  // Attack nearby enemies
  const handleAction = () => {
    if (gameOver) return;
    
    // Get points based on game difficulty
    const points = game.difficulty === 'easy' ? 5 : game.difficulty === 'medium' ? 10 : 15;
    
    // Check for enemies in range and deal damage
    const updatedEnemies = enemies.map(enemy => {
      const distance = Math.sqrt(
        Math.pow(playerPosition.x - enemy.x, 2) + 
        Math.pow(playerPosition.y - enemy.y, 2)
      );
      
      // If enemy is close enough, damage it
      if (distance < 30) {
        return { ...enemy, health: enemy.health - 1 };
      }
      return enemy;
    });
    
    // Remove defeated enemies
    const remainingEnemies = updatedEnemies.filter(enemy => enemy.health > 0);
    const defeatedCount = updatedEnemies.length - remainingEnemies.length;
    
    if (defeatedCount > 0) {
      const earnedPoints = points * defeatedCount;
      setScore(prevScore => prevScore + earnedPoints);
      
      // Show different messages based on the game type
      let message = '';
      const enemyName = getEnemyNameForGame(game.genre);
      
      if (defeatedCount === 1) {
        message = `${characterName} defeated a ${enemyName}! +${earnedPoints} points`;
      } else {
        message = `${characterName} defeated ${defeatedCount} ${enemyName}s! +${earnedPoints} points`;
      }
      
      toast({
        title: 'Game Action',
        description: message,
        variant: 'success',
      });
    }
    
    setEnemies(remainingEnemies);
    
    // Spawn new enemies if all are defeated
    if (remainingEnemies.length === 0) {
      spawnEnemies();
    }
  };
  
  const getEnemyNameForGame = (genre: string) => {
    switch(game.genre) {
      case 'Dungeon Crawler': return 'monster';
      case 'Flying Action': return 'enemy plane';
      case 'Street Fighting': return 'rival';
      case 'Fantasy RPG': return 'creature';
      case 'Mech Combat': return 'robot';
      case 'Stealth Action': return 'guard';
      case 'Platformer': return 'goomba';
      case 'Runner': return 'robot';
      case 'Tower Defense': return 'invader';
      default: return 'enemy';
    }
  };
  
  // Move player when clicking on the game area
  const handleGameAreaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!gameStarted || gameOver) return;
    
    const gameArea = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - gameArea.left) / gameArea.width) * 100;
    const y = ((e.clientY - gameArea.top) / gameArea.height) * 100;
    
    setPlayerPosition({ x, y });
  };
  
  // Enemy AI movement and attacks
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    
    const enemyMovement = setInterval(() => {
      setEnemies(prevEnemies => {
        return prevEnemies.map(enemy => {
          // Move enemy slightly toward player
          const dx = (playerPosition.x - enemy.x) / 20;
          const dy = (playerPosition.y - enemy.y) / 20;
          
          return {
            ...enemy,
            x: enemy.x + dx,
            y: enemy.y + dy,
          };
        });
      });
      
      // Enemies can damage player if they're close
      const enemyDamage = enemies.some(enemy => {
        const distance = Math.sqrt(
          Math.pow(playerPosition.x - enemy.x, 2) + 
          Math.pow(playerPosition.y - enemy.y, 2)
        );
        return distance < 15; // If enemy is very close
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
  
  // Get the appropriate icon for the game genre
  const getGameActionIcon = () => {
    switch(game.genre) {
      case 'Dungeon Crawler': return <Swords className="h-5 w-5 mr-2" />;
      case 'Flying Action': return <Crosshair className="h-5 w-5 mr-2" />;
      case 'Street Fighting': return <Swords className="h-5 w-5 mr-2" />;
      case 'Fantasy RPG': return <Target className="h-5 w-5 mr-2" />;
      case 'Mech Combat': return <Crosshair className="h-5 w-5 mr-2" />;
      case 'Stealth Action': return <Shield className="h-5 w-5 mr-2" />;
      case 'Platformer': return <Gamepad2 className="h-5 w-5 mr-2" />;
      case 'Runner': return <Gamepad2 className="h-5 w-5 mr-2" />;
      case 'Tower Defense': return <Shield className="h-5 w-5 mr-2" />;
      default: return <Gamepad2 className="h-5 w-5 mr-2" />;
    }
  };
  
  // Get the appropriate button text for the game genre
  const getGameActionText = () => {
    switch(game.genre) {
      case 'Dungeon Crawler': return 'Fight Monster';
      case 'Flying Action': return 'Attack Enemy';
      case 'Street Fighting': return 'Fight Rival';
      case 'Fantasy RPG': return 'Cast Spell';
      case 'Mech Combat': return 'Fire Weapons';
      case 'Stealth Action': return 'Sneak Attack';
      case 'Platformer': return 'Jump';
      case 'Runner': return 'Run';
      case 'Tower Defense': return 'Defend';
      default: return 'Attack';
    }
  };
  
  return (
    <div className="w-full h-full min-h-[500px] bg-gray-900 text-white rounded-lg overflow-hidden flex flex-col">
      {/* Game header */}
      <div className="bg-purple-900 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={onExit}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-bold">{game.title}</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-black/30 px-4 py-2 rounded-lg">
            Health: {health}%
          </div>
          <div className="bg-black/30 px-4 py-2 rounded-lg">
            Score: {score}
          </div>
        </div>
      </div>
      
      {/* Game content */}
      <div 
        className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden"
        onClick={gameStarted ? handleGameAreaClick : undefined}
      >
        {!gameStarted ? (
          <div className="text-center">
            <Gamepad2 className="h-16 w-16 mx-auto mb-4 text-purple-400" />
            <h3 className="text-2xl font-bold mb-2">Ready to play {game.title}?</h3>
            <p className="mb-6 text-gray-300">{game.description}</p>
            <Button 
              onClick={startGame}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-2 text-lg"
            >
              Start Game
            </Button>
          </div>
        ) : gameOver ? (
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2 text-red-400">Game Over!</h3>
            <p className="mb-6 text-gray-300">Your final score: {score}</p>
            <Button 
              onClick={startGame}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-2 text-lg"
            >
              Play Again
            </Button>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center relative">
            {/* Game area with player and enemies */}
            <div className="w-full h-[350px] relative bg-black/20 rounded-lg border border-purple-800/30 mb-4 cursor-crosshair">
              {/* Player character */}
              <div 
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
                style={{ 
                  left: `${playerPosition.x}%`, 
                  top: `${playerPosition.y}%`,
                }}
              >
                <img 
                  src={characterImage} 
                  alt={characterName} 
                  className="w-12 h-12 object-contain"
                />
              </div>
              
              {/* Enemies */}
              {enemies.map((enemy) => (
                <div 
                  key={enemy.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
                  style={{ 
                    left: `${enemy.x}%`, 
                    top: `${enemy.y}%`,
                    width: `${enemy.size}px`,
                    height: `${enemy.size}px`,
                  }}
                >
                  <div className={`w-full h-full rounded-full bg-red-500 border border-red-700 flex items-center justify-center text-white text-xs`}>
                    {enemy.type.charAt(0).toUpperCase()}
                  </div>
                </div>
              ))}
              
              {/* Instruction */}
              <div className="absolute bottom-2 left-2 text-xs text-gray-400">
                Click in the area to move
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="mt-auto">
              <Button
                onClick={handleAction}
                className="bg-purple-600 hover:bg-purple-700 mb-2 text-lg px-8 py-6 animate-pulse flex items-center"
              >
                {getGameActionIcon()}
                {getGameActionText()}
              </Button>
              
              <p className="text-gray-400 text-center max-w-md text-sm">
                Click to attack nearby enemies. Move your character by clicking on the game area.
              </p>
            </div>
          </div>
        )}
        
        {/* Background effects */}
        <div className="absolute inset-0 -z-10 opacity-20">
          <img 
            src={game.image} 
            alt="" 
            className="w-full h-full object-cover blur-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default GameInterface;
