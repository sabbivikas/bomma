
import React, { useRef, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Pen, Eraser, Trash2, Download,
  Paintbrush, Palette
} from 'lucide-react';
import { cn } from "@/lib/utils";

interface DrawingCanvasProps {
  onSave: (canvas: HTMLCanvasElement) => void;
  prompt?: string;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ onSave, prompt }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [color, setColor] = useState('#000000');
  const [width, setWidth] = useState([5]);
  
  // Simple canvas size
  const [canvasSize] = useState({ width: 800, height: 600 });
  
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const lastPointRef = useRef<{ x: number, y: number } | null>(null);
  
  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set canvas size
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    canvas.style.width = `${canvasSize.width}px`;
    canvas.style.height = `${canvasSize.height}px`;
    
    const context = canvas.getContext('2d');
    if (context) {
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.strokeStyle = color;
      context.lineWidth = width[0];
      
      // Fill with white background
      context.fillStyle = 'white';
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      contextRef.current = context;
    }
  }, []);
  
  // Update tool properties
  useEffect(() => {
    if (!contextRef.current) return;
    
    contextRef.current.strokeStyle = tool === 'eraser' ? 
      'white' : 
      color;
    contextRef.current.lineWidth = width[0];
    
  }, [color, width, tool]);
  
  // Start drawing
  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !contextRef.current) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
    lastPointRef.current = { x, y };
    
    setIsDrawing(true);
  };
  
  // Draw
  const draw = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !contextRef.current || !lastPointRef.current) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    contextRef.current.lineTo(x, y);
    contextRef.current.stroke();
    
    lastPointRef.current = { x, y };
  };
  
  // Stop drawing
  const stopDrawing = () => {
    if (contextRef.current) {
      contextRef.current.closePath();
    }
    
    setIsDrawing(false);
    lastPointRef.current = null;
  };
  
  // Clear canvas
  const clearCanvas = () => {
    if (!canvasRef.current || !contextRef.current) return;
    
    contextRef.current.fillStyle = 'white';
    contextRef.current.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };
  
  // Save canvas
  const handleSave = () => {
    if (!canvasRef.current) return;
    onSave(canvasRef.current);
  };
  
  // Color options
  const colorOptions = [
    '#000000', // Black
    '#FFFFFF', // White
    '#FF0000', // Red
    '#00FF00', // Green
    '#0000FF', // Blue
    '#FFFF00', // Yellow
    '#FF00FF', // Magenta
    '#00FFFF', // Cyan
  ];

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6">
      {prompt && (
        <div className="w-full mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-800">Today's prompt:</h3>
          <p className="text-blue-600">{prompt}</p>
        </div>
      )}
      
      <div className="flex flex-col w-full gap-4 mb-4">
        <div className="flex flex-wrap gap-2 justify-center">
          <Button
            size="sm"
            variant={tool === 'pen' ? 'default' : 'outline'}
            className="flex items-center gap-2"
            onClick={() => setTool('pen')}
          >
            <Pen className="h-4 w-4" />
            <span>Pen</span>
          </Button>
          
          <Button
            size="sm"
            variant={tool === 'eraser' ? 'default' : 'outline'}
            className="flex items-center gap-2"
            onClick={() => setTool('eraser')}
          >
            <Eraser className="h-4 w-4" />
            <span>Eraser</span>
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            className="flex items-center gap-2"
            onClick={clearCanvas}
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear</span>
          </Button>
          
          <Button
            size="sm"
            className="flex items-center gap-2"
            onClick={handleSave}
          >
            <Download className="h-4 w-4" />
            <span>Save</span>
          </Button>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium flex items-center gap-2">
                <Paintbrush className="h-4 w-4" />
                Brush Width
              </label>
              <span className="text-sm text-gray-500">{width[0]}px</span>
            </div>
            <Slider
              value={width}
              onValueChange={setWidth}
              min={1}
              max={20}
              step={1}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((colorOption) => (
                <button
                  key={colorOption}
                  className={cn(
                    "w-8 h-8 rounded-full border-2",
                    color === colorOption ? "border-black" : "border-gray-200"
                  )}
                  style={{ backgroundColor: colorOption }}
                  onClick={() => setColor(colorOption)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white touch-none">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="cursor-crosshair"
        />
      </div>
    </div>
  );
};

export default DrawingCanvas;
