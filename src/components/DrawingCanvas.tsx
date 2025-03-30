
import React, { useRef, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Pen, Eraser, Trash2, Download, ArrowRight, 
  Sparkles, RotateCcw, Wand2, Paintbrush, Palette, 
  FlipHorizontal, Maximize, Minimize, Square, Circle, 
  Triangle, Minus, Text, Layers, Droplet, ZoomIn, 
  ZoomOut, RotateCw
} from 'lucide-react';
import { Toggle } from "@/components/ui/toggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { LayerManager, Layer } from "@/utils/layerManager";

type Tool = 'pen' | 'eraser' | 'brush' | 'spray' | 'line' | 'square' | 'circle' | 'triangle' | 'text' | 'fill';
type SymmetryMode = 'none' | 'horizontal' | 'vertical' | 'quad' | 'radial';
type ShapeMode = 'fill' | 'stroke' | 'both';
type FilterType = 'none' | 'blur' | 'invert' | 'grayscale' | 'sepia';

interface DrawingCanvasProps {
  onSave: (canvas: HTMLCanvasElement) => void;
  prompt?: string;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ onSave, prompt }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState('#000000');
  const [width, setWidth] = useState([5]);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [canvasSize, setCanvasSize] = useState({ width: 500, height: 500 });
  const [symmetryMode, setSymmetryMode] = useState<SymmetryMode>('none');
  const [shapeMode, setShapeMode] = useState<ShapeMode>('stroke');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [opacity, setOpacity] = useState([100]);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>('none');
  const [layers, setLayers] = useState<Layer[]>([
    { id: 'background', name: 'Background', visible: true, canvas: null, zIndex: 0 },
    { id: 'main', name: 'Layer 1', visible: true, canvas: null, zIndex: 1 }
  ]);
  const [activeLayer, setActiveLayer] = useState('main');
  const [textInput, setTextInput] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  const [textFont, setTextFont] = useState('Arial');
  const [textSize, setTextSize] = useState(16);
  
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const overlayContextRef = useRef<CanvasRenderingContext2D | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastPointRef = useRef<{ x: number, y: number } | null>(null);
  const startPointRef = useRef<{ x: number, y: number } | null>(null);
  const layerManagerRef = useRef<LayerManager | null>(null);
  
  // Initialize canvas and layer manager
  useEffect(() => {
    const canvas = canvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    if (!canvas || !overlayCanvas) return;
    
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
    const overlayContext = overlayCanvas.getContext('2d');
    
    if (context && overlayContext) {
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.strokeStyle = color;
      context.lineWidth = width[0];
      contextRef.current = context;
      
      overlayContext.lineCap = 'round';
      overlayContext.lineJoin = 'round';
      overlayContextRef.current = overlayContext;
      
      // Initialize layer manager
      if (!layerManagerRef.current) {
        layerManagerRef.current = new LayerManager(canvasSize.width, canvasSize.height);
        
        // Initialize with white background on background layer
        const backgroundLayer = layerManagerRef.current.getLayer('background');
        if (backgroundLayer && backgroundLayer.context) {
          backgroundLayer.context.fillStyle = 'white';
          backgroundLayer.context.fillRect(0, 0, canvas.width, canvas.height);
          
          // Save initial canvas state for undo
          saveCanvasState();
        }
      }
    }
    
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [isFullscreen]); 
  
  // Update canvas size
  useEffect(() => {
    const canvas = canvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    const context = contextRef.current;
    const overlayContext = overlayContextRef.current;
    
    if (canvas && overlayCanvas && context && overlayContext) {
      const devicePixelRatio = window.devicePixelRatio || 1;
      
      // Scale canvas for high DPI displays
      canvas.width = canvasSize.width * devicePixelRatio;
      canvas.height = canvasSize.height * devicePixelRatio;
      canvas.style.width = `${canvasSize.width}px`;
      canvas.style.height = `${canvasSize.height}px`;
      
      // Do the same for overlay canvas
      overlayCanvas.width = canvasSize.width * devicePixelRatio;
      overlayCanvas.height = canvasSize.height * devicePixelRatio;
      overlayCanvas.style.width = `${canvasSize.width}px`;
      overlayCanvas.style.height = `${canvasSize.height}px`;
      
      context.scale(devicePixelRatio, devicePixelRatio);
      overlayContext.scale(devicePixelRatio, devicePixelRatio);
      
      context.lineCap = 'round';
      context.lineJoin = 'round';
      overlayContext.lineCap = 'round';
      overlayContext.lineJoin = 'round';
      
      // Update layer manager with new size
      if (layerManagerRef.current) {
        layerManagerRef.current.resizeLayers(canvas.width, canvas.height);
        renderLayers();
      }
    }
  }, [canvasSize]);
  
  // Update tool properties
  useEffect(() => {
    if (!contextRef.current) return;
    const alpha = opacity[0] / 100;
    const hexColor = color.substring(1);
    const r = parseInt(hexColor.substring(0, 2), 16);
    const g = parseInt(hexColor.substring(2, 4), 16);
    const b = parseInt(hexColor.substring(4, 6), 16);
    
    contextRef.current.strokeStyle = tool === 'eraser' ? 
      'rgba(255, 255, 255, 1)' : 
      `rgba(${r}, ${g}, ${b}, ${alpha})`;
    contextRef.current.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
    contextRef.current.lineWidth = width[0];
    
    // Set different drawing styles based on the tool
    if (contextRef.current) {
      if (tool === 'brush') {
        contextRef.current.shadowBlur = 3;
        contextRef.current.shadowColor = `rgba(${r}, ${g}, ${b}, ${alpha})`;
      } else if (tool === 'spray') {
        contextRef.current.shadowBlur = 0;
      } else {
        contextRef.current.shadowBlur = 0;
      }
    }
    
    // Also update overlay context
    if (overlayContextRef.current) {
      overlayContextRef.current.strokeStyle = tool === 'eraser' ? 
        'rgba(255, 255, 255, 1)' : 
        `rgba(${r}, ${g}, ${b}, ${alpha})`;
      overlayContextRef.current.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
      overlayContextRef.current.lineWidth = width[0];
    }
  }, [color, width, tool, opacity]);
  
  // Apply filters when filter type changes
  useEffect(() => {
    if (filterType !== 'none' && layerManagerRef.current) {
      const layer = layerManagerRef.current.getLayer(activeLayer);
      if (layer && layer.context && layer.canvas) {
        const canvas = layer.canvas;
        const context = layer.context;
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        switch (filterType) {
          case 'blur':
            // Simple box blur (not efficient but demonstrates concept)
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            if (tempCtx) {
              tempCtx.drawImage(canvas, 0, 0);
              context.filter = 'blur(4px)';
              context.clearRect(0, 0, canvas.width, canvas.height);
              context.drawImage(tempCanvas, 0, 0);
              context.filter = 'none';
            }
            break;
            
          case 'invert':
            for (let i = 0; i < data.length; i += 4) {
              data[i] = 255 - data[i];       // R
              data[i + 1] = 255 - data[i + 1]; // G
              data[i + 2] = 255 - data[i + 2]; // B
            }
            context.putImageData(imageData, 0, 0);
            break;
            
          case 'grayscale':
            for (let i = 0; i < data.length; i += 4) {
              const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
              data[i] = avg;       // R
              data[i + 1] = avg;   // G
              data[i + 2] = avg;   // B
            }
            context.putImageData(imageData, 0, 0);
            break;
            
          case 'sepia':
            for (let i = 0; i < data.length; i += 4) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              
              data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
              data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
              data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
            }
            context.putImageData(imageData, 0, 0);
            break;
        }
        
        renderLayers();
        saveCanvasState();
      }
    }
    
    // Reset filter type after applying
    if (filterType !== 'none') {
      setFilterType('none');
    }
  }, [filterType, activeLayer]);
  
  // Render all layers to main canvas
  const renderLayers = () => {
    if (!contextRef.current || !layerManagerRef.current) return;
    
    // Clear the main canvas
    contextRef.current.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
    
    // Render each visible layer in order of zIndex
    layerManagerRef.current.renderToCanvas(canvasRef.current!);
  };
  
  // Save canvas state for undo functionality
  const saveCanvasState = () => {
    if (!canvasRef.current || !layerManagerRef.current) return;
    
    // Save the current state of all layers
    const state = layerManagerRef.current.serializeLayers();
    setUndoStack(prevStack => [...prevStack, state]);
    
    // Clear redo stack when a new action is performed
    setRedoStack([]);
  };
  
  // Undo last action
  const handleUndo = () => {
    if (undoStack.length <= 1 || !layerManagerRef.current) return;
    
    // Move current state to redo stack
    const newUndoStack = [...undoStack];
    const currentState = newUndoStack.pop()!;
    setRedoStack(prevStack => [...prevStack, currentState]);
    
    // Load the previous state
    const previousState = newUndoStack[newUndoStack.length - 1];
    layerManagerRef.current.deserializeLayers(previousState);
    
    // Update the undo stack and render
    setUndoStack(newUndoStack);
    renderLayers();
  };
  
  // Redo last undone action
  const handleRedo = () => {
    if (redoStack.length === 0 || !layerManagerRef.current) return;
    
    // Get the state to redo
    const newRedoStack = [...redoStack];
    const stateToRedo = newRedoStack.pop()!;
    
    // Add current state to undo stack
    setUndoStack(prevStack => [...prevStack, stateToRedo]);
    
    // Load the redo state
    layerManagerRef.current.deserializeLayers(stateToRedo);
    
    // Update the redo stack and render
    setRedoStack(newRedoStack);
    renderLayers();
  };
  
  // Convert canvas coordinates to account for zoom and pan
  const convertCoords = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    // Fix: correctly calculate the coordinates with zoom and pan
    const x = (clientX - rect.left - pan.x) / zoom;
    const y = (clientY - rect.top - pan.y) / zoom;
    
    return { x, y };
  };
  
  // Draw symmetrically based on mode
  const drawSymmetrically = (currentX: number, currentY: number, prevX: number, prevY: number) => {
    if (!layerManagerRef.current) return;
    
    const layer = layerManagerRef.current.getLayer(activeLayer);
    if (!layer || !layer.context) return;
    
    const context = layer.context;
    
    const devicePixelRatio = window.devicePixelRatio || 1;
    const canvas = layer.canvas!;
    const centerX = canvas.width / (2 * devicePixelRatio);
    const centerY = canvas.height / (2 * devicePixelRatio);
    
    // Draw the original line
    context.beginPath();
    context.moveTo(prevX, prevY);
    context.lineTo(currentX, currentY);
    context.stroke();
    
    // Apply symmetry based on selected mode
    if (symmetryMode === 'horizontal' || symmetryMode === 'quad') {
      // Horizontal reflection
      const reflectedPrevY = 2 * centerY - prevY;
      const reflectedCurrY = 2 * centerY - currentY;
      
      context.beginPath();
      context.moveTo(prevX, reflectedPrevY);
      context.lineTo(currentX, reflectedCurrY);
      context.stroke();
    }
    
    if (symmetryMode === 'vertical' || symmetryMode === 'quad') {
      // Vertical reflection
      const reflectedPrevX = 2 * centerX - prevX;
      const reflectedCurrX = 2 * centerX - currentX;
      
      context.beginPath();
      context.moveTo(reflectedPrevX, prevY);
      context.lineTo(reflectedCurrX, currentY);
      context.stroke();
    }
    
    if (symmetryMode === 'quad') {
      // Diagonal reflection (fourth quadrant)
      const reflectedPrevX = 2 * centerX - prevX;
      const reflectedCurrX = 2 * centerX - currentX;
      const reflectedPrevY = 2 * centerY - prevY;
      const reflectedCurrY = 2 * centerY - currentY;
      
      context.beginPath();
      context.moveTo(reflectedPrevX, reflectedPrevY);
      context.lineTo(reflectedCurrX, reflectedCurrY);
      context.stroke();
    }
    
    if (symmetryMode === 'radial') {
      // Radial symmetry (8-way)
      const angles = [45, 90, 135, 180, 225, 270, 315];
      
      angles.forEach(angle => {
        const radians = angle * Math.PI / 180;
        
        // Calculate vectors from center
        const prevDx = prevX - centerX;
        const prevDy = prevY - centerY;
        const currDx = currentX - centerX;
        const currDy = currentY - centerY;
        
        // Rotate vectors
        const rotPrevX = centerX + prevDx * Math.cos(radians) - prevDy * Math.sin(radians);
        const rotPrevY = centerY + prevDx * Math.sin(radians) + prevDy * Math.cos(radians);
        const rotCurrX = centerX + currDx * Math.cos(radians) - currDy * Math.sin(radians);
        const rotCurrY = centerY + currDx * Math.sin(radians) + currDy * Math.cos(radians);
        
        context.beginPath();
        context.moveTo(rotPrevX, rotPrevY);
        context.lineTo(rotCurrX, rotCurrY);
        context.stroke();
      });
    }
    
    renderLayers();
  };
  
  // Apply spray brush effect
  const applySprayEffect = (x: number, y: number) => {
    if (!layerManagerRef.current) return;
    
    const layer = layerManagerRef.current.getLayer(activeLayer);
    if (!layer || !layer.context) return;
    
    const context = layer.context;
    
    const density = width[0] * 2;
    const radius = width[0] * 2;
    
    for (let i = 0; i < density; i++) {
      const offsetX = (Math.random() * 2 - 1) * radius;
      const offsetY = (Math.random() * 2 - 1) * radius;
      const distance = offsetX * offsetX + offsetY * offsetY;
      
      if (distance <= radius * radius) {
        context.fillStyle = context.strokeStyle;
        context.fillRect(x + offsetX, y + offsetY, 1, 1);
      }
    }
    
    // Apply symmetry for spray tool if enabled
    if (symmetryMode !== 'none') {
      const devicePixelRatio = window.devicePixelRatio || 1;
      const canvas = layer.canvas!;
      const centerX = canvas.width / (2 * devicePixelRatio);
      const centerY = canvas.height / (2 * devicePixelRatio);
      
      // Apply symmetry based on selected mode
      if (symmetryMode === 'horizontal' || symmetryMode === 'quad') {
        const reflectedY = 2 * centerY - y;
        applySprayEffectAt(x, reflectedY, context);
      }
      
      if (symmetryMode === 'vertical' || symmetryMode === 'quad') {
        const reflectedX = 2 * centerX - x;
        applySprayEffectAt(reflectedX, y, context);
      }
      
      if (symmetryMode === 'quad') {
        const reflectedX = 2 * centerX - x;
        const reflectedY = 2 * centerY - y;
        applySprayEffectAt(reflectedX, reflectedY, context);
      }
      
      if (symmetryMode === 'radial') {
        const angles = [45, 90, 135, 180, 225, 270, 315];
        
        angles.forEach(angle => {
          const radians = angle * Math.PI / 180;
          
          // Calculate vector from center
          const dx = x - centerX;
          const dy = y - centerY;
          
          // Rotate vector
          const rotX = centerX + dx * Math.cos(radians) - dy * Math.sin(radians);
          const rotY = centerY + dx * Math.sin(radians) + dy * Math.cos(radians);
          
          applySprayEffectAt(rotX, rotY, context);
        });
      }
    }
    
    renderLayers();
  };
  
  // Helper function for symmetrical spray effect
  const applySprayEffectAt = (x: number, y: number, context: CanvasRenderingContext2D) => {
    const density = width[0] * 2;
    const radius = width[0] * 2;
    
    for (let i = 0; i < density; i++) {
      const offsetX = (Math.random() * 2 - 1) * radius;
      const offsetY = (Math.random() * 2 - 1) * radius;
      const distance = offsetX * offsetX + offsetY * offsetY;
      
      if (distance <= radius * radius) {
        context.fillStyle = context.strokeStyle;
        context.fillRect(x + offsetX, y + offsetY, 1, 1);
      }
    }
  };
  
  // Apply fill at a specific point (flood fill algorithm)
  const applyFill = (startX: number, startY: number) => {
    if (!layerManagerRef.current) return;
    
    const layer = layerManagerRef.current.getLayer(activeLayer);
    if (!layer || !layer.context || !layer.canvas) return;
    
    const context = layer.context;
    const canvas = layer.canvas;
    
    // Get image data
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const width = canvas.width;
    const height = canvas.height;
    
    // Get target color (color we're replacing)
    const targetColorPos = ((Math.floor(startY) * width) + Math.floor(startX)) * 4;
    const targetR = data[targetColorPos];
    const targetG = data[targetColorPos + 1];
    const targetB = data[targetColorPos + 2];
    const targetA = data[targetColorPos + 3];
    
    // Get fill color
    const fillColorHex = context.fillStyle.toString();
    let fillR = 0, fillG = 0, fillB = 0, fillA = 255;
    
    if (fillColorHex.startsWith('#')) {
      const hex = fillColorHex.substring(1);
      fillR = parseInt(hex.substring(0, 2), 16);
      fillG = parseInt(hex.substring(2, 4), 16);
      fillB = parseInt(hex.substring(4, 6), 16);
    } else if (fillColorHex.startsWith('rgba')) {
      const match = fillColorHex.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)/);
      if (match) {
        fillR = parseInt(match[1]);
        fillG = parseInt(match[2]);
        fillB = parseInt(match[3]);
        fillA = match[4] ? parseFloat(match[4]) * 255 : 255;
      }
    }
    
    // Don't fill if target color is the same as fill color
    if (targetR === fillR && targetG === fillG && targetB === fillB && targetA === fillA) {
      return;
    }
    
    // The tolerance for color matching
    const colorTolerance = 10;
    
    // Stack for flood fill
    const stack: [number, number][] = [[Math.floor(startX), Math.floor(startY)]];
    const visited = new Set<string>();
    
    // Perform flood fill
    while (stack.length > 0) {
      const [x, y] = stack.pop()!;
      const key = `${x},${y}`;
      
      if (visited.has(key)) continue;
      visited.add(key);
      
      const pos = (y * width + x) * 4;
      
      // Check if current pixel color matches target
      if (
        Math.abs(data[pos] - targetR) <= colorTolerance &&
        Math.abs(data[pos + 1] - targetG) <= colorTolerance &&
        Math.abs(data[pos + 2] - targetB) <= colorTolerance
      ) {
        // Set the color
        data[pos] = fillR;
        data[pos + 1] = fillG;
        data[pos + 2] = fillB;
        data[pos + 3] = fillA;
        
        // Add neighboring pixels to stack
        if (x > 0) stack.push([x - 1, y]);
        if (x < width - 1) stack.push([x + 1, y]);
        if (y > 0) stack.push([x, y - 1]);
        if (y < height - 1) stack.push([x, y + 1]);
      }
    }
    
    // Put the modified pixel data back on the canvas
    context.putImageData(imageData, 0, 0);
    renderLayers();
  };
  
  // Handle adding text to canvas
  const handleAddText = () => {
    if (!textInput || !layerManagerRef.current) return;
    
    const layer = layerManagerRef.current.getLayer(activeLayer);
    if (!layer || !layer.context) return;
    
    const context = layer.context;
    const x = textPosition.x;
    const y = textPosition.y;
    
    // Set text properties
    context.font = `${textSize}px ${textFont}`;
    context.fillStyle = context.strokeStyle;
    context.textBaseline = 'top';
    
    // Draw the text
    context.fillText(textInput, x, y);
    
    // Reset text input
    setShowTextInput(false);
    setTextInput('');
    
    // Update canvas and save state
    renderLayers();
    saveCanvasState();
  };
  
  // Draw shapes on overlay canvas during drawing
  const drawShapeOnOverlay = () => {
    if (!overlayContextRef.current || !startPointRef.current || !lastPointRef.current) return;
    
    const context = overlayContextRef.current;
    const startX = startPointRef.current.x;
    const startY = startPointRef.current.y;
    const endX = lastPointRef.current.x;
    const endY = lastPointRef.current.y;
    
    // Clear previous overlay
    context.clearRect(0, 0, overlayCanvasRef.current!.width, overlayCanvasRef.current!.height);
    
    // Set drawing styles
    context.strokeStyle = contextRef.current!.strokeStyle;
    context.fillStyle = contextRef.current!.fillStyle;
    context.lineWidth = contextRef.current!.lineWidth;
    
    switch (tool) {
      case 'line':
        context.beginPath();
        context.moveTo(startX, startY);
        context.lineTo(endX, endY);
        context.stroke();
        break;
        
      case 'square':
        const width = endX - startX;
        const height = endY - startY;
        
        if (shapeMode === 'fill' || shapeMode === 'both') {
          context.fillRect(startX, startY, width, height);
        }
        
        if (shapeMode === 'stroke' || shapeMode === 'both') {
          context.strokeRect(startX, startY, width, height);
        }
        break;
        
      case 'circle':
        const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
        context.beginPath();
        context.arc(startX, startY, radius, 0, 2 * Math.PI);
        
        if (shapeMode === 'fill' || shapeMode === 'both') {
          context.fill();
        }
        
        if (shapeMode === 'stroke' || shapeMode === 'both') {
          context.stroke();
        }
        break;
        
      case 'triangle':
        context.beginPath();
        context.moveTo(startX, startY);
        context.lineTo(endX, endY);
        context.lineTo(startX - (endX - startX), endY);
        context.closePath();
        
        if (shapeMode === 'fill' || shapeMode === 'both') {
          context.fill();
        }
        
        if (shapeMode === 'stroke' || shapeMode === 'both') {
          context.stroke();
        }
        break;
    }
  };
  
  // Finalize shape on main canvas
  const finalizeShape = () => {
    if (!layerManagerRef.current || !startPointRef.current || !lastPointRef.current) return;
    
    const layer = layerManagerRef.current.getLayer(activeLayer);
    if (!layer || !layer.context) return;
    
    const context = layer.context;
    const startX = startPointRef.current.x;
    const startY = startPointRef.current.y;
    const endX = lastPointRef.current.x;
    const endY = lastPointRef.current.y;
    
    switch (tool) {
      case 'line':
        context.beginPath();
        context.moveTo(startX, startY);
        context.lineTo(endX, endY);
        context.stroke();
        break;
        
      case 'square':
        const width = endX - startX;
        const height = endY - startY;
        
        if (shapeMode === 'fill' || shapeMode === 'both') {
          context.fillRect(startX, startY, width, height);
        }
        
        if (shapeMode === 'stroke' || shapeMode === 'both') {
          context.strokeRect(startX, startY, width, height);
        }
        break;
        
      case 'circle':
        const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
        context.beginPath();
        context.arc(startX, startY, radius, 0, 2 * Math.PI);
        
        if (shapeMode === 'fill' || shapeMode === 'both') {
          context.fill();
        }
        
        if (shapeMode === 'stroke' || shapeMode === 'both') {
          context.stroke();
        }
        break;
        
      case 'triangle':
        context.beginPath();
        context.moveTo(startX, startY);
        context.lineTo(endX, endY);
        context.lineTo(startX - (endX - startX), endY);
        context.closePath();
        
        if (shapeMode === 'fill' || shapeMode === 'both') {
          context.fill();
        }
        
        if (shapeMode === 'stroke' || shapeMode === 'both') {
          context.stroke();
        }
        break;
    }
    
    // Clear overlay canvas
    overlayContextRef.current?.clearRect(0, 0, overlayCanvasRef.current!.width, overlayCanvasRef.current!.height);
    
    // Update main canvas and save state
    renderLayers();
    saveCanvasState();
  };
  
  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !layerManagerRef.current) return;
    
    event.preventDefault(); // Prevent default behaviors
    
    let clientX, clientY;
    
    if ('touches' in event) {
      // Fix: For touch events, get coordinates relative to the page and adjust
      const rect = canvas.getBoundingClientRect();
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      // Fix: For mouse events, get client coordinates rather than offset
      clientX = event.clientX;
      clientY = event.clientY;
    }
    
    // Handle panning with space key or middle mouse button
    if (event.nativeEvent instanceof MouseEvent && event.nativeEvent.button === 1) {
      setIsPanning(true);
      return;
    }
    
    const { x, y } = convertCoords(clientX, clientY);
    
    if (tool === 'text') {
      setTextPosition({ x, y });
      setShowTextInput(true);
      return;
    }
    
    if (tool === 'fill') {
      applyFill(x, y);
      return;
    }
    
    setIsDrawing(true);
    
    if (tool === 'spray') {
      applySprayEffect(x, y);
    }
    
    startPointRef.current = { x, y };
    lastPointRef.current = { x, y };
  };
  
  const draw = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !layerManagerRef.current) return;
    
    event.preventDefault();
    
    let clientX, clientY;
    
    if ('touches' in event) {
      const rect = canvasRef.current!.getBoundingClientRect();
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }
    
    if (isPanning) {
      // Handle panning
      if (lastPointRef.current) {
        const dx = clientX - lastPointRef.current.x;
        const dy = clientY - lastPointRef.current.y;
        setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      }
      lastPointRef.current = { x: clientX, y: clientY };
      return;
    }
    
    const { x, y } = convertCoords(clientX, clientY);
    
    if (tool === 'spray') {
      applySprayEffect(x, y);
      return;
    }
    
    // For shape tools, just update the current point to show preview
    if (['line', 'square', 'circle', 'triangle'].includes(tool)) {
      lastPointRef.current = { x, y };
      drawShapeOnOverlay();
      return;
    }
    
    // For drawing tools, draw lines between points
    if (lastPointRef.current) {
      const prevX = lastPointRef.current.x;
      const prevY = lastPointRef.current.y;
      
      if (tool === 'pen' || tool === 'brush' || tool === 'eraser') {
        drawSymmetrically(x, y, prevX, prevY);
      }
    }
    
    lastPointRef.current = { x, y };
  };
  
  const endDrawing = () => {
    if (!isDrawing) return;
    
    if (['line', 'square', 'circle', 'triangle'].includes(tool) && startPointRef.current && lastPointRef.current) {
      finalizeShape();
    }
    
    setIsDrawing(false);
    setIsPanning(false);
    startPointRef.current = null;
    
    // Save the canvas state when drawing ends
    saveCanvasState();
  };
  
  const handleClear = () => {
    if (!layerManagerRef.current) return;
    
    // Clear all layers except background
    const layers = Array.from(layerManagerRef.current.getLayers().values()).filter(layer => layer.id !== 'background');
    layers.forEach(layer => {
      if (layer.context && layer.canvas) {
        layer.context.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
      }
    });
    
    renderLayers();
    saveCanvasState();
  };
  
  const handleSave = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      onSave(canvas);
    }
  };
  
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  const addNewLayer = () => {
    if (!layerManagerRef.current) return;
    
    const newLayer = layerManagerRef.current.addLayer();
    setActiveLayer(newLayer.id);
    setLayers(Array.from(layerManagerRef.current.getLayers().values()));
  };
  
  const removeLayer = (layerId: string) => {
    if (!layerManagerRef.current) return;
    
    layerManagerRef.current.removeLayer(layerId);
    // If the active layer was removed, switch to the first available layer
    if (layerId === activeLayer) {
      const layers = Array.from(layerManagerRef.current.getLayers().values());
      setActiveLayer(layers[0]?.id || 'background');
    }
    
    setLayers(Array.from(layerManagerRef.current.getLayers().values()));
    renderLayers();
    saveCanvasState();
  };
  
  const toggleLayerVisibility = (layerId: string) => {
    if (!layerManagerRef.current) return;
    
    layerManagerRef.current.toggleLayerVisibility(layerId);
    setLayers(Array.from(layerManagerRef.current.getLayers().values()));
    renderLayers();
  };
  
  // Set up touch events
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const handleTouchMove = (e: TouchEvent) => {
      if (isDrawing) {
        e.preventDefault(); // Prevent scrolling when drawing
      }
    };
    
    // Add event listener to prevent page scroll when drawing
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    
    return () => {
      canvas.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isDrawing]);
  
  // Update selected tool indicators
  return (
    <div className="flex flex-col gap-4" ref={containerRef}>
      {prompt && (
        <div className="bg-muted p-3 rounded-md">
          <p className="text-sm italic">"{prompt}"</p>
        </div>
      )}
      
      <div className="flex flex-col gap-4">
        <Tabs defaultValue="tools" className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="tools">Tools</TabsTrigger>
            <TabsTrigger value="layers">Layers</TabsTrigger>
            <TabsTrigger value="effects">Effects</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tools" className="p-2 space-y-4">
            <div className="flex flex-wrap gap-2 justify-center">
              <Toggle
                pressed={tool === 'pen'}
                onClick={() => setTool('pen')}
                aria-label="Pen tool"
                className="p-2"
              >
                <Pen />
              </Toggle>
              <Toggle
                pressed={tool === 'brush'}
                onClick={() => setTool('brush')}
                aria-label="Brush tool"
                className="p-2"
              >
                <Paintbrush />
              </Toggle>
              <Toggle
                pressed={tool === 'eraser'}
                onClick={() => setTool('eraser')}
                aria-label="Eraser tool"
                className="p-2"
              >
                <Eraser />
              </Toggle>
              <Toggle
                pressed={tool === 'spray'}
                onClick={() => setTool('spray')}
                aria-label="Spray tool"
                className="p-2"
              >
                <Droplet />
              </Toggle>
              <Toggle
                pressed={tool === 'fill'}
                onClick={() => setTool('fill')}
                aria-label="Fill tool"
                className="p-2"
              >
                <Palette />
              </Toggle>
              <Toggle
                pressed={tool === 'line'}
                onClick={() => setTool('line')}
                aria-label="Line tool"
                className="p-2"
              >
                <Minus />
              </Toggle>
              <Toggle
                pressed={tool === 'square'}
                onClick={() => setTool('square')}
                aria-label="Square tool"
                className="p-2"
              >
                <Square />
              </Toggle>
              <Toggle
                pressed={tool === 'circle'}
                onClick={() => setTool('circle')}
                aria-label="Circle tool"
                className="p-2"
              >
                <Circle />
              </Toggle>
              <Toggle
                pressed={tool === 'triangle'}
                onClick={() => setTool('triangle')}
                aria-label="Triangle tool"
                className="p-2"
              >
                <Triangle />
              </Toggle>
              <Toggle
                pressed={tool === 'text'}
                onClick={() => setTool('text')}
                aria-label="Text tool"
                className="p-2"
              >
                <Text />
              </Toggle>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Brush Width</label>
              <Slider
                defaultValue={width}
                max={50}
                step={1}
                min={1}
                onValueChange={setWidth}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Opacity</label>
              <Slider
                defaultValue={opacity}
                max={100}
                step={1}
                min={1}
                onValueChange={setOpacity}
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <label className="text-sm font-medium w-full">Color</label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-10 h-10 p-1 border rounded"
              />
              {['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'].map((colorOption) => (
                <button
                  key={colorOption}
                  onClick={() => setColor(colorOption)}
                  className={`w-8 h-8 rounded-full border-2 ${color === colorOption ? 'border-primary' : 'border-gray-300'}`}
                  style={{ backgroundColor: colorOption }}
                  aria-label={`Color ${colorOption}`}
                />
              ))}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Shape Style</label>
              <div className="flex gap-2">
                <Toggle
                  pressed={shapeMode === 'fill'}
                  onClick={() => setShapeMode('fill')}
                  aria-label="Fill shape"
                  className="flex-1"
                >
                  Fill
                </Toggle>
                <Toggle
                  pressed={shapeMode === 'stroke'}
                  onClick={() => setShapeMode('stroke')}
                  aria-label="Stroke shape"
                  className="flex-1"
                >
                  Stroke
                </Toggle>
                <Toggle
                  pressed={shapeMode === 'both'}
                  onClick={() => setShapeMode('both')}
                  aria-label="Fill and stroke shape"
                  className="flex-1"
                >
                  Both
                </Toggle>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="layers" className="p-2 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">Layers</h3>
              <Button size="sm" onClick={addNewLayer} variant="outline">Add Layer</Button>
            </div>
            
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {layers.sort((a, b) => b.zIndex - a.zIndex).map(layer => (
                <div
                  key={layer.id}
                  className={cn(
                    "flex items-center justify-between p-2 rounded",
                    activeLayer === layer.id && "bg-muted"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Toggle
                      pressed={layer.visible}
                      onClick={() => toggleLayerVisibility(layer.id)}
                      aria-label={`Toggle ${layer.name} visibility`}
                      className="w-6 h-6 p-0"
                    >
                      <Layers className="w-4 h-4" />
                    </Toggle>
                    <span
                      className="text-sm cursor-pointer"
                      onClick={() => setActiveLayer(layer.id)}
                    >
                      {layer.name}
                    </span>
                  </div>
                  
                  {layer.id !== 'background' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeLayer(layer.id)}
                      className="h-6 w-6 p-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="effects" className="p-2 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Symmetry</label>
              <div className="flex flex-wrap gap-2">
                <Toggle
                  pressed={symmetryMode === 'none'}
                  onClick={() => setSymmetryMode('none')}
                  aria-label="No symmetry"
                  className="flex-1"
                >
                  None
                </Toggle>
                <Toggle
                  pressed={symmetryMode === 'horizontal'}
                  onClick={() => setSymmetryMode('horizontal')}
                  aria-label="Horizontal symmetry"
                  className="flex-1"
                >
                  Horizontal
                </Toggle>
                <Toggle
                  pressed={symmetryMode === 'vertical'}
                  onClick={() => setSymmetryMode('vertical')}
                  aria-label="Vertical symmetry"
                  className="flex-1"
                >
                  Vertical
                </Toggle>
                <Toggle
                  pressed={symmetryMode === 'quad'}
                  onClick={() => setSymmetryMode('quad')}
                  aria-label="Quad symmetry"
                  className="flex-1"
                >
                  Quad
                </Toggle>
                <Toggle
                  pressed={symmetryMode === 'radial'}
                  onClick={() => setSymmetryMode('radial')}
                  aria-label="Radial symmetry"
                  className="flex-1"
                >
                  Radial
                </Toggle>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Filters</label>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setFilterType('blur')}
                >
                  Blur
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setFilterType('invert')}
                >
                  Invert
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setFilterType('grayscale')}
                >
                  Grayscale
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setFilterType('sepia')}
                >
                  Sepia
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Zoom</label>
              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setZoom(prev => Math.max(0.1, prev - 0.1))}
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <div className="flex-1 flex items-center justify-center">
                  {Math.round(zoom * 100)}%
                </div>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setZoom(prev => Math.min(5, prev + 0.1))}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {showTextInput && (
          <div className="flex flex-col p-3 bg-muted rounded gap-2">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Enter text"
              className="px-3 py-2 border rounded"
              autoFocus
            />
            <div className="flex gap-2">
              <select
                value={textFont}
                onChange={(e) => setTextFont(e.target.value)}
                className="px-3 py-2 border rounded flex-1"
              >
                <option value="Arial">Arial</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier New</option>
                <option value="Georgia">Georgia</option>
                <option value="Verdana">Verdana</option>
              </select>
              <input
                type="number"
                value={textSize}
                onChange={(e) => setTextSize(Number(e.target.value))}
                min={8}
                max={72}
                className="px-3 py-2 border rounded w-20"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddText} variant="default">Add Text</Button>
              <Button onClick={() => setShowTextInput(false)} variant="outline">Cancel</Button>
            </div>
          </div>
        )}
        
        <div
          className={cn(
            "relative overflow-hidden border rounded",
            isFullscreen ? "w-full h-[60vh]" : "w-full aspect-square max-w-full"
          )}
        >
          <div
            className="relative"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top left',
              translate: `${pan.x}px ${pan.y}px`
            }}
          >
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={endDrawing}
              onMouseLeave={endDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={endDrawing}
              className="absolute top-0 left-0"
            />
            <canvas
              ref={overlayCanvasRef}
              className="absolute top-0 left-0 pointer-events-none"
            />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleUndo} variant="outline" disabled={undoStack.length <= 1}>
            <RotateCcw className="mr-1 w-4 h-4" />
            Undo
          </Button>
          <Button onClick={handleRedo} variant="outline" disabled={redoStack.length === 0}>
            <RotateCw className="mr-1 w-4 h-4" />
            Redo
          </Button>
          <Button onClick={handleClear} variant="outline">
            <Trash2 className="mr-1 w-4 h-4" />
            Clear
          </Button>
          <Button onClick={toggleFullscreen} variant="outline">
            {isFullscreen ? (
              <Minimize className="mr-1 w-4 h-4" />
            ) : (
              <Maximize className="mr-1 w-4 h-4" />
            )}
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </Button>
          <Button onClick={handleSave} className="ml-auto">
            <Download className="mr-1 w-4 h-4" />
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DrawingCanvas;
