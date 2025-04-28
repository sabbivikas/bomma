
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
import { Character } from '@/services/characterService';
import { useToast } from '@/hooks/use-toast';
import { initializeSessionId, getSessionId } from '@/utils/sessionService';

const WorldsContent = () => {
  const [mode, setMode] = useState<'select' | 'create' | 'games' | 'playing'>('select');
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const { character, setCharacter, savedCharacters, isLoading, refetchCharacters } = useCharacter();
  const { toast } = useToast();
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  
  // Initialize session on component mount
  useEffect(() => {
    // Initialize session ID and force a new one if there are issues
    const sessionId = initializeSessionId();
    console.log("WorldsContent: Session ID initialized:", sessionId);
    
    // Immediately load characters after session is initialized
    loadCharacters();
  }, []);
  
  // Function to load characters
  const loadCharacters = async () => {
    try {
      console.log("Loading characters with session ID:", getSessionId());
      await refetchCharacters();
      setInitialLoadDone(true);
    } catch (error) {
      console.error("Error fetching characters:", error);
      toast({
        title: "Error",
        description: "Failed to load your characters. Please refresh the page.",
        variant: "destructive",
      });
    }
  };
  
  // Also refresh when tab becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log("Page became visible, refreshing characters");
        loadCharacters();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  
  // Set mode based on character and savedCharacters state
  useEffect(() => {
    if (!initialLoadDone) return;

    if (character) {
      setMode('games');
    } else if (savedCharacters.length > 0) {
      setMode('select');
    } else {
      setMode('select');
    }
  }, [character, savedCharacters, initialLoadDone]);
  
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
