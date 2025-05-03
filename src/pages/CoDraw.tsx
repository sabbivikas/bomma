
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { enhanceDrawing } from '@/utils/drawingEnhancer';
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
      // Call the enhanceDrawing function from utils
      const result = await enhanceDrawing(image, prompt);
      
      // Display the enhanced image on the result canvas
      if (result?.imageData && resultCanvasRef.current) {
        const resultCanvas = resultCanvasRef.current;
        const ctx = resultCanvas.getContext('2d');
        if (ctx) {
          const img = new Image();
          img.onload = () => {
            ctx.clearRect(0, 0, resultCanvas.width, resultCanvas.height);
            ctx.drawImage(img, 0, 0, resultCanvas.width, resultCanvas.height);
          };
          img.src = result.imageData;
        }
        
        toast({
          title: "Drawing Enhanced",
          description: "Your drawing was successfully enhanced!",
        });
      } else if (result?.message) {
        toast({
          title: "Enhancement Result",
          description: result.message,
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
              placeholder="Describe what to add (e.g., 'add blue eyes')"
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
        </div>
      </div>
    </div>
  );
}
