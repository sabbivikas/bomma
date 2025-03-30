
import React from 'react';

const Cloud: React.FC = () => {
  return (
    <div className="clouds fixed inset-0 pointer-events-none overflow-hidden z-5">
      {/* Soft, floating clouds - more visible and with fixed styles */}
      {Array(12).fill(0).map((_, i) => (
        <div 
          key={`cloud-${i}`}
          className="cloud absolute"
          style={{
            left: `${Math.random() * 90}%`,
            top: `${Math.random() * 60}%`,
            width: `${100 + Math.random() * 200}px`,
            height: `${80 + Math.random() * 100}px`,
            background: 'white',
            opacity: 0.9,
            borderRadius: '50%',
            boxShadow: '0 0 40px 20px white',
            filter: 'blur(3px)',
            animation: `float-cloud ${15 + Math.random() * 15}s linear infinite alternate ${Math.random() * 10}s`
          }}
        />
      ))}
    </div>
  );
};

export default Cloud;
