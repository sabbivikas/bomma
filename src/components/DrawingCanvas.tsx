
import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Pen, Eraser, Trash2, Paintbrush, Palette, 
  Type, Square, Circle as CircleIcon, Layers
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
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
import ThemePreview from './ThemePreview';
import { useToast } from '@/hooks/use-toast';

interface DrawingCanvasProps {
  onSave: (canvas: HTMLCanvasElement) => void;
  prompt?: string | null;
  canvasRef?: React.RefObject<HTMLCanvasElement>;
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

interface Frame {
  id: string;
  imageData: string;
  timestamp: number;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ onSave, prompt, canvasRef: externalCanvasRef }) => {
  const internalCanvasRef = useRef<HTMLCanvasElement>(null);
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
  
  // Simple canvas size - modified to use a different aspect ratio
  const [canvasSize] = useState({ width: 800, height: 500 });
  
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
  
  // New social features
  const [frames, setFrames] = useState<Frame[]>([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(-1);
  const [showFramesPanel, setShowFramesPanel] = useState(false);
  const [caption, setCaption] = useState('');
  const [showCaptionDialog, setShowCaptionDialog] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    // Update the current stroke style ref whenever color changes
    currentStrokeStyleRef.current = color;
  }, [color]);

  // Use the canvas ref that's actually being rendered
  const activeCanvasRef = externalCanvasRef || internalCanvasRef;
  
  // Initialize canvas
  useEffect(() => {
    const canvas = activeCanvasRef.current;
    if (!canvas) return;
    
    // Set canvas size
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    canvas.style.width = `100%`; // Make canvas responsive
    canvas.style.height = `auto`; // Maintain aspect ratio
    
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
    if (!activeCanvasRef.current || !contextRef.current) return;
    
    // Need to preserve the current drawing when changing theme
    const canvas = activeCanvasRef.current;
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

  // Apply theme background to canvas
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
    const canvas = activeCanvasRef.current;
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
    
    const canvas = activeCanvasRef.current;
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
    if (!activeCanvasRef.current || !contextRef.current) return;
    
    contextRef.current.fillStyle = 'white';
    contextRef.current.fillRect(0, 0, activeCanvasRef.current.width, activeCanvasRef.current.height);
    
    // Clear text and shape elements
    setTextElements([]);
    setShapeElements([]);
    setSelectedTextIndex(null);
    isDraggingTextRef.current = false;
    
    // Reapply theme background
    applyThemeBackground(contextRef.current, activeCanvasRef.current.width, activeCanvasRef.current.height);
  };
  
  // Handle publish
  const handlePublish = () => {
    if (!activeCanvasRef.current || !contextRef.current) return;
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
      
      onSave(activeCanvasRef.current);
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

  // Update canvas sizing
  useEffect(() => {
    const handleResize = () => {
      const canvas = activeCanvasRef.current;
      if (!canvas || !contextRef.current) return;
      
      // Get the container width (parent element)
      const container = canvas.parentElement;
      if (!container) return;
      
      const containerWidth = container.clientWidth;
      const containerHeight = Math.min(window.innerHeight * 0.6, 500); // Reduced height
      
      // Check if we're on a mobile screen
      const scale = containerWidth / canvasSize.width;
      setCanvasScale(scale);
      
      // Update offset for coordinate mapping
      const rect = canvas.getBoundingClientRect();
      setCanvasOffset({
        x: rect.left,
        y: rect.top
      });
    };
    
    // Initial sizing
    handleResize();
    
    // Listen for window resize events
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [canvasSize.width]);
  
  // Render current shape preview
  useEffect(() => {
    if (!activeCanvasRef.current || !contextRef.current || !currentShape) return;
    
    // Create a copy of the canvas to restore after drawing preview
    const canvas = activeCanvasRef.current;
    const ctx = contextRef.current;
    
    // Store current state and transform settings
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Draw the current shape preview
    ctx.strokeStyle = currentShape.color;
    ctx.fillStyle = currentShape.color;
    
    if (currentShape.type === 'rectangle') {
      ctx.beginPath();
      ctx.rect(currentShape.x, currentShape.y, currentShape.width, currentShape.height);
      if (fill) {
        ctx.fill();
      } else {
        ctx.stroke();
      }
    } else if (currentShape.type === 'circle') {
      const radius = Math.min(Math.abs(currentShape.width), Math.abs(currentShape.height)) / 2;
      const centerX = currentShape.x + currentShape.width / 2;
      const centerY = currentShape.y + currentShape.height / 2;
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      if (fill) {
        ctx.fill();
      } else {
        ctx.stroke();
      }
    }
    
    return () => {
      // Restore the canvas state when shape preview changes or is removed
      if (ctx && imageData) {
        ctx.putImageData(imageData, 0, 0);
      }
    };
  }, [currentShape, fill]);
  
  // Select a visual theme
  const handleVisualThemeChange = (themeId: string) => {
    setVisualTheme(themeId as VisualTheme);
    setShowThemeSelector(false);
  };
  
  // Select a seasonal overlay
  const handleSeasonalThemeChange = (themeId: string) => {
    setSeasonalTheme(themeId as SeasonalTheme);
  };
  
  // Save the current canvas to a frame
  const handleAddFrame = () => {
    if (!activeCanvasRef.current) return;
    
    try {
      // Apply all text and shapes to canvas first
      textElements.forEach(element => {
        if (contextRef.current) {
          contextRef.current.font = `${element.size}px ${element.fontFamily}`;
          contextRef.current.fillStyle = element.color;
          contextRef.current.fillText(element.text, element.x, element.y);
        }
      });
      
      const imageData = activeCanvasRef.current.toDataURL();
      
      const newFrame = {
        id: `frame_${Date.now()}`,
        imageData,
        timestamp: Date.now()
      };
      
      setFrames(prev => [...prev, newFrame]);
      setCurrentFrameIndex(frames.length);
      
      clearCanvas();
      
      toast({
        title: "Frame added",
        description: `Frame ${frames.length + 1} added to your animation`,
        variant: "success",
      });
    } catch (error) {
      console.error("Error adding frame:", error);
    }
  };
  
  // Render the component
  return (
    <div className="flex flex-col w-full">
      {/* Canvas for drawing */}
      <div className="relative drawing-canvas-container">
        <canvas 
          ref={activeCanvasRef}
          className={`w-full h-auto border border-gray-200 rounded bg-white touch-none`}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        
        {/* Text element overlays for preview */}
        {textElements.map((element, index) => (
          <div
            key={`text_${index}`}
            style={{
              position: 'absolute',
              left: `${(element.x / canvasSize.width) * 100}%`,
              top: `${(element.y / canvasSize.height) * 100}%`,
              fontSize: `${element.size / canvasSize.width * 100}vw`,
              color: element.color,
              fontFamily: element.fontFamily,
              pointerEvents: 'none',
              transform: 'translate(0, -100%)',
              opacity: 0.5, // Semi-transparent for preview
              padding: '2px',
              backgroundColor: selectedTextIndex === index ? 'rgba(0,0,255,0.1)' : 'transparent',
              border: selectedTextIndex === index ? '1px dashed blue' : 'none',
            }}
          >
            {element.text}
          </div>
        ))}
      </div>
      
      {/* Tools Panel */}
      <div className="drawing-tools-container mt-2 p-2 rounded-lg border-t border-gray-100">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Drawing tools */}
          <div>
            <ToggleGroup type="single" value={tool} onValueChange={(value) => value && setTool(value as any)}>
              <ToggleGroupItem value="pen" aria-label="Pen tool">
                <Pen className="w-4 h-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="eraser" aria-label="Eraser tool">
                <Eraser className="w-4 h-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="text" aria-label="Text tool">
                <Type className="w-4 h-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="rectangle" aria-label="Rectangle tool">
                <Square className="w-4 h-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="circle" aria-label="Circle tool">
                <CircleIcon className="w-4 h-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          
          {/* Color picker */}
          <div className="flex items-center gap-2">
            <Label htmlFor="color-picker" className="sr-only">Color</Label>
            <input 
              type="color" 
              id="color-picker"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer appearance-none border border-gray-300"
              style={{ backgroundColor: color }}
            />
            
            {/* Width slider */}
            <div className="w-24 md:w-32">
              <Slider 
                value={width} 
                onValueChange={setWidth}
                min={1}
                max={30}
                step={1}
              />
            </div>
            
            {/* Fill option for shape tools */}
            {(tool === 'rectangle' || tool === 'circle') && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="fill"
                  checked={fill}
                  onCheckedChange={(checked) => setFill(checked === true)}
                />
                <Label htmlFor="fill" className="text-xs">Fill</Label>
              </div>
            )}
            
            {/* Text options */}
            {tool === 'text' && (
              <div className="flex items-center gap-2">
                <div className="w-20">
                  <Slider 
                    value={textSize} 
                    onValueChange={setTextSize}
                    min={8}
                    max={72}
                    step={1}
                  />
                </div>
                <Select value={textFont} onValueChange={setTextFont}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Arial">Arial</SelectItem>
                    <SelectItem value="Times New Roman">Times</SelectItem>
                    <SelectItem value="Comic Sans MS">Comic</SelectItem>
                    <SelectItem value="Courier New">Courier</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center gap-1 md:gap-2">
            {/* Text editing buttons */}
            {selectedTextIndex !== null && (
              <>
                <Button 
                  size="sm"
                  variant="outline"
                  onClick={handleEditText}
                >
                  Edit
                </Button>
                <Button 
                  size="sm"
                  variant="outline"
                  onClick={handleRemoveText}
                >
                  Remove
                </Button>
              </>
            )}
            
            {/* Clear button */}
            <Button 
              size="sm"
              variant="outline" 
              onClick={clearCanvas}
              className="flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" /> Clear
            </Button>
            
            {/* Theme button */}
            <Popover open={showThemeSelector} onOpenChange={setShowThemeSelector}>
              <PopoverTrigger asChild>
                <Button 
                  size="sm"
                  variant="outline" 
                  className="flex items-center gap-1"
                >
                  <Palette className="w-4 h-4" /> Theme
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-64 p-3">
                <h4 className="font-medium mb-2">Visual Style</h4>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {visualThemes.map(themeConfig => (
                    <button
                      key={themeConfig.id}
                      className={cn(
                        "p-2 rounded border text-center text-xs",
                        theme.visualTheme === themeConfig.id 
                          ? "border-primary bg-primary/10 font-medium" 
                          : "border-gray-200 hover:bg-gray-50"
                      )}
                      onClick={() => handleVisualThemeChange(themeConfig.id)}
                    >
                      {themeConfig.name}
                    </button>
                  ))}
                </div>
                
                <h4 className="font-medium mb-2">Seasonal Overlay</h4>
                <Select 
                  value={theme.seasonalTheme} 
                  onValueChange={handleSeasonalThemeChange}
                >
                  <SelectTrigger className="w-full">
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
                
                <ThemePreview 
                  className="mt-3 h-20" 
                  visualTheme={theme.visualTheme as VisualTheme} 
                  seasonalTheme={theme.seasonalTheme as SeasonalTheme} 
                />
              </PopoverContent>
            </Popover>

            {/* Save button */}
            <Button 
              onClick={handlePublish}
              disabled={isPublishing}
              className="flex items-center gap-1"
            >
              {isPublishing ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Frames management panel */}
      {showFramesPanel && (
        <div className="mt-4 p-3 border rounded-lg bg-gray-50">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">Frames</h3>
            <Button variant="outline" size="sm" onClick={handleAddFrame}>
              Add Frame
            </Button>
          </div>
          
          <div className="grid grid-cols-5 gap-2 overflow-x-auto pb-2">
            {frames.map((frame, index) => (
              <div 
                key={frame.id} 
                className={cn(
                  "cursor-pointer rounded border border-gray-200 overflow-hidden",
                  currentFrameIndex === index ? "ring-2 ring-primary" : ""
                )}
              >
                <img 
                  src={frame.imageData} 
                  alt={`Frame ${index + 1}`} 
                  className="w-full h-auto"
                  onClick={() => setCurrentFrameIndex(index)} 
                />
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Text input dialog */}
      <Dialog open={textDialogOpen} onOpenChange={handleTextDialogOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Text</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <Label htmlFor="text-input" className="mb-2 block">Text Content</Label>
            <Input
              id="text-input"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Enter your text..."
              autoComplete="off"
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setTextDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddText}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DrawingCanvas;
