
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

// Drawing functions

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
  const originalLineWidth = context.lineWidth;
  
  // Set styles
  context.fillStyle = color;
  context.lineWidth = 3;
  
  // Left eye - made more visible and larger
  context.beginPath();
  context.arc(centerX - eyeDistance, eyeY, radius * 0.15, 0, Math.PI * 2);
  context.fill();
  context.stroke();
  
  // Right eye - made more visible and larger
  context.beginPath();
  context.arc(centerX + eyeDistance, eyeY, radius * 0.15, 0, Math.PI * 2);
  context.fill();
  context.stroke();
  
  // Add pupils for more detail
  context.fillStyle = 'white';
  
  // Left pupil highlight
  context.beginPath();
  context.arc(centerX - eyeDistance + radius * 0.05, eyeY - radius * 0.05, radius * 0.05, 0, Math.PI * 2);
  context.fill();
  
  // Right pupil highlight
  context.beginPath();
  context.arc(centerX + eyeDistance + radius * 0.05, eyeY - radius * 0.05, radius * 0.05, 0, Math.PI * 2);
  context.fill();
  
  // Restore original styles
  context.fillStyle = originalFillStyle;
  context.lineWidth = originalLineWidth;
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
  // Store original styles
  const originalStrokeStyle = context.strokeStyle;
  const originalLineWidth = context.lineWidth;
  
  // Set styles for more visibility
  context.strokeStyle = color;
  context.lineWidth = 3;
  
  // Determine the type of mouth (smile or frown)
  if (isSmile) {
    // Draw a smile
    context.beginPath();
    context.arc(centerX, centerY + radius * 0.3, radius * 0.3, 0.1 * Math.PI, 0.9 * Math.PI);
    context.stroke();
  } else {
    // Draw a frown
    context.beginPath();
    context.arc(centerX, centerY + radius * 0.5, radius * 0.3, 1.1 * Math.PI, 1.9 * Math.PI);
    context.stroke();
  }
  
  // Restore original styles
  context.strokeStyle = originalStrokeStyle;
  context.lineWidth = originalLineWidth;
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
  // Store original styles
  const originalStrokeStyle = context.strokeStyle;
  const originalLineWidth = context.lineWidth;
  
  // Set styles for more visibility
  context.strokeStyle = color;
  context.lineWidth = 3;
  
  // Draw hair based on style
  if (style === 'spiky') {
    // Spiky hair - made more pronounced
    for (let angle = -0.9 * Math.PI; angle <= 0.9 * Math.PI; angle += 0.1) {
      const length = radius * 0.7 * (0.7 + Math.random() * 0.6);
      context.beginPath();
      context.moveTo(
        centerX + Math.cos(angle) * radius * 0.8,
        centerY + Math.sin(angle) * radius * 0.8
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
    const bottomY = centerY + radius * 1.8; // Made longer
    
    context.lineTo(rightSideX, bottomY);
    context.lineTo(leftSideX, bottomY);
    context.closePath();
    context.stroke();
    
    // Add some hair strands for detail
    for (let i = 0; i < 8; i++) {
      const startX = centerX - radius + (2 * radius * Math.random());
      const startY = centerY + radius * (0.5 + Math.random() * 0.5);
      const endY = startY + radius * (0.7 + Math.random() * 0.5);
      
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
    // Default short hair - made more visible
    context.beginPath();
    for (let angle = -0.9 * Math.PI; angle <= 0.9 * Math.PI; angle += 0.05) {
      const lineLength = radius * (0.3 + Math.random() * 0.3);
      context.moveTo(centerX + Math.cos(angle) * radius * 0.9, centerY + Math.sin(angle) * radius * 0.9);
      context.lineTo(centerX + Math.cos(angle) * (radius + lineLength), 
                    centerY + Math.sin(angle) * (radius + lineLength));
    }
    context.stroke();
  }
  
  // Restore original styles
  context.strokeStyle = originalStrokeStyle;
  context.lineWidth = originalLineWidth;
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
  // Store original styles
  const originalStrokeStyle = context.strokeStyle;
  const originalFillStyle = context.fillStyle;
  const originalLineWidth = context.lineWidth;
  
  // Set styles for more visibility
  context.strokeStyle = color;
  context.fillStyle = color;
  context.lineWidth = 3;
  
  if (style === 'top') {
    // Top hat
    // Hat body - made more visible
    context.beginPath();
    context.fillRect(
      centerX - radius * 0.6,
      centerY - radius * 1.8,
      radius * 1.2,
      radius * 0.8
    );
    
    // Hat brim - more pronounced
    context.beginPath();
    context.ellipse(
      centerX,
      centerY - radius - 3,
      radius * 0.9,
      radius * 0.2,
      0,
      0,
      Math.PI * 2
    );
    context.fill();
  } else if (style === 'cowboy') {
    // Cowboy hat - made more visible
    // Hat top (curved)
    context.beginPath();
    context.ellipse(
      centerX,
      centerY - radius - 15,
      radius * 0.6,
      radius * 0.3,
      0,
      0,
      Math.PI * 2
    );
    context.fill();
    
    // Hat brim (wider)
    context.beginPath();
    context.ellipse(
      centerX,
      centerY - radius + 5,
      radius * 1.3,
      radius * 0.25,
      0,
      0,
      Math.PI * 2
    );
    context.fill();
  } else {
    // Default cap - made more visible
    // Cap body
    context.beginPath();
    context.arc(
      centerX,
      centerY,
      radius,
      -0.95 * Math.PI,
      0.95 * Math.PI,
      true
    );
    context.stroke();
    
    // Cap brim - more pronounced
    context.fillStyle = color;
    context.beginPath();
    context.ellipse(
      centerX,
      centerY - radius * 0.5,
      radius * 0.7,
      radius * 0.25,
      0,
      Math.PI,
      Math.PI * 2
    );
    context.fill();
  }
  
  // Restore original styles
  context.strokeStyle = originalStrokeStyle;
  context.fillStyle = originalFillStyle;
  context.lineWidth = originalLineWidth;
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
  context.lineWidth = 3;
  
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
  if (promptLower.includes('eye') || promptLower.match(/add\s+eyes/i)) {
    drawEyes(context, centerX, centerY, radius, color);
    return true;
  }
  
  // Add mouth
  if (promptLower.includes('mouth') || promptLower.includes('smile') || 
      promptLower.includes('frown')) {
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
 * Apply AI drawing instructions to a canvas
 */
export const applyAIDrawingInstructions = (
  context: CanvasRenderingContext2D,
  instructions: AiDrawingInstructions,
  canvas: HTMLCanvasElement
): boolean => {
  if (!instructions || !context || !canvas) {
    return false;
  }

  const width = canvas.width;
  const height = canvas.height;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.3;
  
  try {
    // Process instructions based on type
    switch (instructions.type) {
      case 'color_instructions':
        if (instructions.colors && instructions.colors.length > 0) {
          const color = instructions.colors[0];
          const area = instructions.element === 'background' ? 'background' : 
                      instructions.element === 'face' || instructions.element === 'circle' ? 'circle' : 'all';
          colorDrawing(context, canvas, color, area);
          return true;
        }
        break;
        
      case 'text_instructions':
        // For text instructions, we'll try to interpret them using our existing function
        return interpretAndDrawShape(context, instructions.content, canvas);
        
      case 'ascii_art':
        // For ASCII art, we don't have a direct implementation, so we'll default to 
        // trying to interpret the content as a text instruction
        return interpretAndDrawShape(context, instructions.content, canvas);
        
      default:
        return false;
    }
    
    return false;
  } catch (error) {
    console.error("Error applying AI drawing instructions:", error);
    return false;
  }
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

// Additional utility to find a face in the drawing
export const findDrawingCenter = (canvas: HTMLCanvasElement): {centerX: number, centerY: number, radius: number} => {
  const context = canvas.getContext('2d');
  if (!context) {
    return {centerX: canvas.width/2, centerY: canvas.height/2, radius: Math.min(canvas.width, canvas.height) * 0.3};
  }
  
  // Default to center if we can't find anything
  let centerX = canvas.width / 2;
  let centerY = canvas.height / 2;
  let radius = Math.min(canvas.width, canvas.height) * 0.3;
  
  // Get image data to analyze
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  // Find non-white pixels to determine the drawing
  let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0;
  let pixelCount = 0;
  
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const idx = (y * canvas.width + x) * 4;
      // Check if pixel isn't white (allowing some tolerance)
      if (data[idx] < 240 || data[idx + 1] < 240 || data[idx + 2] < 240) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
        pixelCount++;
      }
    }
  }
  
  // If we found non-white pixels, calculate center and radius
  if (pixelCount > 0) {
    centerX = (minX + maxX) / 2;
    centerY = (minY + maxY) / 2;
    radius = Math.max(maxX - minX, maxY - minY) / 2;
  }
  
  return {centerX, centerY, radius};
};
