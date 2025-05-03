
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import DrawingCanvas from './DrawingCanvas';
import PromptInput from './PromptInput';

const CoDrawing: React.FC = () => {
  const [currentImage, setCurrentImage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleImageChange = (imageData: string) => {
    setCurrentImage(imageData);
  };

  const handleSendPrompt = async (prompt: string) => {
    if (!currentImage) {
      toast({
        title: "Drawing required",
        description: "Please create a drawing first",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Send the current drawing and prompt to the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('enhance-drawing', {
        body: { 
          image: currentImage, 
          prompt: prompt 
        }
      });
      
      if (error) {
        throw error;
      }

      if (data.imageData) {
        // Update the canvas with the enhanced image
        setCurrentImage(data.imageData);
        
        toast({
          title: "Drawing enhanced",
          description: "AI has modified your drawing based on your prompt",
        });
      } else if (data.textResponse) {
        toast({
          title: "AI suggestion",
          description: data.textResponse.substring(0, 100),
        });
      } else {
        toast({
          description: "Could not enhance drawing. Try a different prompt.",
        });
      }
    } catch (error) {
      console.error('Error enhancing drawing:', error);
      toast({
        title: "Error",
        description: "Failed to enhance drawing. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <DrawingCanvas onImageChange={handleImageChange} />
      <PromptInput onSendPrompt={handleSendPrompt} isLoading={isProcessing} />
    </div>
  );
};

export default CoDrawing;
