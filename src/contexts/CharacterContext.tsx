
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
  removeCharacter?: (id: string) => void;
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
    if (saved) {
      try {
        // Parse the saved data and ensure it's in the right format
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Convert date strings back to Date objects
          return parsed.map(char => ({
            ...char,
            createdAt: new Date(char.createdAt)
          }));
        }
        return [];
      } catch (e) {
        console.error("Error parsing saved characters:", e);
        return [];
      }
    }
    return [];
  });

  const addCharacter = (newCharacter: Character) => {
    const updatedCharacters = [...savedCharacters, newCharacter];
    setSavedCharacters(updatedCharacters);
    localStorage.setItem('savedCharacters', JSON.stringify(updatedCharacters));
  };

  const removeCharacter = (id: string) => {
    const updatedCharacters = savedCharacters.filter(c => c.id !== id);
    setSavedCharacters(updatedCharacters);
    localStorage.setItem('savedCharacters', JSON.stringify(updatedCharacters));
    
    // If the currently selected character is removed, deselect it
    if (character && character.id === id) {
      setCharacter(null);
    }
  };

  return (
    <CharacterContext.Provider value={{ 
      character, 
      setCharacter, 
      savedCharacters, 
      addCharacter,
      removeCharacter
    }}>
      {children}
    </CharacterContext.Provider>
  );
};
