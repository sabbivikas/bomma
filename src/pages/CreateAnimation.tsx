
import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import AnimationCreator from '@/components/AnimationCreator';
import ThemedBackground from '@/components/ThemedBackground';

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
    <ThemedBackground>
      <div className="min-h-screen flex flex-col relative">
        <Navbar />
        
        <main className="flex-1 w-full relative z-10 pb-2">
          <div className="bg-gradient-to-b from-purple-50/90 to-blue-50/90 rounded-none md:rounded-lg shadow-sm border border-gray-100 backdrop-blur-sm">
            <AnimationCreator />
          </div>
        </main>
      </div>
    </ThemedBackground>
  );
};

export default CreateAnimation;
