
import React from 'react';
import { useCharacter, Character } from '@/contexts/CharacterContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trash2, Plus, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CharacterSelectProps {
  onCreateNew: () => void;
  onSelectCharacter: (character: Character) => void;
}

const CharacterSelect: React.FC<CharacterSelectProps> = ({ onCreateNew, onSelectCharacter }) => {
  const { savedCharacters, removeCharacter } = useCharacter();
  const { toast } = useToast();
  
  if (savedCharacters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="bg-purple-100 rounded-full p-6 mb-4">
          <Globe className="h-12 w-12 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">No Characters Yet</h2>
        <p className="text-gray-600 mb-6 max-w-md">
          Create your first character to begin your adventure in our action games!
        </p>
        <Button 
          onClick={onCreateNew}
          className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
        >
          <Plus size={16} />
          Create Your First Character
        </Button>
      </div>
    );
  }
  
  const handleDeleteCharacter = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent triggering the card click
    removeCharacter(id);
    toast({
      title: "Character deleted",
      description: "The character has been removed from your collection.",
      variant: "default",
    });
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Your Characters</h2>
        <Button
          onClick={onCreateNew} 
          className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
        >
          <Plus size={16} />
          Create New
        </Button>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {savedCharacters.map((character) => (
          <Card 
            key={character.id}
            className="cursor-pointer hover:border-purple-400 transition-all relative bg-white/80"
            onClick={() => onSelectCharacter(character)}
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
              <Button 
                variant="ghost" 
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-100 hover:bg-red-200"
                onClick={(e) => handleDeleteCharacter(e, character.id)}
              >
                <Trash2 className="h-3 w-3 text-red-500" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CharacterSelect;
