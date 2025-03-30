
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

      {/* Puppy following the human - facing forward now */}
      <svg
        width="40"
        height="30"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="running-puppy"
        style={{ position: 'absolute', left: '25px', top: '35px' }}
      >
        {/* Dog head - facing forward */}
        <circle cx="12" cy="8" r="3" fill="#000000" />
        
        {/* Dog ears */}
        <path
          d="M9 6L7 4"
          stroke="#000000"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M15 6L17 4"
          stroke="#000000"
          strokeWidth="2"
          strokeLinecap="round"
        />
        
        {/* Dog body - more oblong for forward-facing appearance */}
        <ellipse cx="12" cy="13" rx="3" ry="2.5" fill="#000000" />
        
        {/* Dog front legs - side by side for forward motion */}
        <path
          className="paw-front-left"
          d="M10 15L9 18"
          stroke="#000000"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          className="paw-front-right"
          d="M14 15L15 18"
          stroke="#000000"
          strokeWidth="2"
          strokeLinecap="round"
        />
        
        {/* Dog tail - slightly showing from behind */}
        <path
          className="tail-wag"
          d="M12 16L12 19"
          stroke="#000000"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

export default RunningHuman;
