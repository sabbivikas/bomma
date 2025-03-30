
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

      {/* Puppy following the human - in side profile running position */}
      <svg
        width="40"
        height="30"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="running-puppy"
        style={{ position: 'absolute', left: '25px', top: '35px' }}
      >
        {/* Dog head - side profile */}
        <circle cx="8" cy="10" r="3" fill="#000000" />
        
        {/* Dog ear */}
        <path
          d="M8 7L9 5"
          stroke="#000000"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        
        {/* Dog snout */}
        <path
          d="M5 10L3 10.5"
          stroke="#000000"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        
        {/* Dog body - side profile */}
        <ellipse cx="13" cy="12" rx="5" ry="2.5" fill="#000000" />
        
        {/* Dog front leg */}
        <path
          className="dog-front-leg"
          d="M10 14L9 17"
          stroke="#000000"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        
        {/* Dog back leg */}
        <path
          className="dog-back-leg"
          d="M16 14L17 17"
          stroke="#000000"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        
        {/* Dog tail */}
        <path
          className="dog-tail"
          d="M18 11L20 10"
          stroke="#000000"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

export default RunningHuman;
