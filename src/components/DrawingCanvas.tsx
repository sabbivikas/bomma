
import React, { useRef, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Pen, Eraser, Trash2, Download,
  Paintbrush, Palette, Share, PlusSquare, Type,
  Square, Circle as CircleIcon, Sparkles
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useTheme } from '@/contexts/ThemeContext';
import { visualThemes, seasonalThemes } from '@/utils/themeConfig';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DrawingCanvasProps {
  onSave: (canvas: HTMLCanvasElement) => void;
  prompt?: string;
}

interface TextElement {
  text: string;
  x: number;
  y: number;
  color: string;
  size: number;
  fontFamily: string;
  isDragging: boolean;
}

interface ShapeElement {
  type: 'rectangle' | 'circle';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  fill: boolean;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ onSave, prompt }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'eraser' | 'text' | 'rectangle' | 'circle'>('pen');
  const [color, setColor] = useState('#000000');
  const [width, setWidth] = useState([5]);
  const [isPublishing, setIsPublishing] = useState(false);
  const isMobile = useIsMobile();
  const [fill, setFill] = useState(false);
  const { theme, setVisualTheme, setSeasonalTheme } = useTheme();
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  
  // Text tool states
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [currentTextElement, setCurrentTextElement] = useState<TextElement | null>(null);
  const [textDialogOpen, setTextDialogOpen] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [textSize, setTextSize] = useState([18]);
  const [textFont, setTextFont] = useState('Arial');
  const [selectedTextIndex, setSelectedTextIndex] = useState<number | null>(null);
  
  // Shape tool states
  const [shapeElements, setShapeElements] = useState<ShapeElement[]>([]);
  const [currentShape, setCurrentShape] = useState<ShapeElement | null>(null);
  
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
  
  // Render text and shape elements
  useEffect(() => {
    if (!contextRef.current || !canvasRef.current) return;
    
    // Only redraw when necessary
    if (tool === 'text' || tool === 'rectangle' || tool === 'circle' || currentTextElement || currentShape) {
      // Create a temporary canvas to avoid flickering
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvasRef.current.width;
      tempCanvas.height = canvasRef.current.height;
      const tempContext = tempCanvas.getContext('2d');
      
      if (tempContext && contextRef.current) {
        // Copy the current canvas to temp
        tempContext.drawImage(canvasRef.current, 0, 0);
        
        // Draw all shape elements
        shapeElements.forEach((element) => {
          tempContext.strokeStyle = element.color;
          tempContext.fillStyle = element.color;
          
          if (element.type === 'rectangle') {
            if (element.fill) {
              tempContext.fillRect(element.x, element.y, element.width, element.height);
            } else {
              tempContext.strokeRect(element.x, element.y, element.width, element.height);
            }
          } else if (element.type === 'circle') {
            tempContext.beginPath();
            // Use ellipse to create circles based on width/height
            const radiusX = Math.abs(element.width) / 2;
            const radiusY = Math.abs(element.height) / 2;
            const centerX = element.x + element.width / 2;
            const centerY = element.y + element.height / 2;
            
            tempContext.ellipse(
              centerX, 
              centerY, 
              radiusX, 
              radiusY, 
              0, 
              0, 
              2 * Math.PI
            );
            
            if (element.fill) {
              tempContext.fill();
            } else {
              tempContext.stroke();
            }
          }
        });
        
        // Draw current shape being created
        if (currentShape && lastPointRef.current) {
          tempContext.strokeStyle = currentShape.color;
          tempContext.fillStyle = currentShape.color;
          
          if (currentShape.type === 'rectangle') {
            if (fill) {
              tempContext.fillRect(
                currentShape.x, 
                currentShape.y, 
                currentShape.width, 
                currentShape.height
              );
            } else {
              tempContext.strokeRect(
                currentShape.x, 
                currentShape.y, 
                currentShape.width, 
                currentShape.height
              );
            }
          } else if (currentShape.type === 'circle') {
            tempContext.beginPath();
            
            // Use ellipse to create circles based on width/height
            const radiusX = Math.abs(currentShape.width) / 2;
            const radiusY = Math.abs(currentShape.height) / 2;
            const centerX = currentShape.x + currentShape.width / 2;
            const centerY = currentShape.y + currentShape.height / 2;
            
            tempContext.ellipse(
              centerX, 
              centerY, 
              radiusX, 
              radiusY, 
              0, 
              0, 
              2 * Math.PI
            );
            
            if (fill) {
              tempContext.fill();
            } else {
              tempContext.stroke();
            }
          }
        }
        
        // Draw all text elements
        textElements.forEach((element, i) => {
          tempContext.font = `${element.size}px ${element.fontFamily}`;
          tempContext.fillStyle = element.color;
          tempContext.fillText(element.text, element.x, element.y);
          
          // Draw selection rectangle for selected text
          if (i === selectedTextIndex) {
            const metrics = tempContext.measureText(element.text);
            const height = element.size;
            
            tempContext.strokeStyle = '#007bff';
            tempContext.lineWidth = 1;
            tempContext.setLineDash([3, 3]);
            tempContext.strokeRect(
              element.x - 4, 
              element.y - height, 
              metrics.width + 8, 
              height + 8
            );
            tempContext.setLineDash([]);
          }
        });
        
        // Update the main canvas
        contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        contextRef.current.drawImage(tempCanvas, 0, 0);
      }
    }
  }, [textElements, selectedTextIndex, tool, shapeElements, currentShape, fill]);
  
  // Get coordinates from mouse or touch event
  const getCoordinates = (event: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in event) {
      // Touch event
      return {
        x: event.touches[0].clientX - rect.left,
        y: event.touches[0].clientY - rect.top
      };
    } else {
      // Mouse event
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
    }
  };
  
  // Start drawing, text placement, or shape creation
  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !contextRef.current) return;
    
    // Prevent scrolling on touch devices
    if ('touches' in event) {
      event.preventDefault();
    }
    
    const coords = getCoordinates(event, canvas);
    
    // Handle based on selected tool
    if (tool === 'text') {
      // Check if clicked on existing text
      const clickedTextIndex = textElements.findIndex(el => {
        if (!contextRef.current) return false;
        
        contextRef.current.font = `${el.size}px ${el.fontFamily}`;
        const metrics = contextRef.current.measureText(el.text);
        const height = el.size;
        
        return (
          coords.x >= el.x - 4 &&
          coords.x <= el.x + metrics.width + 4 &&
          coords.y >= el.y - height &&
          coords.y <= el.y + 8
        );
      });
      
      if (clickedTextIndex !== -1) {
        // Select text for dragging
        setSelectedTextIndex(clickedTextIndex);
        
        const selectedText = { ...textElements[clickedTextIndex], isDragging: true };
        
        setTextElements(prev => 
          prev.map((el, i) => i === clickedTextIndex ? selectedText : el)
        );
        
        lastPointRef.current = coords;
      } else {
        // Add new text
        setSelectedTextIndex(null);
        setCurrentTextElement({ 
          text: '', 
          x: coords.x, 
          y: coords.y,
          color: color,
          size: textSize[0],
          fontFamily: textFont,
          isDragging: false
        });
        setTextDialogOpen(true);
      }
    } else if (tool === 'rectangle' || tool === 'circle') {
      // Start creating a shape
      setCurrentShape({
        type: tool,
        x: coords.x,
        y: coords.y,
        width: 0,
        height: 0,
        color: color,
        fill: fill
      });
      
      lastPointRef.current = coords;
      setIsDrawing(true);
    } else {
      // Drawing with pen or eraser
      contextRef.current.beginPath();
      contextRef.current.moveTo(coords.x, coords.y);
      lastPointRef.current = coords;
      
      setIsDrawing(true);
    }
  };
  
  // Draw, move text, or resize shape
  const draw = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    // Prevent scrolling on touch devices
    if ('touches' in event) {
      event.preventDefault();
    }
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const coords = getCoordinates(event, canvas);
    
    if (tool === 'text' && selectedTextIndex !== null && lastPointRef.current) {
      // Move selected text
      const dx = coords.x - lastPointRef.current.x;
      const dy = coords.y - lastPointRef.current.y;
      
      setTextElements(prev => prev.map((el, i) => {
        if (i === selectedTextIndex) {
          return {
            ...el,
            x: el.x + dx,
            y: el.y + dy
          };
        }
        return el;
      }));
      
      lastPointRef.current = coords;
    } else if ((tool === 'rectangle' || tool === 'circle') && isDrawing && currentShape && lastPointRef.current) {
      // Update shape dimensions
      setCurrentShape({
        ...currentShape,
        width: coords.x - currentShape.x,
        height: coords.y - currentShape.y
      });
      
    } else if (isDrawing && contextRef.current && lastPointRef.current) {
      // Draw with pen or eraser
      contextRef.current.lineTo(coords.x, coords.y);
      contextRef.current.stroke();
      
      lastPointRef.current = coords;
    }
  };
  
  // Stop drawing, text placement, or shape creation
  const stopDrawing = () => {
    // End drawing
    if (contextRef.current) {
      contextRef.current.closePath();
    }
    
    // Finalize shape if one is being created
    if (currentShape) {
      setShapeElements(prev => [...prev, {
        ...currentShape,
        fill: fill
      }]);
      setCurrentShape(null);
    }
    
    // Reset dragging state for text
    if (selectedTextIndex !== null) {
      setTextElements(prev => prev.map((el, i) => {
        if (i === selectedTextIndex) {
          return { ...el, isDragging: false };
        }
        return el;
      }));
    }
    
    setIsDrawing(false);
    lastPointRef.current = null;
  };
  
  // Add text to canvas
  const handleAddText = () => {
    if (!currentTextElement || !textInput.trim()) {
      setTextDialogOpen(false);
      setCurrentTextElement(null);
      return;
    }
    
    const newTextElement: TextElement = {
      ...currentTextElement,
      text: textInput.trim()
    };
    
    setTextElements([...textElements, newTextElement]);
    setTextInput('');
    setTextDialogOpen(false);
    setCurrentTextElement(null);
  };
  
  // Clear canvas
  const clearCanvas = () => {
    if (!canvasRef.current || !contextRef.current) return;
    
    contextRef.current.fillStyle = 'white';
    contextRef.current.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    // Clear text and shape elements
    setTextElements([]);
    setShapeElements([]);
    setSelectedTextIndex(null);
  };
  
  // Handle publish
  const handlePublish = () => {
    if (!canvasRef.current || !contextRef.current) return;
    setIsPublishing(true);
    
    try {
      // Ensure all text is rendered to canvas before saving
      // This ensures text becomes part of the saved image
      textElements.forEach(element => {
        if (contextRef.current) {
          contextRef.current.font = `${element.size}px ${element.fontFamily}`;
          contextRef.current.fillStyle = element.color;
          contextRef.current.fillText(element.text, element.x, element.y);
        }
      });
      
      onSave(canvasRef.current);
    } catch (error) {
      console.error("Error publishing doodle:", error);
    } finally {
      setIsPublishing(false);
    }
  };
  
  // Remove selected text
  const handleRemoveText = () => {
    if (selectedTextIndex !== null) {
      setTextElements(prev => prev.filter((_, i) => i !== selectedTextIndex));
      setSelectedTextIndex(null);
    }
  };
  
  // Edit selected text
  const handleEditText = () => {
    if (selectedTextIndex !== null) {
      const selectedText = textElements[selectedTextIndex];
      setCurrentTextElement(selectedText);
      setTextInput(selectedText.text);
      setTextSize([selectedText.size]);
      setTextFont(selectedText.fontFamily);
      setColor(selectedText.color);
      setTextDialogOpen(true);
      
      // Remove the old text, it will be added again after editing
      setTextElements(prev => prev.filter((_, i) => i !== selectedTextIndex));
      setSelectedTextIndex(null);
    }
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
  
  // Font options
  const fontOptions = [
    'Arial',
    'Times New Roman',
    'Courier New',
    'Georgia',
    'Comic Sans MS',
  ];

  // Responsive canvas size for mobile
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas || !contextRef.current) return;
      
      // Get the container width (parent element)
      const container = canvas.parentElement;
      if (!container) return;
      
      const containerWidth = container.clientWidth;
      
      // Calculate new dimensions while maintaining aspect ratio
      const newWidth = Math.min(containerWidth, canvasSize.width);
      const scaleFactor = newWidth / canvasSize.width;
      const newHeight = canvasSize.height * scaleFactor;
      
      // Update canvas display size
      canvas.style.width = `${newWidth}px`;
      canvas.style.height = `${newHeight}px`;
    };
    
    // Initial resize
    handleResize();
    
    // Add resize event listener
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [canvasSize]);

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
          <ToggleGroup type="single" value={tool} onValueChange={(value) => {
            if (value) setTool(value as typeof tool);
            setSelectedTextIndex(null);
          }}>
            <ToggleGroupItem value="pen" aria-label="Pen tool">
              <Pen className="h-4 w-4 mr-2" />
              Pen
            </ToggleGroupItem>
            
            <ToggleGroupItem value="eraser" aria-label="Eraser tool">
              <Eraser className="h-4 w-4 mr-2" />
              Eraser
            </ToggleGroupItem>
            
            <ToggleGroupItem value="text" aria-label="Text tool">
              <Type className="h-4 w-4 mr-2" />
              Text
            </ToggleGroupItem>
            
            <ToggleGroupItem value="rectangle" aria-label="Rectangle tool">
              <Square className="h-4 w-4 mr-2" />
              Rectangle
            </ToggleGroupItem>
            
            <ToggleGroupItem value="circle" aria-label="Circle tool">
              <CircleIcon className="h-4 w-4 mr-2" />
              Circle
            </ToggleGroupItem>
          </ToggleGroup>
          
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
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setShowThemeSelector(!showThemeSelector)}
          >
            <Sparkles className="h-4 w-4" />
            <span>Themes</span>
          </Button>
          
          <Button
            size="sm"
            variant="success"
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white ml-2 animate-pulse"
            onClick={handlePublish}
            disabled={isPublishing}
          >
            <PlusSquare className="h-4 w-4" />
            <span>{isPublishing ? "Publishing..." : "Publish to Frame"}</span>
          </Button>
        </div>
        
        {/* Theme Selector */}
        {showThemeSelector && (
          <div className="mt-2 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Visual Theme Selector */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Visual Theme</Label>
                <Select 
                  value={theme.visualTheme}
                  onValueChange={(value) => setVisualTheme(value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a visual theme" />
                  </SelectTrigger>
                  <SelectContent>
                    {visualThemes.map((visualTheme) => (
                      <SelectItem key={visualTheme.id} value={visualTheme.id}>
                        {visualTheme.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">Visual theme affects the background style of your story frames</p>
              </div>
              
              {/* Seasonal Theme Selector */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Seasonal Theme</Label>
                <Select 
                  value={theme.seasonalTheme}
                  onValueChange={(value) => setSeasonalTheme(value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a seasonal theme" />
                  </SelectTrigger>
                  <SelectContent>
                    {seasonalThemes.map((seasonalTheme) => (
                      <SelectItem key={seasonalTheme.id} value={seasonalTheme.id}>
                        {seasonalTheme.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">Seasonal theme adds thematic elements to your story</p>
              </div>
            </div>
            
            {/* Theme Preview */}
            <div className="mt-4 p-3 rounded-lg border" style={{
              background: visualThemes.find(vt => vt.id === theme.visualTheme)?.backgroundStyle || ''
            }}>
              <p className="text-center text-sm">This is how your frame background will look</p>
            </div>
          </div>
        )}
        
        {/* Text options - only show when text tool is selected */}
        {tool === 'text' && selectedTextIndex !== null && (
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            <Button
              size="sm"
              variant="outline"
              className="flex items-center gap-2"
              onClick={handleEditText}
            >
              <span>Edit Text</span>
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              className="flex items-center gap-2 text-red-500"
              onClick={handleRemoveText}
            >
              <span>Remove Text</span>
            </Button>
          </div>
        )}
        
        {/* Shape fill option */}
        {(tool === 'rectangle' || tool === 'circle') && (
          <div className="flex items-center justify-center gap-2">
            <Button
              size="sm"
              variant={fill ? "default" : "outline"}
              onClick={() => setFill(true)}
              className="w-20"
            >
              Fill
            </Button>
            <Button
              size="sm"
              variant={!fill ? "default" : "outline"}
              onClick={() => setFill(false)}
              className="w-20"
            >
              Outline
            </Button>
          </div>
        )}
        
        <div className="space-y-4">
          {(tool === 'pen' || tool === 'eraser') && (
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
          )}
          
          {tool === 'text' && !selectedTextIndex && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  Font Size
                </label>
                <span className="text-sm text-gray-500">{textSize[0]}px</span>
              </div>
              <Slider
                value={textSize}
                onValueChange={setTextSize}
                min={8}
                max={72}
                step={1}
              />
            </div>
          )}
          
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
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className={cn(
            "cursor-crosshair",
            tool === 'text' && "cursor-text",
            (tool === 'rectangle' || tool === 'circle') && "cursor-crosshair"
          )}
        />
      </div>
      
      {/* Text Input Dialog */}
      <Dialog open={textDialogOpen} onOpenChange={setTextDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Text</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="text">Enter Text</Label>
              <Textarea
                id="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Enter your text here..."
                className="min-h-20"
                autoFocus
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="font-family">Font</Label>
              <select
                id="font-family"
                value={textFont}
                onChange={(e) => setTextFont(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                {fontOptions.map((font) => (
                  <option key={font} value={font} style={{ fontFamily: font }}>
                    {font}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTextDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddText}>Add Text</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DrawingCanvas;
