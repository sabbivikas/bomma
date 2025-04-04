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
import { visualThemes, seasonalThemes, getThemeConfig } from '@/utils/themeConfig';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { VisualTheme, SeasonalTheme } from '@/types/theme';

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

[Rest of the original code from the file, up until the ThemePreview component]

  // Theme preview component
  const ThemePreview = () => {
    const visualThemeConfig = getThemeConfig(theme.visualTheme);
    const seasonalThemeConfig = theme.seasonalTheme !== 'none' ? getThemeConfig(theme.seasonalTheme) : null;
    
    // Create a mini-preview canvas to show theme
    const previewCanvasRef = useRef<HTMLCanvasElement>(null);
    
    useEffect(() => {
      const canvas = previewCanvasRef.current;
      if (!canvas) return;
      
      canvas.width = 300;
      canvas.height = 100;
      
      const context = canvas.getContext('2d');
      if (context) {
        applyThemeBackground(context, canvas.width, canvas.height);
      }
    }, [theme.visualTheme, theme.seasonalTheme]);
    
    return (
      <div className="mt-4 p-1 rounded-lg border overflow-hidden">
        <canvas 
          ref={previewCanvasRef} 
          width="300" 
          height="100" 
          className="w-full h-[100px] rounded-lg"
        />
        <p className="text-center text-sm mt-1">This is how your frame background will look</p>
      </div>
    );
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

[Rest of the original code until the theme selector portion]

            <div>
              <Label className="text-sm font-medium mb-2 block">Style</Label>
              <Select
                value={theme.visualTheme}
                onValueChange={(value) => setVisualTheme(value as VisualTheme)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a style" />
                </SelectTrigger>
                <SelectContent>
                  {visualThemes.map((theme) => (
                    <SelectItem key={theme.id} value={theme.id as VisualTheme}>
                      {theme.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm font-medium mb-2 block">Theme</Label>
              <Select
                value={theme.seasonalTheme}
                onValueChange={(value) => setSeasonalTheme(value as SeasonalTheme)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a theme" />
                </SelectTrigger>
                <SelectContent>
                  {seasonalThemes.map((theme) => (
                    <SelectItem key={theme.id} value={theme.id as SeasonalTheme}>
                      {theme.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

[Rest of the original code until the end]
