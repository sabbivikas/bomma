
import React, { useState, useRef, useEffect } from 'react';
import { createStory, addFrameToStory } from '@/utils/storyService';
import { getSessionId } from '@/utils/doodleService';
import { StoryFrame } from '@/types/doodle';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

// Import our new components
import StoryForm from './story/StoryForm';
import FramePreview from './story/FramePreview';
import DrawingSection from './story/DrawingSection';
import StoryActions from './story/StoryActions';

const StoryCreator: React.FC = () => {
  const [title, setTitle] = useState('');
  const [frames, setFrames] = useState<StoryFrame[]>([]);
  const [isCreatingStory, setIsCreatingStory] = useState(false);
  const [isAddingFrame, setIsAddingFrame] = useState(false);
  const navigate = useNavigate();

  // Calculate states for validation
  const isTitleEmpty = title.trim() === '';
  const hasNoFrames = frames.length === 0;
  const canCreateStory = !isTitleEmpty && !hasNoFrames && !isCreatingStory;

  // Ref for scrolling to the bottom of the frames list
  const framesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new frame is added
  useEffect(() => {
    if (frames.length > 0) {
      framesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [frames.length]);

  const handleSaveFrame = (canvas: HTMLCanvasElement) => {
    setIsAddingFrame(true);
    
    try {
      // Convert canvas to data URL
      const imageUrl = canvas.toDataURL('image/png');
      
      // Create a temporary frame for the UI
      const tempFrame: StoryFrame = {
        id: `temp-${Date.now()}`,
        storyId: '',
        imageUrl,
        order: frames.length,
        duration: 3000, // Default 3 seconds per frame for stories
        createdAt: new Date().toISOString()
      };
      
      // Add to local state
      setFrames(prevFrames => [...prevFrames, tempFrame]);
      
      toast({
        title: "Frame added",
        description: `Frame ${frames.length + 1} added to story`,
        variant: "success",
      });
    } catch (error) {
      console.error('Error saving frame:', error);
      toast({
        title: "Error saving frame",
        description: "Could not save the frame. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAddingFrame(false);
    }
  };

  const handleRemoveFrame = (index: number) => {
    setFrames(prevFrames => prevFrames.filter((_, i) => i !== index));
  };

  const handleCreateStory = async () => {
    if (title.trim() === '') {
      toast({
        title: "Title required",
        description: "Please enter a title for your story",
        variant: "destructive",
      });
      return;
    }
    
    if (frames.length === 0) {
      toast({
        title: "Frames required",
        description: "Please add at least one frame to your story",
        variant: "destructive",
      });
      return;
    }
    
    setIsCreatingStory(true);
    
    try {
      const sessionId = getSessionId();
      
      // Create the story
      const newStory = await createStory({
        title,
        sessionId,
        isAnimation: false,
      });
      
      if (!newStory) {
        throw new Error("Failed to create story");
      }
      
      // Add each frame to the story
      for (let i = 0; i < frames.length; i++) {
        const frame = frames[i];
        await addFrameToStory(newStory.id, {
          imageUrl: frame.imageUrl,
          order: i,
          duration: 3000 // Default 3 seconds per frame for stories
        });
      }
      
      toast({
        title: "Story created!",
        description: "Your story has been published successfully",
        variant: "success",
      });
      
      // Navigate to the stories page
      navigate('/stories');
      
    } catch (error) {
      console.error('Error creating story:', error);
      toast({
        title: "Error creating story",
        description: "Could not create the story. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingStory(false);
    }
  };
  
  // Clear all frames
  const handleClearAllFrames = () => {
    if (frames.length > 0) {
      setFrames([]);
      toast({
        title: "All frames cleared",
        description: "All frames have been removed from your story",
        variant: "default",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Create Story</h2>
        <p className="text-gray-600">
          Draw frames to create a visual story or comic
        </p>
      </div>
      
      <div className="space-y-4">
        <StoryForm 
          title={title} 
          setTitle={setTitle} 
          isTitleEmpty={isTitleEmpty} 
        />
        
        <FramePreview 
          frames={frames} 
          onRemoveFrame={handleRemoveFrame} 
        />
        
        <DrawingSection 
          framesCount={frames.length} 
          hasNoFrames={hasNoFrames} 
          onSaveFrame={handleSaveFrame} 
        />
        
        <StoryActions 
          canCreateStory={canCreateStory}
          hasFrames={frames.length > 0}
          isCreatingStory={isCreatingStory}
          onClearFrames={handleClearAllFrames}
          onCreateStory={handleCreateStory}
          isTitleEmpty={isTitleEmpty}
          hasNoFrames={hasNoFrames}
        />
      </div>
    </div>
  );
};

export default StoryCreator;
