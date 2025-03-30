
import React from 'react';

const RunningHuman: React.FC = () => {
  return (
    <div className="running-human-container">
      {/* Human */}
      <svg
        width="60"
        height="80"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="running-human"
      >
        {/* Head */}
        <circle cx="12" cy="6" r="2.5" fill="#222222" />
        
        {/* Body */}
        <path
          d="M12 8.5L12 14"
          stroke="#222222"
          strokeWidth="2"
          strokeLinecap="round"
        />
        
        {/* Arms */}
        <path
          className="arm-front"
          d="M12 10L15 7"
          stroke="#222222"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          className="arm-back"
          d="M12 10L9 13"
          stroke="#222222"
          strokeWidth="2"
          strokeLinecap="round"
        />
        
        {/* Legs */}
        <path
          className="leg-front"
          d="M12 14L15 17"
          stroke="#222222"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          className="leg-back"
          d="M12 14L9 17"
          stroke="#222222"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      {/* Puppy following the human */}
      <svg
        width="40"
        height="30"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="running-puppy"
      >
        {/* Dog head */}
        <circle cx="12" cy="8" r="3" fill="#8B4513" />
        
        {/* Dog ears */}
        <path
          d="M9 6L7 4"
          stroke="#8B4513"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M15 6L17 4"
          stroke="#8B4513"
          strokeWidth="2"
          strokeLinecap="round"
        />
        
        {/* Dog body */}
        <ellipse cx="12" cy="13" rx="4" ry="3" fill="#8B4513" />
        
        {/* Dog legs */}
        <path
          className="paw-front"
          d="M10 15L9 18"
          stroke="#8B4513"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          className="paw-back"
          d="M14 15L15 18"
          stroke="#8B4513"
          strokeWidth="2"
          strokeLinecap="round"
        />
        
        {/* Dog tail */}
        <path
          className="tail-wag"
          d="M16 12L19 11"
          stroke="#8B4513"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

export default RunningHuman;
