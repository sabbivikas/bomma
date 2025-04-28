
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

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
}

const GameCard: React.FC<GameCardProps> = ({ game, characterImage, characterName }) => {
  const { toast } = useToast();
  
  const handlePlayGame = () => {
    toast({
      title: 'Coming Soon!',
      description: `${characterName} will be ready to play in ${game.title} very soon!`,
      variant: 'default',
    });
  };
  
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg border-2 hover:border-purple-400">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={game.image} 
          alt={game.title} 
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
        <div className="absolute bottom-0 right-0 bg-black/70 text-white px-3 py-1 text-xs rounded-tl-md">
          {game.genre}
        </div>
        <div className="absolute top-0 left-0 bg-purple-600 text-white px-3 py-1 text-xs rounded-br-md">
          {game.difficulty}
        </div>
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">{game.title}</CardTitle>
        <CardDescription>{game.description}</CardDescription>
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
            <p className="text-xs text-gray-500">Your Character</p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={handlePlayGame} 
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          Play Now
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GameCard;
