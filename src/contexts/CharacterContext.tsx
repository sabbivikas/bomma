
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Character, fetchCharacters, createCharacter as createCharacterService, deleteCharacter as deleteCharacterService } from '@/services/characterService';
import { useToast } from '@/hooks/use-toast';

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

export type { Character };

type CharacterProviderProps = {
  children: ReactNode;
};

export const CharacterProvider: React.FC<CharacterProviderProps> = ({ children }) => {
  const [character, setCharacter] = useState<Character | null>(null);
  const [savedCharacters, setSavedCharacters] = useState<Character[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const loadCharacters = async () => {
      try {
        const characters = await fetchCharacters();
        setSavedCharacters(characters);
      } catch (error) {
        console.error('Failed to load characters:', error);
        toast({
          title: "Error",
          description: "Failed to load characters. Please try again.",
          variant: "destructive",
        });
      }
    };

    loadCharacters();
  }, [toast]);

  const addCharacter = async (newCharacter: Character) => {
    try {
      const character = await createCharacterService(newCharacter.name, newCharacter.imageUrl);
      setSavedCharacters(prev => [...prev, character]);
    } catch (error) {
      console.error('Failed to save character:', error);
      toast({
        title: "Error",
        description: "Failed to save character. Please try again.",
        variant: "destructive",
      });
    }
  };

  const removeCharacter = async (id: string) => {
    try {
      await deleteCharacterService(id);
      setSavedCharacters(prev => prev.filter(c => c.id !== id));
      if (character?.id === id) {
        setCharacter(null);
      }
    } catch (error) {
      console.error('Failed to delete character:', error);
      toast({
        title: "Error",
        description: "Failed to delete character. Please try again.",
        variant: "destructive",
      });
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
