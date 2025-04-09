
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
        
        <main className="flex-1 container mx-auto px-2 md:px-4 py-4 relative z-10 pb-16 max-w-6xl">
          <div className="bg-gradient-to-b from-purple-50/90 to-blue-50/90 rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 backdrop-blur-sm">
            <AnimationCreator />
          </div>
        </main>
      </div>
    </ThemedBackground>
  );
};

export default CreateAnimation;
