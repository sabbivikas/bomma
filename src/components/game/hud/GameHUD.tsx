
import React from 'react';

interface GameHUDProps {
  score: number;
}

const GameHUD: React.FC<GameHUDProps> = ({ score }) => {
  return (
    <>
      <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-sm px-4 py-2 rounded-lg border border-purple-500/30">
        <div className="text-purple-300 font-bold text-xl">Score: {score}</div>
      </div>
      
      <div className="absolute top-4 right-4 w-48">
        <div className="text-sm text-purple-300 mb-1">Shield Energy</div>
        <div className="h-2 bg-black/40 rounded-full overflow-hidden">
          <div className="h-full w-3/4 bg-gradient-to-r from-purple-600 to-purple-400" />
        </div>
      </div>
    </>
  );
};

export default GameHUD;
