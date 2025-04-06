
import React from 'react';
import { AlertCircle } from 'lucide-react';
import DrawingCanvas from '@/components/DrawingCanvas';

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
  return (
    <div className="mt-4">
      <h3 className="text-lg font-medium mb-2">
        {framesCount === 0 ? "Create your first frame" : "Add next frame"}
        {hasNoFrames && (
          <span className="text-xs text-red-500 ml-2">
            (You need at least one frame to create a story)
          </span>
        )}
      </h3>
      
      <div className="bg-white rounded-xl shadow-md p-6 mb-4">
        <p className="text-sm text-blue-600 mb-4 font-medium bg-blue-50 p-3 rounded-md border border-blue-100 flex items-start">
          <AlertCircle className="h-4 w-4 mr-2 mt-0.5 text-blue-600 shrink-0" />
          <span>Draw your frame below, then click the <strong>"Publish to Frame"</strong> button to add it to your story.</span>
        </p>
        <DrawingCanvas onSave={onSaveFrame} />
      </div>
    </div>
  );
};

export default DrawingSection;
