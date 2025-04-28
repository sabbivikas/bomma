
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

const WorldsContent = () => {
  const [mode, setMode] = useState<'select' | 'create' | 'games' | 'playing'>('select');
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const { character, setCharacter, savedCharacters } = useCharacter();
  
  useEffect(() => {
    if (character) {
      setMode('games');
    } else {
      setMode('select');
    }
  }, [character, savedCharacters]);
  
  const handleCreateNew = () => {
    setMode('create');
  };
  
  const handleCharacterCreated = (characterId: string) => {
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Character Worlds</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Create your own character and play exciting action games! Your character becomes the hero in each adventure.
        </p>
      </div>
      
      {mode === 'select' && (
        <CharacterSelect 
          onCreateNew={handleCreateNew} 
          onSelectCharacter={handleSelectCharacter}
        />
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
