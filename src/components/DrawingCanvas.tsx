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
  
  // Track canvas scale and offset for coordinate mapping
  const [canvasScale, setCanvasScale] = useState(1);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const lastPointRef = useRef<{ x: number, y: number } | null>(null);

  // Keep track of current stroke style for touch events
  const currentStrokeStyleRef = useRef<string>('#000000');

  // Text interaction state management
  const isDraggingTextRef = useRef<boolean>(false);
  const lastTextClickTimeRef = useRef<number>(0);
  const isAddingNewTextRef = useRef<boolean>(false);
  const lastTouchEndTimeRef = useRef<number>(0);

  // Track touch interaction to prevent accidental tool switching
  const [isTouching, setIsTouching] = useState(false);
  
  useEffect(() => {
    // Update the current stroke style ref whenever color changes
    currentStrokeStyleRef.current = color;
  }, [color]);

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
      
      // Apply theme background instead of plain white
      applyThemeBackground(context, canvas.width, canvas.height);
      
      contextRef.current = context;
    }
  }, []);

  // Apply theme to canvas when theme changes
  useEffect(() => {
    if (!canvasRef.current || !contextRef.current) return;
    
    // Need to preserve the current drawing when changing theme
    const canvas = canvasRef.current;
    const context = contextRef.current;
    
    // Create a temporary canvas to store the current drawing
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempContext = tempCanvas.getContext('2d');
    
    if (tempContext) {
      // Copy current canvas content to temp canvas
      tempContext.drawImage(canvas, 0, 0);
      
      // Apply new theme background
      applyThemeBackground(context, canvas.width, canvas.height);
      
      // Restore the drawing on top of the new background
      context.drawImage(tempCanvas, 0, 0);
    }
  }, [theme.visualTheme, theme.seasonalTheme]);

  // Function to apply theme background to canvas
  const applyThemeBackground = (context: CanvasRenderingContext2D, width: number, height: number) => {
    const visualThemeConfig = getThemeConfig(theme.visualTheme);
    const seasonalThemeConfig = theme.seasonalTheme !== 'none' ? getThemeConfig(theme.seasonalTheme) : null;
    
    // Always start with a plain white background
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);
    
    // If no visual theme is selected or it's 'minimal', keep white background
    if (!visualThemeConfig || visualThemeConfig.id === 'minimal') {
      return;
    }
    
    // Apply visual theme background
    if (visualThemeConfig.id === 'ghibli') {
      // Ghibli theme - soft pastel gradient
      const gradient = context.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#E6F0FD');
      gradient.addColorStop(0.5, '#D3ECFD');
      gradient.addColorStop(1, '#FCE8E6');
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);
    } else if (visualThemeConfig.id === 'darkFantasy') {
      // Dark fantasy theme
      const gradient = context.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#1A1B26');
      gradient.addColorStop(0.5, '#292A37');
      gradient.addColorStop(1, '#3A3C4E');
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);
    } else if (visualThemeConfig.id === 'vintage') {
      // Vintage theme
      const gradient = context.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#F3E7D3');
      gradient.addColorStop(0.5, '#EBD9B4');
      gradient.addColorStop(1, '#D9C9A3');
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);
    } else if (visualThemeConfig.id === 'comic') {
      // Comic book theme
      const gradient = context.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#FFF8DC');
      gradient.addColorStop(0.5, '#FFFACD');
      gradient.addColorStop(1, '#FAFAD2');
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);
      
      // Add comic dots pattern
      context.fillStyle = 'rgba(0,0,0,0.05)';
      const dotSize = 5;
      const spacing = 20;
      for (let x = 0; x < width; x += spacing) {
        for (let y = 0; y < height; y += spacing) {
          context.beginPath();
          context.arc(x, y, dotSize/2, 0, Math.PI * 2);
          context.fill();
        }
      }
    } else if (visualThemeConfig.id === 'default') {
      // Default theme - soft blue gradient
      const gradient = context.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#E0F7FA');
      gradient.addColorStop(0.5, '#B3E5FC');
      gradient.addColorStop(1, '#D1C4E9');
      context.fillStyle = gradient;
      context.globalAlpha = 0.3; // Make it subtle
      context.fillRect(0, 0, width, height);
      context.globalAlpha = 1.0;
    }
    
    // Skip seasonal overlays if 'none' is selected
    if (!seasonalThemeConfig || seasonalThemeConfig.id === 'none') {
      return;
    }
    
    // Apply seasonal overlays
    context.globalAlpha = 0.15; // Make it subtle
    
    if (seasonalThemeConfig.id === 'spring') {
      // Spring - add some flowers or petals
      context.fillStyle = '#f8bbce';
      for (let i = 0; i < 15; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = 5 + Math.random() * 15;
        drawFlower(context, x, y, size);
      }
    } else if (seasonalThemeConfig.id === 'summer') {
      // Summer - add sun rays
      const centerX = width / 2;
      const centerY = height / 4;
      const radius = Math.min(width, height) / 3;
      
      context.fillStyle = '#FFEB3B';
      context.beginPath();
      context.arc(centerX, centerY, radius, 0, Math.PI * 2);
      context.fill();
      
      // Draw rays
      context.strokeStyle = '#FFEB3B';
      context.lineWidth = 10;
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        context.beginPath();
        context.moveTo(
          centerX + Math.cos(angle) * radius,
          centerY + Math.sin(angle) * radius
        );
        context.lineTo(
          centerX + Math.cos(angle) * (radius + 50),
          centerY + Math.sin(angle) * (radius + 50)
        );
        context.stroke();
      }
    } else if (seasonalThemeConfig.id === 'autumn') {
      // Autumn - add leaves
      const leafColors = ['#D2691E', '#8B4513', '#A0522D', '#CD853F'];
      for (let i = 0; i < 20; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = 5 + Math.random() * 15;
        const colorIndex = Math.floor(Math.random() * leafColors.length);
        
        context.fillStyle = leafColors[colorIndex];
        drawLeaf(context, x, y, size);
      }
    } else if (seasonalThemeConfig.id === 'winter') {
      // Winter - add snowflakes
      context.fillStyle = 'white';
      for (let i = 0; i < 30; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = 2 + Math.random() * 5;
        drawSnowflake(context, x, y, size);
      }
    } else if (seasonalThemeConfig.id === 'halloween') {
      // Halloween theme
      context.fillStyle = 'rgba(0, 0, 0, 0.2)';
      context.fillRect(0, 0, width, height);
      
      // Add spooky elements
      const spookyColors = ['#FF6D00', '#6A1B9A', '#4A148C'];
      for (let i = 0; i < 15; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = 10 + Math.random() * 20;
        const colorIndex = Math.floor(Math.random() * spookyColors.length);
        
        context.fillStyle = spookyColors[colorIndex];
        if (Math.random() > 0.5) {
          // Draw spider web
          drawSpiderWeb(context, x, y, size);
        } else {
          // Draw bat
          drawBat(context, x, y, size);
        }
      }
    } else if (seasonalThemeConfig.id === 'christmas') {
      // Christmas theme
      for (let i = 0; i < 20; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = 5 + Math.random() * 15;
        
        if (Math.random() > 0.5) {
          // Draw snowflake
          context.fillStyle = 'white';
          drawSnowflake(context, x, y, size);
        } else {
          // Draw simple ornament
          context.fillStyle = Math.random() > 0.5 ? '#C8102E' : '#228B22';
          drawOrnament(context, x, y, size);
        }
      }
    }
    
    context.globalAlpha = 1.0;
  };
  
  // Helper functions to draw seasonal elements
  const drawFlower = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    const numPetals = 5;
    for (let i = 0; i < numPetals; i++) {
      const angle = (i / numPetals) * Math.PI * 2;
      ctx.beginPath();
      ctx.ellipse(
        x + Math.cos(angle) * size/2, 
        y + Math.sin(angle) * size/2,
        size/2, size/4,
        angle, 0, Math.PI * 2
      );
      ctx.fill();
    }
    
    // Draw center
    ctx.fillStyle = '#FFF59D';
    ctx.beginPath();
    ctx.arc(x, y, size/3, 0, Math.PI * 2);
    ctx.fill();
  };
  
  const drawLeaf = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    ctx.beginPath();
    ctx.ellipse(x, y, size, size/2, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  };
  
  const drawSnowflake = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    // Simple snowflake (just a dot for performance)
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  };
  
  const drawSpiderWeb = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    // Simple spider web
    const numLines = 6;
    for (let i = 0; i < numLines; i++) {
      const angle = (i / numLines) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(
        x + Math.cos(angle) * size,
        y + Math.sin(angle) * size
      );
      ctx.stroke();
    }
    
    // Add concentric circles
    for (let r = size/3; r <= size; r += size/3) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  };
  
  const drawBat = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    // Simple bat
    ctx.beginPath();
    ctx.ellipse(x, y, size/3, size/2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Wings
    ctx.beginPath();
    ctx.ellipse(x - size/2, y, size/2, size/4, Math.PI/4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.ellipse(x + size/2, y, size/2, size/4, -Math.PI/4, 0, Math.PI * 2);
    ctx.fill();
  };
  
  const drawOrnament = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    
    // Ornament top
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.rect(x - size/5, y - size - size/4, size/2.5, size/4);
    ctx.fill();
  };

  // Get precise coordinates for both mouse and touch events
  const getCoordinates = (event: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    if ('touches' in event && event.touches.length > 0) {
      // Touch event
      return {
        x: (event.touches[0].clientX - rect.left) * scaleX,
        y: (event.touches[0].clientY - rect.top) * scaleY
      };
    } else if ('clientX' in event) {
      // Mouse event
      return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY
      };
    }
    
    // Fallback (should never happen)
    return { x: 0, y: 0 };
  };
  
  // Check if a point is inside a text's clickable area
  const isPointInText = (x: number, y: number, textElement: TextElement) => {
    if (!contextRef.current) return false;
    
    contextRef.current.font = `${textElement.size}px ${textElement.fontFamily}`;
    const metrics = contextRef.current.measureText(textElement.text);
    const height = textElement.size;
    
    // Add a larger touch area for mobile
    const padding = isMobile ? 15 : 5;
    
    return (
      x >= textElement.x - padding &&
      x <= textElement.x + metrics.width + padding &&
      y >= textElement.y - height - padding &&
      y <= textElement.y + padding
    );
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
    // Reset any ongoing text drag operation
    setSelectedTextIndex(null);
    
    // Check if clicked on existing text
    let clickedTextIndex = -1;
    for (let i = 0; i < textElements.length; i++) {
      if (isPointInText(coords.x, coords.y, textElements[i])) {
        clickedTextIndex = i;
        break;
      }
    }
    
    const now = Date.now();
    // Don't allow interactions too close together
    if (now - lastTextClickTimeRef.current < 300) {
      return;
    }
    
    if (clickedTextIndex !== -1) {
      // Text element was clicked - select it for potential editing/dragging
      console.log("Selected text at index:", clickedTextIndex);
      setSelectedTextIndex(clickedTextIndex);
      isDraggingTextRef.current = true;
      
      // Mark this text as being dragged in the state
      setTextElements(prev => 
        prev.map((el, i) => i === clickedTextIndex ? {...el, isDragging: true} : el)
      );
      
      lastPointRef.current = coords;
    } else if (!isAddingNewTextRef.current) {
      // No text was clicked and we're not already adding text - create new text
      console.log("Creating new text at", coords.x, coords.y);
      isAddingNewTextRef.current = true;
      
      // Create a new text element
      setCurrentTextElement({ 
        text: '', 
        x: coords.x, 
        y: coords.y,
        color: color,
        size: textSize[0],
        fontFamily: textFont,
        isDragging: false
      });
      
      // Show dialog to input text content
      setTextDialogOpen(true);
    }
    
    lastTextClickTimeRef.current = now;
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
    
    if (selectedTextIndex !== null && lastPointRef.current && isDraggingTextRef.current) {
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
      // Make sure the correct color is set before drawing the line
      if (contextRef.current.strokeStyle !== currentStrokeStyleRef.current) {
        contextRef.current.strokeStyle = currentStrokeStyleRef.current;
      }
      
      contextRef.current.lineTo(coords.x, coords.y);
      contextRef.current.stroke();
      
      lastPointRef.current = coords;
    }
  };
  
  // Stop drawing, text placement, or shape creation
  const stopDrawing = (event?: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    // End drawing
    setIsTouching(false);
    
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
    
    // Handle end of text dragging
    if (selectedTextIndex !== null && isDraggingTextRef.current) {
      // Update text element to no longer be in dragging state
      setTextElements(prev => prev.map((el, i) => {
        if (i === selectedTextIndex) {
          return { ...el, isDragging: false };
        }
        return el;
      }));
      
      // Small delay before allowing new text selections
      setTimeout(() => {
        isDraggingTextRef.current = false;
      }, 200);
    }
    
    // Record the time of touch end for debouncing
    if (event && 'touches' in event) {
      lastTouchEndTimeRef.current = Date.now();
    }
    
    setIsDrawing(false);
    lastPointRef.current = null;
  };
  
  // Add text to canvas
  const handleAddText = () => {
    if (!currentTextElement || !textInput.trim()) {
      setTextDialogOpen(false);
      setCurrentTextElement(null);
      isAddingNewTextRef.current = false;
      return;
    }
    
    const newTextElement: TextElement = {
      ...currentTextElement,
      text: textInput.trim()
    };
    
    console.log("Adding new text:", newTextElement);
    
    setTextElements([...textElements, newTextElement]);
    setTextInput('');
    setTextDialogOpen(false);
    setCurrentTextElement(null);
    isAddingNewTextRef.current = false;
  };
  
  // Handle text dialog closing
  const handleTextDialogOpenChange = (open: boolean) => {
    if (!open) {
      // Dialog is closing
      isAddingNewTextRef.current = false;
    }
    setTextDialogOpen(open);
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
    isDraggingTextRef.current = false;
    
    // Reapply theme background
    applyThemeBackground(contextRef.current, canvasRef.current.width, canvasRef.current.height);
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
      
      // Render all shapes to canvas
      shapeElements.forEach(shape => {
        if (!contextRef.current) return;
        
        contextRef.current.strokeStyle = shape.color;
        contextRef.current.fillStyle = shape.color;
        
        if (shape.type === 'rectangle') {
          contextRef.current.beginPath();
          contextRef.current.rect(shape.x, shape.y, shape.width, shape.height);
          if (shape.fill) {
            contextRef.current.fill();
          } else {
            contextRef.current.stroke();
          }
        } else if (shape.type === 'circle') {
          const radius = Math.min(Math.abs(shape.width), Math.abs(shape.height)) / 2;
          const centerX = shape.x + shape.width / 2;
          const centerY = shape.y + shape.height / 2;
          
          contextRef.current.beginPath();
          contextRef.current.arc(centerX, centerY, radius, 0, Math.PI * 2);
          if (shape.fill) {
            contextRef.current.fill();
          } else {
            contextRef.current.stroke();
          }
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
      console.log("Removing text at index:", selectedTextIndex);
      setTextElements(prev => prev.filter((_, i) => i !== selectedTextIndex));
      setSelectedTextIndex(null);
      isDraggingTextRef.current = false;
    }
  };
  
  // Edit selected text
  const handleEditText = () => {
    if (selectedTextIndex !== null) {
      const selectedText = textElements[selectedTextIndex];
      console.log("Editing text:", selectedText);
      
      setCurrentTextElement(selectedText);
      setTextInput(selectedText.text);
      setTextSize([selectedText.size]);
      setTextFont(selectedText.fontFamily);
      setColor(selectedText.color);
      
      // Remove the old text, it will be added again after editing
      setTextElements(prev => prev.filter((_, i) => i !== selectedTextIndex));
      setSelectedTextIndex(null);
      isDraggingTextRef.current = false;
      
      // Open text dialog
      setTextDialogOpen(true);
    }
  };

  // Update canvas sizing and touch handling for mobile
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
      
      // Store the scale factor for coordinate calculations
      setCanvasScale(canvas.width / newWidth);
      
      // Update offset
      const rect = canvas.getBoundingClientRect();
      setCanvasOffset({ x: rect.left, y: rect.top });
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
    <div className="flex flex-col gap-4">
      {/* Drawing tools */}
