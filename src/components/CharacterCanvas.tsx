
import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import DrawingCanvas from '@/components/DrawingCanvas';
import { useToast } from '@/hooks/use-toast';
import { useCharacter } from '@/contexts/CharacterContext';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';

type CharacterCanvasProps = {
  onCharacterCreated?: (characterId: string) => void;
};

const CharacterCanvas: React.FC<CharacterCanvasProps> = ({ onCharacterCreated }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [characterName, setCharacterName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  const { addCharacter, setCharacter, savedCharacters } = useCharacter();

  // Track when the DrawingCanvas saves to our ref
  useEffect(() => {
    console.log("Canvas ready state:", isCanvasReady);
    console.log("Canvas ref exists:", canvasRef.current !== null);
  }, [isCanvasReady]);

  const handleSaveCharacter = async () => {
    console.log("Save character clicked");
    console.log("Canvas ready:", isCanvasReady);
    console.log("Canvas ref:", canvasRef.current);

    if (!canvasRef.current || !isCanvasReady) {
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
      console.log("Image URL generated successfully");

      // Create new character
      const newCharacter = {
        id: uuidv4(),
        name: characterName,
        imageUrl,
        createdAt: new Date(),
      };

      console.log("Created new character:", newCharacter);

      // Add to saved characters and persist immediately
      addCharacter(newCharacter);
      
      // Force update the localStorage
      const updatedCharacters = [...savedCharacters, newCharacter];
      localStorage.setItem('savedCharacters', JSON.stringify(updatedCharacters));
      
      // Set as current character and persist immediately
      setCharacter(newCharacter);
      localStorage.setItem('currentCharacterId', newCharacter.id);
      
      console.log("Set current character:", newCharacter);
      console.log("Updated localStorage with new character");

      toast({
        title: "Character created!",
        description: `${characterName} is ready for adventure!`,
        variant: "success",
      });

      // Call callback if provided
      if (onCharacterCreated) {
        onCharacterCreated(newCharacter.id);
      }
      
      // Redirect to worlds page immediately
      navigate('/worlds');
      
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

  // Handle saving from DrawingCanvas
  const handleCanvasSave = (canvas: HTMLCanvasElement) => {
    console.log("Canvas saved callback received");
    if (canvas) {
      console.log("Canvas element received:", canvas);
      canvasRef.current = canvas;
      setIsCanvasReady(true);
    } else {
      console.error("Received null canvas in handleCanvasSave");
    }
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
          key="character-drawing-canvas"
          onSave={handleCanvasSave}
          prompt={null}
        />
      </div>

      <div className="flex justify-center">
        <Button
          onClick={handleSaveCharacter}
          disabled={isCreating || !isCanvasReady}
          className={`bg-purple-600 hover:bg-purple-700 text-white px-8 py-2 ${!isCanvasReady ? 'opacity-50' : ''}`}
        >
          {isCreating ? 'Creating...' : isCanvasReady ? 'Save Character' : 'Draw Something First'}
        </Button>
      </div>
    </div>
  );
};

export default CharacterCanvas;
