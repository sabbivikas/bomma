
import React, { useState } from 'react';
import { CheckCircle, Lightbulb } from 'lucide-react';
import DrawingCanvas from '@/components/DrawingCanvas';
import FrameCounter from '@/components/story/FrameCounter';
import { useTheme } from '@/contexts/ThemeContext';
import { getThemeConfig } from '@/utils/themeConfig';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import PromptInput from './PromptInput';

interface DrawingSectionProps {
  framesCount: number;
  hasNoFrames: boolean;
  onSaveFrame: (canvas: HTMLCanvasElement) => void;
  prompt?: string;
}

const DrawingSection: React.FC<DrawingSectionProps> = ({ 
  framesCount, 
  hasNoFrames, 
  onSaveFrame,
  prompt
}) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null);
  const { theme } = useTheme();
  
  // Get theme configuration for styling
  const visualThemeConfig = getThemeConfig(theme.visualTheme);
  
  const handleSaveFrame = (canvas: HTMLCanvasElement) => {
    // Store canvas reference for potential AI enhancement
    setCanvasRef(canvas);
    
    onSaveFrame(canvas);
    
    // Show success message briefly
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };
  
  const handleSendPrompt = async (promptText: string) => {
    if (!canvasRef) {
      toast({
        title: "No drawing found",
        description: "Please create a drawing first before enhancing",
        variant: "destructive",
      });
      return;
    }
    
    setIsEnhancing(true);
    
    try {
      // Convert canvas to data URL
      const imageUrl = canvasRef.toDataURL('image/png');
      
      // Call the Supabase Edge Function with the drawing and prompt
      const { data, error } = await supabase.functions.invoke('enhance-drawing', {
        body: { 
          image: imageUrl, 
          prompt: promptText 
        }
      });
      
      if (error) {
        throw error;
      }
      
      if (data && data.enhancedImage) {
        // Handle the enhanced image data
        // For now, we'll just show a success message
        toast({
          title: "Drawing enhanced",
          description: "AI has enhanced your drawing based on your prompt",
          variant: "success",
        });
        
        // In a real implementation, you might update the canvas with the enhanced image
        // const img = new Image();
        // img.onload = () => {
        //   const ctx = canvasRef.getContext('2d');
        //   ctx?.clearRect(0, 0, canvasRef.width, canvasRef.height);
        //   ctx?.drawImage(img, 0, 0);
        // };
        // img.src = data.enhancedImage;
      }
    } catch (error) {
      console.error('Error enhancing drawing:', error);
      toast({
        title: "Error enhancing drawing",
        description: "Could not enhance the drawing. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <div className="w-full flex flex-col">
      {/* Display prompt at the top if available */}
      {prompt && (
        <div className="p-3 mb-2 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            <h3 className="font-medium text-gray-800 text-sm">Today's prompt:</h3>
          </div>
          <p className="font-medium text-gray-900">{prompt}</p>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-sm md:text-base font-medium text-gray-700">
          {framesCount === 0 ? "Create your first frame" : "Add next frame"}
        </h3>
        
        <FrameCounter count={framesCount} />
      </div>
      
      <div className={`w-full rounded-lg border border-gray-200 shadow-md overflow-hidden ${visualThemeConfig?.backgroundStyle || 'bg-gradient-to-b from-purple-100 to-blue-100'} backdrop-blur-sm`}>
        {showSuccess && (
          <div className="mb-1 text-xs text-green-600 font-medium flex items-center px-3 pt-2">
            <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
            <span>Frame added successfully</span>
          </div>
        )}
        
        <DrawingCanvas onSave={handleSaveFrame} prompt={prompt} />
      </div>
      
      {/* Add the new PromptInput component here */}
      <PromptInput 
        onSendPrompt={handleSendPrompt}
        isLoading={isEnhancing}
      />
    </div>
  );
};

export default DrawingSection;
