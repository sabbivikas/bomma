
import { useState, useEffect } from 'react';

// Helper function to detect if the device is an iPad
export const useIsIpad = () => {
  const [isIpad, setIsIpad] = useState(false);

  useEffect(() => {
    const checkIsIpad = () => {
      // Check for iPad specifically
      const isIpadOS = navigator.userAgent.match(/iPad/i) !== null ||
        (navigator.userAgent.match(/Mac/i) !== null && navigator.maxTouchPoints > 0);
      
      // Also check for typical iPad dimensions - width between 750px and 1024px
      const isIpadSize = window.innerWidth >= 750 && window.innerWidth <= 1024;
      
      setIsIpad(isIpadOS || isIpadSize);
    };

    checkIsIpad();
    window.addEventListener('resize', checkIsIpad);
    return () => window.removeEventListener('resize', checkIsIpad);
  }, []);

  return isIpad;
};
