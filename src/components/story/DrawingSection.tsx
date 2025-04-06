
import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';
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
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-md font-medium text-gray-700">
          {framesCount === 0 ? "Create your first frame" : "Add next frame"}
        </h3>
        
        <FrameCounter count={framesCount} />
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-3 mb-4">
        {showSuccess && (
          <div className="mb-2 text-xs text-green-600 font-medium flex items-center">
            <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
            <span>Frame added successfully</span>
          </div>
        )}
        
        <DrawingCanvas onSave={handleSaveFrame} />
      </div>
    </div>
  );
};

export default DrawingSection;
