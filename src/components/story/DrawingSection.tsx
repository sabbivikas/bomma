
import React, { useState } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import DrawingCanvas from '@/components/DrawingCanvas';
import FrameCounter from './FrameCounter';
import { Button } from "@/components/ui/button";

interface DrawingSectionProps {
  framesCount: number;
  hasNoFrames: boolean;
  onSaveFrame: (canvas: HTMLCanvasElement) => void;
}

const DrawingSection: React.FC<DrawingSectionProps> = ({ 
  framesCount, 
  hasNoFrames, 
  onSaveFrame 
}) => {
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSaveFrame = (canvas: HTMLCanvasElement) => {
    onSaveFrame(canvas);
    
    // Show success message briefly
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium">
          {framesCount === 0 ? "Create your first frame" : "Add next frame"}
          {hasNoFrames && (
            <span className="text-xs text-red-500 ml-2">
              (You need at least one frame to create a story)
            </span>
          )}
        </h3>
        
        <div className="flex items-center">
          <FrameCounter count={framesCount} />
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-md p-4 mb-4">
        {showSuccess && (
          <div className="mb-4 text-sm text-green-600 font-medium bg-green-50 p-3 rounded-md border border-green-100 flex items-start">
            <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-600 shrink-0" />
            <span>Frame successfully added! You can add more frames or create your story.</span>
          </div>
        )}
        
        {!showSuccess && (
          <div className="mb-4 text-sm text-blue-600 font-medium bg-blue-50 p-3 rounded-md border border-blue-100 flex items-start">
            <AlertCircle className="h-4 w-4 mr-2 mt-0.5 text-blue-600 shrink-0" />
            <span>Draw your frame below, then click "Publish" to add it to your story.</span>
          </div>
        )}
        
        <DrawingCanvas onSave={handleSaveFrame} />
      </div>
    </div>
  );
};

export default DrawingSection;
