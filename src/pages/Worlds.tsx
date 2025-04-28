
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { CharacterProvider, useCharacter, Character } from '@/contexts/CharacterContext';
import CharacterCanvas from '@/components/CharacterCanvas';
import CharacterSelect from '@/components/CharacterSelect';
import GameCard from '@/components/GameCard';
import { World, Gamepad2 } from 'lucide-react';
import { games } from '@/data/games';
import ThemedBackground from '@/components/ThemedBackground';

const WorldsContent = () => {
  const [mode, setMode] = useState<'select' | 'create' | 'games'>('select');
  const { character, setCharacter, savedCharacters } = useCharacter();
  
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
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 flex items-center justify-center gap-2">
          <World className="h-8 w-8 text-purple-600" />
          <span>Character Worlds</span>
        </h1>
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
              />
            ))}
          </div>
        </div>
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
          <style jsx global>{`
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
          `}</style>
        </div>
      </ThemedBackground>
    </CharacterProvider>
  );
};

export default Worlds;
