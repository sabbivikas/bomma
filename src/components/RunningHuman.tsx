
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

const RunningHuman: React.FC = () => {
  const isMobile = useIsMobile();
  
  // Scale down for mobile devices
  const scale = isMobile ? 0.7 : 1;
  
  return (
    <div className="running-human-container" style={{ transform: `scale(${scale})`, height: isMobile ? '60px' : '80px' }}>
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
          d="M12 10L15 7"
          stroke="#222222"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M12 10L9 13"
          stroke="#222222"
          strokeWidth="2"
          strokeLinecap="round"
        />
        
        {/* Legs */}
        <path
          d="M12 14L15 17"
          stroke="#222222"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M12 14L9 17"
          stroke="#222222"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      {/* Puppy */}
      <svg
        width="40"
        height="30"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="running-puppy"
      >
        {/* Dog head - clearer and more visible */}
        <circle cx="16" cy="10" r="3" fill="#333333" />
        
        {/* Dog ear */}
        <path
          d="M16 7L14.5 5"
          stroke="#333333"
          strokeWidth="2"
          strokeLinecap="round"
        />
        
        {/* Dog snout */}
        <path
          d="M19 10L21 10"
          stroke="#333333"
          strokeWidth="2"
          strokeLinecap="round"
        />
        
        {/* Dog body - side profile, more visible */}
        <ellipse cx="11" cy="12" rx="5" ry="2.5" fill="#333333" />
        
        {/* Dog front leg */}
        <path
          d="M14 14L15 17"
          stroke="#333333"
          strokeWidth="2"
          strokeLinecap="round"
        />
        
        {/* Dog back leg */}
        <path
          d="M8 14L7 17"
          stroke="#333333"
          strokeWidth="2"
          strokeLinecap="round"
        />
        
        {/* Dog tail */}
        <path
          d="M6 11L4 10"
          stroke="#333333"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

export default RunningHuman;
