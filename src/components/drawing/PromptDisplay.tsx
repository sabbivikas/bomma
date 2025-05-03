
import React from 'react';
import { Lightbulb } from 'lucide-react';

interface PromptDisplayProps {
  prompt?: string | null;
}

const PromptDisplay: React.FC<PromptDisplayProps> = ({ prompt }) => {
  if (!prompt) return null;
  
  return (
    <div className="p-3 mb-2 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <Lightbulb className="h-4 w-4 text-amber-500" />
        <h3 className="font-medium text-gray-800 text-sm">Today's prompt:</h3>
      </div>
      <p className="font-medium text-gray-900">{prompt}</p>
    </div>
  );
};

export default PromptDisplay;
