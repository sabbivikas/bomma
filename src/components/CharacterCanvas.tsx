
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import DrawingCanvas from '@/components/DrawingCanvas';
import { useToast } from '@/hooks/use-toast';
import { useCharacter } from '@/contexts/CharacterContext';
import { v4 as uuidv4 } from 'uuid';

type CharacterCanvasProps = {
  onCharacterCreated: (characterId: string) => void;
};

const CharacterCanvas: React.FC<CharacterCanvasProps> = ({ onCharacterCreated }) => {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [characterName, setCharacterName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { addCharacter } = useCharacter();

  const handleSaveCharacter = async () => {
    if (!canvasRef.current) {
      toast({
        title: "Error",
        description: "Canvas is not ready. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (!characterName.trim()) {
      toast({
        title: "Name required",
        description: "Please give your character a name.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      // Get image data from canvas
      const imageUrl = canvasRef.current.toDataURL('image/png');

      // Create new character
      const newCharacter = {
        id: uuidv4(),
        name: characterName,
        imageUrl,
        createdAt: new Date(),
      };

      // Add to saved characters
      addCharacter(newCharacter);

      toast({
        title: "Character created!",
        description: `${characterName} is ready for adventure!`,
        variant: "success",
      });

      // Notify parent
      onCharacterCreated(newCharacter.id);
    } catch (error) {
      console.error('Error saving character:', error);
      toast({
        title: "Error",
        description: "Failed to save your character. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleCanvasSave = (canvas: HTMLCanvasElement) => {
    canvasRef.current = canvas;
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-4">
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-2 text-center">Create Your Character</h2>
        <p className="text-gray-600 text-center mb-4">
          Draw your character to use in action games!
        </p>
      </div>

      <div className="mb-6">
        <Label htmlFor="characterName">Character Name</Label>
        <Input
          id="characterName"
          placeholder="Enter a name for your character"
          value={characterName}
          onChange={(e) => setCharacterName(e.target.value)}
          className="border-2 border-purple-200 focus:border-purple-500"
        />
      </div>

      <div className="mb-6 border-2 border-purple-200 rounded-lg overflow-hidden">
        <DrawingCanvas 
          onSaveCanvas={handleCanvasSave}
          height={400}
          width={400}
          strokeWidth={5}
          toolbarPosition="bottom"
          showPrompt={false}
        />
      </div>

      <div className="flex justify-center">
        <Button
          onClick={handleSaveCharacter}
          disabled={isCreating}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-2"
        >
          {isCreating ? 'Creating...' : 'Save Character'}
        </Button>
      </div>
    </div>
  );
};

export default CharacterCanvas;
