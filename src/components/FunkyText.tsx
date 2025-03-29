
import React from 'react';

interface FunkyTextProps {
  text: string;
  className?: string;
}

const FunkyText: React.FC<FunkyTextProps> = ({ text, className = "" }) => {
  return (
    <span className={`wavy-text ${className}`}>
      {text.split('').map((char, index) => (
        <span 
          key={index} 
          style={{ 
            animationDelay: `${index * 0.05}s`,
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
};

export default FunkyText;
