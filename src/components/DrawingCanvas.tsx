
import React, { useRef, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Pen, Eraser, Trash2, Download, ArrowRight } from 'lucide-react';

type Tool = 'pen' | 'eraser';

interface DrawingCanvasProps {
  onSave: (canvas: HTMLCanvasElement) => void;
  prompt?: string;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ onSave, prompt }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState('#8B5CF6');
  const [width, setWidth] = useState([5]);
  const [canvasSize, setCanvasSize] = useState({ width: 500, height: 500 });
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  
  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Make canvas responsive
    const updateCanvasSize = () => {
      const container = canvas.parentElement;
      if (container) {
        const newWidth = Math.min(container.clientWidth, 800);
        const newHeight = Math.min(newWidth, 600);
        setCanvasSize({ width: newWidth, height: newHeight });
      }
    };
    
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    
    const context = canvas.getContext('2d');
    if (context) {
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.strokeStyle = color;
      context.lineWidth = width[0];
      contextRef.current = context;
      
      // Fill with white background
      context.fillStyle = 'white';
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, []);
  
  // Update canvas size
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (canvas && context) {
      const devicePixelRatio = window.devicePixelRatio || 1;
      
      // Scale canvas for high DPI displays
      canvas.width = canvasSize.width * devicePixelRatio;
      canvas.height = canvasSize.height * devicePixelRatio;
      canvas.style.width = `${canvasSize.width}px`;
      canvas.style.height = `${canvasSize.height}px`;
      
      context.scale(devicePixelRatio, devicePixelRatio);
      context.lineCap = 'round';
      context.lineJoin = 'round';
      
      // Preserve existing drawing when resizing
      const tempCanvas = document.createElement('canvas');
      const tempContext = tempCanvas.getContext('2d');
      if (tempContext) {
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        tempContext.drawImage(canvas, 0, 0);
        
        // Fill with white background
        context.fillStyle = 'white';
        context.fillRect(0, 0, canvas.width / devicePixelRatio, canvas.height / devicePixelRatio);
        
        context.drawImage(tempCanvas, 0, 0);
      }
    }
  }, [canvasSize]);
  
  // Update tool properties
  useEffect(() => {
    if (!contextRef.current) return;
    contextRef.current.strokeStyle = tool === 'pen' ? color : '#FFFFFF';
    contextRef.current.lineWidth = width[0];
  }, [color, width, tool]);
  
  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;
    
    setIsDrawing(true);
    
    let clientX, clientY;
    
    if ('touches' in event) {
      const rect = canvas.getBoundingClientRect();
      clientX = event.touches[0].clientX - rect.left;
      clientY = event.touches[0].clientY - rect.top;
    } else {
      clientX = event.nativeEvent.offsetX;
      clientY = event.nativeEvent.offsetY;
    }
    
    context.beginPath();
    context.moveTo(clientX, clientY);
  };
  
  const draw = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !contextRef.current || !canvasRef.current) return;
    
    event.preventDefault(); // Prevent scrolling on touch devices
    
    let clientX, clientY;
    
    if ('touches' in event) {
      const rect = canvasRef.current.getBoundingClientRect();
      clientX = event.touches[0].clientX - rect.left;
      clientY = event.touches[0].clientY - rect.top;
    } else {
      clientX = event.nativeEvent.offsetX;
      clientY = event.nativeEvent.offsetY;
    }
    
    contextRef.current.lineTo(clientX, clientY);
    contextRef.current.stroke();
  };
  
  const stopDrawing = () => {
    if (!contextRef.current) return;
    contextRef.current.closePath();
    setIsDrawing(false);
  };
  
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;
    
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);
  };
  
  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = 'doodle.png';
    link.click();
  };
  
  const handleSave = () => {
    if (canvasRef.current) {
      onSave(canvasRef.current);
    }
  };
  
  const predefinedColors = [
    '#8B5CF6', // Purple (primary)
    '#F97316', // Orange (secondary)
    '#0EA5E9', // Blue (accent)
    '#10B981', // Green
    '#EF4444', // Red
    '#000000', // Black
  ];
  
  return (
    <div className="flex flex-col gap-4 w-full">
      {prompt && (
        <div className="bg-muted p-4 rounded-lg animate-pulse-light">
          <p className="font-medium">Today's Prompt:</p>
          <p className="text-lg font-bold">{prompt}</p>
        </div>
      )}
      
      <div className="w-full flex flex-col items-center">
        <div className="canvas-container w-full border-2 border-canvas-border rounded-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            className="bg-canvas-background cursor-crosshair touch-none"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>
        
        <div className="drawing-tools-container w-full mt-4">
          <div className="drawing-tools">
            <Button
              variant="outline"
              size="icon"
              className={`${tool === 'pen' ? 'active' : ''}`}
              onClick={() => setTool('pen')}
            >
              <Pen className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className={`${tool === 'eraser' ? 'active' : ''}`}
              onClick={() => setTool('eraser')}
            >
              <Eraser className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={clearCanvas}
            >
              <Trash2 className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={downloadCanvas}
            >
              <Download className="h-5 w-5" />
            </Button>
            
            {/* Color picker input acting as a custom color option */}
            <div className="flex items-center justify-center">
              <input 
                type="color" 
                value={color}
                onChange={(e) => {
                  setTool('pen');
                  setColor(e.target.value);
                }}
                className="color-picker"
              />
            </div>
          </div>
          
          <div className="color-palette flex gap-2 mt-4 justify-center">
            {predefinedColors.map((colorOption) => (
              <button
                key={colorOption}
                className={`color-circle ${color === colorOption && tool === 'pen' ? 'active' : ''}`}
                style={{ backgroundColor: colorOption }}
                onClick={() => {
                  setTool('pen');
                  setColor(colorOption);
                }}
              />
            ))}
          </div>
          
          <div className="w-full mt-4">
            <p className="text-sm mb-2">Brush Size: {width[0]}px</p>
            <Slider 
              min={1} 
              max={20} 
              step={1} 
              value={width} 
              onValueChange={setWidth} 
              className="w-full" 
            />
          </div>
          
          <div className="flex justify-end mt-4">
            <Button onClick={handleSave} className="gap-2">
              Save & Share <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrawingCanvas;
