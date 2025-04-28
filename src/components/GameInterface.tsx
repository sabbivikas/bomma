
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Gamepad2 } from 'lucide-react';
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
  
  // Simple game mechanics based on game type
  const handleAction = () => {
    // Increase score based on game difficulty
    const points = game.difficulty === 'easy' ? 5 : game.difficulty === 'medium' ? 10 : 15;
    setScore(prevScore => prevScore + points);
    
    // Show different messages based on the game type
    let message = '';
    switch(game.genre) {
      case 'Dungeon Crawler':
        message = `${characterName} defeated a monster! +${points} points`;
        break;
      case 'Flying Action':
        message = `${characterName} shot down an enemy plane! +${points} points`;
        break;
      case 'Street Fighting':
        message = `${characterName} defeated a rival gang member! +${points} points`;
        break;
      case 'Fantasy RPG':
        message = `${characterName} cast a powerful spell! +${points} points`;
        break;
      case 'Mech Combat':
        message = `${characterName}'s robot landed a critical hit! +${points} points`;
        break;
      case 'Stealth Action':
        message = `${characterName} successfully infiltrated an enemy base! +${points} points`;
        break;
      default:
        message = `${characterName} scored ${points} points!`;
    }
    
    toast({
      title: 'Game Action',
      description: message,
      variant: 'success',
    });
  };
  
  const startGame = () => {
    setGameStarted(true);
    toast({
      title: 'Game Started',
      description: `${characterName} has entered ${game.title}!`,
      variant: 'success',
    });
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
        <div className="bg-black/30 px-4 py-2 rounded-lg">
          Score: {score}
        </div>
      </div>
      
      {/* Game content */}
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
        ) : (
          <div className="w-full flex flex-col items-center">
            <div className="mb-8 w-24 h-24 rounded-full overflow-hidden border-4 border-purple-500 bg-white">
              <img 
                src={characterImage} 
                alt={characterName} 
                className="w-full h-full object-contain"
              />
            </div>
            
            <h3 className="text-xl mb-4">
              {characterName} is in the {game.genre.toLowerCase()} world!
            </h3>
            
            <Button
              onClick={handleAction}
              className="bg-purple-600 hover:bg-purple-700 mb-6 text-lg px-8 py-6 animate-pulse"
            >
              {game.genre === 'Dungeon Crawler' ? 'Fight Monster' : 
               game.genre === 'Flying Action' ? 'Attack Enemy' :
               game.genre === 'Street Fighting' ? 'Fight Rival' :
               game.genre === 'Fantasy RPG' ? 'Cast Spell' :
               game.genre === 'Mech Combat' ? 'Fire Weapons' :
               'Take Action'}
            </Button>
            
            <p className="text-gray-400 text-center max-w-md">
              Click the button to play! Each action earns you points based on the game difficulty.
            </p>
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
