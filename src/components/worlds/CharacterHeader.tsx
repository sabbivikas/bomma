
import React from 'react';
import { Character } from '@/contexts/CharacterContext';

interface CharacterHeaderProps {
  character: Character;
  onChangeCharacter: () => void;
}

const CharacterHeader: React.FC<CharacterHeaderProps> = ({ character, onChangeCharacter }) => {
  return (
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
        onClick={onChangeCharacter}
        className="text-purple-600 hover:text-purple-800 font-medium"
      >
        Change Character
      </button>
    </div>
  );
};

export default CharacterHeader;
