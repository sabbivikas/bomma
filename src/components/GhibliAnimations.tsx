
import React from 'react';

const GhibliAnimations = () => {
  // Generate random animation delays
  const getRandomDelay = () => Math.random() * 10;
  const getRandomDuration = (min: number, max: number) => min + Math.random() * (max - min);

  // Create dust particles
  const dustParticles = Array.from({ length: 15 }, (_, i) => ({
    id: `dust-${i}`,
    delay: getRandomDelay(),
    duration: getRandomDuration(8, 15),
    size: 2 + Math.random() * 4,
    left: `${Math.random() * 100}%`,
    opacity: 0.4 + Math.random() * 0.4,
  }));

  // Create leaf particles
  const leaves = Array.from({ length: 5 }, (_, i) => ({
    id: `leaf-${i}`,
    delay: getRandomDelay(),
    duration: getRandomDuration(15, 25),
    size: 8 + Math.random() * 6,
    left: `${Math.random() * 100}%`,
  }));

  // Create soot sprites
  const sootSprites = Array.from({ length: 6 }, (_, i) => ({
    id: `soot-${i}`,
    delay: getRandomDelay(),
    duration: getRandomDuration(12, 18),
    size: 6 + Math.random() * 4,
    left: `${10 + Math.random() * 80}%`,
  }));

  // Create butterflies
  const butterflies = Array.from({ length: 3 }, (_, i) => ({
    id: `butterfly-${i}`,
    delay: getRandomDelay(),
    duration: getRandomDuration(20, 30),
    size: 12 + Math.random() * 8,
    startPosition: `${Math.random() * 30}%`,
  }));

  return (
    <div className="ghibli-animations fixed inset-0 pointer-events-none overflow-hidden">
      {/* Dust particles */}
      {dustParticles.map((particle) => (
        <div
          key={particle.id}
          className="absolute bottom-0"
          style={{
            left: particle.left,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '50%',
            animation: `float-dust ${particle.duration}s linear infinite`,
            animationDelay: `${particle.delay}s`,
            opacity: particle.opacity,
          }}
        ></div>
      ))}

      {/* Leaves */}
      {leaves.map((leaf) => (
        <div
          key={leaf.id}
          className="absolute bottom-0"
          style={{
            left: leaf.left,
            animation: `float-leaf ${leaf.duration}s linear infinite`,
            animationDelay: `${leaf.delay}s`,
            zIndex: 2,
          }}
        >
          <svg
            width={leaf.size}
            height={leaf.size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z"
              fill="#4CAF50"
              fillOpacity="0.4"
            />
            <path d="M12 12L12 6" stroke="#4CAF50" strokeOpacity="0.7" strokeWidth="2" />
          </svg>
        </div>
      ))}

      {/* Soot sprites */}
      {sootSprites.map((sprite) => (
        <div
          key={sprite.id}
          className="absolute bottom-0"
          style={{
            left: sprite.left,
            width: `${sprite.size}px`,
            height: `${sprite.size}px`,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            borderRadius: '50%',
            animation: `float-soot ${sprite.duration}s linear infinite`,
            animationDelay: `${sprite.delay}s`,
            zIndex: 3,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '20%',
              left: '15%',
              width: '30%',
              height: '30%',
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
              borderRadius: '50%',
            }}
          ></div>
          <div
            style={{
              position: 'absolute',
              top: '20%',
              right: '15%',
              width: '30%',
              height: '30%',
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
              borderRadius: '50%',
            }}
          ></div>
        </div>
      ))}

      {/* Butterflies */}
      {butterflies.map((butterfly) => (
        <div
          key={butterfly.id}
          className="absolute bottom-10"
          style={{
            left: butterfly.startPosition,
            animation: `flutter ${butterfly.duration}s linear infinite`,
            animationDelay: `${butterfly.delay}s`,
            zIndex: 4,
          }}
        >
          <div className="butterfly-wings">
            <svg
              width={butterfly.size}
              height={butterfly.size * 0.8}
              viewBox="0 0 24 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 9C12 9 8 5 2 5C2 5 4 13 12 9Z"
                fill="#FF9D9D"
                fillOpacity="0.7"
              />
              <path
                d="M12 9C12 9 16 5 22 5C22 5 20 13 12 9Z"
                fill="#FF9D9D"
                fillOpacity="0.7"
              />
              <path d="M12 2L12 16" stroke="#333" strokeOpacity="0.6" strokeWidth="0.5" />
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GhibliAnimations;
