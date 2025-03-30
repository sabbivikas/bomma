
import { v4 as uuidv4 } from 'uuid';

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  canvas: HTMLCanvasElement | null;
  context?: CanvasRenderingContext2D | null;
  zIndex: number;
}

export class LayerManager {
  private layers: Map<string, Layer>;
  private width: number;
  private height: number;
  
  constructor(width: number, height: number) {
    this.layers = new Map<string, Layer>();
    this.width = width;
    this.height = height;
    
    // Create default layers
    this.initLayer('background', 'Background', 0);
    this.initLayer('main', 'Layer 1', 1);
  }
  
  private initLayer(id: string, name: string, zIndex: number): Layer {
    const canvas = document.createElement('canvas');
    canvas.width = this.width;
    canvas.height = this.height;
    
    const context = canvas.getContext('2d');
    
    const layer: Layer = {
      id,
      name,
      visible: true,
      canvas,
      context,
      zIndex
    };
    
    this.layers.set(id, layer);
    return layer;
  }
  
  public getLayer(id: string): Layer | undefined {
    return this.layers.get(id);
  }

  public getLayers(): Map<string, Layer> {
    return this.layers;
  }
  
  public addLayer(id = uuidv4(), name = 'New Layer'): Layer {
    // Find the highest zIndex and add 1
    let maxZIndex = 0;
    this.layers.forEach(layer => {
      if (layer.zIndex > maxZIndex) {
        maxZIndex = layer.zIndex;
      }
    });
    
    return this.initLayer(id, name, maxZIndex + 1);
  }
  
  public removeLayer(id: string): boolean {
    // Don't remove the background layer
    if (id === 'background') return false;
    
    return this.layers.delete(id);
  }
  
  public toggleLayerVisibility(id: string): void {
    const layer = this.layers.get(id);
    if (layer) {
      layer.visible = !layer.visible;
    }
  }
  
  public renderToCanvas(targetCanvas: HTMLCanvasElement): void {
    const targetContext = targetCanvas.getContext('2d');
    if (!targetContext) return;
    
    // Clear the canvas first
    targetContext.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
    
    // Sort layers by zIndex
    const sortedLayers = Array.from(this.layers.values())
      .sort((a, b) => a.zIndex - b.zIndex);
    
    // Render each visible layer to the target canvas
    for (const layer of sortedLayers) {
      if (layer.visible && layer.canvas) {
        targetContext.drawImage(layer.canvas, 0, 0);
      }
    }
  }
  
  public resizeLayers(width: number, height: number): void {
    this.width = width;
    this.height = height;
    
    // Resize all layer canvases
    this.layers.forEach(layer => {
      if (layer.canvas && layer.context) {
        // Create a temporary canvas to save the current content
        const tempCanvas = document.createElement('canvas');
        const tempContext = tempCanvas.getContext('2d');
        
        if (tempContext) {
          tempCanvas.width = layer.canvas.width;
          tempCanvas.height = layer.canvas.height;
          tempContext.drawImage(layer.canvas, 0, 0);
          
          // Resize the layer canvas
          layer.canvas.width = width;
          layer.canvas.height = height;
          
          // Restore the content
          layer.context.drawImage(tempCanvas, 0, 0);
        }
      }
    });
  }
  
  // Serialize all layers to a single string for undo/redo
  public serializeLayers(): string {
    const layerData: Record<string, {
      id: string;
      name: string;
      visible: boolean;
      imageData: string;
      zIndex: number;
    }> = {};
    
    this.layers.forEach((layer, id) => {
      if (layer.canvas) {
        layerData[id] = {
          id: layer.id,
          name: layer.name,
          visible: layer.visible,
          imageData: layer.canvas.toDataURL(),
          zIndex: layer.zIndex
        };
      }
    });
    
    return JSON.stringify(layerData);
  }
  
  // Deserialize layers from string for undo/redo
  public deserializeLayers(serializedData: string): void {
    try {
      const layerData = JSON.parse(serializedData) as Record<string, {
        id: string;
        name: string;
        visible: boolean;
        imageData: string;
        zIndex: number;
      }>;
      
      // Clear existing layers (except create new ones as needed)
      const existingLayerIds = new Set(this.layers.keys());
      const loadedLayerIds = new Set(Object.keys(layerData));
      
      // Remove layers that no longer exist
      for (const id of existingLayerIds) {
        if (!loadedLayerIds.has(id)) {
          this.layers.delete(id);
        }
      }
      
      // Load or create layers
      for (const id of loadedLayerIds) {
        const loadedLayer = layerData[id];
        let layer = this.layers.get(id);
        
        if (!layer) {
          // Create new layer if it doesn't exist
          layer = this.initLayer(loadedLayer.id, loadedLayer.name, loadedLayer.zIndex);
        } else {
          // Update existing layer properties
          layer.name = loadedLayer.name;
          layer.visible = loadedLayer.visible;
          layer.zIndex = loadedLayer.zIndex;
        }
        
        // Load image data
        if (layer.canvas && layer.context) {
          const img = new Image();
          img.src = loadedLayer.imageData;
          img.onload = () => {
            if (layer?.canvas && layer.context) {
              layer.context.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
              layer.context.drawImage(img, 0, 0);
            }
          };
        }
      }
    } catch (error) {
      console.error('Error deserializing layers:', error);
    }
  }
}
