
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gamepad2, Shield, Swords, Crosshair, Target } from 'lucide-react';

export interface Game {
  id: string;
  title: string;
  description: string;
  image: string;
  genre: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface GameCardProps {
  game: Game;
  characterImage: string;
  characterName: string;
  onPlayGame: () => void;
}

const GameCard: React.FC<GameCardProps> = ({ game, characterImage, characterName, onPlayGame }) => {
  // Get the appropriate icon for the game genre
  const getGameIcon = () => {
    switch(game.genre) {
      case 'Dungeon Crawler': return <Swords className="h-4 w-4" />;
      case 'Flying Action': return <Crosshair className="h-4 w-4" />;
      case 'Street Fighting': return <Swords className="h-4 w-4" />;
      case 'Fantasy RPG': return <Target className="h-4 w-4" />;
      case 'Mech Combat': return <Crosshair className="h-4 w-4" />;
      case 'Stealth Action': return <Shield className="h-4 w-4" />;
      default: return <Gamepad2 className="h-4 w-4" />;
    }
  };
  
  // Get color for difficulty badge
  const getDifficultyColor = () => {
    switch(game.difficulty) {
      case 'easy': return 'bg-green-600';
      case 'medium': return 'bg-yellow-600';
      case 'hard': return 'bg-red-600';
      default: return 'bg-purple-600';
    }
  };
  
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg border-2 hover:border-purple-400 bg-gray-900 text-white">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={game.image} 
          alt={game.title} 
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
        <div className="absolute bottom-0 right-0 bg-black/70 text-white px-3 py-1 text-xs rounded-tl-md flex items-center gap-1">
          {getGameIcon()}
          {game.genre}
        </div>
        <Badge className={`absolute top-0 left-0 ${getDifficultyColor()} text-white rounded-br-md`}>
          {game.difficulty}
        </Badge>
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">{game.title}</CardTitle>
        <CardDescription className="text-gray-300">{game.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="flex items-center mb-3">
          <div className="mr-3 border-2 border-purple-300 rounded-full overflow-hidden w-10 h-10">
            <img 
              src={characterImage} 
              alt={characterName}
              className="w-full h-full object-cover" 
            />
          </div>
          <div>
            <p className="text-sm font-medium">{characterName}</p>
            <p className="text-xs text-gray-400">Your Character</p>
          </div>
        </div>
        <div className="text-xs text-gray-400 mb-1">
          <span className="font-bold">GAMEPLAY: </span> 
          Move your character, attack enemies, earn points!
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={onPlayGame} 
          className="w-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center gap-2"
        >
          <Gamepad2 className="h-4 w-4" />
          Play Now
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GameCard;
