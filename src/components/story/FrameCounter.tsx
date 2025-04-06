
import React from 'react';

interface FrameCounterProps {
  count: number;
}

const FrameCounter: React.FC<FrameCounterProps> = ({ count }) => {
  return (
    <div className="flex items-center text-xs md:text-sm text-gray-500">
      <div className="flex gap-0.5 md:gap-1 mr-1 md:mr-1.5">
        {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
          <div 
            key={i} 
            className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-green-500"
            title={`Frame ${i + 1}`}
          />
        ))}
        {count > 3 && (
          <div className="text-[10px] md:text-xs flex items-center justify-center px-1 bg-green-100 rounded-full">
            +{count - 3}
          </div>
        )}
      </div>
      <span>
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
