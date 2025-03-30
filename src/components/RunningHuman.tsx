
import React from 'react';

const RunningHuman: React.FC = () => {
  return (
    <div className="running-human-container">
      <svg
        width="60"
        height="60"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="running-human"
      >
        {/* Head */}
        <circle cx="12" cy="6" r="3" fill="#222222" />
        
        {/* Body */}
        <path
          d="M12 9L12 14"
          stroke="#222222"
          strokeWidth="2"
          strokeLinecap="round"
        />
        
        {/* Arms - in running position */}
        <path
          d="M12 11L9 8M12 11L15 14"
          stroke="#222222"
          strokeWidth="2"
          strokeLinecap="round"
        />
        
        {/* Legs - in running position */}
        <path
          d="M12 14L9 17M12 14L15 11"
          stroke="#222222"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

export default RunningHuman;
