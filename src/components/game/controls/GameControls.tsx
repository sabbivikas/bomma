
import React from 'react';
import { Rocket } from 'lucide-react';

interface ControlsProps {
  onShoot: () => void;
}

const Controls: React.FC<ControlsProps> = ({ onShoot }) => {
  return (
    <>
      <div className="absolute bottom-4 left-4 flex gap-2">
        <button 
          className="w-14 h-14 bg-purple-600/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-purple-600/30 border border-purple-500/30 text-white"
          onClick={(e) => {
            e.stopPropagation();
            // Move left logic
          }}
        >
          ←
        </button>
        <button 
          className="w-14 h-14 bg-purple-600/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-purple-600/30 border border-purple-500/30 text-white"
          onClick={(e) => {
            e.stopPropagation();
            // Move right logic
          }}
        >
          →
        </button>
      </div>
      
      <div className="absolute bottom-4 right-4 flex gap-2">
        <button 
          className="w-20 h-20 bg-red-500/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-red-500/30 border-2 border-red-500/30"
          onClick={(e) => {
            e.stopPropagation();
            onShoot();
          }}
        >
          <Rocket className="w-10 h-10 text-red-400" />
        </button>
      </div>
    </>
  );
};

export default Controls;
