
import React, { useEffect } from 'react';
import Cloud from '@/components/Cloud';
import GhibliAnimations from '@/components/GhibliAnimations';
import { useIsMobile } from '@/hooks/use-mobile';

const DreamyEffects = () => {
  const isMobile = useIsMobile();
  
  useEffect(() => {
    // Only add particles if not on mobile to avoid performance issues
    if (isMobile) return;
    
    const createDreamyDustParticles = () => {
      const container = document.querySelector('.create-page-container');
      if (!container) return;
      
      // Create dust particles
      for (let i = 0; i < 15; i++) {
        const dust = document.createElement('div');
        dust.className = 'dreamy-dust';
        
        // Random positioning
        dust.style.left = `${Math.random() * 100}%`;
        dust.style.top = `${Math.random() * 100}%`;
        dust.style.opacity = `${0.4 + Math.random() * 0.5}`;
        dust.style.width = `${3 + Math.random() * 4}px`;
        dust.style.height = dust.style.width;
        
        // Random animation duration and delay
        dust.style.animationDuration = `${5 + Math.random() * 10}s`;
        dust.style.animationDelay = `${Math.random() * 5}s`;
        
        container.appendChild(dust);
      }
      
      // Add floating sparkles
      for (let i = 0; i < 8; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'ghibli-sparkle';
        
        // Random positioning
        sparkle.style.left = `${Math.random() * 100}%`;
        sparkle.style.top = `${Math.random() * 100}%`;
        sparkle.style.opacity = `${0.3 + Math.random() * 0.3}`;
        
        // Random size
        const size = 4 + Math.random() * 8;
        sparkle.style.width = `${size}px`;
        sparkle.style.height = `${size}px`;
        
        // Animation
        sparkle.style.animationDuration = `${3 + Math.random() * 7}s`;
        sparkle.style.animationDelay = `${Math.random() * 5}s`;
        
        container.appendChild(sparkle);
      }
    };
    
    createDreamyDustParticles();
    
    return () => {
      const dusts = document.querySelectorAll('.dreamy-dust, .ghibli-sparkle');
      dusts.forEach(dust => dust.remove());
    };
  }, [isMobile]);
  
  if (isMobile) return null;
  
  return (
    <>
      <GhibliAnimations />
      <Cloud />
    </>
  );
};

export default DreamyEffects;
