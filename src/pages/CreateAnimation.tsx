
import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import AnimationCreator from '@/components/AnimationCreator';
import Cloud from '@/components/Cloud';
import GhibliAnimations from '@/components/GhibliAnimations';

const CreateAnimation = () => {
  useEffect(() => {
    // Update the page title when this component mounts
    document.title = "Bomma | Create Animation";
    
    // Restore the original title when component unmounts
    return () => {
      document.title = "Bomma";
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#E0F7FA] via-[#B3E5FC] to-[#D1C4E9] opacity-70 z-0"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.8),transparent_70%)] z-0"></div>
      <GhibliAnimations />
      <Cloud />
      
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 relative z-10">
        <AnimationCreator />
      </main>
    </div>
  );
};

export default CreateAnimation;
