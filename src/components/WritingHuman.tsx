
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
      {/* Human body */}
      <svg
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Head */}
        <circle cx="12" cy="6" r="3.5" fill="#333333" />
        
        {/* Body */}
        <path
          d="M12 8.5L12 14"
          stroke="#333333"
          strokeWidth="3"
          strokeLinecap="round"
        />
        
        {/* Left arm - changes based on action */}
        <path
          d={
            action === 'thinking' 
              ? "M12 10L9 7" // Arm up to head in thinking pose
              : action === 'waving' 
                ? "M12 10L8 8" // Arm up in waving position
                : "M12 10L9 12" // Default writing position
          }
          stroke="#333333"
          strokeWidth="3"
          strokeLinecap="round"
          className={action === 'waving' ? "waving-hand" : ""}
        />
        
        {/* Right arm - changes based on action */}
        <path
          d={
            action === 'thinking' 
              ? "M12 10L14 8" // Arm slightly up in thinking pose
              : "M12 10L15 12" // Default position for writing/waving
          }
          stroke="#333333"
          strokeWidth="3"
          strokeLinecap="round"
          className={action !== 'thinking' ? "writing-hand" : ""}
        />
        
        {/* Pencil - only visible when writing */}
        {action === 'writing' && (
          <path
            d="M15 12L18 14"
            stroke="#333333"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="pencil"
          />
        )}
        
        {/* Thought bubble - only visible when thinking */}
        {action === 'thinking' && (
          <>
            <circle cx="17" cy="4" r="1" fill="#333333" className="thought-bubble" />
            <circle cx="19" cy="3" r="1.5" fill="#333333" className="thought-bubble" />
            <circle cx="21" cy="2" r="1" fill="#333333" className="thought-bubble" />
          </>
        )}
        
        {/* Legs */}
        <path
          d="M12 14L14 17"
          stroke="#333333" 
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M12 14L10 17"
          stroke="#333333"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

export default WritingHuman;
