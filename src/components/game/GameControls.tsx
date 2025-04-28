
import React from 'react';
import { Button } from '@/components/ui/button';
import { Rocket, Target, Gamepad2 } from 'lucide-react';
import { Game } from '@/components/GameCard';

interface GameControlsProps {
  game: Game;
  onAction: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({ game, onAction }) => {
  const getGameActionIcon = () => {
    switch(game.genre) {
      case 'Flying Action': return <Rocket className="h-5 w-5" />;
      case 'Platformer': return <Gamepad2 className="h-5 w-5" />;
      default: return <Target className="h-5 w-5" />;
    }
  };

  const getGameActionText = () => {
    switch(game.genre) {
      case 'Flying Action': return 'FIRE!';
      case 'Platformer': return 'JUMP!';
      default: return 'ATTACK!';
    }
  };

  return (
    <div className="mt-auto">
      <Button
        onClick={onAction}
        className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 mb-2 text-lg px-8 py-6 w-full sm:w-auto animate-pulse border-2 border-purple-400 shadow-lg shadow-purple-500/20"
      >
        {getGameActionIcon()}
        {getGameActionText()}
      </Button>
      
      <p className="text-purple-300 text-center max-w-md text-sm">
        Use mouse to move and attack. Watch your health!
      </p>
    </div>
  );
};

export default GameControls;
