
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
    <div className="bg-gradient-to-r from-purple-900 to-purple-800 p-4 flex items-center justify-between rounded-t-lg border-b-2 border-purple-400">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={onExit} className="border-purple-400 hover:bg-purple-700/50">
          <ArrowLeft className="h-4 w-4 text-purple-200" />
        </Button>
        <h2 className="text-xl font-bold text-purple-100 tracking-wider">{game.title}</h2>
      </div>
      <div className="flex items-center gap-4">
        <div className="bg-black/40 px-4 py-2 rounded-lg border border-purple-400/30">
          <span className="text-purple-300">HP:</span> <span className="text-purple-100 font-bold">{health}%</span>
        </div>
        <div className="bg-black/40 px-4 py-2 rounded-lg border border-purple-400/30">
          <span className="text-purple-300">SCORE:</span> <span className="text-purple-100 font-bold">{score}</span>
        </div>
      </div>
    </div>
  );
};

export default GameHeader;
