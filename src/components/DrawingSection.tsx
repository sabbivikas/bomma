
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
  
  // Function to draw based on AI instructions
  const applyAIDrawingInstructions = (context: CanvasRenderingContext2D, instructions: any) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const width = canvas.width;
    const height = canvas.height;
    
    // Get center of canvas (which should be the circle center)
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Estimate circle radius (assuming the circle takes up most of the canvas)
    const radius = Math.min(width, height) * 0.4;
    
    // If we have ASCII art instructions, interpret and draw them
    if (instructions && instructions.type === "ascii_art") {
      const asciiContent = instructions.content;
      
      // Set drawing styles
      context.fillStyle = 'black';
      context.strokeStyle = 'black';
      context.lineWidth = 2;
      
      // Check for common patterns in ASCII art
      if (asciiContent.includes('.   .') || asciiContent.includes('o   o') || 
          asciiContent.includes('•   •') || asciiContent.includes('*   *')) {
        // Draw eyes
        drawEyes(context, centerX, centerY, radius);
      }
      
      // Check for mouth patterns
      if (asciiContent.includes('-----') || asciiContent.includes('_____') || 
          asciiContent.includes('\\___/') || asciiContent.includes('(     )')) {
        // Draw mouth
        drawMouth(context, centerX, centerY, radius);
      }
      
      return true;
    }
    
    return false;
  };
  
  // Helper function to draw eyes
  const drawEyes = (context: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number) => {
    // Position eyes slightly above the horizontal center line
    const eyeY = centerY - radius * 0.1;
    const eyeDistance = radius * 0.4;
    
    // Left eye
    context.beginPath();
    context.arc(centerX - eyeDistance, eyeY, radius * 0.1, 0, Math.PI * 2);
    context.fill();
    
    // Right eye
    context.beginPath();
    context.arc(centerX + eyeDistance, eyeY, radius * 0.1, 0, Math.PI * 2);
    context.fill();
    
    // Add pupils for more detail
    context.fillStyle = 'white';
    
    // Left pupil highlight
    context.beginPath();
    context.arc(centerX - eyeDistance + radius * 0.03, eyeY - radius * 0.03, radius * 0.03, 0, Math.PI * 2);
    context.fill();
    
    // Right pupil highlight
    context.beginPath();
    context.arc(centerX + eyeDistance + radius * 0.03, eyeY - radius * 0.03, radius * 0.03, 0, Math.PI * 2);
    context.fill();
  };
  
  // Helper function to draw mouth
  const drawMouth = (context: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number) => {
    // Draw a simple curved mouth
    context.beginPath();
    context.arc(centerX, centerY + radius * 0.3, radius * 0.25, 0.1 * Math.PI, 0.9 * Math.PI);
    context.stroke();
  };
  
  // Function to interpret and draw different shapes based on text description
  const interpretAndDrawShape = (context: CanvasRenderingContext2D, prompt: string) => {
    if (!canvasRef.current) return false;
    
    const canvas = canvasRef.current;
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Common radius for shapes
    const radius = Math.min(width, height) * 0.3;
    
    // Set default drawing styles
    context.fillStyle = 'black';
    context.strokeStyle = 'black';
    context.lineWidth = 2;
    
    // Simple pattern matching for common drawing requests
    const promptLower = prompt.toLowerCase();
    
    // Add eyes
    if (promptLower.includes('eye') || promptLower.includes('face')) {
      drawEyes(context, centerX, centerY, radius);
      return true;
    }
    
    // Add mouth
    if (promptLower.includes('mouth') || promptLower.includes('smile') || 
        promptLower.includes('frown') || promptLower.includes('face')) {
      drawMouth(context, centerX, centerY, radius);
      return true;
    }
    
    // Add hair
    if (promptLower.includes('hair')) {
      // Simple hair on top of a circle
      context.beginPath();
      for (let angle = -0.4 * Math.PI; angle <= 0.4 * Math.PI; angle += 0.05) {
        const lineLength = radius * (0.8 + Math.random() * 0.4);
        context.moveTo(centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius);
        context.lineTo(centerX + Math.cos(angle) * (radius + lineLength), 
                       centerY + Math.sin(angle) * (radius + lineLength));
      }
      context.stroke();
      return true;
    }
    
    // Add hat
    if (promptLower.includes('hat')) {
      // Simple hat on top
      context.beginPath();
      context.ellipse(centerX, centerY - radius - 5, radius * 0.8, radius * 0.3, 0, 0, Math.PI * 2);
      context.stroke();
      return true;
    }
    
    // Add ice cream to a cone
    if (promptLower.includes('ice cream') || promptLower.includes('icecream')) {
      // Draw ice cream scoop
      context.beginPath();
      context.arc(centerX, centerY - radius * 0.6, radius * 0.8, 0, Math.PI * 2);
      context.stroke();
      
      // Add some texture/drips
      for (let i = 0; i < 5; i++) {
        const drip = 0.3 + Math.random() * 0.5;
        const angle = (0.7 + 0.6 * Math.random()) * Math.PI;
        const driplength = radius * 0.3 * Math.random();
        
        context.beginPath();
        context.moveTo(centerX + Math.cos(angle) * radius * 0.8, 
                      centerY - radius * 0.6 + Math.sin(angle) * radius * 0.8);
        context.quadraticCurveTo(
          centerX + Math.cos(angle) * radius * 0.8, 
          centerY - radius * 0.6 + Math.sin(angle) * radius * 0.8 + driplength * 0.7,
          centerX + Math.cos(angle) * radius * 0.8 - 5 + Math.random() * 10, 
          centerY - radius * 0.6 + Math.sin(angle) * radius * 0.8 + driplength
        );
        context.stroke();
      }
      return true;
    }
    
    return false; // No matching pattern found
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
      
      // Get canvas context for drawing
      const context = canvasRef.current.getContext('2d');
      if (!context) {
        throw new Error("Could not get canvas context");
      }
      
      // Track whether any enhancement was applied
      let enhancementApplied = false;
      
      // Check if the response contains an image
      if (data && data.imageData) {
        // Apply the generated image to the canvas
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
        enhancementApplied = true;
      } 
      // If we have parsed instructions, try to apply them
      else if (data && data.parsedInstructions) {
        enhancementApplied = applyAIDrawingInstructions(context, data.parsedInstructions);
        
        if (enhancementApplied) {
          toast({
            title: "Drawing Updated",
            description: "Your drawing was updated based on AI instructions",
            variant: "default",
          });
        }
      }
      // Try to interpret the prompt directly if not already handled
      else if (!enhancementApplied && data && data.textResponse) {
        // Show the text response as a toast
        toast({
          title: "AI Suggestion",
          description: data.textResponse.substring(0, 100) + (data.textResponse.length > 100 ? '...' : ''),
          variant: "default",
        });
        
        // Try to interpret the prompt directly
        enhancementApplied = interpretAndDrawShape(context, promptText);
      }
      
      // If no specific enhancement was applied, try interpreting prompt directly
      if (!enhancementApplied) {
        enhancementApplied = interpretAndDrawShape(context, promptText);
        
        if (enhancementApplied) {
          toast({
            title: "Drawing Enhanced",
            description: "Your drawing was updated based on your request",
            variant: "default",
          });
        } else {
          toast({
            title: "Could not enhance drawing",
            description: "Try a different prompt like 'add eyes' or 'draw hair'",
            variant: "default",
          });
        }
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
