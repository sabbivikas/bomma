
import React from 'react';

interface WritingHumanProps {
  className?: string;
}

const WritingHuman: React.FC<WritingHumanProps> = ({ className = '' }) => {
  return (
    <div className={`writing-human ${className}`} style={{ width: '40px', height: '40px' }}>
      {/* Human body */}
      <svg
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Head */}
        <circle cx="12" cy="6" r="3" fill="#333333" />
        
        {/* Body */}
        <path
          d="M12 8.5L12 14"
          stroke="#333333"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        
        {/* Left arm - static */}
        <path
          d="M12 10L9 12"
          stroke="#333333"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        
        {/* Right arm - animated writing hand */}
        <path
          d="M12 10L15 12"
          stroke="#333333"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="writing-hand"
        />
        
        {/* Pencil */}
        <path
          d="M15 12L18 14"
          stroke="#333333"
          strokeWidth="2"
          strokeLinecap="round"
          className="pencil"
        />
        
        {/* Legs */}
        <path
          d="M12 14L14 17"
          stroke="#333333"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M12 14L10 17"
          stroke="#333333"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

export default WritingHuman;
