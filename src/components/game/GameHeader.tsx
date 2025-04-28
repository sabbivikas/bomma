
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Game } from '@/components/GameCard';

interface GameHeaderProps {
  game: Game;
  health: number;
  score: number;
  onExit: () => void;
}

const GameHeader: React.FC<GameHeaderProps> = ({ game, health, score, onExit }) => {
  return (
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
  );
};

export default GameHeader;
