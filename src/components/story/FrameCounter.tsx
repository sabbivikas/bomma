
import React from 'react';

interface FrameCounterProps {
  count: number;
}

const FrameCounter: React.FC<FrameCounterProps> = ({ count }) => {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <div className="flex gap-1">
        {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
          <div 
            key={i} 
            className="w-2.5 h-2.5 rounded-full bg-green-500"
            title={`Frame ${i + 1}`}
          />
        ))}
        {count > 3 && (
          <div className="text-xs flex items-center justify-center px-1.5 bg-green-100 rounded-full">
            +{count - 3}
          </div>
        )}
      </div>
      <span className="font-medium">
        {count === 0 
          ? "No frames" 
          : count === 1 
            ? "1 frame" 
            : `${count} frames`
        }
      </span>
    </div>
  );
};

export default FrameCounter;
