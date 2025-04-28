
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import { Game } from '@/components/GameCard';

interface GameControlsProps {
  game: Game;
  onAction: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({ onAction }) => {
  return (
    <div className="mt-auto flex justify-center gap-4">
      <Button
        variant="outline"
        className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 border-none px-8 py-2"
      >
        Main Menu
      </Button>
      
      <Button
        onClick={onAction}
        className="bg-teal-500 hover:bg-teal-600 text-white border-none px-8 py-2"
      >
        <RefreshCcw className="w-4 h-4 mr-2" />
        Restart Level
      </Button>
    </div>
  );
};

export default GameControls;
