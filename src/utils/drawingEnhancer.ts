
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Interface for AI response instructions
export interface AiDrawingInstructions {
  type: 'ascii_art' | 'text_instructions';
  content: string;
  element?: string;
}

/**
 * Makes a request to the AI enhancement service
 */
export const enhanceDrawing = async (imageUrl: string, promptText: string) => {
  try {
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
    
    return data;
  } catch (error) {
    console.error('Error enhancing drawing:', error);
    throw error;
  }
};

/**
 * Draws eyes on the canvas based on context
 */
export const drawEyes = (context: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number) => {
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

/**
 * Draws a mouth on the canvas
 */
export const drawMouth = (context: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number) => {
  // Draw a simple curved mouth
  context.beginPath();
  context.arc(centerX, centerY + radius * 0.3, radius * 0.25, 0.1 * Math.PI, 0.9 * Math.PI);
  context.stroke();
};

/**
 * Interprets AI drawing instructions and applies them to canvas
 */
export const applyAIDrawingInstructions = (
  context: CanvasRenderingContext2D, 
  instructions: AiDrawingInstructions, 
  canvas: HTMLCanvasElement
) => {
  if (!canvas) return false;
  
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

/**
 * Interprets text description and draws shapes
 */
export const interpretAndDrawShape = (
  context: CanvasRenderingContext2D, 
  prompt: string,
  canvas: HTMLCanvasElement
) => {
  if (!canvas) return false;
  
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

/**
 * Processes a drawing enhancement request
 */
export const processEnhancement = async (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  promptText: string,
  setIsEnhancing: (value: boolean) => void
) => {
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
    
    // Call the enhancement service
    const data = await enhanceDrawing(imageUrl, promptText);
    
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
      enhancementApplied = applyAIDrawingInstructions(context, data.parsedInstructions, canvasRef.current);
      
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
      enhancementApplied = interpretAndDrawShape(context, promptText, canvasRef.current);
    }
    
    // If no specific enhancement was applied, try interpreting prompt directly
    if (!enhancementApplied) {
      enhancementApplied = interpretAndDrawShape(context, promptText, canvasRef.current);
      
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
