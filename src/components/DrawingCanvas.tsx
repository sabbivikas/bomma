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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useTheme } from '@/contexts/ThemeContext';
import { visualThemes, seasonalThemes, getThemeConfig } from '@/utils/themeConfig';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { VisualTheme, SeasonalTheme } from '@/types/theme';
import ThemePreview from '@/components/ThemePreview';

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
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const currentStrokeStyleRef = useRef<string>('black');
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'eraser' | 'text' | 'rectangle' | 'circle'>('pen');
  const [color, setColor] = useState('#000000');
  const [width, setWidth] = useState([5]);
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 400 });
  const [textDialogOpen, setEditDialogOpen] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [textSize, setTextSize] = useState([24]);
  const [textFont, setTextFont] = useState('Arial');
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [selectedTextIndex, setSelectedTextIndex] = useState<number | null>(null);
  const [isDraggingText, setIsDraggingText] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [fill, setFill] = useState(false);
  const [currentShape, setCurrentShape] = useState<ShapeElement | null>(null);
  const [isTouching, setIsTouching] = useState(false);
  
  const isMobile = useIsMobile();
  const { theme, setVisualTheme, setSeasonalTheme } = useTheme();
  
  useEffect(() => {
    currentStrokeStyleRef.current = color;
  }, [color]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    contextRef.current = context;
    
    // Apply theme background
    applyThemeBackground(context, theme.visualTheme, theme.seasonalTheme, canvasSize.width, canvasSize.height);
    
    // Redraw existing elements
    textElements.forEach(textElement => {
      context.font = `${textElement.size}px ${textElement.fontFamily}`;
      context.fillStyle = textElement.color;
      context.fillText(textElement.text, textElement.x, textElement.y);
    });
  }, []);
  
  // Apply theme background
  const applyThemeBackground = (
    context: CanvasRenderingContext2D, 
    visualTheme: string, 
    seasonalTheme: string,
    width: number,
    height: number
  ) => {
    const visualThemeConfig = getThemeConfig(visualTheme);
    const seasonalThemeConfig = theme.seasonalTheme !== 'none' ? getThemeConfig(seasonalTheme) : null;
    
    if (!visualThemeConfig) return;
    
    // Apply background style
    context.fillStyle = (context.canvas as any).style.background;
    context.fillRect(0, 0, width, height);
    
    // Apply seasonal overlay if applicable
    if (seasonalThemeConfig && seasonalThemeConfig.id !== 'none') {
      // Implement seasonal overlay logic here (e.g., using images or patterns)
    }
  };
  
  // Helper function to generate a unique ID
  const generateId = () => {
    return Math.random().toString(36).substring(2, 15);
  };

  // Get precise coordinates for both mouse and touch events
  const getCoordinates = (event: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    
    if ('touches' in event) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };
  
  // Check if a point is inside a text's clickable area
  const isPointInText = (x: number, y: number, textElement: TextElement) => {
    const textWidth = contextRef.current?.measureText(textElement.text).width || 0;
    const textHeight = textElement.size;
    
    return x >= textElement.x && x <= textElement.x + textWidth &&
           y >= textElement.y - textHeight && y <= textElement.y;
  };
  
  // Start drawing, text placement, or shape creation
  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsTouching(true);
    const canvas = canvasRef.current;
    if (!canvas || !contextRef.current) return;
    
    // Prevent scrolling on touch devices
    if ('touches' in event) {
      event.preventDefault();
    }
    
    const coords = getCoordinates(event, canvas);
    
    // Handle based on selected tool
    if (tool === 'text') {
      handleTextToolStart(coords);
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
      if (contextRef.current) {
        contextRef.current.beginPath();
        contextRef.current.moveTo(coords.x, coords.y);
        
        // Set the appropriate color and width based on the tool
        if (tool === 'eraser') {
          contextRef.current.strokeStyle = 'white';
          currentStrokeStyleRef.current = 'white';
          contextRef.current.lineWidth = width[0] * 2; // Make eraser a bit larger
        } else {
          contextRef.current.strokeStyle = color;
          currentStrokeStyleRef.current = color;
          contextRef.current.lineWidth = width[0];
        }
      }
      
      lastPointRef.current = coords;
      setIsDrawing(true);
    }
  };
  
  // Handle text tool interactions (selecting, dragging, or creating text)
  const handleTextToolStart = (coords: { x: number, y: number }) => {
    // Check if clicking on existing text
    for (let i = 0; i < textElements.length; i++) {
      if (isPointInText(coords.x, coords.y, textElements[i])) {
        setSelectedTextIndex(i);
        setIsDraggingText(true);
        return;
      }
    }
    
    // If no text is selected, open the text dialog
    setSelectedTextIndex(null);
    setEditDialogOpen(true);
  };
  
  // Draw, move text, or resize shape
  const draw = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isTouching) return;
    const canvas = canvasRef.current;
    if (!canvas || !contextRef.current) return;
    
    const coords = getCoordinates(event, canvas);
    
    if (tool === 'text') {
      // Drag selected text
      if (selectedTextIndex !== null && isDraggingText) {
        const updatedTextElements = [...textElements];
        updatedTextElements[selectedTextIndex] = {
          ...updatedTextElements[selectedTextIndex],
          x: coords.x,
          y: coords.y
        };
        setTextElements(updatedTextElements);
        
        // Redraw canvas
        const context = canvas.getContext('2d');
        if (!context) return;
        
        context.clearRect(0, 0, canvas.width, canvas.height);
        applyThemeBackground(context, theme.visualTheme, theme.seasonalTheme, canvasSize.width, canvasSize.height);
        
        updatedTextElements.forEach(textElement => {
          context.font = `${textElement.size}px ${textElement.fontFamily}`;
          context.fillStyle = textElement.color;
          context.fillText(textElement.text, textElement.x, textElement.y);
        });
      }
    } else if (tool === 'rectangle' || tool === 'circle') {
      // Resize the shape
      if (isDrawing && currentShape) {
        const newWidth = coords.x - currentShape.x;
        const newHeight = coords.y - currentShape.y;
        
        setCurrentShape({
          ...currentShape,
          width: newWidth,
          height: newHeight
        });
        
        // Redraw canvas
        const context = canvas.getContext('2d');
        if (!context) return;
        
        context.clearRect(0, 0, canvas.width, canvas.height);
        applyThemeBackground(context, theme.visualTheme, theme.seasonalTheme, canvasSize.width, canvasSize.height);
        
        // Redraw existing text elements
        textElements.forEach(textElement => {
          context.font = `${textElement.size}px ${textElement.fontFamily}`;
          context.fillStyle = textElement.color;
          context.fillText(textElement.text, textElement.x, textElement.y);
        });
        
        // Redraw the shape
        context.beginPath();
        context.strokeStyle = currentShape.color;
        context.fillStyle = currentShape.color;
        
        if (currentShape.type === 'rectangle') {
          context.rect(currentShape.x, currentShape.y, newWidth, newHeight);
        } else if (currentShape.type === 'circle') {
          const radiusX = Math.abs(newWidth / 2);
          const radiusY = Math.abs(newHeight / 2);
          context.ellipse(currentShape.x + newWidth / 2, currentShape.y + newHeight / 2, radiusX, radiusY, 0, 0, 2 * Math.PI);
        }
        
        if (currentShape.fill) {
          context.fill();
        } else {
          context.stroke();
        }
      }
    } else {
      // Draw with pen or eraser
      if (!isDrawing || !lastPointRef.current || !contextRef.current) return;
      
      contextRef.current.lineTo(coords.x, coords.y);
      contextRef.current.stroke();
      
      lastPointRef.current = coords;
    }
  };
  
  // Stop drawing, text placement, or shape creation
  const stopDrawing = (event?: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsTouching(false);
    if (event) {
      event.preventDefault();
    }
    
    if (tool === 'text') {
      setIsDraggingText(false);
    } else if (tool === 'rectangle' || tool === 'circle') {
      // Finalize the shape
      setIsDrawing(false);
    } else {
      // Stop drawing with pen or eraser
      if (!isDrawing || !contextRef.current) return;
      
      contextRef.current.closePath();
      setIsDrawing(false);
    }
  };
  
  // Add text to canvas
  const handleAddText = () => {
    if (textInput.trim() === '') return;
    
    const newTextElement: TextElement = {
      text: textInput,
      x: 50,
      y: 50,
      color: color,
      size: textSize[0],
      fontFamily: textFont,
      isDragging: false
    };
    
    setTextElements(prevTextElements => [...prevTextElements, newTextElement]);
    setEditDialogOpen(false);
    setTextInput('');
  };
  
  // Handle text dialog closing
  const handleTextDialogOpenChange = (open: boolean) => {
    setEditDialogOpen(open);
  };
  
  // Clear canvas
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !contextRef.current) return;
    
    contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
    applyThemeBackground(contextRef.current, theme.visualTheme, theme.seasonalTheme, canvas.width, canvas.height);
    setTextElements([]);
    setCurrentShape(null);
  };
  
  // Handle publish
  const handlePublish = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    setIsPublishing(true);
    onSave(canvas);
  };
  
  // Remove selected text
  const handleRemoveText = () => {
    if (selectedTextIndex === null) return;
    
    setTextElements(prevTextElements => {
      const newTextElements = [...prevTextElements];
      newTextElements.splice(selectedTextIndex, 1);
      return newTextElements;
    });
    
    setSelectedTextIndex(null);
  };
  
  // Edit selected text
  const handleEditText = () => {
    if (selectedTextIndex === null) return;
    
    const selectedText = textElements[selectedTextIndex];
    setTextInput(selectedText.text);
    setColor(selectedText.color);
    setTextSize([selectedText.size]);
    setTextFont(selectedText.fontFamily);
    setEditDialogOpen(true);
  };

  // Update canvas sizing and touch handling for mobile
  useEffect(() => {
    const handleResize = () => {
      const containerWidth = document.querySelector('.canvas-container')?.clientWidth || 600;
      const newWidth = Math.min(containerWidth, 800); // Limit max width
      const newHeight = newWidth * (3 / 4); // Maintain aspect ratio
      setCanvasSize({ width: newWidth, height: newHeight });
    };
    
    // Set initial size
    handleResize();
    
    // Listen for window resize
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [canvasSize]);

  return (
    <div className="flex flex-col gap-4">
      {/* Drawing tools */}
      <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
        <ToggleGroup type="single" value={tool} onValueChange={(value) => value && setTool(value as any)}>
          <ToggleGroupItem value="pen" aria-label="Pen" title="Pen">
            <Pen className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="eraser" aria-label="Eraser" title="Eraser">
            <Eraser className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="text" aria-label="Text" title="Text">
            <Type className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="rectangle" aria-label="Rectangle" title="Rectangle">
            <Square className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="circle" aria-label="Circle" title="Circle">
            <CircleIcon className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
        
        {/* Clear button outside toggle group */}
        <Button variant="outline" onClick={clearCanvas} size="icon" title="Clear canvas">
          <Trash2 className="h-4 w-4" />
        </Button>
        
        {/* Theme button */}
        <Popover open={showThemeSelector} onOpenChange={setShowThemeSelector}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" title="Change theme">
              <Sparkles className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-2">
            <div className="flex flex-col gap-4">
              <h3 className="font-medium">Canvas Theme</h3>
              
              {/* Theme previews */}
              <div className="grid grid-cols-2 gap-2">
                <ThemePreview theme={{ visualTheme: theme.visualTheme, seasonalTheme: 'none' }} className="h-24" />
                <ThemePreview theme={theme} className="h-24" />
              </div>
              
              <div className="flex flex-col gap-2">
                <Label htmlFor="visual-theme">Style</Label>
                <Select 
                  value={theme.visualTheme} 
                  onValueChange={(value) => setVisualTheme(value as VisualTheme)}
                >
                  <SelectTrigger id="visual-theme">
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    {visualThemes.map(theme => (
                      <SelectItem key={theme.id} value={theme.id}>
                        {theme.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex flex-col gap-2">
                <Label htmlFor="seasonal-theme">Seasonal Overlay</Label>
                <Select 
                  value={theme.seasonalTheme} 
                  onValueChange={(value) => setSeasonalTheme(value as SeasonalTheme)}
                >
                  <SelectTrigger id="seasonal-theme">
                    <SelectValue placeholder="Select overlay" />
                  </SelectTrigger>
                  <SelectContent>
                    {seasonalThemes.map(theme => (
                      <SelectItem key={theme.id} value={theme.id}>
                        {theme.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      {/* Drawing settings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Color picker */}
        <div className="flex items-center gap-3">
          <label htmlFor="color-picker" className="text-sm font-medium">
            Color:
          </label>
          <input
            id="color-picker"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-6 w-6 border border-gray-300 rounded"
          />
        </div>
        
        {/* Width slider */}
        <div className="flex items-center gap-3">
          <label htmlFor="width-slider" className="text-sm font-medium whitespace-nowrap">
            Width: {width[0]}px
          </label>
          <Slider
            id="width-slider"
            value={width}
            onValueChange={setWidth}
            min={1}
            max={30}
            step={1}
            className="flex-1"
          />
        </div>
      </div>
      
      {/* Shape settings - only show when relevant */}
      {(tool === 'rectangle' || tool === 'circle') && (
        <div className="flex items-center gap-2">
          <Checkbox 
            id="fill-shape" 
            checked={fill} 
            onCheckedChange={(checked) => setFill(!!checked)} 
          />
          <Label htmlFor="fill-shape">Fill shape</Label>
        </div>
      )}
      
      {/* Text settings - only show when relevant */}
      {tool === 'text' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <label htmlFor="text-size-slider" className="text-sm font-medium whitespace-nowrap">
              Size: {textSize[0]}px
            </label>
            <Slider
              id="text-size-slider"
              value={textSize}
              onValueChange={setTextSize}
              min={10}
              max={72}
              step={1}
              className="flex-1"
            />
          </div>
          
          <div className="flex items-center gap-3 col-span-2">
            <label htmlFor="font-family" className="text-sm font-medium">
              Font:
            </label>
            <Select value={textFont} onValueChange={setTextFont}>
              <SelectTrigger id="font-family" className="flex-1">
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Arial">Arial</SelectItem>
                <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                <SelectItem value="Courier New">Courier New</SelectItem>
                <SelectItem value="Georgia">Georgia</SelectItem>
                <SelectItem value="Verdana">Verdana</SelectItem>
                <SelectItem value="Comic Sans MS">Comic Sans MS</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
      
      {/* Selected text options */}
      {selectedTextIndex !== null && (
        <div className="flex gap-2 animate-fade-in">
          <Button size="sm" variant="outline" onClick={handleEditText}>
            Edit Text
          </Button>
          <Button size="sm" variant="destructive" onClick={handleRemoveText}>
            Remove
          </Button>
        </div>
      )}
      
      {/* Canvas container */}
      <div className="border rounded-md p-1 overflow-hidden bg-white canvas-container">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={isDrawing ? draw : undefined}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={isDrawing ? draw : undefined}
          onTouchEnd={stopDrawing}
          className="cursor-crosshair touch-none border border-gray-200 w-full max-w-full rounded shadow-sm"
        />
      </div>
      
      {/* Prompt display */}
      {prompt && (
        <div className="bg-blue-50 border border-blue-200 p-3 rounded-md">
          <h3 className="font-medium text-blue-700">Today's Prompt</h3>
          <p className="text-blue-600">{prompt}</p>
        </div>
      )}
      
      {/* Text input dialog */}
      <Dialog open={textDialogOpen} onOpenChange={handleTextDialogOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Text</DialogTitle>
            <DialogDescription>
              Enter the text you want to add to your canvas.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="text-input">Text</Label>
              <Input
                id="text-input"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Enter your text here"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="text-color">Color</Label>
              <div className="flex items-center gap-2">
                <input
                  id="text-color"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-10 w-10 border border-gray-200 rounded"
                />
                <span>{color}</span>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="text-font">Font</Label>
              <Select value={textFont} onValueChange={setTextFont}>
                <SelectTrigger id="text-font">
                  <SelectValue placeholder="Select font" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Arial">Arial</SelectItem>
                  <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                  <SelectItem value="Courier New">Courier New</SelectItem>
                  <SelectItem value="Georgia">Georgia</SelectItem>
                  <SelectItem value="Verdana">Verdana</SelectItem>
                  <SelectItem value="Comic Sans MS">Comic Sans MS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="text-dialog-size">Size: {textSize[0]}px</Label>
              <Slider
                id="text-dialog-size"
                value={textSize}
                onValueChange={setTextSize}
                min={10}
                max={72}
                step={1}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleAddText}>
              Add Text
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Publish button */}
      <div className="mt-4">
        <Button 
          onClick={handlePublish} 
          disabled={isPublishing} 
          className="w-full"
        >
          {isPublishing ? 'Publishing...' : 'Publish Doodle'}
        </Button>
      </div>
    </div>
  );
};

export default DrawingCanvas;
