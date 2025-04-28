
import React from 'react';
import { Button } from '@/components/ui/button';
import { Gamepad2, Shield, Swords, Crosshair, Target } from 'lucide-react';
import { Game } from '@/components/GameCard';

interface GameControlsProps {
  game: Game;
  onAction: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({ game, onAction }) => {
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
    <div className="mt-auto">
      <Button
        onClick={onAction}
        className="bg-purple-600 hover:bg-purple-700 mb-2 text-lg px-8 py-6 animate-pulse flex items-center"
      >
        {getGameActionIcon()}
        {getGameActionText()}
      </Button>
      
      <p className="text-gray-400 text-center max-w-md text-sm">
        Click to attack nearby enemies. Move your character by clicking on the game area.
      </p>
    </div>
  );
};

export default GameControls;
