
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sun, Cloud, Star } from 'lucide-react';
import { Button } from './ui/button';

const OpeningSequence: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [stage, setStage] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  
  useEffect(() => {
    // Sequence stages with subtle timing
    const stageTimers = [
      setTimeout(() => setStage(1), 1000),  // Background elements fade in
      setTimeout(() => setStage(2), 2000),  // Title appears
      setTimeout(() => setStage(3), 4500),  // Subtitle appears
    ];
    
    return () => {
      stageTimers.forEach(clearTimeout);
    };
  }, [onComplete]);

  const handleEnterClick = () => {
    setFadeOut(true);
    setTimeout(() => onComplete(), 1000);
  };

  return (
    <motion.div 
      className="fixed inset-0 flex flex-col items-center justify-center z-50 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: fadeOut ? 0 : 1 }}
      transition={{ duration: fadeOut ? 1 : 1.5, ease: "easeInOut" }}
      style={{
        background: "linear-gradient(to bottom, #E0F7FA, #B3E5FC)",
      }}
    >
      {/* Background elements - more subtle and elegant */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Clouds */}
        {[...Array(5)].map((_, i) => (
          <motion.div 
            key={`cloud-${i}`}
            className="absolute"
            style={{
              top: `${10 + Math.random() * 40}%`, 
              left: `${Math.random() * 100}%`,
              opacity: 0.8,
              scale: 0.7 + Math.random() * 0.6
            }}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: stage >= 1 ? 0.8 : 0,
              x: [0, 10, 0],
              y: [0, Math.random() * 5, 0]
            }}
            transition={{
              opacity: { duration: 2 },
              x: { repeat: Infinity, duration: 20 + i * 10, ease: "easeInOut" },
              y: { repeat: Infinity, duration: 15 + i * 5, ease: "easeInOut" }
            }}
          >
            <Cloud className="text-white h-16 w-16" strokeWidth={1} />
          </motion.div>
        ))}

        {/* Sun */}
        <motion.div 
          className="absolute top-[15%] right-[20%]"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: stage >= 1 ? 1 : 0,
            y: [0, -5, 0]
          }}
          transition={{
            opacity: { duration: 2 },
            y: { repeat: Infinity, duration: 10, ease: "easeInOut" }
          }}
        >
          <Sun className="text-yellow-300 h-14 w-14" strokeWidth={1} />
        </motion.div>

        {/* Stars - subtle twinkling */}
        {[...Array(12)].map((_, i) => (
          <motion.div 
            key={`star-${i}`}
            className="absolute"
            style={{ 
              top: `${5 + Math.random() * 30}%`, 
              left: `${Math.random() * 100}%`
            }}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: stage >= 1 ? [0.1, 0.5, 0.1] : 0,
              scale: [0.8, 1.1, 0.8]
            }}
            transition={{
              opacity: { duration: 2, delay: i * 0.1 },
              scale: { repeat: Infinity, duration: 3 + Math.random() * 2, ease: "easeInOut" }
            }}
          >
            <Star className="text-yellow-100 h-3 w-3" fill="#FFFBE9" strokeWidth={1} />
          </motion.div>
        ))}
      </div>

      {/* Content container */}
      <div className="z-10 text-center px-4">
        {/* Title with elegant animation */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: stage >= 2 ? 1 : 0,
            y: stage >= 2 ? 0 : 20
          }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <motion.div 
            className="bg-white bg-opacity-90 backdrop-blur-sm border border-black px-12 py-6 rounded-lg shadow-lg"
            animate={{ y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          >
            <h1 
              className="text-5xl font-elegant tracking-tight"
              style={{
                textShadow: "1px 1px 2px rgba(0,0,0,0.1)"
              }}
            >
              Make Something Wonderful
            </h1>
          </motion.div>
        </motion.div>
        
        {/* Subtitle with fade in */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: stage >= 3 ? 1 : 0
          }}
          transition={{ duration: 1.5, delay: 0.5 }}
        >
          <p
            className="text-xl font-elegant text-black/80 bg-white/70 backdrop-blur-sm px-8 py-4 rounded-lg inline-block"
          >
            A world of imagination awaits
          </p>
        </motion.div>

        {/* Enter button */}
        <motion.div
          className="mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: stage >= 3 ? 1 : 0,
            y: stage >= 3 ? 0 : 20
          }}
          transition={{ duration: 1, delay: 1 }}
        >
          <Button 
            onClick={handleEnterClick}
            className="bg-black hover:bg-black/80 text-white px-8 py-6 rounded-full text-lg font-elegant"
          >
            Enter
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default OpeningSequence;
