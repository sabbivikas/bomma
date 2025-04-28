
import { useState } from 'react';
import { Game } from '@/components/GameCard';
import { useToast } from '@/hooks/use-toast';

export const useScoringLogic = (game: Game, characterName: string) => {
  const [score, setScore] = useState(0);
  const { toast } = useToast();

  const getEnemyNameForGame = (genre: string) => {
    switch(genre) {
      case 'Action Shooter': return 'drone';
      case 'Mech Combat': return 'enemy mech';
      case 'Beat-em-up': return 'fighter';
      case 'FPS': return 'alien';
      default: return 'enemy';
    }
  };

  const updateScore = (defeatedCount: number) => {
    const points = game.difficulty === 'easy' ? 5 : game.difficulty === 'medium' ? 10 : 15;
    const earnedPoints = points * defeatedCount;
    setScore(prevScore => prevScore + earnedPoints);

    const enemyName = getEnemyNameForGame(game.genre);
    const message = defeatedCount === 1
      ? `${characterName} shot down a ${enemyName}! +${earnedPoints} points`
      : `${characterName} defeated ${defeatedCount} ${enemyName}s! +${earnedPoints} points`;

    toast({
      title: 'Target Eliminated',
      description: message,
      variant: 'success',
    });

    return earnedPoints;
  };

  return {
    score,
    setScore,
    updateScore
  };
};
