
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Interface for AI response instructions
export interface AiDrawingInstructions {
  type: 'ascii_art' | 'text_instructions' | 'color_instructions';
  content: string;
  element?: string;
  colors?: string[];
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

// Color mapping to use with color-related prompts
const colorMap: Record<string, string> = {
  red: '#FF0000',
  orange: '#FFA500',
  yellow: '#FFFF00',
  green: '#00FF00',
  blue: '#0000FF',
  purple: '#800080',
  pink: '#FFC0CB',
  brown: '#A52A2A',
  black: '#000000',
  white: '#FFFFFF',
  gray: '#808080',
  grey: '#808080',
  gold: '#FFD700',
  silver: '#C0C0C0',
  cyan: '#00FFFF',
  magenta: '#FF00FF',
  lime: '#00FF00',
  maroon: '#800000',
  navy: '#000080',
  olive: '#808000',
  teal: '#008080',
  violet: '#EE82EE',
  turquoise: '#40E0D0',
  tan: '#D2B48C',
  salmon: '#FA8072',
  skyblue: '#87CEEB',
  coral: '#FF7F50',
  indigo: '#4B0082',
  lavender: '#E6E6FA',
  crimson: '#DC143C',
};

/**
 * Extract color from prompt text
 */
const extractColorFromPrompt = (promptText: string): string | null => {
  const promptLower = promptText.toLowerCase();
  
  // Check for direct color mentions in the prompt
  for (const [colorName, colorValue] of Object.entries(colorMap)) {
    if (promptLower.includes(colorName)) {
      return colorValue;
    }
  }
  
  // No color found
  return null;
};

/**
 * Draws eyes on the canvas based on context
 */
export const drawEyes = (
  context: CanvasRenderingContext2D, 
  centerX: number, 
  centerY: number, 
  radius: number,
  color: string = '#000000'
) => {
  // Position eyes slightly above the horizontal center line
  const eyeY = centerY - radius * 0.1;
  const eyeDistance = radius * 0.4;
  
  // Store original fillStyle
  const originalFillStyle = context.fillStyle;
  
  // Set fillStyle to the specified color
  context.fillStyle = color;
  
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
  
  // Restore original fillStyle
  context.fillStyle = originalFillStyle;
};

/**
 * Draws a mouth on the canvas
 */
export const drawMouth = (
  context: CanvasRenderingContext2D, 
  centerX: number, 
  centerY: number, 
  radius: number,
  color: string = '#000000',
  isSmile: boolean = true
) => {
  // Store original strokeStyle
  const originalStrokeStyle = context.strokeStyle;
  
  // Set strokeStyle to the specified color
  context.strokeStyle = color;
  
  // Determine the type of mouth (smile or frown)
  if (isSmile) {
    // Draw a smile
    context.beginPath();
    context.arc(centerX, centerY + radius * 0.3, radius * 0.25, 0.1 * Math.PI, 0.9 * Math.PI);
    context.stroke();
  } else {
    // Draw a frown
    context.beginPath();
    context.arc(centerX, centerY + radius * 0.5, radius * 0.25, 1.1 * Math.PI, 1.9 * Math.PI);
    context.stroke();
  }
  
  // Restore original strokeStyle
  context.strokeStyle = originalStrokeStyle;
};

/**
 * Draws hair on the canvas
 */
export const drawHair = (
  context: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  color: string = '#000000',
  style: 'short' | 'long' | 'spiky' = 'short'
) => {
  // Store original strokeStyle
  const originalStrokeStyle = context.strokeStyle;
  
  // Set strokeStyle to the specified color
  context.strokeStyle = color;
  context.lineWidth = 2;
  
  // Draw hair based on style
  if (style === 'spiky') {
    // Spiky hair
    for (let angle = -0.9 * Math.PI; angle <= 0.9 * Math.PI; angle += 0.1) {
      const length = radius * 0.5 * (0.7 + Math.random() * 0.6);
      context.beginPath();
      context.moveTo(
        centerX + Math.cos(angle) * radius,
        centerY + Math.sin(angle) * radius
      );
      context.lineTo(
        centerX + Math.cos(angle) * (radius + length),
        centerY + Math.sin(angle) * (radius + length)
      );
      context.stroke();
    }
  } else if (style === 'long') {
    // Long flowing hair
    context.beginPath();
    for (let angle = -0.9 * Math.PI; angle <= 0.9 * Math.PI; angle += 0.05) {
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      if (angle === -0.9 * Math.PI) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    }
    
    // Draw the bottom of the long hair
    const leftSideX = centerX - radius;
    const rightSideX = centerX + radius;
    const bottomY = centerY + radius * 1.5;
    
    context.lineTo(rightSideX, bottomY);
    context.lineTo(leftSideX, bottomY);
    context.closePath();
    context.stroke();
    
    // Add some hair strands for detail
    for (let i = 0; i < 8; i++) {
      const startX = centerX - radius + (2 * radius * Math.random());
      const startY = centerY + radius * (0.5 + Math.random() * 0.5);
      const endY = startY + radius * (0.5 + Math.random() * 0.5);
      
      context.beginPath();
      context.moveTo(startX, startY);
      context.bezierCurveTo(
        startX - radius * 0.2, startY + radius * 0.2,
        startX + radius * 0.2, endY - radius * 0.2,
        startX, endY
      );
      context.stroke();
    }
  } else {
    // Default short hair
    context.beginPath();
    for (let angle = -0.9 * Math.PI; angle <= 0.9 * Math.PI; angle += 0.05) {
      const lineLength = radius * (0.2 + Math.random() * 0.3);
      context.moveTo(centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius);
      context.lineTo(centerX + Math.cos(angle) * (radius + lineLength), 
                    centerY + Math.sin(angle) * (radius + lineLength));
    }
    context.stroke();
  }
  
  // Restore original strokeStyle
  context.strokeStyle = originalStrokeStyle;
};

/**
 * Draws a hat on the canvas
 */
export const drawHat = (
  context: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  color: string = '#000000',
  style: 'cap' | 'top' | 'cowboy' = 'cap'
) => {
  // Store original strokeStyle and fillStyle
  const originalStrokeStyle = context.strokeStyle;
  const originalFillStyle = context.fillStyle;
  
  // Set styles to the specified color
  context.strokeStyle = color;
  context.fillStyle = color;
  
  if (style === 'top') {
    // Top hat
    // Hat body
    context.beginPath();
    context.rect(
      centerX - radius * 0.6,
      centerY - radius * 1.8,
      radius * 1.2,
      radius * 0.8
    );
    context.stroke();
    
    // Hat brim
    context.beginPath();
    context.ellipse(
      centerX,
      centerY - radius - 3,
      radius * 0.8,
      radius * 0.2,
      0,
      0,
      Math.PI * 2
    );
    context.stroke();
  } else if (style === 'cowboy') {
    // Cowboy hat
    // Hat top (curved)
    context.beginPath();
    context.ellipse(
      centerX,
      centerY - radius - 10,
      radius * 0.5,
      radius * 0.25,
      0,
      0,
      Math.PI * 2
    );
    context.stroke();
    
    // Hat brim (wider)
    context.beginPath();
    context.ellipse(
      centerX,
      centerY - radius + 5,
      radius * 1.1,
      radius * 0.2,
      0,
      0,
      Math.PI * 2
    );
    context.stroke();
  } else {
    // Default cap
    // Cap body
    context.beginPath();
    context.arc(
      centerX,
      centerY,
      radius * 0.8,
      -0.9 * Math.PI,
      0.9 * Math.PI,
      true
    );
    context.stroke();
    
    // Cap brim
    context.beginPath();
    context.ellipse(
      centerX,
      centerY - radius * 0.5,
      radius * 0.6,
      radius * 0.2,
      0,
      Math.PI,
      Math.PI * 2
    );
    context.stroke();
  }
  
  // Restore original styles
  context.strokeStyle = originalStrokeStyle;
  context.fillStyle = originalFillStyle;
};

/**
 * Apply color to the drawing
 */
export const colorDrawing = (
  context: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  color: string = '#FFC107',
  area: 'background' | 'circle' | 'all' = 'all'
) => {
  const width = canvas.width;
  const height = canvas.height;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.4;
  
  // Store the current composite operation
  const originalComposite = context.globalCompositeOperation;
  
  if (area === 'background') {
    // Create a clipping path for the background (everything except the circle)
    context.save();
    context.beginPath();
    context.rect(0, 0, width, height);
    context.arc(centerX, centerY, radius, 0, Math.PI * 2, true);
    context.clip();
    
    // Fill the background with color
    context.fillStyle = color;
    context.fillRect(0, 0, width, height);
    context.restore();
  } else if (area === 'circle') {
    // Fill only the circle
    context.fillStyle = color;
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, Math.PI * 2);
    context.fill();
  } else {
    // Fill everything with a semi-transparent color
    context.globalCompositeOperation = 'multiply';
    context.fillStyle = color;
    context.fillRect(0, 0, width, height);
  }
  
  // Restore the original composite operation
  context.globalCompositeOperation = originalComposite;
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
  
  // Extract possible color from instructions
  let color = '#000000';
  if (instructions.colors && instructions.colors.length > 0) {
    color = instructions.colors[0];
  }
  
  // If we have ASCII art instructions, interpret and draw them
  if (instructions && instructions.type === "ascii_art") {
    const asciiContent = instructions.content;
    
    // Set drawing styles
    context.fillStyle = color;
    context.strokeStyle = color;
    context.lineWidth = 2;
    
    // Check for common patterns in ASCII art
    if (asciiContent.includes('.   .') || asciiContent.includes('o   o') || 
        asciiContent.includes('•   •') || asciiContent.includes('*   *')) {
      // Draw eyes
      drawEyes(context, centerX, centerY, radius, color);
      return true;
    }
    
    // Check for mouth patterns
    if (asciiContent.includes('-----') || asciiContent.includes('_____') || 
        asciiContent.includes('\\___/') || asciiContent.includes('(     )')) {
      // Draw mouth
      const isSmile = asciiContent.includes('\\___/') || asciiContent.includes('(     )');
      drawMouth(context, centerX, centerY, radius, color, isSmile);
      return true;
    }
    
    return false;
  }
  
  // If we have text instructions, interpret them
  if (instructions && instructions.type === "text_instructions") {
    const element = instructions.element || '';
    const content = instructions.content || '';
    const contentLower = content.toLowerCase();
    
    // Extract possible color from the content
    const extractedColor = extractColorFromPrompt(content);
    if (extractedColor) {
      color = extractedColor;
    }
    
    // Check if the instruction is to color/fill something
    if (contentLower.includes('color') || contentLower.includes('fill') || contentLower.includes('paint')) {
      if (contentLower.includes('background')) {
        colorDrawing(context, canvas, color, 'background');
        return true;
      } else if (contentLower.includes('circle') || 
                contentLower.includes('face') || 
                contentLower.includes('head')) {
        colorDrawing(context, canvas, color, 'circle');
        return true;
      } else {
        colorDrawing(context, canvas, color, 'all');
        return true;
      }
    }
    
    // Check for eye-related instructions
    if (element.includes('eye') || contentLower.includes('eye')) {
      drawEyes(context, centerX, centerY, radius, color);
      return true;
    }
    
    // Check for mouth-related instructions
    if (element.includes('mouth') || contentLower.includes('mouth') || 
        element.includes('smile') || contentLower.includes('smile') ||
        element.includes('frown') || contentLower.includes('frown')) {
      
      // Determine if it should be a smile or frown
      const isSmile = !contentLower.includes('frown') && !contentLower.includes('sad');
      drawMouth(context, centerX, centerY, radius, color, isSmile);
      return true;
    }
    
    // Check for hair-related instructions
    if (element.includes('hair') || contentLower.includes('hair')) {
      let hairStyle: 'short' | 'long' | 'spiky' = 'short';
      
      if (contentLower.includes('long')) {
        hairStyle = 'long';
      } else if (contentLower.includes('spiky') || contentLower.includes('spike')) {
        hairStyle = 'spiky';
      }
      
      drawHair(context, centerX, centerY, radius, color, hairStyle);
      return true;
    }
    
    // Check for hat-related instructions
    if (element.includes('hat') || contentLower.includes('hat') || 
        contentLower.includes('cap') || contentLower.includes('cowboy')) {
      
      let hatStyle: 'cap' | 'top' | 'cowboy' = 'cap';
      
      if (contentLower.includes('top')) {
        hatStyle = 'top';
      } else if (contentLower.includes('cowboy')) {
        hatStyle = 'cowboy';
      }
      
      drawHat(context, centerX, centerY, radius, color, hatStyle);
      return true;
    }
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
  
  // Extract possible color from the prompt
  const extractedColor = extractColorFromPrompt(prompt);
  const color = extractedColor || '#000000';
  
  // Set default drawing styles
  context.fillStyle = color;
  context.strokeStyle = color;
  context.lineWidth = 2;
  
  // Simple pattern matching for common drawing requests
  const promptLower = prompt.toLowerCase();
  
  // Check for color-related instructions
  if (promptLower.includes('color') || promptLower.includes('fill') || promptLower.includes('paint')) {
    if (promptLower.includes('background')) {
      colorDrawing(context, canvas, color, 'background');
      return true;
    } else if (promptLower.includes('circle') || 
              promptLower.includes('face') || 
              promptLower.includes('head')) {
      colorDrawing(context, canvas, color, 'circle');
      return true;
    } else {
      colorDrawing(context, canvas, color, 'all');
      return true;
    }
  }
  
  // Add eyes
  if (promptLower.includes('eye') || promptLower.includes('face')) {
    drawEyes(context, centerX, centerY, radius, color);
    return true;
  }
  
  // Add mouth
  if (promptLower.includes('mouth') || promptLower.includes('smile') || 
      promptLower.includes('frown') || promptLower.includes('face')) {
    // Determine if it should be a smile or frown
    const isSmile = !promptLower.includes('frown') && !promptLower.includes('sad');
    drawMouth(context, centerX, centerY, radius, color, isSmile);
    return true;
  }
  
  // Add hair
  if (promptLower.includes('hair')) {
    let hairStyle: 'short' | 'long' | 'spiky' = 'short';
    
    if (promptLower.includes('long')) {
      hairStyle = 'long';
    } else if (promptLower.includes('spiky') || promptLower.includes('spike')) {
      hairStyle = 'spiky';
    }
    
    drawHair(context, centerX, centerY, radius, color, hairStyle);
    return true;
  }
  
  // Add hat
  if (promptLower.includes('hat') || promptLower.includes('cap') || promptLower.includes('cowboy')) {
    let hatStyle: 'cap' | 'top' | 'cowboy' = 'cap';
    
    if (promptLower.includes('top')) {
      hatStyle = 'top';
    } else if (promptLower.includes('cowboy')) {
      hatStyle = 'cowboy';
    }
    
    drawHat(context, centerX, centerY, radius, color, hatStyle);
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
