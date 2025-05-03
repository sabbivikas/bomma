
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { enhanceDrawing, interpretAndDrawShape, findDrawingCenter } from '@/utils/drawingEnhancer';
import { toast } from '@/hooks/use-toast';

export default function CoDraw() {
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const resultCanvasRef = useRef<HTMLCanvasElement>(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  // Initialize drawing canvas
  const initializeCanvas = (canvas: HTMLCanvasElement | null) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  // Set up drawing canvas after component mounts
  React.useEffect(() => {
    initializeCanvas(drawingCanvasRef.current);
  }, []);

  // Handle drawing on canvas
  const handleMouseDown = (e: React.MouseEvent) => {
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Start drawing
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';

    // Handle mouse movement while drawing
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const moveX = moveEvent.clientX - rect.left;
      const moveY = moveEvent.clientY - rect.top;
      
      ctx.lineTo(moveX, moveY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(moveX, moveY);
    };

    // Handle mouse up - stop drawing
    const handleMouseUp = () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      ctx.beginPath();
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Clear the drawing canvas
  const handleClearCanvas = () => {
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Also clear the result canvas
    const resultCanvas = resultCanvasRef.current;
    if (resultCanvas) {
      const resultCtx = resultCanvas.getContext('2d');
      if (resultCtx) {
        resultCtx.clearRect(0, 0, resultCanvas.width, resultCanvas.height);
      }
    }
  };

  // Send the drawing and prompt to the backend for enhancement
  const handleEnhanceDrawing = async () => {
    if (!drawingCanvasRef.current) return;
    const canvas = drawingCanvasRef.current;
    const image = canvas.toDataURL('image/png');

    if (!prompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please enter a prompt describing what to add to your drawing.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // First try to directly enhance the drawing using local functions
      const context = canvas.getContext('2d');
      if (context) {
        // Try local enhancement first - this is faster and more reliable for simple operations
        const enhanced = interpretAndDrawShape(context, prompt, canvas);
        
        if (enhanced) {
          // Copy the enhanced drawing to result canvas
          const resultCanvas = resultCanvasRef.current;
          if (resultCanvas) {
            const resultCtx = resultCanvas.getContext('2d');
            if (resultCtx) {
              resultCtx.clearRect(0, 0, resultCanvas.width, resultCanvas.height);
              resultCtx.drawImage(canvas, 0, 0);
            }
          }
          
          toast({
            title: "Drawing Enhanced",
            description: "Your drawing was enhanced with the requested features.",
          });
          setLoading(false);
          return;
        }
      }

      // If local enhancement fails, call the server-side function
      const result = await enhanceDrawing(image, prompt);
      
      // Process the response
      if (result?.textResponse) {
        // If we got text instructions back, try to interpret them
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Find the center of the drawing to apply enhancements
          const {centerX, centerY, radius} = findDrawingCenter(canvas);
          
          // Try to apply common enhancements based on the prompt
          let enhancementApplied = false;
          
          // Check for specific features in prompt
          if (prompt.toLowerCase().includes('eye')) {
            enhancementApplied = true;
            // Draw eyes on the drawing
            const color = prompt.toLowerCase().includes('blue') ? '#0000FF' : 
                         prompt.toLowerCase().includes('green') ? '#00FF00' :
                         prompt.toLowerCase().includes('red') ? '#FF0000' : '#000000';
            
            ctx.save();
            ctx.lineWidth = 3;
            ctx.fillStyle = color;
            ctx.strokeStyle = color;
            
            // Draw larger eyes
            const eyeDistance = radius * 0.4;
            const eyeY = centerY - radius * 0.1;
            
            // Left eye
            ctx.beginPath();
            ctx.arc(centerX - eyeDistance, eyeY, radius * 0.15, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            // Right eye
            ctx.beginPath();
            ctx.arc(centerX + eyeDistance, eyeY, radius * 0.15, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            // Add pupils
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(centerX - eyeDistance + radius * 0.05, eyeY - radius * 0.05, radius * 0.05, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(centerX + eyeDistance + radius * 0.05, eyeY - radius * 0.05, radius * 0.05, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
          } else if (prompt.toLowerCase().includes('smile') || prompt.toLowerCase().includes('mouth')) {
            enhancementApplied = true;
            // Draw a smile
            ctx.save();
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#000000';
            
            ctx.beginPath();
            ctx.arc(centerX, centerY + radius * 0.3, radius * 0.3, 0.1 * Math.PI, 0.9 * Math.PI);
            ctx.stroke();
            
            ctx.restore();
          } else if (prompt.toLowerCase().includes('hat')) {
            enhancementApplied = true;
            // Draw a hat
            ctx.save();
            ctx.lineWidth = 3;
            ctx.fillStyle = '#000000';
            ctx.strokeStyle = '#000000';
            
            // Draw a simple cap
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, -0.95 * Math.PI, 0.95 * Math.PI, true);
            ctx.stroke();
            
            // Cap brim
            ctx.beginPath();
            ctx.ellipse(centerX, centerY - radius * 0.5, radius * 0.7, radius * 0.25, 0, Math.PI, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
          } else if (prompt.toLowerCase().includes('hair')) {
            enhancementApplied = true;
            // Draw hair
            ctx.save();
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#000000';
            
            // Short hair by default
            for (let angle = -0.9 * Math.PI; angle <= 0.9 * Math.PI; angle += 0.05) {
              const lineLength = radius * (0.3 + Math.random() * 0.3);
              ctx.beginPath();
              ctx.moveTo(centerX + Math.cos(angle) * radius * 0.9, centerY + Math.sin(angle) * radius * 0.9);
              ctx.lineTo(centerX + Math.cos(angle) * (radius + lineLength), 
                        centerY + Math.sin(angle) * (radius + lineLength));
              ctx.stroke();
            }
            
            ctx.restore();
          }
          
          if (enhancementApplied) {
            // Copy the enhanced drawing to result canvas
            const resultCanvas = resultCanvasRef.current;
            if (resultCanvas) {
              const resultCtx = resultCanvas.getContext('2d');
              if (resultCtx) {
                resultCtx.clearRect(0, 0, resultCanvas.width, resultCanvas.height);
                resultCtx.drawImage(canvas, 0, 0);
              }
            }
            
            toast({
              title: "Drawing Enhanced",
              description: "Your drawing was enhanced with the requested features.",
            });
          } else {
            toast({
              title: "Enhancement Information",
              description: result.textResponse.substring(0, 100) + "...",
            });
            
            // Copy original to result canvas as fallback
            const resultCanvas = resultCanvasRef.current;
            if (resultCanvas) {
              const resultCtx = resultCanvas.getContext('2d');
              if (resultCtx) {
                resultCtx.clearRect(0, 0, resultCanvas.width, resultCanvas.height);
                resultCtx.drawImage(canvas, 0, 0);
              }
            }
          }
        }
      } else {
        toast({
          title: "Enhancement Result",
          description: "The AI provided text instructions. Try a more specific prompt like 'add blue eyes' or 'add a hat'.",
        });
      }
    } catch (err: any) {
      console.error('Error enhancing drawing:', err);
      toast({
        title: "Enhancement Failed",
        description: err?.message || "Something went wrong while enhancing your drawing.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">AI Drawing Enhancement</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Drawing Section */}
        <div className="flex flex-col space-y-4">
          <h2 className="text-lg font-medium">Your Drawing</h2>
          <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
            <canvas
              ref={drawingCanvasRef}
              width={512}
              height={512}
              className="w-full cursor-crosshair touch-none"
              onMouseDown={handleMouseDown}
            />
          </div>
          <Button 
            variant="outline" 
            onClick={handleClearCanvas}
            className="w-full"
          >
            Clear Canvas
          </Button>
        </div>
        
        {/* Enhanced Result Section */}
        <div className="flex flex-col space-y-4">
          <h2 className="text-lg font-medium">Enhanced Result</h2>
          <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
            <canvas
              ref={resultCanvasRef}
              width={512}
              height={512}
              className="w-full"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Try: 'add eyes' or 'add a hat'"
              disabled={loading}
              className="flex-1"
            />
            <Button 
              onClick={handleEnhanceDrawing} 
              disabled={loading}
              className="whitespace-nowrap"
            >
              {loading ? 'Enhancing...' : 'Enhance Drawing'}
            </Button>
          </div>
          <div className="text-sm text-gray-500">
            <p>Quick tips: Try "add eyes", "add a smile", "add hat", or "add spiky hair"</p>
          </div>
        </div>
      </div>
    </div>
  );
}
