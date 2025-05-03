
import React, { useState, useRef } from 'react';
import DrawingCanvas from '@/components/DrawingCanvas';
import FrameCounter from './FrameCounter';
import { useTheme } from '@/contexts/ThemeContext';
import { getThemeConfig } from '@/utils/themeConfig';
import PromptDisplay from '@/components/drawing/PromptDisplay';
import DrawingSuccessMessage from '@/components/drawing/DrawingSuccessMessage';
import DrawingEnhancePrompt from '@/components/drawing/DrawingEnhancePrompt';
import { processEnhancement } from '@/utils/drawingEnhancer';

interface DrawingSectionProps {
  framesCount: number;
  hasNoFrames: boolean;
  onSaveFrame: (canvas: HTMLCanvasElement) => void;
  prompt?: string;
}

const DrawingSection: React.FC<DrawingSectionProps> = ({ 
  framesCount, 
  hasNoFrames, 
  onSaveFrame,
  prompt
}) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme } = useTheme();
  
  // Get theme configuration for styling
  const visualThemeConfig = getThemeConfig(theme.visualTheme);
  
  const handleSaveFrame = (canvas: HTMLCanvasElement) => {
    // Store canvas reference for potential AI enhancement
    canvasRef.current = canvas;
    
    onSaveFrame(canvas);
    
    // Show success message briefly
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };
  
  const handleSendPrompt = async (promptText: string) => {
    await processEnhancement(canvasRef, promptText, setIsEnhancing);
  };

  return (
    <div className="w-full flex flex-col">
      {/* Display prompt at the top if available */}
      <PromptDisplay prompt={prompt} />
      
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-sm md:text-base font-medium text-gray-700">
          {framesCount === 0 ? "Create your first frame" : "Add next frame"}
        </h3>
        
        <FrameCounter count={framesCount} />
      </div>
      
      <div className={`w-full rounded-lg border border-gray-200 shadow-md overflow-hidden ${visualThemeConfig?.backgroundStyle || 'bg-gradient-to-b from-purple-100 to-blue-100'} backdrop-blur-sm`}>
        <DrawingSuccessMessage show={showSuccess} />
        
        <DrawingCanvas 
          onSave={handleSaveFrame} 
          prompt={prompt} 
          canvasRef={canvasRef}
        />
      </div>
      
      {/* Add the prompt input component */}
      <DrawingEnhancePrompt 
        onSendPrompt={handleSendPrompt}
        isLoading={isEnhancing}
      />
    </div>
  );
};

export default DrawingSection;
