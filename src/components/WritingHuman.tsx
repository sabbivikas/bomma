
import React from 'react';

interface WritingHumanProps {
  className?: string;
}

const WritingHuman: React.FC<WritingHumanProps> = ({ className = '' }) => {
  return (
    <div className={`writing-human ${className}`} style={{ width: '30px', height: '30px' }}>
      {/* Human body */}
      <svg
        width="30"
        height="30"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Head */}
        <circle cx="12" cy="6" r="2.5" fill="#000000" />
        
        {/* Body */}
        <path
          d="M12 8.5L12 14"
          stroke="#000000"
          strokeWidth="2"
          strokeLinecap="round"
        />
        
        {/* Left arm - static */}
        <path
          d="M12 10L9 12"
          stroke="#000000"
          strokeWidth="2"
          strokeLinecap="round"
        />
        
        {/* Right arm - animated writing hand */}
        <path
          d="M12 10L16 12"
          stroke="#000000"
          strokeWidth="2"
          strokeLinecap="round"
          className="writing-hand"
        />
        
        {/* Pencil */}
        <path
          d="M16 12L18 14"
          stroke="#000000"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="pencil"
        />
        
        {/* Legs */}
        <path
          d="M12 14L14 17"
          stroke="#000000"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M12 14L10 17"
          stroke="#000000"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

export default WritingHuman;
