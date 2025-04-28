
import React, { useState, useEffect } from 'react';
import { useCharacter } from '@/contexts/CharacterContext';
import CharacterCanvas from '@/components/CharacterCanvas';
import CharacterSelect from '@/components/CharacterSelect';
import GameCard from '@/components/GameCard';
import GameInterface from '@/components/GameInterface';
import { Game } from '@/components/GameCard';
import CharacterHeader from './CharacterHeader';
import { games } from '@/data/games';
import NoCharacters from './NoCharacters';
import { Loader2 } from 'lucide-react';

const WorldsContent = () => {
  const [mode, setMode] = useState<'select' | 'create' | 'games' | 'playing'>('select');
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const { character, setCharacter, savedCharacters, isLoading, refetchCharacters } = useCharacter();
  
  useEffect(() => {
    if (character) {
      setMode('games');
    } else if (savedCharacters.length > 0) {
      setMode('select');
    } else {
      setMode('select');
    }
  }, [character, savedCharacters]);

  // Additional refresh on component mount
  useEffect(() => {
    refetchCharacters();
  }, []);
  
  const handleCreateNew = () => {
    setMode('create');
  };
  
  const handleCharacterCreated = async (characterId: string) => {
    // Refresh characters to get the newly created one
    await refetchCharacters();
    
    const newCharacter = savedCharacters.find(c => c.id === characterId);
    if (newCharacter) {
      setCharacter(newCharacter);
      setMode('games');
    }
  };
  
  const handleSelectCharacter = (selectedCharacter: Character) => {
    setCharacter(selectedCharacter);
    setMode('games');
  };

  const handlePlayGame = (game: Game) => {
    setCurrentGame(game);
    setMode('playing');
  };

  const handleExitGame = () => {
    setCurrentGame(null);
    setMode('games');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-600 mb-4" />
          <p className="text-gray-600">Loading characters...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Character Worlds</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Create your own character and play exciting action games! Your character becomes the hero in each adventure.
        </p>
      </div>
      
      {mode === 'select' && (
        (savedCharacters.length === 0 ? 
          <NoCharacters onCreateNew={handleCreateNew} /> : 
          <CharacterSelect 
            onCreateNew={handleCreateNew} 
            onSelectCharacter={handleSelectCharacter}
          />
        )
      )}
      
      {mode === 'create' && (
        <CharacterCanvas onCharacterCreated={handleCharacterCreated} />
      )}
      
      {mode === 'games' && character && (
        <div className="space-y-8">
          <CharacterHeader 
            character={character}
            onChangeCharacter={() => setMode('select')}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
              <GameCard 
                key={game.id}
                game={game}
                characterImage={character.imageUrl}
                characterName={character.name}
                onPlayGame={() => handlePlayGame(game)}
              />
            ))}
          </div>
        </div>
      )}

      {mode === 'playing' && character && currentGame && (
        <GameInterface
          game={currentGame}
          characterName={character.name}
          characterImage={character.imageUrl}
          onExit={handleExitGame}
        />
      )}
    </div>
  );
};

export default WorldsContent;
