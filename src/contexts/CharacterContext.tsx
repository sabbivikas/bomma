
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

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
  removeCharacter: (id: string) => void;
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
  const [savedCharacters, setSavedCharacters] = useState<Character[]>([]);

  // Load saved characters and current character from localStorage on initial mount only
  useEffect(() => {
    const loadSavedCharacters = () => {
      const saved = localStorage.getItem('savedCharacters');
      if (saved) {
        try {
          // Parse the saved data and ensure it's in the right format
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            // Convert date strings back to Date objects
            const characters = parsed.map(char => ({
              ...char,
              createdAt: new Date(char.createdAt)
            }));
            console.log("Loaded characters:", characters);
            setSavedCharacters(characters);
            
            // Check if there's a current character saved
            const currentCharId = localStorage.getItem('currentCharacterId');
            if (currentCharId) {
              const currentChar = characters.find(c => c.id === currentCharId);
              if (currentChar) {
                console.log("Setting current character from localStorage:", currentChar);
                setCharacter(currentChar);
              }
            }
          }
        } catch (e) {
          console.error("Error parsing saved characters:", e);
        }
      }
    };

    loadSavedCharacters();
  }, []);

  // Save current character ID to localStorage whenever it changes
  useEffect(() => {
    if (character) {
      console.log("Saving current character to localStorage:", character.id);
      localStorage.setItem('currentCharacterId', character.id);
    } else {
      localStorage.removeItem('currentCharacterId');
    }
  }, [character]);

  const addCharacter = (newCharacter: Character) => {
    console.log("Adding new character:", newCharacter);
    setSavedCharacters(prev => {
      const updated = [...prev, newCharacter];
      // Save to localStorage
      localStorage.setItem('savedCharacters', JSON.stringify(updated));
      return updated;
    });
  };

  const removeCharacter = (id: string) => {
    setSavedCharacters(prev => {
      const updated = prev.filter(c => c.id !== id);
      // Save to localStorage
      localStorage.setItem('savedCharacters', JSON.stringify(updated));
      return updated;
    });
    
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
