
import React from 'react';

interface FrameCounterProps {
  count: number;
}

const FrameCounter: React.FC<FrameCounterProps> = ({ count }) => {
  return (
    <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
      <div className="flex gap-1">
        {Array.from({ length: Math.min(count, 5) }).map((_, i) => (
          <div 
            key={i} 
            className="w-3 h-3 rounded-full bg-green-500"
            title={`Frame ${i + 1}`}
          />
        ))}
        {count > 5 && (
          <div className="text-xs flex items-center justify-center px-1.5 bg-green-100 rounded-full">
            +{count - 5}
          </div>
        )}
      </div>
      <span>
        {count === 0 
          ? "No frames yet" 
          : count === 1 
            ? "1 frame added" 
            : `${count} frames added`
        }
      </span>
    </div>
  );
};

export default FrameCounter;
