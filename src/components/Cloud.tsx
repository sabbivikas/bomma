
import React from 'react';

const Cloud: React.FC = () => {
  return (
    <div className="clouds fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Soft, floating clouds */}
      {Array(5).fill(0).map((_, i) => (
        <div 
          key={`cloud-${i}`}
          className="cloud absolute opacity-40"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 30}%`,
            width: `${100 + Math.random() * 150}px`,
            height: `${60 + Math.random() * 60}px`,
            borderRadius: '50%',
            background: 'white',
            boxShadow: '20px 20px 80px white',
            filter: 'blur(15px)',
            animation: `float-cloud ${35 + Math.random() * 20}s linear infinite alternate ${Math.random() * 10}s`
          }}
        />
      ))}

      {/* Add CSS keyframe animation for slow-moving clouds */}
      <style>
        {`
          @keyframes float-cloud {
            0% { transform: translateX(0) translateY(0); }
            50% { transform: translateX(${Math.random() * 10 + 5}px) translateY(${Math.random() * 5}px); }
            100% { transform: translateX(${Math.random() * -10 - 5}px) translateY(${Math.random() * -5}px); }
          }
        `}
      </style>
    </div>
  );
};

export default Cloud;
