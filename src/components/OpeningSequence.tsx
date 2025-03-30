import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sun, Cloud } from 'lucide-react';

const OpeningSequence: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [showLogo, setShowLogo] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  
  useEffect(() => {
    // First show the logo after a short delay
    const logoTimer = setTimeout(() => {
      setShowLogo(true);
    }, 1000);
    
    // Then start fading out after animation completes
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 5000);
    
    // Finally call onComplete when done
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 6000);
    
    return () => {
      clearTimeout(logoTimer);
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <motion.div 
      className="fixed inset-0 bg-gradient-to-b from-[#87CEEB] to-[#E0F7FA] flex flex-col items-center justify-center z-50"
      animate={{ opacity: fadeOut ? 0 : 1 }}
      transition={{ duration: 1 }}
    >
      <motion.div
        className="relative"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: showLogo ? 1 : 0, opacity: showLogo ? 1 : 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        {/* Floating elements (Ghibli-style) */}
        <motion.div 
          className="absolute" 
          style={{ top: -80, left: -100 }}
          animate={{ y: [0, -20, 0], x: [0, 10, 0] }} 
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        >
          <Cloud className="text-white h-16 w-16 opacity-80" />
        </motion.div>
        
        <motion.div 
          className="absolute" 
          style={{ top: -40, right: -120 }}
          animate={{ y: [0, -15, 0], x: [0, -5, 0] }} 
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 0.5 }}
        >
          <Cloud className="text-white h-12 w-12 opacity-70" />
        </motion.div>
        
        <motion.div 
          className="absolute" 
          style={{ top: -20, right: 80 }}
          animate={{ rotate: [0, 360] }} 
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
        >
          <Sun className="text-yellow-300 h-10 w-10" />
        </motion.div>
        
        {/* Main title */}
        <motion.h1 
          className="text-4xl font-bold font-funky text-center px-8 py-6 bg-white/80 rounded-lg border-2 border-black shadow-lg"
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          Creative Canvas Club
        </motion.h1>
        
        {/* Flying characters - similar to your running human */}
        <motion.div
          className="absolute bottom-[-100px]"
          animate={{ x: [-300, 300] }}
          transition={{ duration: 4, ease: "linear" }}
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
              <svg width="40" height="30" viewBox="0 0 24 24" className="running-puppy" style={{ position: 'absolute', left: '-25px', top: '35px' }}>
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
    </motion.div>
  );
};

export default OpeningSequence;
