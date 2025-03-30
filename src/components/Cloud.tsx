
import React from 'react';

const Cloud: React.FC = () => {
  return (
    <div className="clouds fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Soft, floating clouds - more visible and with fixed styles */}
      {Array(8).fill(0).map((_, i) => (
        <div 
          key={`cloud-${i}`}
          className="cloud absolute"
          style={{
            left: `${Math.random() * 90}%`,
            top: `${Math.random() * 40}%`,
            width: `${100 + Math.random() * 200}px`,
            height: `${80 + Math.random() * 80}px`,
            background: 'white',
            opacity: 0.8,
            borderRadius: '50%',
            boxShadow: '0 0 40px 20px white',
            filter: 'blur(5px)',
            animation: `float-cloud ${30 + Math.random() * 20}s linear infinite alternate ${Math.random() * 10}s`
          }}
        />
      ))}
    </div>
  );
};

export default Cloud;
