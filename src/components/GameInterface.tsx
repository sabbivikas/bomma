
import React from 'react';
import { Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Game } from '@/components/GameCard';
import { useGameLogic } from '@/hooks/useGameLogic';
import GameHeader from '@/components/game/GameHeader';
import GameArea from '@/components/game/GameArea';
import GameControls from '@/components/game/GameControls';

interface GameInterfaceProps {
  game: Game;
  characterName: string;
  characterImage: string;
  onExit: () => void;
}

const GameInterface: React.FC<GameInterfaceProps> = ({ game, characterName, characterImage, onExit }) => {
  const {
    score,
    gameStarted,
    enemies,
    playerPosition,
    health,
    gameOver,
    startGame,
    handleAction,
    setPlayerPosition,
    shootAtClosestEnemy  // Use the new function
  } = useGameLogic(game, characterName);

  const handleGameAreaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!gameStarted || gameOver) return;
    
    const gameArea = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - gameArea.left) / gameArea.width) * 100;
    const y = ((e.clientY - gameArea.top) / gameArea.height) * 100;
    
    setPlayerPosition({ x, y });
  };

  return (
    <div className="w-full h-full min-h-[500px] bg-gray-900 text-white rounded-lg overflow-hidden flex flex-col">
      <GameHeader game={game} health={health} score={score} onExit={onExit} />
      
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
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
            <GameArea
              enemies={enemies}
              playerPosition={playerPosition}
              characterImage={characterImage}
              characterName={characterName}
              onAreaClick={handleGameAreaClick}
              onShoot={shootAtClosestEnemy}  // Connect the shooting function
              score={score}  // Pass score for display
            />
            
            <GameControls game={game} onAction={handleAction} />
          </div>
        )}
        
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
