
import React from 'react';

const GhibliAnimations: React.FC = () => {
  return (
    <div className="ghibli-animations fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Floating dust particles (like in "My Neighbor Totoro" and "Spirited Away") */}
      <div className="dust-particles">
        {Array(20).fill(0).map((_, i) => (
          <div 
            key={`dust-${i}`} 
            className="dust-particle absolute rounded-full bg-black/5"
            style={{
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float-dust ${Math.random() * 15 + 10}s linear infinite ${Math.random() * 10}s`
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
              opacity: 0.6,
              transform: `rotate(${Math.random() * 360}deg)`,
              animation: `float-leaf ${Math.random() * 20 + 20}s ease-in-out infinite ${Math.random() * 10}s`
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 21.5C17.5 21.5 21.5 17.5 21.5 12C21.5 6.5 17.5 2.5 12 2.5C6.5 2.5 2.5 6.5 2.5 12C2.5 17.5 6.5 21.5 12 21.5Z" fill="none" stroke="black" strokeOpacity="0.15" strokeWidth="1" />
              <path d="M12 21.5C15 18.5 16 15 16 12C16 9 15 5.5 12 2.5C9 5.5 8 9 8 12C8 15 9 18.5 12 21.5Z" fill="none" stroke="black" strokeOpacity="0.15" strokeWidth="1" />
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
              opacity: 0.6,
              animation: `float-soot ${Math.random() * 10 + 15}s ease-in-out infinite ${Math.random() * 5}s`
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="8" fill="black" fillOpacity="0.1" />
              <circle cx="7" cy="8" r="1" fill="black" fillOpacity="0.2" />
              <circle cx="12" cy="8" r="1" fill="black" fillOpacity="0.2" />
            </svg>
          </div>
        ))}
      </div>

      {/* Cute Butterflies (like in "The Secret World of Arrietty") */}
      <div className="butterflies">
        {Array(7).fill(0).map((_, i) => (
          <div 
            key={`butterfly-${i}`} 
            className="butterfly absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              transform: `scale(${0.6 + Math.random() * 0.4})`,
              animation: `flutter ${Math.random() * 10 + 15}s ease-in-out infinite ${Math.random() * 5}s`
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="butterfly-wings">
              {/* Left wing */}
              <path 
                d="M12 12C8 8 5 8 3 10C1 12 1 15 3 17C5 19 8 18 12 12Z" 
                fill="none" 
                stroke="black" 
                strokeOpacity="0.2" 
                strokeWidth="1" 
              />
              {/* Right wing */}
              <path 
                d="M12 12C16 8 19 8 21 10C23 12 23 15 21 17C19 19 16 18 12 12Z" 
                fill="none" 
                stroke="black" 
                strokeOpacity="0.2" 
                strokeWidth="1" 
              />
              {/* Body */}
              <path 
                d="M12 6C12 6 12 18 12 18" 
                stroke="black" 
                strokeOpacity="0.3" 
                strokeWidth="1" 
              />
              {/* Antennas */}
              <path 
                d="M12 6C11 4 10 3 9 3M12 6C13 4 14 3 15 3" 
                stroke="black" 
                strokeOpacity="0.3" 
                strokeWidth="1" 
              />
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GhibliAnimations;
