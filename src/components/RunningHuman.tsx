
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

const RunningHuman: React.FC = () => {
  const isMobile = useIsMobile();
  
  // Scale for different devices
  const scale = isMobile ? 0.8 : 1;
  
  return (
    <div className="running-human-container" style={{ transform: `scale(${scale})` }}>
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
        <circle cx="12" cy="6" r="3" fill="#000000" />
        
        {/* Body */}
        <path
          d="M12 8.5L12 14"
          stroke="#000000"
          strokeWidth="3"
          strokeLinecap="round"
        />
        
        {/* Arms - more exaggerated running position */}
        <path
          d="M12 10L18 7"
          stroke="#000000"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M12 10L6 12"
          stroke="#000000"
          strokeWidth="3"
          strokeLinecap="round"
        />
        
        {/* Legs - more exaggerated running position */}
        <path
          d="M12 14L18 18"
          stroke="#000000"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M12 14L7 17"
          stroke="#000000"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>

      {/* Puppy - bolder lines and more contrast */}
      <svg
        width="50"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="running-puppy"
      >
        {/* Dog head */}
        <circle cx="16" cy="10" r="3.5" fill="#000000" />
        
        {/* Dog ear */}
        <path
          d="M16 7L13 4"
          stroke="#000000"
          strokeWidth="3"
          strokeLinecap="round"
        />
        
        {/* Dog snout */}
        <path
          d="M19 10L22 10"
          stroke="#000000"
          strokeWidth="3"
          strokeLinecap="round"
        />
        
        {/* Dog body */}
        <ellipse cx="11" cy="12" rx="5.5" ry="3" fill="#000000" />
        
        {/* Dog legs - more exaggerated */}
        <path
          d="M14 14L18 19"
          stroke="#000000"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M8 14L4 19"
          stroke="#000000"
          strokeWidth="3"
          strokeLinecap="round"
        />
        
        {/* Dog tail - more visible */}
        <path
          d="M6 11L2 9"
          stroke="#000000"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

export default RunningHuman;
