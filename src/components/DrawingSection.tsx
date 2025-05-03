
import React, { useState, useRef } from 'react';
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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme } = useTheme();
  
  // Get theme configuration for styling
  const visualThemeConfig = getThemeConfig(theme.visualTheme);
  
  const handleSaveFrame = (canvas: HTMLCanvasElement) => {
    // Store canvas reference for potential AI enhancement
    canvasRef.current = canvas;
    
    onSaveFrame(canvas);
    
    // Show success message briefly
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };
  
  // Function to draw simple eyes based on ASCII art
  const drawSimpleEyes = (context: CanvasRenderingContext2D, asciiArt: string) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const width = canvas.width;
    const height = canvas.height;
    
    // Get center of canvas (which should be the circle center)
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Estimate circle radius (assuming the circle takes up most of the canvas)
    const radius = Math.min(width, height) * 0.4;
    
    // Set drawing styles
    context.fillStyle = 'black';
    context.strokeStyle = 'black';
    context.lineWidth = 2;
    
    // Draw two simple dots for eyes
    // Position eyes above the horizontal center line
    const eyeY = centerY - radius * 0.2;
    const eyeDistance = radius * 0.5;
    
    // Left eye
    context.beginPath();
    context.arc(centerX - eyeDistance, eyeY, radius * 0.1, 0, Math.PI * 2);
    context.fill();
    
    // Right eye
    context.beginPath();
    context.arc(centerX + eyeDistance, eyeY, radius * 0.1, 0, Math.PI * 2);
    context.fill();
    
    // If the ASCII art contains mouth indicators (like dashes or parentheses),
    // draw a simple curved mouth
    if (asciiArt.includes('-') || asciiArt.includes('(')) {
      context.beginPath();
      context.arc(centerX, centerY + radius * 0.2, radius * 0.3, 0.2 * Math.PI, 0.8 * Math.PI);
      context.stroke();
    }
  };
  
  const handleSendPrompt = async (promptText: string) => {
    if (!canvasRef.current) {
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
      const imageUrl = canvasRef.current.toDataURL('image/png');
      
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
      
      console.log("Edge function response:", data);
      
      // Check if the response contains an image
      if (data && data.imageData) {
        // Apply the generated image to the canvas
        const context = canvasRef.current.getContext('2d');
        if (context) {
          // Create a new image element with the received data
          const img = new Image();
          img.onload = () => {
            // Clear the canvas first
            context.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
            // Draw the image onto the canvas
            context.drawImage(img, 0, 0, canvasRef.current!.width, canvasRef.current!.height);
            
            toast({
              title: "AI Enhancement Applied",
              description: "Your drawing has been enhanced with AI-generated content",
              variant: "default",
            });
          };
          img.onerror = (e) => {
            console.error("Error loading enhanced image:", e);
            toast({
              title: "Error applying enhancement",
              description: "Could not apply the AI-generated image",
              variant: "destructive",
            });
          };
          // Set the source to the base64 image data
          img.src = data.imageData;
        }
      } else if (data && data.parsedInstructions && data.parsedInstructions.type === "ascii_art") {
        // If we have ASCII art instructions, try to draw eyes based on them
        const context = canvasRef.current.getContext('2d');
        if (context) {
          drawSimpleEyes(context, data.parsedInstructions.content);
          
          toast({
            title: "Eyes Added",
            description: "Simple eyes have been drawn based on AI description",
            variant: "default",
          });
        }
      } else if (data && data.textResponse) {
        // Handle text response
        toast({
          title: "AI Enhancement Suggestion",
          description: data.textResponse.substring(0, 200) + (data.textResponse.length > 200 ? '...' : ''),
          variant: "default",
        });
        
        // Try to parse simple features from text description
        const context = canvasRef.current.getContext('2d');
        if (context && data.textResponse.toLowerCase().includes("eye")) {
          // If text mentions eyes, try to draw simple eyes
          drawSimpleEyes(context, "basic eyes");
          
          toast({
            title: "Simple Eyes Added",
            description: "Added basic eyes based on AI description",
            variant: "default",
          });
        }
      } else {
        toast({
          title: "No enhancement generated",
          description: "The AI couldn't generate an enhancement for your drawing",
          variant: "destructive",
        });
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
        
        <DrawingCanvas 
          onSave={handleSaveFrame} 
          prompt={prompt} 
          canvasRef={canvasRef}
        />
      </div>
      
      {/* Add the PromptInput component here */}
      <PromptInput 
        onSendPrompt={handleSendPrompt}
        isLoading={isEnhancing}
      />
    </div>
  );
};

export default DrawingSection;
