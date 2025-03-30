
import React, { useState, useEffect } from 'react';

interface WritingHumanProps {
  className?: string;
}

const WritingHuman: React.FC<WritingHumanProps> = ({ className = '' }) => {
  const [action, setAction] = useState<'writing' | 'waving' | 'thinking'>('writing');

  // Cycle through different actions periodically
  useEffect(() => {
    const actionInterval = setInterval(() => {
      setAction(current => {
        if (current === 'writing') return 'waving';
        if (current === 'waving') return 'thinking';
        return 'writing';
      });
    }, 5000); // Change action every 5 seconds

    return () => clearInterval(actionInterval);
  }, []);

  return (
    <div className={`writing-human ${className} ${action}`}>
      {/* Human body - reduced viewBox size for smaller default rendering */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ maxWidth: '100%', maxHeight: '100%' }}
      >
        {/* Head - scaled down */}
        <circle cx="10" cy="5" r="2.5" fill="#333333" />
        
        {/* Body - scaled down */}
        <path
          d="M10 7L10 11"
          stroke="#333333"
          strokeWidth="2"
          strokeLinecap="round"
        />
        
        {/* Left arm - changes based on action - scaled down */}
        <path
          d={
            action === 'thinking' 
              ? "M10 8.5L8 6.5" // Arm up to head in thinking pose
              : action === 'waving' 
                ? "M10 8.5L7 7" // Arm up in waving position
                : "M10 8.5L8 10" // Default writing position
          }
          stroke="#333333"
          strokeWidth="2"
          strokeLinecap="round"
          className={action === 'waving' ? "waving-hand" : ""}
        />
        
        {/* Right arm - changes based on action - scaled down */}
        <path
          d={
            action === 'thinking' 
              ? "M10 8.5L12 7" // Arm slightly up in thinking pose
              : "M10 8.5L12.5 10" // Default position for writing/waving
          }
          stroke="#333333"
          strokeWidth="2"
          strokeLinecap="round"
          className={action !== 'thinking' ? "writing-hand" : ""}
        />
        
        {/* Pencil - only visible when writing - scaled down */}
        {action === 'writing' && (
          <path
            d="M12.5 10L14.5 11.5"
            stroke="#333333"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="pencil"
          />
        )}
        
        {/* Thought bubble - only visible when thinking - scaled down */}
        {action === 'thinking' && (
          <>
            <circle cx="14" cy="3.5" r="0.7" fill="#333333" className="thought-bubble" />
            <circle cx="15.5" cy="2.5" r="1" fill="#333333" className="thought-bubble" />
            <circle cx="17" cy="1.5" r="0.7" fill="#333333" className="thought-bubble" />
          </>
        )}
        
        {/* Legs - scaled down */}
        <path
          d="M10 11L11.5 13.5"
          stroke="#333333" 
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M10 11L8.5 13.5"
          stroke="#333333"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      
      {/* Add CSS animations for the different actions */}
      <style>
        {`
        .waving-hand {
          animation: wave 1s infinite alternate;
          transform-origin: 10px 8.5px;
        }
        
        @keyframes wave {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(15deg); }
        }
        
        .writing-hand {
          animation: write 0.5s infinite alternate;
          transform-origin: 10px 8.5px;
        }
        
        @keyframes write {
          0% { transform: translateX(0); }
          100% { transform: translateX(0.3px); }
        }
        
        .thought-bubble {
          opacity: 0.7;
          animation: pulse 2s infinite alternate;
        }
        
        @keyframes pulse {
          0% { opacity: 0.5; transform: scale(0.95); }
          100% { opacity: 0.9; transform: scale(1.05); }
        }
        `}
      </style>
    </div>
  );
};

export default WritingHuman;
