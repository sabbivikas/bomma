
import React from 'react';

const GhibliAnimations: React.FC = () => {
  return (
    <div className="ghibli-animations fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Animated Butterflies (only 3) */}
      <div className="butterflies">
        {/* Top left butterfly */}
        <div 
          className="butterfly absolute"
          style={{
            left: '15%',
            top: '10%',
            transform: 'scale(0.5)',
            animation: 'flutter-path 30s ease-in-out infinite'
          }}
        >
          <div className="butterfly-inner" style={{ animation: 'flutter-wings 0.3s ease-in-out infinite alternate' }}>
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Left wing */}
              <path 
                d="M15 15C10.5 10.5 6 10.5 3.5 12.5C1 14.5 1 18.75 3.5 21.25C6 23.75 10.5 22.5 15 15Z" 
                fill="#FFCAD4" 
                stroke="#F48FB1" 
                strokeOpacity="0.7" 
                strokeWidth="0.5" 
              />
              {/* Right wing */}
              <path 
                d="M15 15C19.5 10.5 24 10.5 26.5 12.5C29 14.5 29 18.75 26.5 21.25C24 23.75 19.5 22.5 15 15Z" 
                fill="#FFCAD4" 
                stroke="#F48FB1" 
                strokeOpacity="0.7" 
                strokeWidth="0.5" 
              />
              {/* Body */}
              <path 
                d="M15 7.5C15 7.5 15 22.5 15 22.5" 
                stroke="#F48FB1" 
                strokeOpacity="0.8" 
                strokeWidth="1" 
              />
              {/* Antennas */}
              <path 
                d="M15 7.5C13.75 5 12.5 3.75 11.25 3.75M15 7.5C16.25 5 17.5 3.75 18.75 3.75" 
                stroke="#F48FB1" 
                strokeOpacity="0.8" 
                strokeWidth="0.8" 
              />
            </svg>
          </div>
        </div>

        {/* Top right butterfly */}
        <div 
          className="butterfly absolute"
          style={{
            right: '20%',
            top: '15%',
            transform: 'scale(0.6)',
            animation: 'flutter-path 25s ease-in-out infinite 5s'
          }}
        >
          <div className="butterfly-inner" style={{ animation: 'flutter-wings 0.3s ease-in-out infinite alternate' }}>
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Left wing */}
              <path 
                d="M15 15C10.5 10.5 6 10.5 3.5 12.5C1 14.5 1 18.75 3.5 21.25C6 23.75 10.5 22.5 15 15Z" 
                fill="#D4F1F9" 
                stroke="#87CEEB" 
                strokeOpacity="0.7" 
                strokeWidth="0.5" 
              />
              {/* Right wing */}
              <path 
                d="M15 15C19.5 10.5 24 10.5 26.5 12.5C29 14.5 29 18.75 26.5 21.25C24 23.75 19.5 22.5 15 15Z" 
                fill="#D4F1F9" 
                stroke="#87CEEB" 
                strokeOpacity="0.7" 
                strokeWidth="0.5" 
              />
              {/* Body */}
              <path 
                d="M15 7.5C15 7.5 15 22.5 15 22.5" 
                stroke="#87CEEB" 
                strokeOpacity="0.8" 
                strokeWidth="1" 
              />
              {/* Antennas */}
              <path 
                d="M15 7.5C13.75 5 12.5 3.75 11.25 3.75M15 7.5C16.25 5 17.5 3.75 18.75 3.75" 
                stroke="#87CEEB" 
                strokeOpacity="0.8" 
                strokeWidth="0.8" 
              />
            </svg>
          </div>
        </div>

        {/* Middle butterfly */}
        <div 
          className="butterfly absolute"
          style={{
            left: '50%',
            top: '20%',
            transform: 'translateX(-50%) scale(0.7)',
            animation: 'flutter-path 28s ease-in-out infinite 8s'
          }}
        >
          <div className="butterfly-inner" style={{ animation: 'flutter-wings 0.3s ease-in-out infinite alternate' }}>
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Left wing */}
              <path 
                d="M15 15C10.5 10.5 6 10.5 3.5 12.5C1 14.5 1 18.75 3.5 21.25C6 23.75 10.5 22.5 15 15Z" 
                fill="#F8EBD9" 
                stroke="#FFB74D" 
                strokeOpacity="0.7" 
                strokeWidth="0.5" 
              />
              {/* Right wing */}
              <path 
                d="M15 15C19.5 10.5 24 10.5 26.5 12.5C29 14.5 29 18.75 26.5 21.25C24 23.75 19.5 22.5 15 15Z" 
                fill="#F8EBD9" 
                stroke="#FFB74D" 
                strokeOpacity="0.7" 
                strokeWidth="0.5" 
              />
              {/* Body */}
              <path 
                d="M15 7.5C15 7.5 15 22.5 15 22.5" 
                stroke="#FFB74D" 
                strokeOpacity="0.8" 
                strokeWidth="1" 
              />
              {/* Antennas */}
              <path 
                d="M15 7.5C13.75 5 12.5 3.75 11.25 3.75M15 7.5C16.25 5 17.5 3.75 18.75 3.75" 
                stroke="#FFB74D" 
                strokeOpacity="0.8" 
                strokeWidth="0.8" 
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Add Ghibli-style CSS keyframe animations */}
      <style>
        {`
          @keyframes flutter-wings {
            0% { transform: scaleX(0.8); }
            100% { transform: scaleX(1.2); }
          }
          
          @keyframes flutter-path {
            0%, 100% { transform: translateY(0) translateX(0) rotate(0deg); }
            10% { transform: translateY(-30px) translateX(20px) rotate(10deg); }
            20% { transform: translateY(-60px) translateX(40px) rotate(20deg); }
            30% { transform: translateY(-30px) translateX(60px) rotate(10deg); }
            40% { transform: translateY(0px) translateX(80px) rotate(0deg); }
            50% { transform: translateY(30px) translateX(60px) rotate(-10deg); }
            60% { transform: translateY(60px) translateX(40px) rotate(-20deg); }
            70% { transform: translateY(30px) translateX(20px) rotate(-10deg); }
            80% { transform: translateY(0px) translateX(0px) rotate(0deg); }
            90% { transform: translateY(-15px) translateX(10px) rotate(5deg); }
          }
        `}
      </style>
    </div>
  );
};

export default GhibliAnimations;
