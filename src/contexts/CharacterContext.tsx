
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Character = {
  id: string;
  name: string;
  imageUrl: string;
  createdAt: Date;
};

type CharacterContextType = {
  character: Character | null;
  setCharacter: (character: Character | null) => void;
  savedCharacters: Character[];
  addCharacter: (character: Character) => void;
};

const CharacterContext = createContext<CharacterContextType | undefined>(undefined);

export const useCharacter = (): CharacterContextType => {
  const context = useContext(CharacterContext);
  if (!context) {
    throw new Error('useCharacter must be used within a CharacterProvider');
  }
  return context;
};

type CharacterProviderProps = {
  children: ReactNode;
};

export const CharacterProvider: React.FC<CharacterProviderProps> = ({ children }) => {
  const [character, setCharacter] = useState<Character | null>(null);
  const [savedCharacters, setSavedCharacters] = useState<Character[]>(() => {
    // Load saved characters from local storage
    const saved = localStorage.getItem('savedCharacters');
    return saved ? JSON.parse(saved) : [];
  });

  const addCharacter = (newCharacter: Character) => {
    const updatedCharacters = [...savedCharacters, newCharacter];
    setSavedCharacters(updatedCharacters);
    localStorage.setItem('savedCharacters', JSON.stringify(updatedCharacters));
  };

  return (
    <CharacterContext.Provider value={{ character, setCharacter, savedCharacters, addCharacter }}>
      {children}
    </CharacterContext.Provider>
  );
};
