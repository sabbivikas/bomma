
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Character, fetchCharacters, createCharacter as createCharacterService, deleteCharacter as deleteCharacterService } from '@/services/characterService';
import { useToast } from '@/hooks/use-toast';
import { initializeSessionId } from '@/utils/sessionService';

type CharacterContextType = {
  character: Character | null;
  setCharacter: (character: Character | null) => void;
  savedCharacters: Character[];
  addCharacter: (character: Character) => Promise<Character | null>;
  removeCharacter: (id: string) => void;
  isLoading: boolean;
  refetchCharacters: () => Promise<void>;
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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  // Initialize session ID on provider mount and ensure it's set properly
  useEffect(() => {
    const sessionId = initializeSessionId();
    console.log("CharacterProvider: Session ID initialized:", sessionId);
  }, []);

  const refetchCharacters = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching characters...");
      // Ensure we have a session ID
      const sessionId = initializeSessionId();
      console.log("Using session ID:", sessionId);
      
      const characters = await fetchCharacters();
      console.log("Characters fetched:", characters);
      setSavedCharacters(characters);
    } catch (error) {
      console.error('Failed to load characters:', error);
      toast({
        title: "Error",
        description: "Failed to load characters. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refetchCharacters();
  }, []);

  const addCharacter = async (newCharacter: Character): Promise<Character | null> => {
    try {
      // Ensure we have a session ID
      const sessionId = initializeSessionId();
      console.log("Adding character with session ID:", sessionId);
      
      console.log("Adding character:", newCharacter);
      const character = await createCharacterService(newCharacter.name, newCharacter.imageUrl);
      console.log("Character added:", character);
      
      // Add to local state
      setSavedCharacters(prev => [character, ...prev]);
      
      toast({
        title: "Character created",
        description: `${character.name} is ready for adventure!`,
        variant: "success",
      });
      
      return character;
    } catch (error) {
      console.error('Failed to save character:', error);
      toast({
        title: "Error",
        description: `Failed to save character: ${error.message || 'Please try again.'}`,
        variant: "destructive",
      });
      return null;
    }
  };

  const removeCharacter = async (id: string) => {
    try {
      await deleteCharacterService(id);
      setSavedCharacters(prev => prev.filter(c => c.id !== id));
      if (character?.id === id) {
        setCharacter(null);
      }
      toast({
        title: "Character deleted",
        description: "Your character has been removed.",
        variant: "default",
      });
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
      removeCharacter,
      isLoading,
      refetchCharacters
    }}>
      {children}
    </CharacterContext.Provider>
  );
};
