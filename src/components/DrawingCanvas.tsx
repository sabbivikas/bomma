
import React, { useRef, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Pen, Eraser, Trash2, Download, ArrowRight, 
  Sparkles, RotateCcw, Wand2, Paintbrush, Palette, 
  FlipHorizontal, Maximize, Minimize, Square, Circle, 
  Triangle, Line, Text, Layers, Droplet, ZoomIn, 
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
      const rect = canvas.getBoundingClientRect();
      clientX = event.touches[0].clientX - rect.left;
      clientY = event.touches[0].clientY - rect.top;
    } else {
      clientX = event.nativeEvent.offsetX;
      clientY = event.nativeEvent.offsetY;
    }
    
    // Handle panning with space key or middle mouse button
    if (event.nativeEvent instanceof MouseEvent && event.nativeEvent.button === 1) {
      setIsPanning(true);
      lastPointRef.current = { x: clientX, y: clientY };
      return;
    }
    
    // Get coordinates adjusted for zoom and pan
    const { x, y } = convertCoords(clientX, clientY);
    
    // If text tool is selected, set position and show text input
    if (tool === 'text') {
      setTextPosition({ x, y });
      setShowTextInput(true);
      return;
    }
    
    // If fill tool is selected, apply fill at click location
    if (tool === 'fill') {
      applyFill(x, y);
      saveCanvasState();
      return;
    }
    
    // For shape tools, record the start point
    if (tool === 'line' || tool === 'square' || tool === 'circle' || tool === 'triangle') {
      startPointRef.current = { x, y };
      lastPointRef.current = { x, y };
    }
    
    setIsDrawing(true);
    
    // For spray brush, apply immediately
    if (tool === 'spray') {
      applySprayEffect(x, y);
      saveCanvasState();
    } else if (tool === 'pen' || tool === 'brush' || tool === 'eraser') {
      // For drawing tools, get the active layer
      const layer = layerManagerRef.current.getLayer(activeLayer);
      if (layer && layer.context) {
        const context = layer.context;
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x, y + 0.01); // Small line to ensure single dots are drawn
        context.stroke();
      }
    }
    
    lastPointRef.current = { x, y };
  };
  
  const continueDrawing = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    
    if (!isDrawing && !isPanning) return;
    
    const canvas = canvasRef.current;
    if (!canvas || !lastPointRef.current || !layerManagerRef.current) return;
    
    let clientX, clientY;
    
    if ('touches' in event) {
      const rect = canvas.getBoundingClientRect();
      clientX = event.touches[0].clientX - rect.left;
      clientY = event.touches[0].clientY - rect.top;
    } else {
      clientX = event.nativeEvent.offsetX;
      clientY = event.nativeEvent.offsetY;
    }
    
    // Handle panning
    if (isPanning) {
      const dx = clientX - lastPointRef.current.x;
      const dy = clientY - lastPointRef.current.y;
      
      setPan(prev => ({
        x: prev.x + dx,
        y: prev.y + dy
      }));
      
      lastPointRef.current = { x: clientX, y: clientY };
      return;
    }
    
    // Get coordinates adjusted for zoom and pan
    const { x, y } = convertCoords(clientX, clientY);
    
    // Handle shape tools
    if (tool === 'line' || tool === 'square' || tool === 'circle' || tool === 'triangle') {
      lastPointRef.current = { x, y };
      drawShapeOnOverlay();
      return;
    }
    
    // Handle spray brush
    if (tool === 'spray') {
      applySprayEffect(x, y);
      lastPointRef.current = { x, y };
      return;
    }
    
    // Handle regular drawing tools
    if (tool === 'pen' || tool === 'brush' || tool === 'eraser') {
      const layer = layerManagerRef.current.getLayer(activeLayer);
      if (layer && layer.context) {
        const lastX = lastPointRef.current.x;
        const lastY = lastPointRef.current.y;
        
        // Draw with symmetry if enabled
        drawSymmetrically(x, y, lastX, lastY);
        
        lastPointRef.current = { x, y };
      }
    }
  };
  
  const stopDrawing = () => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }
    
    if (!isDrawing) return;
    setIsDrawing(false);
    
    // Finalize shapes
    if (tool === 'line' || tool === 'square' || tool === 'circle' || tool === 'triangle') {
      finalizeShape();
    }
    
    // Save state for undo
    saveCanvasState();
  };
  
  const handleClearCanvas = () => {
    if (!layerManagerRef.current) return;
    
    // Clear all layers except background
    layerManagerRef.current.getLayer('background')?.context?.fillStyle = 'white';
    layerManagerRef.current.getLayer('background')?.context?.fillRect(
      0, 0, 
      canvasRef.current?.width ?? 500, 
      canvasRef.current?.height ?? 500
    );
    
    // Clear all other layers
    layerManagerRef.current.getLayer('main')?.context?.clearRect(
      0, 0, 
      canvasRef.current?.width ?? 500, 
      canvasRef.current?.height ?? 500
    );
    
    renderLayers();
    saveCanvasState();
  };
  
  const handleDownload = () => {
    if (!canvasRef.current) return;
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.download = 'doodle.png';
    link.href = canvasRef.current.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleAddLayer = () => {
    if (!layerManagerRef.current) return;
    
    const newLayer = layerManagerRef.current.addLayer();
    setLayers(prevLayers => [...prevLayers, newLayer]);
    setActiveLayer(newLayer.id);
    
    renderLayers();
  };
  
  const handleRemoveLayer = (id: string) => {
    if (!layerManagerRef.current) return;
    
    layerManagerRef.current.removeLayer(id);
    
    setLayers(prevLayers => prevLayers.filter(l => l.id !== id));
    
    // If we're removing the active layer, set the active layer to the highest remaining layer
    if (id === activeLayer) {
      const remainingLayers = Array.from(layerManagerRef.current.getLayer('main') 
        ? ['main'] 
        : ['background']);
      setActiveLayer(remainingLayers[remainingLayers.length - 1]);
    }
    
    renderLayers();
    saveCanvasState();
  };
  
  const toggleLayerVisibility = (id: string) => {
    if (!layerManagerRef.current) return;
    
    layerManagerRef.current.toggleLayerVisibility(id);
    
    setLayers(prevLayers => 
      prevLayers.map(layer => 
        layer.id === id 
          ? { ...layer, visible: !layer.visible } 
          : layer
      )
    );
    
    renderLayers();
  };
  
  const handleSave = () => {
    if (!canvasRef.current) return;
    onSave(canvasRef.current);
  };
  
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 5)); // Limit max zoom to 5x
  };
  
  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.2)); // Limit min zoom to 0.2x
  };
  
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };
  
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  return (
    <div className="drawing-canvas-container flex flex-col gap-4 w-full" ref={containerRef}>
      {/* Prompt display */}
      {prompt && (
        <div className="bg-purple-50 border-2 border-purple-200 rounded-md p-4 mb-2">
          <h3 className="text-lg font-medium text-purple-800 flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Today's Prompt
          </h3>
          <p className="text-purple-700">{prompt}</p>
        </div>
      )}
      
      {/* Main drawing area */}
      <div className="relative border-2 border-gray-300 rounded-md bg-white overflow-hidden"
        style={{
          width: canvasSize.width,
          height: canvasSize.height,
          margin: '0 auto',
          cursor: tool === 'fill' 
            ? 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23000000\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'M19 11h4a2 2 0 0 0 2-2V6c0-1.1-.9-2-2-2h-4\'/%3E%3Cpath d=\'M14 10V4a2 2 0 1 0-4 0v6\'/%3E%3Cpath d=\'M10 10H5a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h5\'/%3E%3Cpath d=\'M14 10h5a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-5\'/%3E%3Cpath d=\'M13.1 16H13a3 3 0 1 1 0 6\'/%3E%3C/svg%3E") 16 16, auto'
            : tool === 'eraser'
              ? 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23000000\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21\'/%3E%3Cpath d=\'M22 21H7\'/%3E%3Cpath d=\'m5 11 9 9\'/%3E%3C/svg%3E") 16 16, auto'
              : tool === 'text'
                ? 'text'
                : 'crosshair',
          transform: `scale(${zoom})`,
          transformOrigin: 'center center',
        }}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={continueDrawing}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={continueDrawing}
          onTouchEnd={stopDrawing}
          style={{ position: 'absolute', transform: `translate(${pan.x}px, ${pan.y}px)` }}
        />
        <canvas
          ref={overlayCanvasRef}
          style={{ 
            position: 'absolute', 
            pointerEvents: 'none',
            transform: `translate(${pan.x}px, ${pan.y}px)`
          }}
        />
        
        {showTextInput && (
          <div
            className="absolute bg-white border border-gray-300 p-2 rounded-md"
            style={{
              left: (textPosition.x * zoom) + pan.x,
              top: (textPosition.y * zoom) + pan.y,
              zIndex: 10
            }}
          >
            <input
              type="text"
              className="border border-gray-300 p-1 mb-2 w-full"
              autoFocus
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Type your text..."
            />
            <div className="flex gap-2">
              <select
                value={textFont}
                onChange={(e) => setTextFont(e.target.value)}
                className="border border-gray-300 p-1 text-sm"
              >
                <option value="Arial">Arial</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier New</option>
                <option value="Georgia">Georgia</option>
                <option value="Verdana">Verdana</option>
              </select>
              <input
                type="number"
                min="8"
                max="72"
                value={textSize}
                onChange={(e) => setTextSize(Number(e.target.value))}
                className="border border-gray-300 p-1 w-16 text-sm"
              />
              <Button size="sm" onClick={handleAddText}>Add</Button>
              <Button size="sm" variant="outline" onClick={() => setShowTextInput(false)}>Cancel</Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Tools and options */}
      <Tabs defaultValue="tools" className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="tools">Tools</TabsTrigger>
          <TabsTrigger value="layers">Layers</TabsTrigger>
          <TabsTrigger value="effects">Effects</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tools" className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {/* Drawing tools */}
            <Toggle pressed={tool === 'pen'} onClick={() => setTool('pen')} className="flex-grow" aria-label="Pen">
              <Pen className="h-4 w-4 mr-1" /> Pen
            </Toggle>
            <Toggle pressed={tool === 'brush'} onClick={() => setTool('brush')} className="flex-grow" aria-label="Brush">
              <Paintbrush className="h-4 w-4 mr-1" /> Brush
            </Toggle>
            <Toggle pressed={tool === 'spray'} onClick={() => setTool('spray')} className="flex-grow" aria-label="Spray">
              <Droplet className="h-4 w-4 mr-1" /> Spray
            </Toggle>
            <Toggle pressed={tool === 'eraser'} onClick={() => setTool('eraser')} className="flex-grow" aria-label="Eraser">
              <Eraser className="h-4 w-4 mr-1" /> Eraser
            </Toggle>
            <Toggle pressed={tool === 'fill'} onClick={() => setTool('fill')} className="flex-grow" aria-label="Fill">
              <Droplet className="h-4 w-4 mr-1" /> Fill
            </Toggle>
            <Toggle pressed={tool === 'text'} onClick={() => setTool('text')} className="flex-grow" aria-label="Text">
              <Text className="h-4 w-4 mr-1" /> Text
            </Toggle>
            
            {/* Shape tools */}
            <Toggle pressed={tool === 'line'} onClick={() => setTool('line')} className="flex-grow" aria-label="Line">
              <Line className="h-4 w-4 mr-1" /> Line
            </Toggle>
            <Toggle pressed={tool === 'square'} onClick={() => setTool('square')} className="flex-grow" aria-label="Square">
              <Square className="h-4 w-4 mr-1" /> Square
            </Toggle>
            <Toggle pressed={tool === 'circle'} onClick={() => setTool('circle')} className="flex-grow" aria-label="Circle">
              <Circle className="h-4 w-4 mr-1" /> Circle
            </Toggle>
            <Toggle pressed={tool === 'triangle'} onClick={() => setTool('triangle')} className="flex-grow" aria-label="Triangle">
              <Triangle className="h-4 w-4 mr-1" /> Triangle
            </Toggle>
          </div>
          
          {/* Shape mode options (only visible when a shape tool is selected) */}
          {(tool === 'square' || tool === 'circle' || tool === 'triangle') && (
            <div className="flex gap-2">
              <Toggle pressed={shapeMode === 'fill'} onClick={() => setShapeMode('fill')} aria-label="Fill">
                Fill
              </Toggle>
              <Toggle pressed={shapeMode === 'stroke'} onClick={() => setShapeMode('stroke')} aria-label="Stroke">
                Stroke
              </Toggle>
              <Toggle pressed={shapeMode === 'both'} onClick={() => setShapeMode('both')} aria-label="Both">
                Both
              </Toggle>
            </div>
          )}
          
          {/* Color selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-8 h-8 border-none"
              />
              <div className="grid grid-cols-10 gap-1">
                {[
                  '#000000', '#FFFFFF', '#FF0000', '#FF9900', '#FFFF00', 
                  '#00FF00', '#00FFFF', '#0000FF', '#9900FF', '#FF00FF',
                  '#795548', '#607D8B', '#9E9E9E', '#FFEB3B', '#FF5722',
                  '#4CAF50', '#2196F3', '#3F51B5', '#673AB7', '#E91E63'
                ].map((c) => (
                  <div
                    key={c}
                    className={`w-5 h-5 rounded-full cursor-pointer ${c === '#FFFFFF' ? 'border border-gray-300' : ''}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                  />
                ))}
              </div>
            </div>
          </div>
          
          {/* Size slider */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium text-gray-700">Size</label>
              <span className="text-sm text-gray-500">{width[0]}px</span>
            </div>
            <Slider
              value={width}
              onValueChange={setWidth}
              min={1}
              max={50}
              step={1}
              className="w-full"
            />
          </div>
          
          {/* Opacity slider */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium text-gray-700">Opacity</label>
              <span className="text-sm text-gray-500">{opacity[0]}%</span>
            </div>
            <Slider
              value={opacity}
              onValueChange={setOpacity}
              min={1}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
        </TabsContent>
        
        <TabsContent value="layers">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Layers</h3>
              <Button onClick={handleAddLayer} size="sm" variant="outline">Add Layer</Button>
            </div>
            
            <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-2">
              {layerManagerRef.current && Array.from(layers)
                .sort((a, b) => b.zIndex - a.zIndex)
                .map((layer) => (
                  <div key={layer.id} 
                    className={cn(
                      "flex items-center justify-between p-2 rounded",
                      activeLayer === layer.id ? "bg-gray-100" : ""
                    )}
                    onClick={() => setActiveLayer(layer.id)}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={layer.visible}
                        onChange={() => toggleLayerVisibility(layer.id)}
                        className="h-4 w-4"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span>{layer.name}</span>
                    </div>
                    
                    {layer.id !== 'background' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveLayer(layer.id);
                        }}
                        className="text-red-500 h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
              ))}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="effects" className="space-y-4">
          {/* Symmetry options */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Symmetry</label>
            <div className="flex flex-wrap gap-2">
              <Toggle pressed={symmetryMode === 'none'} onClick={() => setSymmetryMode('none')} className="flex-grow" aria-label="No Symmetry">
                None
              </Toggle>
              <Toggle pressed={symmetryMode === 'horizontal'} onClick={() => setSymmetryMode('horizontal')} className="flex-grow" aria-label="Horizontal">
                Horizontal
              </Toggle>
              <Toggle pressed={symmetryMode === 'vertical'} onClick={() => setSymmetryMode('vertical')} className="flex-grow" aria-label="Vertical">
                Vertical
              </Toggle>
              <Toggle pressed={symmetryMode === 'quad'} onClick={() => setSymmetryMode('quad')} className="flex-grow" aria-label="Quad">
                Quad
              </Toggle>
              <Toggle pressed={symmetryMode === 'radial'} onClick={() => setSymmetryMode('radial')} className="flex-grow" aria-label="Radial">
                Radial
              </Toggle>
            </div>
          </div>
          
          {/* Filter options */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Filters</label>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setFilterType('blur')} size="sm" variant="outline">Blur</Button>
              <Button onClick={() => setFilterType('invert')} size="sm" variant="outline">Invert</Button>
              <Button onClick={() => setFilterType('grayscale')} size="sm" variant="outline">Grayscale</Button>
              <Button onClick={() => setFilterType('sepia')} size="sm" variant="outline">Sepia</Button>
            </div>
          </div>
          
          {/* Flip options */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Transform</label>
            <div className="flex gap-2">
              <Button onClick={() => {
                if (!layerManagerRef.current) return;
                const layer = layerManagerRef.current.getLayer(activeLayer);
                if (!layer || !layer.context || !layer.canvas) return;
                
                // Create temp canvas
                const tempCanvas = document.createElement('canvas');
                const tempCtx = tempCanvas.getContext('2d');
                tempCanvas.width = layer.canvas.width;
                tempCanvas.height = layer.canvas.height;
                
                if (!tempCtx) return;
                
                // Draw the original canvas onto the temp canvas
                tempCtx.drawImage(layer.canvas, 0, 0);
                
                // Clear the original canvas
                layer.context.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
                
                // Flip horizontally
                layer.context.translate(layer.canvas.width, 0);
                layer.context.scale(-1, 1);
                layer.context.drawImage(tempCanvas, 0, 0);
                
                // Reset transform
                layer.context.setTransform(1, 0, 0, 1, 0, 0);
                
                renderLayers();
                saveCanvasState();
              }} size="sm" variant="outline">
                <FlipHorizontal className="h-4 w-4 mr-1" /> Flip Horizontal
              </Button>
              <Button onClick={() => {
                if (!layerManagerRef.current) return;
                const layer = layerManagerRef.current.getLayer(activeLayer);
                if (!layer || !layer.context || !layer.canvas) return;
                
                // Create temp canvas
                const tempCanvas = document.createElement('canvas');
                const tempCtx = tempCanvas.getContext('2d');
                tempCanvas.width = layer.canvas.width;
                tempCanvas.height = layer.canvas.height;
                
                if (!tempCtx) return;
                
                // Draw the original canvas onto the temp canvas
                tempCtx.drawImage(layer.canvas, 0, 0);
                
                // Clear the original canvas
                layer.context.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
                
                // Flip vertically
                layer.context.translate(0, layer.canvas.height);
                layer.context.scale(1, -1);
                layer.context.drawImage(tempCanvas, 0, 0);
                
                // Reset transform
                layer.context.setTransform(1, 0, 0, 1, 0, 0);
                
                renderLayers();
                saveCanvasState();
              }} size="sm" variant="outline">
                <RotateCw className="h-4 w-4 mr-1" /> Flip Vertical
              </Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="actions" className="space-y-4">
          {/* View controls */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Zoom & View</label>
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleZoomIn} size="sm" variant="outline">
                <ZoomIn className="h-4 w-4 mr-1" /> Zoom In
              </Button>
              <Button onClick={handleZoomOut} size="sm" variant="outline">
                <ZoomOut className="h-4 w-4 mr-1" /> Zoom Out
              </Button>
              <Button onClick={handleResetZoom} size="sm" variant="outline">
                Reset View
              </Button>
              <Button onClick={toggleFullscreen} size="sm" variant="outline">
                {isFullscreen ? (
                  <><Minimize className="h-4 w-4 mr-1" /> Exit Fullscreen</>
                ) : (
                  <><Maximize className="h-4 w-4 mr-1" /> Fullscreen</>
                )}
              </Button>
            </div>
          </div>
          
          {/* Undo/Redo */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">History</label>
            <div className="flex gap-2">
              <Button 
                onClick={handleUndo} 
                disabled={undoStack.length <= 1} 
                size="sm" 
                variant="outline"
              >
                <RotateCcw className="h-4 w-4 mr-1" /> Undo
              </Button>
              <Button 
                onClick={handleRedo} 
                disabled={redoStack.length === 0} 
                size="sm" 
                variant="outline"
              >
                <RotateCw className="h-4 w-4 mr-1" /> Redo
              </Button>
            </div>
          </div>
          
          {/* Canvas actions */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Canvas Actions</label>
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={handleClearCanvas}
                size="sm" 
                variant="destructive"
              >
                <Trash2 className="h-4 w-4 mr-1" /> Clear Canvas
              </Button>
              <Button 
                onClick={handleDownload}
                size="sm" 
                variant="outline"
              >
                <Download className="h-4 w-4 mr-1" /> Download
              </Button>
              <Button 
                onClick={handleSave}
                size="sm" 
                variant="default"
              >
                <ArrowRight className="h-4 w-4 mr-1" /> Publish Doodle
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DrawingCanvas;
