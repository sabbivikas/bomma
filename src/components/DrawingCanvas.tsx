import React, { useRef, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Pen, Eraser, Trash2, Download, ArrowRight, 
  Sparkles, RotateCcw, Wand2, Paintbrush, Palette, 
  FlipHorizontal, Maximize, Minimize
} from 'lucide-react';
import { Toggle } from "@/components/ui/toggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type Tool = 'pen' | 'eraser' | 'brush' | 'spray';
type SymmetryMode = 'none' | 'horizontal' | 'vertical' | 'quad';

interface DrawingCanvasProps {
  onSave: (canvas: HTMLCanvasElement) => void;
  prompt?: string;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ onSave, prompt }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState('#000000');
  const [width, setWidth] = useState([5]);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [canvasSize, setCanvasSize] = useState({ width: 500, height: 500 });
  const [symmetryMode, setSymmetryMode] = useState<SymmetryMode>('none');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastPointRef = useRef<{ x: number, y: number } | null>(null);
  
  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Make canvas responsive
    const updateCanvasSize = () => {
      const container = canvas.parentElement;
      if (container) {
        let newWidth, newHeight;
        
        if (isFullscreen) {
          // In fullscreen mode, use most of the available screen space
          newWidth = window.innerWidth * 0.95;
          newHeight = window.innerHeight * 0.6; // Leave room for controls
        } else {
          // Normal mode
          newWidth = Math.min(container.clientWidth, 800);
          newHeight = Math.min(newWidth, 600);
        }
        
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
      
      // Save initial canvas state for undo
      saveCanvasState();
    }
    
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [isFullscreen]); // Add isFullscreen to dependency array
  
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
    contextRef.current.strokeStyle = tool === 'eraser' ? '#FFFFFF' : color;
    contextRef.current.lineWidth = width[0];
    
    // Set different drawing styles based on the tool
    if (contextRef.current) {
      if (tool === 'brush') {
        contextRef.current.shadowBlur = 3;
        contextRef.current.shadowColor = color;
      } else if (tool === 'spray') {
        contextRef.current.shadowBlur = 0;
      } else {
        contextRef.current.shadowBlur = 0;
      }
    }
  }, [color, width, tool]);
  
  // Save canvas state for undo functionality
  const saveCanvasState = () => {
    if (!canvasRef.current) return;
    const imageData = canvasRef.current.toDataURL('image/png');
    setUndoStack(prevStack => [...prevStack, imageData]);
  };
  
  // Undo last action
  const handleUndo = () => {
    if (undoStack.length <= 1) return;
    
    const newStack = [...undoStack];
    newStack.pop(); // Remove current state
    const previousState = newStack[newStack.length - 1];
    
    // Load the previous state
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (canvas && context) {
      const img = new Image();
      img.src = previousState;
      img.onload = () => {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
    }
    
    setUndoStack(newStack);
  };
  
  // Draw symmetrically based on mode
  const drawSymmetrically = (currentX: number, currentY: number, prevX: number, prevY: number) => {
    if (!contextRef.current || !canvasRef.current) return;
    
    const devicePixelRatio = window.devicePixelRatio || 1;
    const centerX = canvasRef.current.width / (2 * devicePixelRatio);
    const centerY = canvasRef.current.height / (2 * devicePixelRatio);
    
    // Draw the original line
    contextRef.current.beginPath();
    contextRef.current.moveTo(prevX, prevY);
    contextRef.current.lineTo(currentX, currentY);
    contextRef.current.stroke();
    
    // Apply symmetry based on selected mode
    if (symmetryMode === 'horizontal' || symmetryMode === 'quad') {
      // Horizontal reflection
      const reflectedPrevY = 2 * centerY - prevY;
      const reflectedCurrY = 2 * centerY - currentY;
      
      contextRef.current.beginPath();
      contextRef.current.moveTo(prevX, reflectedPrevY);
      contextRef.current.lineTo(currentX, reflectedCurrY);
      contextRef.current.stroke();
    }
    
    if (symmetryMode === 'vertical' || symmetryMode === 'quad') {
      // Vertical reflection
      const reflectedPrevX = 2 * centerX - prevX;
      const reflectedCurrX = 2 * centerX - currentX;
      
      contextRef.current.beginPath();
      contextRef.current.moveTo(reflectedPrevX, prevY);
      contextRef.current.lineTo(reflectedCurrX, currentY);
      contextRef.current.stroke();
    }
    
    if (symmetryMode === 'quad') {
      // Diagonal reflection (fourth quadrant)
      const reflectedPrevX = 2 * centerX - prevX;
      const reflectedCurrX = 2 * centerX - currentX;
      const reflectedPrevY = 2 * centerY - prevY;
      const reflectedCurrY = 2 * centerY - currentY;
      
      contextRef.current.beginPath();
      contextRef.current.moveTo(reflectedPrevX, reflectedPrevY);
      contextRef.current.lineTo(reflectedCurrX, reflectedCurrY);
      contextRef.current.stroke();
    }
  };
  
  // Apply spray brush effect
  const applySprayEffect = (x: number, y: number) => {
    if (!contextRef.current) return;
    
    const density = width[0] * 2;
    const radius = width[0] * 2;
    
    for (let i = 0; i < density; i++) {
      const offsetX = (Math.random() * 2 - 1) * radius;
      const offsetY = (Math.random() * 2 - 1) * radius;
      const distance = offsetX * offsetX + offsetY * offsetY;
      
      if (distance <= radius * radius) {
        contextRef.current.fillStyle = color;
        contextRef.current.fillRect(x + offsetX, y + offsetY, 1, 1);
      }
    }
    
    // Apply symmetry for spray tool if enabled
    if (symmetryMode !== 'none') {
      const devicePixelRatio = window.devicePixelRatio || 1;
      const centerX = canvasRef.current!.width / (2 * devicePixelRatio);
      const centerY = canvasRef.current!.height / (2 * devicePixelRatio);
      
      // Apply symmetry based on selected mode
      if (symmetryMode === 'horizontal' || symmetryMode === 'quad') {
        const reflectedY = 2 * centerY - y;
        applySprayEffectAt(x, reflectedY);
      }
      
      if (symmetryMode === 'vertical' || symmetryMode === 'quad') {
        const reflectedX = 2 * centerX - x;
        applySprayEffectAt(reflectedX, y);
      }
      
      if (symmetryMode === 'quad') {
        const reflectedX = 2 * centerX - x;
        const reflectedY = 2 * centerY - y;
        applySprayEffectAt(reflectedX, reflectedY);
      }
    }
  };
  
  // Helper function for symmetrical spray effect
  const applySprayEffectAt = (x: number, y: number) => {
    if (!contextRef.current) return;
    
    const density = width[0] * 2;
    const radius = width[0] * 2;
    
    for (let i = 0; i < density; i++) {
      const offsetX = (Math.random() * 2 - 1) * radius;
      const offsetY = (Math.random() * 2 - 1) * radius;
      const distance = offsetX * offsetX + offsetY * offsetY;
      
      if (distance <= radius * radius) {
        contextRef.current.fillStyle = color;
        contextRef.current.fillRect(x + offsetX, y + offsetY, 1, 1);
      }
    }
  };
  
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
    
    lastPointRef.current = { x: clientX, y: clientY };
    
    if (tool === 'spray') {
      applySprayEffect(clientX, clientY);
    } else {
      if (symmetryMode === 'none') {
        context.beginPath();
        context.moveTo(clientX, clientY);
      }
    }
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
    
    const prevPoint = lastPointRef.current;
    if (!prevPoint) return;
    
    if (tool === 'spray') {
      applySprayEffect(clientX, clientY);
    } else {
      if (symmetryMode !== 'none') {
        drawSymmetrically(clientX, clientY, prevPoint.x, prevPoint.y);
      } else {
        contextRef.current.lineTo(clientX, clientY);
        contextRef.current.stroke();
      }
    }
    
    lastPointRef.current = { x: clientX, y: clientY };
  };
  
  const stopDrawing = () => {
    if (!contextRef.current) return;
    
    if (symmetryMode === 'none') {
      contextRef.current.closePath();
    }
    
    setIsDrawing(false);
    lastPointRef.current = null;
    saveCanvasState();
  };
  
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;
    
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);
    saveCanvasState();
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
  
  // Update toggleFullscreen to handle canvas resizing
  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    
    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(err => {
          console.error(`Error attempting to exit fullscreen: ${err.message}`);
        });
      }
    }
  };
  
  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  // Expanded color palette with more vibrant options
  const colorPalette = [
    // Grayscale
    '#000000', // Black
    '#555555', // Dark Gray
    '#888888', // Medium Gray
    '#BBBBBB', // Light Gray
    '#FFFFFF', // White
    // Primary Colors
    '#FF0000', // Red
    '#00FF00', // Green
    '#0000FF', // Blue
    // Secondary Colors
    '#FFFF00', // Yellow
    '#FF00FF', // Magenta
    '#00FFFF', // Cyan
    // Additional Colors
    '#FF8800', // Orange
    '#8800FF', // Purple
    '#00FF88', // Teal
    '#FF0088', // Pink
  ];
  
  return (
    <div className="flex flex-col gap-4 w-full animate-pop-in">
      {!isFullscreen && prompt && (
        <div className="bg-muted p-4 rounded-lg border-2 border-black sketchy-box">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-5 w-5 animate-pulse-light" />
            <p className="font-medium">Today's Prompt:</p>
          </div>
          <p className="text-xl font-bold sketchy-text">{prompt}</p>
        </div>
      )}
      
      <div 
        ref={containerRef} 
        className={cn(
          "w-full flex flex-col items-center",
          isFullscreen && "fixed inset-0 bg-black/90 z-50 pt-4 px-4"
        )}
      >
        <div className={cn(
          "canvas-container w-full relative group",
          isFullscreen && "flex justify-center"
        )}>
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            className="bg-white cursor-crosshair touch-none rounded-lg border-2 border-gray-200"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "absolute top-2 right-2 opacity-50 hover:opacity-100 transition-opacity",
              isFullscreen && "bg-white/20 text-white hover:bg-white/40"
            )}
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
        </div>
        
        <div className={cn(
          "drawing-tools-container w-full mt-4",
          isFullscreen && "max-w-5xl mx-auto"
        )}>
          <Tabs defaultValue="tools" className="w-full">
            <TabsList className={cn(
              "mb-4 w-full grid grid-cols-3",
              isFullscreen && "bg-white/10"
            )}>
              <TabsTrigger value="tools" className={cn(
                "flex items-center gap-2",
                isFullscreen && "text-white data-[state=active]:bg-white/20 data-[state=active]:text-white"
              )}>
                <Pen className="h-4 w-4" />
                <span>Draw</span>
              </TabsTrigger>
              <TabsTrigger value="effects" className={cn(
                "flex items-center gap-2",
                isFullscreen && "text-white data-[state=active]:bg-white/20 data-[state=active]:text-white"
              )}>
                <Wand2 className="h-4 w-4" />
                <span>Effects</span>
              </TabsTrigger>
              <TabsTrigger value="colors" className={cn(
                "flex items-center gap-2",
                isFullscreen && "text-white data-[state=active]:bg-white/20 data-[state=active]:text-white"
              )}>
                <Palette className="h-4 w-4" />
                <span>Colors</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="tools" className={cn(
              "space-y-4",
              isFullscreen && "bg-black/50 p-4 rounded-lg"
            )}>
              <div className="drawing-tools grid grid-cols-5 gap-2">
                <Button
                  variant={isFullscreen ? "secondary" : "outline"}
                  size="icon"
                  className={cn(
                    tool === 'pen' ? 'bg-black text-white' : '',
                    'border-2 border-black sketchy-button',
                    isFullscreen && "border-white/50"
                  )}
                  onClick={() => setTool('pen')}
                  title="Pen Tool"
                >
                  <Pen className="h-5 w-5" />
                </Button>
                <Button
                  variant={isFullscreen ? "secondary" : "outline"}
                  size="icon"
                  className={cn(
                    tool === 'brush' ? 'bg-black text-white' : '',
                    'border-2 border-black sketchy-button',
                    isFullscreen && "border-white/50"
                  )}
                  onClick={() => setTool('brush')}
                  title="Brush Tool"
                >
                  <Paintbrush className="h-5 w-5" />
                </Button>
                <Button
                  variant={isFullscreen ? "secondary" : "outline"}
                  size="icon"
                  className={cn(
                    tool === 'spray' ? 'bg-black text-white' : '',
                    'border-2 border-black sketchy-button',
                    isFullscreen && "border-white/50"
                  )}
                  onClick={() => setTool('spray')}
                  title="Spray Tool"
                >
                  <Sparkles className="h-5 w-5" />
                </Button>
                <Button
                  variant={isFullscreen ? "secondary" : "outline"}
                  size="icon"
                  className={cn(
                    tool === 'eraser' ? 'bg-black text-white' : '',
                    'border-2 border-black sketchy-button',
                    isFullscreen && "border-white/50"
                  )}
                  onClick={() => setTool('eraser')}
                  title="Eraser Tool"
                >
                  <Eraser className="h-5 w-5" />
                </Button>
                <Button
                  variant={isFullscreen ? "secondary" : "outline"}
                  size="icon"
                  className={cn(
                    'border-2 border-black sketchy-button',
                    isFullscreen && "border-white/50"
                  )}
                  onClick={handleUndo}
                  title="Undo"
                  disabled={undoStack.length <= 1}
                >
                  <RotateCcw className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="w-full">
                <p className={cn(
                  "text-sm mb-2",
                  isFullscreen && "text-white"
                )}>Brush Size: {width[0]}px</p>
                <Slider 
                  min={1} 
                  max={30} 
                  step={1} 
                  value={width} 
                  onValueChange={setWidth} 
                  className={cn(
                    "w-full",
                    isFullscreen && "[&_.bg-secondary]:bg-white/30 [&_.bg-primary]:bg-white"
                  )}
                />
              </div>
              
              <div className="flex gap-2 justify-between">
                <Button
                  variant={isFullscreen ? "secondary" : "outline"}
                  className={cn(
                    "border-2 border-black sketchy-button",
                    isFullscreen && "border-white/50 text-white"
                  )}
                  onClick={clearCanvas}
                >
                  <Trash2 className="h-5 w-5 mr-2" />
                  Clear Canvas
                </Button>
                <Button
                  variant={isFullscreen ? "secondary" : "outline"}
                  className={cn(
                    "border-2 border-black sketchy-button",
                    isFullscreen && "border-white/50 text-white"
                  )}
                  onClick={downloadCanvas}
                >
                  <Download className="h-5 w-5 mr-2" />
                  Download
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="effects" className={cn(
              "space-y-4",
              isFullscreen && "bg-black/50 p-4 rounded-lg"
            )}>
              <div>
                <p className={cn(
                  "text-sm mb-2",
                  isFullscreen && "text-white"
                )}>Symmetry Mode:</p>
                <div className="grid grid-cols-4 gap-2">
                  <Button
                    variant={isFullscreen ? "secondary" : "outline"}
                    className={cn(
                      "border-2 border-black sketchy-button flex-grow",
                      symmetryMode === 'none' && "bg-black text-white",
                      isFullscreen && "border-white/50",
                      isFullscreen && symmetryMode === 'none' && "bg-white/20"
                    )}
                    onClick={() => setSymmetryMode('none')}
                  >
                    None
                  </Button>
                  <Button
                    variant={isFullscreen ? "secondary" : "outline"}
                    className={cn(
                      "border-2 border-black sketchy-button flex-grow",
                      symmetryMode === 'horizontal' && "bg-black text-white",
                      isFullscreen && "border-white/50",
                      isFullscreen && symmetryMode === 'horizontal' && "bg-white/20"
                    )}
                    onClick={() => setSymmetryMode('horizontal')}
                  >
                    <FlipHorizontal className="h-4 w-4 mr-2" />
                    Horizontal
                  </Button>
                  <Button
                    variant={isFullscreen ? "secondary" : "outline"}
                    className={cn(
                      "border-2 border-black sketchy-button flex-grow",
                      symmetryMode === 'vertical' && "bg-black text-white",
                      isFullscreen && "border-white/50",
                      isFullscreen && symmetryMode === 'vertical' && "bg-white/20"
                    )}
                    onClick={() => setSymmetryMode('vertical')}
                  >
                    <FlipHorizontal className="h-4 w-4 mr-2 rotate-90" />
                    Vertical
                  </Button>
                  <Button
                    variant={isFullscreen ? "secondary" : "outline"}
                    className={cn(
                      "border-2 border-black sketchy-button flex-grow",
                      symmetryMode === 'quad' && "bg-black text-white",
                      isFullscreen && "border-white/50",
                      isFullscreen && symmetryMode === 'quad' && "bg-white/20"
                    )}
                    onClick={() => setSymmetryMode('quad')}
                  >
                    Quadrant
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="colors" className={cn(
              isFullscreen && "bg-black/50 p-4 rounded-lg"
            )}>
              <div className="color-palette grid grid-cols-5 gap-4">
                {colorPalette.map((colorOption) => (
                  <button
                    key={colorOption}
                    className={cn(
                      "color-circle w-10 h-10 rounded-full border-2",
                      color === colorOption && tool !== 'eraser' 
                        ? 'ring-2 ring-offset-2 ring-black' 
                        : '',
                      isFullscreen && color === colorOption && 'ring-white'
                    )}
                    style={{ backgroundColor: colorOption }}
                    onClick={() => {
                      setTool(tool === 'eraser' ? 'pen' : tool);
                      setColor(colorOption);
                    }}
                  />
                ))}
                <div className="flex items-center justify-center">
                  <input 
                    type="color" 
                    value={color}
                    onChange={(e) => {
                      setTool(tool === 'eraser' ? 'pen' : tool);
                      setColor(e.target.value);
                    }}
                    className="color-picker w-10 h-10 cursor-pointer"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className={cn(
            "flex justify-end mt-4",
            isFullscreen && "pb-4"
          )}>
            <Button 
              onClick={handleSave} 
              className={cn(
                "border-2 border-black sketchy-button gap-2 bg-black text-white",
                isFullscreen && "border-white bg-white/20 hover:bg-white/30"
              )}
            >
              Save & Share <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .canvas-container {
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }
        
        .canvas-container:hover {
          box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
        }
        
        .color-picker {
          -webkit-appearance: none;
          appearance: none;
          background-color: transparent;
          border: none;
          cursor: pointer;
        }
        
        .color-picker::-webkit-color-swatch {
          border-radius: 50%;
          border: 2px solid #ddd;
        }
        
        .color-picker::-moz-color-swatch {
          border-radius: 50%;
          border: 2px solid #ddd;
        }
        
        canvas {
          touch-action: none;
        }
      ` }} />
    </div>
  );
};

export default DrawingCanvas;
