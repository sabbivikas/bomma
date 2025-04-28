
import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import DrawingCanvas from '@/components/DrawingCanvas';
import { useToast } from '@/hooks/use-toast';
import { useCharacter } from '@/contexts/CharacterContext';
import { useNavigate } from 'react-router-dom';
import { initializeSessionId } from '@/utils/sessionService';

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
  const [hasDrawnSomething, setHasDrawnSomething] = useState(false);
  const { addCharacter, setCharacter, refetchCharacters } = useCharacter();

  // Initialize session ID when component mounts
  useEffect(() => {
    initializeSessionId();
  }, []);

  useEffect(() => {
    console.log("Canvas ready state:", isCanvasReady);
    console.log("Canvas ref exists:", canvasRef.current !== null);
  }, [isCanvasReady]);

  const handleSaveCharacter = async () => {
    console.log("Save character clicked");
    
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

    if (!hasDrawnSomething) {
      toast({
        title: "Drawing required",
        description: "Please draw something for your character.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      // Get image data from canvas
      const imageUrl = canvasRef.current.toDataURL('image/png');
      console.log("Image URL generated, length:", imageUrl.length);

      if (!imageUrl || imageUrl.length < 100) {
        throw new Error("Failed to generate valid image data");
      }

      // Create character object
      const newCharacter = {
        id: 'temp-id', // This will be replaced by the database
        name: characterName,
        imageUrl,
        createdAt: new Date(),
      };

      // Save character using the service
      const savedCharacter = await addCharacter(newCharacter);
      
      if (!savedCharacter) {
        throw new Error("Failed to save character");
      }
      
      // Set as current character
      setCharacter(savedCharacter);
      
      toast({
        title: "Character created",
        description: "Your character has been saved successfully!",
        variant: "success",
      });
      
      // Refresh characters list to ensure we have the latest data
      await refetchCharacters();

      // Call callback if provided
      if (onCharacterCreated) {
        onCharacterCreated(savedCharacter.id);
      }
      
      // Navigate to worlds page
      navigate('/worlds');
      
    } catch (error) {
      console.error('Error saving character:', error);
      toast({
        title: "Error",
        description: `Failed to save your character: ${error.message || 'Unknown error'}`,
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
      setHasDrawnSomething(true);
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
          disabled={isCreating || !isCanvasReady || !hasDrawnSomething}
          className={`bg-purple-600 hover:bg-purple-700 text-white px-8 py-2 ${
            !isCanvasReady || !hasDrawnSomething ? 'opacity-50' : ''
          }`}
        >
          {isCreating ? 'Creating...' : isCanvasReady && hasDrawnSomething ? 'Save Character' : 'Draw Something First'}
        </Button>
      </div>
    </div>
  );
};

export default CharacterCanvas;
