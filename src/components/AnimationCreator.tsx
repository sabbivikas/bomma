
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import DrawingCanvas from '@/components/DrawingCanvas';
import { createStory, addFrameToStory } from '@/utils/storyService';
import { getSessionId } from '@/utils/doodleService';
import { StoryFrame } from '@/types/doodle';
import { Trash2, Plus, Film, Eye } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { getThemeConfig } from '@/utils/themeConfig';

const AnimationCreator: React.FC = () => {
  const [title, setTitle] = useState('');
  const [frames, setFrames] = useState<StoryFrame[]>([]);
  const [currentFrameDuration, setCurrentFrameDuration] = useState([1000]); // Default 1 second
  const [isCreatingStory, setIsCreatingStory] = useState(false);
  const [isAddingFrame, setIsAddingFrame] = useState(false);
  const { theme } = useTheme();
  const navigate = useNavigate();

  // Get theme configuration
  const visualThemeConfig = getThemeConfig(theme.visualTheme);
  const seasonalThemeConfig = theme.seasonalTheme !== 'none' ? getThemeConfig(theme.seasonalTheme) : null;

  // Ref for scrolling to the bottom of the frames list
  const framesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new frame is added
  React.useEffect(() => {
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
        duration: currentFrameDuration[0],
        createdAt: new Date().toISOString()
      };
      
      // Add to local state
      setFrames(prevFrames => [...prevFrames, tempFrame]);
      
      toast({
        title: "Frame added",
        description: `Frame ${frames.length + 1} added to animation`,
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
        description: "Please enter a title for your animation",
        variant: "destructive",
      });
      return;
    }
    
    if (frames.length < 2) {
      toast({
        title: "More frames needed",
        description: "Please add at least 2 frames to create an animation",
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
        isAnimation: true,
      });
      
      if (!newStory) {
        throw new Error("Failed to create animation");
      }
      
      // Add each frame to the story
      for (let i = 0; i < frames.length; i++) {
        const frame = frames[i];
        await addFrameToStory(newStory.id, {
          imageUrl: frame.imageUrl,
          order: i,
          duration: frame.duration
        });
      }
      
      toast({
        title: "Animation created!",
        description: "Your animation has been published successfully",
        variant: "success",
      });
      
      // Navigate to the stories page
      navigate('/stories');
      
    } catch (error) {
      console.error('Error creating animation:', error);
      toast({
        title: "Error creating animation",
        description: "Could not create the animation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingStory(false);
    }
  };

  // Generate theme-based background style for frames
  const getThemeBackgroundStyle = () => {
    let style = visualThemeConfig?.backgroundStyle || '';
    return style;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Create Animation</h2>
        <p className="text-gray-600">
          Draw frames one by one to create an animated sequence
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="title">Animation Title</Label>
          <Input 
            id="title" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            placeholder="My Awesome Animation"
          />
        </div>
        
        <div className="space-y-2">
          <Label>Frame Duration (milliseconds)</Label>
          <div className="flex items-center gap-4">
            <Slider
              value={currentFrameDuration}
              onValueChange={setCurrentFrameDuration}
              min={200}
              max={5000}
              step={100}
              className="flex-1"
            />
            <span className="w-16 text-right">{currentFrameDuration[0]} ms</span>
          </div>
          <p className="text-xs text-gray-500">
            This controls how long each frame will be displayed in the animation
          </p>
        </div>
        
        {/* Frame preview area */}
        {frames.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Frames ({frames.length})</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-60 overflow-y-auto p-2 bg-gray-50 rounded-md">
              {frames.map((frame, index) => (
                <div key={index} className="relative group">
                  <div className={`aspect-square border rounded-md overflow-hidden ${getThemeBackgroundStyle()}`}>
                    <img 
                      src={frame.imageUrl} 
                      alt={`Frame ${index + 1}`} 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="absolute top-0 right-0 p-1">
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveFrame(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-2 py-1">
                    Frame {index + 1} • {frame.duration}ms
                  </div>
                </div>
              ))}
              <div ref={framesEndRef} />
            </div>
          </div>
        )}
        
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">
            {frames.length === 0 ? "Create your first frame" : "Add next frame"}
          </h3>
          <DrawingCanvas onSave={handleSaveFrame} />
          
          <div className="mt-4 flex justify-between">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              disabled={frames.length < 2}
              onClick={() => navigate('/stories')}
            >
              <Eye className="h-4 w-4" />
              View All Stories
            </Button>
            
            <div className="space-x-4">
              <Button
                variant="outline"
                className="flex items-center gap-2"
                disabled={isAddingFrame}
                onClick={() => setFrames([])}
              >
                <Trash2 className="h-4 w-4" />
                Clear All Frames
              </Button>
              
              <Button
                className="flex items-center gap-2"
                disabled={frames.length < 2 || isCreatingStory}
                onClick={handleCreateStory}
              >
                <Film className="h-4 w-4" />
                Create Animation
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimationCreator;
