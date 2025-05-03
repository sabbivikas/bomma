
import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Eraser, Paintbrush, Trash2 } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useToast } from '@/hooks/use-toast';

interface DrawingCanvasProps {
  onImageChange: (imageData: string) => void;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ onImageChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState([5]);
  const [ctxRef, setCtxRef] = useState<CanvasRenderingContext2D | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Setup canvas size
    const parent = canvas.parentElement;
    if (parent) {
      canvas.width = parent.clientWidth;
      canvas.height = 400; // Fixed height
    }

    const context = canvas.getContext('2d');
    if (context) {
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.strokeStyle = color;
      context.lineWidth = lineWidth[0];
      setCtxRef(context);

      // Initialize with white background
      context.fillStyle = 'white';
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  // Update stroke when color or line width changes
  useEffect(() => {
    if (ctxRef) {
      ctxRef.strokeStyle = tool === 'eraser' ? 'white' : color;
      ctxRef.lineWidth = lineWidth[0];
    }
  }, [color, lineWidth, tool, ctxRef]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !ctxRef) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e 
      ? e.touches[0].clientX - rect.left 
      : e.clientX - rect.left;
    const y = 'touches' in e 
      ? e.touches[0].clientY - rect.top 
      : e.clientY - rect.top;

    ctxRef.beginPath();
    ctxRef.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !ctxRef || !canvasRef.current) return;
    
    e.preventDefault();

    const rect = canvasRef.current.getBoundingClientRect();
    const x = 'touches' in e 
      ? e.touches[0].clientX - rect.left 
      : e.clientX - rect.left;
    const y = 'touches' in e 
      ? e.touches[0].clientY - rect.top 
      : e.clientY - rect.top;

    ctxRef.lineTo(x, y);
    ctxRef.stroke();
  };

  const endDrawing = () => {
    if (!ctxRef) return;
    ctxRef.closePath();
    setIsDrawing(false);
    
    // Notify parent about the image change
    if (canvasRef.current) {
      const imageData = canvasRef.current.toDataURL('image/png');
      onImageChange(imageData);
    }
  };

  const clearCanvas = () => {
    if (!ctxRef || !canvasRef.current) return;
    ctxRef.fillStyle = 'white';
    ctxRef.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    toast({
      title: "Canvas cleared",
      description: "Your drawing has been cleared."
    });

    // Notify parent about the image change
    if (canvasRef.current) {
      const imageData = canvasRef.current.toDataURL('image/png');
      onImageChange(imageData);
    }
  };

  const updateCanvasWithImage = (src: string) => {
    const image = new Image();
    image.onload = () => {
      if (ctxRef && canvasRef.current) {
        ctxRef.drawImage(image, 0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    };
    image.src = src;
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <ToggleGroup type="single" value={tool} onValueChange={(value) => value && setTool(value as 'pen' | 'eraser')}>
            <ToggleGroupItem value="pen" aria-label="Pen tool">
              <Paintbrush className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="eraser" aria-label="Eraser tool">
              <Eraser className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>

          <div className="w-24">
            <Slider 
              value={lineWidth} 
              onValueChange={setLineWidth}
              min={1}
              max={20}
              step={1}
            />
          </div>

          <input 
            type="color" 
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8 border border-gray-300 rounded-md cursor-pointer"
          />
        </div>

        <Button variant="outline" size="sm" onClick={clearCanvas}>
          <Trash2 className="h-4 w-4 mr-1" /> Clear
        </Button>
      </div>

      <div className="border border-gray-300 rounded-lg overflow-hidden bg-white touch-none">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={endDrawing}
          className="w-full touch-none"
        />
      </div>
    </div>
  );
};

export default DrawingCanvas;
