import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sun, Cloud, Star, Palette, Brush, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import WritingHuman from './WritingHuman';

const OpeningSequence: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [stage, setStage] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  
  useEffect(() => {
    // Sequence stages with artistic timing
    const stageTimers = [
      setTimeout(() => setStage(1), 800),  // Background elements fade in
      setTimeout(() => setStage(2), 1600),  // Title appears
      setTimeout(() => setStage(3), 2400),  // Subtitle appears
      setTimeout(() => setStage(4), 3200),  // Art elements appear
    ];
    
    return () => {
      stageTimers.forEach(clearTimeout);
    };
  }, []);

  const handleEnterClick = () => {
    setFadeOut(true);
    setTimeout(() => {
      onComplete();
    }, 1000);
  };

  // Random brush stroke colors
  const brushColors = ['#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', '#118AB2'];

  return (
    <motion.div 
      className="fixed inset-0 flex flex-col items-center justify-center z-50 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: fadeOut ? 0 : 1 }}
      transition={{ duration: fadeOut ? 1 : 1.5, ease: "easeInOut" }}
      style={{
        background: "linear-gradient(120deg, #E0F7FA, #B3E5FC, #BBDEFB, #D1C4E9)"
      }}
    >
      {/* Abstract background elements - artistic inspiration */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Dynamic paint splatter/brush stroke elements */}
        {[...Array(8)].map((_, i) => (
          <motion.div 
            key={`brush-${i}`}
            className="absolute"
            style={{
              top: `${5 + Math.random() * 90}%`, 
              left: `${Math.random() * 100}%`,
              width: `${50 + Math.random() * 100}px`,
              height: `${40 + Math.random() * 60}px`,
              background: brushColors[Math.floor(Math.random() * brushColors.length)],
              borderRadius: '50%',
              filter: 'blur(40px)',
              opacity: 0.2 + Math.random() * 0.2,
              zIndex: 5
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: stage >= 1 ? 1 : 0,
              opacity: stage >= 1 ? 0.2 + Math.random() * 0.2 : 0,
              x: [0, Math.random() * 10 - 5],
              y: [0, Math.random() * 10 - 5]
            }}
            transition={{
              scale: { duration: 2 + i * 0.5, ease: "easeOut" },
              opacity: { duration: 2.5 + i * 0.3 },
              x: { repeat: Infinity, duration: 20 + i * 5, repeatType: "reverse", ease: "easeInOut" },
              y: { repeat: Infinity, duration: 15 + i * 4, repeatType: "reverse", ease: "easeInOut" }
            }}
          />
        ))}
        
        {/* Glowing particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div 
            key={`particle-${i}`}
            className="absolute rounded-full"
            style={{
              top: `${Math.random() * 100}%`, 
              left: `${Math.random() * 100}%`,
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
              background: 'white',
              boxShadow: '0 0 5px #fff, 0 0 10px #fff',
              opacity: 0.6 + Math.random() * 0.4
            }}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: stage >= 1 ? [0.3, 0.8, 0.3] : 0,
            }}
            transition={{
              opacity: { 
                duration: 2 + Math.random() * 4, 
                repeat: Infinity,
                ease: "easeInOut" 
              }
            }}
          />
        ))}

        {/* Artist tools floating */}
        <motion.div 
          className="absolute top-[15%] right-[25%]"
          initial={{ opacity: 0, y: -20 }}
          animate={{ 
            opacity: stage >= 4 ? 1 : 0,
            y: stage >= 4 ? [0, -5, 0] : -20,
            rotate: [0, 5, 0, -5, 0]
          }}
          transition={{
            opacity: { duration: 1 },
            y: { repeat: Infinity, duration: 5, ease: "easeInOut" },
            rotate: { repeat: Infinity, duration: 10, ease: "easeInOut" }
          }}
        >
          <Palette className="text-pink-300 h-12 w-12" strokeWidth={1} />
        </motion.div>

        <motion.div 
          className="absolute bottom-[20%] left-[20%]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: stage >= 4 ? 1 : 0,
            y: stage >= 4 ? [0, 5, 0] : 20,
            rotate: [0, -8, 0, 8, 0]
          }}
          transition={{
            opacity: { duration: 1.2, delay: 0.3 },
            y: { repeat: Infinity, duration: 6, ease: "easeInOut" },
            rotate: { repeat: Infinity, duration: 12, ease: "easeInOut" }
          }}
        >
          <Brush className="text-indigo-400 h-10 w-10" strokeWidth={1} />
        </motion.div>

        <motion.div 
          className="absolute top-[35%] left-[15%]"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: stage >= 4 ? 1 : 0,
            scale: stage >= 4 ? [0.9, 1.1, 0.9] : 0.8,
          }}
          transition={{
            opacity: { duration: 1.4, delay: 0.6 },
            scale: { repeat: Infinity, duration: 4, ease: "easeInOut" }
          }}
        >
          <Sparkles className="text-amber-300 h-8 w-8" strokeWidth={1} />
        </motion.div>
      </div>

      {/* Content container - keeping these free floating */}
      <div className="z-10 text-center px-4 relative">
        {/* Title with artistic animation - now outside of box */}
        <motion.h1
          className="text-6xl font-elegant tracking-tight mb-6 text-black relative"
          initial={{ opacity: 0, y: 20, letterSpacing: '10px' }}
          animate={{ 
            opacity: stage >= 2 ? 1 : 0,
            y: stage >= 2 ? 0 : 20,
            letterSpacing: stage >= 2 ? '0px' : '10px'
          }}
          transition={{ duration: 1.8, ease: "easeOut" }}
          style={{
            textShadow: "2px 2px 4px rgba(0,0,0,0.1)"
          }}
        >
          Bomma
          <span className="relative inline-block">
            <WritingHuman className="absolute -top-10 -left-2" />
          </span>
        </motion.h1>
        
        {/* Subtitle with creative fade in - outside of box */}
        <motion.p
          className="text-2xl font-elegant text-black/80 mb-16"
          initial={{ opacity: 0, y: 15 }}
          animate={{ 
            opacity: stage >= 3 ? 1 : 0,
            y: stage >= 3 ? 0 : 15
          }}
          transition={{ duration: 1.5, delay: 0.3 }}
        >
          A world of imagination awaits
        </motion.p>

        {/* Creative Enter button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: stage >= 3 ? 1 : 0,
            y: stage >= 3 ? 0 : 20
          }}
          transition={{ duration: 1, delay: 0.6 }}
          className="relative"
        >
          {/* Canvas-like container with paint strokes */}
          <motion.div 
            className="relative w-48 h-48 mx-auto"
            animate={{ 
              rotate: [0, 2, 0, -2, 0]
            }}
            transition={{ 
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut" 
            }}
          >
            {/* Paint strokes around button */}
            {[...Array(5)].map((_, i) => (
              <motion.div 
                key={`stroke-${i}`}
                className="absolute rounded-full opacity-50"
                style={{
                  top: `${50 + (Math.cos(i * 72 * Math.PI / 180) * 35)}%`,
                  left: `${50 + (Math.sin(i * 72 * Math.PI / 180) * 35)}%`,
                  width: `${20 + Math.random() * 15}px`,
                  height: `${10 + Math.random() * 10}px`,
                  background: brushColors[Math.floor(Math.random() * brushColors.length)],
                  transform: `rotate(${i * 72}deg)`
                }}
                initial={{ scale: 0 }}
                animate={{ 
                  scale: stage >= 4 ? [0.9, 1.1, 0.9] : 0,
                }}
                transition={{
                  scale: { 
                    delay: 0.1 * i,
                    duration: 4 + i * 0.5,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut"
                  }
                }}
              />
            ))}

            {/* The Enter button itself */}
            <motion.button
              onClick={handleEnterClick}
              className="relative bg-transparent border border-black/10 rounded-full w-28 h-28 flex items-center justify-center overflow-hidden group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Animated gradient background */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-br from-pink-200/40 via-blue-200/40 to-purple-200/40"
                animate={{ 
                  rotate: [0, 360],
                }}
                transition={{ 
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear" 
                }}
              />
              
              {/* Inner circle with ripple effect */}
              <motion.div 
                className="relative w-24 h-24 rounded-full bg-white/90 flex flex-col items-center justify-center z-10 overflow-hidden"
                whileHover={{
                  boxShadow: "0px 0px 15px rgba(255,255,255,0.8)"
                }}
              >
                {/* Ripple effect on hover */}
                <div className="absolute inset-0 z-0 group-hover:z-10">
                  <motion.div
                    className="w-full h-full rounded-full bg-transparent"
                    initial={{ scale: 0, opacity: 0.8, backgroundImage: "radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 70%)" }}
                    whileHover={{ 
                      scale: 2.5,
                      opacity: 0,
                      transition: { duration: 1.5, repeat: Infinity }
                    }}
                  />
                </div>
                
                {/* Text and icon */}
                <span className="font-elegant text-black text-lg relative z-10">Enter</span>
                <motion.div
                  className="mt-1 relative z-10"
                  animate={{
                    x: [0, 5, 0]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <ArrowRight className="h-4 w-4 text-black/70" />
                </motion.div>
              </motion.div>
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default OpeningSequence;
