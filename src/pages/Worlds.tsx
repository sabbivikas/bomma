
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { CharacterProvider, useCharacter, Character } from '@/contexts/CharacterContext';
import CharacterCanvas from '@/components/CharacterCanvas';
import CharacterSelect from '@/components/CharacterSelect';
import GameCard from '@/components/GameCard';
import GameInterface from '@/components/GameInterface';
import { Plus, Globe, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { games } from '@/data/games';
import ThemedBackground from '@/components/ThemedBackground';
import { Game } from '@/components/GameCard';
import { useToast } from '@/hooks/use-toast';

const WorldsContent = () => {
  const [mode, setMode] = useState<'select' | 'create' | 'games' | 'playing'>('select');
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const { character, setCharacter, savedCharacters } = useCharacter();
  const { toast } = useToast();
  
  // When component loads, check if we have a character
  useEffect(() => {
    console.log("WorldsContent rendering, character:", character);
    console.log("Saved characters count:", savedCharacters.length);
    
    if (character) {
      console.log("Character found, switching to games mode:", character);
      setMode('games');
    } else {
      console.log("No character found, staying in select mode");
      setMode('select');
    }
  }, [character, savedCharacters]);
  
  const handleCreateNew = () => {
    setMode('create');
  };
  
  const handleCharacterCreated = (characterId: string) => {
    console.log("Character created callback with id:", characterId);
    const newCharacter = savedCharacters.find(c => c.id === characterId);
    if (newCharacter) {
      console.log("Character created, setting current character:", newCharacter);
      setCharacter(newCharacter);
      toast({
        title: "Character Selected",
        description: `${newCharacter.name} is ready for adventure!`,
        variant: "success",
      });
      setMode('games');
    }
  };
  
  const handleSelectCharacter = (selectedCharacter: Character) => {
    console.log("Selected character:", selectedCharacter);
    setCharacter(selectedCharacter);
    toast({
      title: "Character Selected",
      description: `${selectedCharacter.name} is ready for adventure!`,
      variant: "success",
    });
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
        <h1 className="text-3xl md:text-4xl font-bold mb-4 flex items-center justify-center gap-2">
          <Globe className="h-8 w-8 text-purple-600" />
          <span>Character Worlds</span>
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Create your own character and play exciting action games! Your character becomes the hero in each adventure.
        </p>
      </div>
      
      {mode === 'select' && (
        <>
          {savedCharacters.length > 0 && (
            <div className="w-full max-w-4xl mx-auto mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Your Characters</h2>
                <Button
                  onClick={handleCreateNew} 
                  className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
                >
                  <Plus size={16} />
                  Create New
                </Button>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {savedCharacters.map((character) => (
                  <div 
                    key={character.id}
                    className="cursor-pointer hover:scale-105 transition-all relative bg-white/80 border rounded-md overflow-hidden"
                    onClick={() => handleSelectCharacter(character)}
                  >
                    <div className="p-3">
                      <div className="w-full h-[120px] mb-3 rounded overflow-hidden bg-gray-100">
                        <img 
                          src={character.imageUrl} 
                          alt={character.name}
                          className="w-full h-full object-contain" 
                        />
                      </div>
                      <div className="text-center">
                        <p className="font-medium truncate">{character.name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(character.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <CharacterSelect 
            onCreateNew={handleCreateNew} 
            onSelectCharacter={handleSelectCharacter}
          />
        </>
      )}
      
      {mode === 'create' && (
        <CharacterCanvas onCharacterCreated={handleCharacterCreated} />
      )}
      
      {mode === 'games' && character && (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-purple-400">
                <img 
                  src={character.imageUrl} 
                  alt={character.name}
                  className="w-full h-full object-contain bg-gray-100" 
                />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{character.name}'s Adventures</h2>
                <p className="text-gray-600">Choose a game to play with your character</p>
              </div>
            </div>
            <button 
              onClick={() => setMode('select')}
              className="text-purple-600 hover:text-purple-800 font-medium"
            >
              Change Character
            </button>
          </div>
          
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

const Worlds = () => {
  return (
    <CharacterProvider>
      <ThemedBackground>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1 relative z-10 pb-12">
            <WorldsContent />
          </main>
          
          {/* Dreamy particles for background effect */}
          <style>
            {`
            .dreamy-dust {
              position: absolute;
              background-color: white;
              border-radius: 50%;
              opacity: 0.5;
              animation: float 10s ease-in-out infinite;
              z-index: 1;
            }
            
            @keyframes float {
              0%, 100% { transform: translateY(0) translateX(0); }
              50% { transform: translateY(-20px) translateX(10px); }
            }
            
            .ghibli-sparkle {
              position: absolute;
              background-color: white;
              border-radius: 50%;
              box-shadow: 0 0 10px 2px white;
              animation: sparkle-float 8s ease-in-out infinite;
              z-index: 1;
            }
            
            @keyframes sparkle-float {
              0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
              50% { transform: translateY(-30px) scale(1.2); opacity: 0.7; }
            }
            `}
          </style>
        </div>
      </ThemedBackground>
    </CharacterProvider>
  );
};

export default Worlds;
