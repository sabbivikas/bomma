
import React from 'react';

const GhibliAnimations: React.FC = () => {
  return (
    <div className="ghibli-animations fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Floating dust particles (like in "My Neighbor Totoro" and "Spirited Away") */}
      <div className="dust-particles">
        {Array(25).fill(0).map((_, i) => (
          <div 
            key={`dust-${i}`} 
            className="dust-particle absolute rounded-full bg-white"
            style={{
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.3 + Math.random() * 0.4,
              boxShadow: '0 0 3px rgba(255, 255, 255, 0.8)',
              animation: `float-dust ${Math.random() * 20 + 15}s linear infinite ${Math.random() * 10}s`
            }}
          />
        ))}
      </div>
      
      {/* Floating leaves (like in "Totoro" or "Princess Mononoke") */}
      <div className="floating-leaves">
        {Array(8).fill(0).map((_, i) => (
          <div 
            key={`leaf-${i}`} 
            className="leaf absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.5 + Math.random() * 0.3,
              transform: `rotate(${Math.random() * 360}deg) scale(${0.6 + Math.random() * 0.4})`,
              animation: `float-leaf ${Math.random() * 25 + 15}s ease-in-out infinite ${Math.random() * 15}s`
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 21.5C17.2467 21.5 21.5 17.2467 21.5 12C21.5 6.75329 17.2467 2.5 12 2.5C6.75329 2.5 2.5 6.75329 2.5 12C2.5 17.2467 6.75329 21.5 12 21.5ZM12 21.5C15 18.5 16 15 16 12C16 9 15 5.5 12 2.5C9 5.5 8 9 8 12C8 15 9 18.5 12 21.5Z" fill="#76A065" fillOpacity="0.6" stroke="#76A065" strokeOpacity="0.8" strokeWidth="0.5" />
            </svg>
          </div>
        ))}
      </div>
      
      {/* Tiny soot sprites (like in "Spirited Away") */}
      <div className="soot-sprites">
        {Array(6).fill(0).map((_, i) => (
          <div 
            key={`soot-${i}`} 
            className="soot absolute"
            style={{
              left: `${Math.random() * 100}%`,
              bottom: `-20px`,
              opacity: 0.7,
              animation: `float-soot ${Math.random() * 15 + 20}s ease-in-out infinite ${Math.random() * 5}s`
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="soot-sprite">
              <circle cx="10" cy="10" r="8" fill="black" fillOpacity="0.3" />
              <circle cx="7" cy="8" r="1" fill="white" fillOpacity="0.4" />
              <circle cx="12" cy="8" r="1" fill="white" fillOpacity="0.4" />
            </svg>
          </div>
        ))}
      </div>

      {/* Animated Butterflies (Ghibli inspired) */}
      <div className="butterflies">
        {Array(9).fill(0).map((_, i) => (
          <div 
            key={`butterfly-${i}`} 
            className="butterfly absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              transform: `scale(${0.4 + Math.random() * 0.4})`,
              animation: `flutter-path ${Math.random() * 30 + 20}s ease-in-out infinite ${Math.random() * 10}s`
            }}
          >
            <div className="butterfly-inner" style={{ animation: `flutter-wings 0.3s ease-in-out infinite alternate` }}>
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
        ))}
      </div>

      {/* Add Ghibli-style CSS keyframe animations */}
      <style>
        {`
          @keyframes float-dust {
            0% { transform: translateY(0) translateX(0); opacity: 0.2; }
            25% { transform: translateY(-20px) translateX(10px); opacity: 0.6; }
            50% { transform: translateY(-40px) translateX(-10px); opacity: 0.4; }
            75% { transform: translateY(-60px) translateX(15px); opacity: 0.6; }
            100% { transform: translateY(-100px) translateX(0); opacity: 0.2; }
          }
          
          @keyframes float-leaf {
            0% { transform: rotate(0deg) translateY(0) translateX(0); }
            33% { transform: rotate(120deg) translateY(-30px) translateX(30px); }
            66% { transform: rotate(240deg) translateY(20px) translateX(-20px); }
            100% { transform: rotate(360deg) translateY(0) translateX(0); }
          }
          
          @keyframes float-soot {
            0% { transform: translateY(0); }
            50% { transform: translateY(-150px) translateX(${Math.random() * 100 - 50}px); }
            100% { transform: translateY(-300px) translateX(${Math.random() * 100 - 50}px); }
          }
          
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
          
          .soot-sprite {
            animation: bob 1s ease-in-out infinite alternate;
          }
          
          @keyframes bob {
            from { transform: translateY(0); }
            to { transform: translateY(-3px); }
          }
        `}
      </style>
    </div>
  );
};

export default GhibliAnimations;
