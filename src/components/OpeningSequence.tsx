
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sun, Cloud, Wind, Star, TreeDeciduous, Mountain } from 'lucide-react';

const OpeningSequence: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [stage, setStage] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  
  useEffect(() => {
    // Sequence stages
    const stageTimers = [
      setTimeout(() => setStage(1), 1000),  // Nature elements appear
      setTimeout(() => setStage(2), 3000),  // Title appears
      setTimeout(() => setStage(3), 5000),  // Characters appear
      setTimeout(() => setStage(4), 8000),  // Begin fade out
      setTimeout(() => onComplete(), 9500)  // Complete sequence
    ];
    
    return () => {
      stageTimers.forEach(clearTimeout);
    };
  }, [onComplete]);

  // Begin fade out on stage 4
  useEffect(() => {
    if (stage === 4) {
      setFadeOut(true);
    }
  }, [stage]);

  return (
    <motion.div 
      className="fixed inset-0 bg-gradient-to-b from-[#87CEEB] via-[#C4E0F9] to-[#E0F7FA] flex flex-col items-center justify-center z-50 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: fadeOut ? 0 : 1 }}
      transition={{ duration: fadeOut ? 1.5 : 2 }}
    >
      {/* Sky elements */}
      <motion.div 
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: stage >= 1 ? 1 : 0 }}
        transition={{ duration: 2 }}
      >
        {/* Sun */}
        <motion.div 
          className="absolute top-[15%] right-[20%]"
          animate={{ 
            rotate: [0, 360],
            y: [0, -10, 0] 
          }} 
          transition={{ 
            rotate: { repeat: Infinity, duration: 60, ease: "linear" },
            y: { repeat: Infinity, duration: 8, ease: "easeInOut" }
          }}
        >
          <Sun className="text-yellow-300 h-16 w-16" strokeWidth={1} />
        </motion.div>
        
        {/* Clouds */}
        {[...Array(5)].map((_, i) => (
          <motion.div 
            key={`cloud-${i}`}
            className="absolute"
            style={{ 
              top: `${10 + Math.random() * 30}%`, 
              left: `${-10 + Math.random() * 110}%`,
              opacity: 0.8 - (i * 0.1),
              scale: 0.7 + (Math.random() * 0.6)
            }}
            animate={{ 
              x: [0, 100, 0], 
              y: [0, Math.random() * 10, 0]
            }}
            transition={{ 
              x: { repeat: Infinity, duration: 20 + i * 10, ease: "easeInOut" },
              y: { repeat: Infinity, duration: 10 + i * 5, ease: "easeInOut" }
            }}
          >
            <Cloud className="text-white h-12 w-12" strokeWidth={1} />
          </motion.div>
        ))}
        
        {/* Stars twinkling in background */}
        {[...Array(12)].map((_, i) => (
          <motion.div 
            key={`star-${i}`}
            className="absolute"
            style={{ 
              top: `${5 + Math.random() * 40}%`, 
              left: `${Math.random() * 100}%`,
              opacity: 0.4
            }}
            animate={{ 
              opacity: [0.2, 0.8, 0.2],
              scale: [0.8, 1.2, 0.8]
            }}
            transition={{ 
              repeat: Infinity,
              duration: 2 + Math.random() * 3,
              ease: "easeInOut"
            }}
          >
            <Star className="text-yellow-100 h-3 w-3" fill="#FFFBE9" strokeWidth={1} />
          </motion.div>
        ))}
      </motion.div>
      
      {/* Landscape elements */}
      <motion.div 
        className="absolute bottom-0 w-full h-[30%] pointer-events-none"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: stage >= 1 ? 1 : 0, y: stage >= 1 ? 0 : 50 }}
        transition={{ duration: 2, delay: 0.5 }}
      >
        {/* Mountains in background */}
        <div className="absolute bottom-[30%] w-full">
          <motion.div className="absolute left-[10%]" style={{ opacity: 0.7 }}>
            <Mountain className="text-blue-900 h-24 w-24" strokeWidth={1}/>
          </motion.div>
          <motion.div className="absolute left-[30%]" style={{ opacity: 0.5 }}>
            <Mountain className="text-blue-800 h-32 w-32" strokeWidth={1}/>
          </motion.div>
          <motion.div className="absolute left-[60%]" style={{ opacity: 0.6 }}>
            <Mountain className="text-blue-900 h-28 w-28" strokeWidth={1}/>
          </motion.div>
        </div>
        
        {/* Trees */}
        {[...Array(8)].map((_, i) => (
          <motion.div 
            key={`tree-${i}`}
            className="absolute bottom-[2%]"
            style={{ 
              left: `${5 + (i * 12)}%`,
              opacity: 0.8,
              scale: 0.6 + (Math.random() * 0.5)
            }}
            animate={{ 
              y: [0, -3, 0]
            }}
            transition={{ 
              repeat: Infinity,
              duration: 2 + Math.random() * 2,
              ease: "easeInOut"
            }}
          >
            <TreeDeciduous className="text-green-800 h-16 w-16" strokeWidth={1}/>
          </motion.div>
        ))}
        
        {/* Gentle winds */}
        {[...Array(4)].map((_, i) => (
          <motion.div 
            key={`wind-${i}`}
            className="absolute"
            style={{ 
              bottom: `${10 + Math.random() * 20}%`, 
              left: `${-20 + Math.random() * 140}%`,
              opacity: 0.5
            }}
            animate={{ 
              x: [-50, 50],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{ 
              repeat: Infinity,
              duration: 8 + Math.random() * 4,
              ease: "easeInOut"
            }}
          >
            <Wind className="text-blue-100 h-8 w-8" strokeWidth={1}/>
          </motion.div>
        ))}
      </motion.div>
      
      {/* Main title */}
      <motion.div
        className="z-10 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: stage >= 2 ? 1 : 0,
          y: stage >= 2 ? 0 : 20
        }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <motion.h1 
          className="text-5xl font-bold font-funky text-center px-10 py-6 bg-white/70 backdrop-blur-sm rounded-lg border-2 border-black shadow-lg"
          style={{
            fontFamily: "'Comic Sans MS', cursive, sans-serif",
            textShadow: "1px 1px 3px rgba(0,0,0,0.2)"
          }}
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        >
          Make Something Wonderful
        </motion.h1>
        
        <motion.p
          className="mt-4 text-xl font-funky text-center text-black/80 bg-white/50 backdrop-blur-sm px-6 py-2 rounded-lg inline-block"
          style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: stage >= 2 ? 1 : 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
        >
          A world of imagination awaits
        </motion.p>
      </motion.div>
      
      {/* Characters */}
      <motion.div
        className="absolute bottom-[5%] left-[-20%]"
        initial={{ x: -100, opacity: 0 }}
        animate={{ 
          x: stage >= 3 ? [0, 300] : -100,
          opacity: stage >= 3 ? 1 : 0
        }}
        transition={{ 
          x: { duration: 6, ease: "linear" },
          opacity: { duration: 1 }
        }}
      >
        <div className="scale-75">
          <div className="running-human-container" style={{ animation: 'none' }}>
            <svg width="60" height="80" viewBox="0 0 24 24" className="running-human">
              {/* Human */}
              <circle cx="12" cy="6" r="2.5" fill="#222222" />
              <path d="M12 8.5L12 14" stroke="#222222" strokeWidth="2" strokeLinecap="round" />
              <path className="arm-front" d="M12 10L15 7" stroke="#222222" strokeWidth="2" strokeLinecap="round" />
              <path className="arm-back" d="M12 10L9 13" stroke="#222222" strokeWidth="2" strokeLinecap="round" />
              <path className="leg-front" d="M12 14L15 17" stroke="#222222" strokeWidth="2" strokeLinecap="round" />
              <path className="leg-back" d="M12 14L9 17" stroke="#222222" strokeWidth="2" strokeLinecap="round" />
            </svg>
            
            <svg width="40" height="30" viewBox="0 0 24 24" className="running-puppy" style={{ position: 'absolute', left: '-45px', top: '35px' }}>
              {/* Dog head - side profile facing right */}
              <circle cx="16" cy="10" r="3" fill="#000000" />
              
              {/* Dog ear */}
              <path d="M16 7L15 5" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />
              
              {/* Dog snout */}
              <path d="M19 10L21 10.5" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />
              
              {/* Dog body - side profile */}
              <ellipse cx="11" cy="12" rx="5" ry="2.5" fill="#000000" />
              
              {/* Dog front leg */}
              <path className="dog-front-leg" d="M14 14L15 17" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />
              
              {/* Dog back leg */}
              <path className="dog-back-leg" d="M8 14L7 17" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />
              
              {/* Dog tail */}
              <path className="dog-tail" d="M6 11L4 10" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default OpeningSequence;
