
import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import StoryCreator from '@/components/StoryCreator';
import ThemedBackground from '@/components/ThemedBackground';

const CreateStory = () => {
  useEffect(() => {
    // Update the page title when this component mounts
    document.title = "Bomma | Create Story";
    
    // Restore the original title when component unmounts
    return () => {
      document.title = "Bomma";
    };
  }, []);

  return (
    <ThemedBackground>
      <div className="min-h-screen flex flex-col relative">
        <Navbar />
        
        <main className="flex-1 container mx-auto px-4 py-6 relative z-10 pb-20 max-w-5xl">
          <StoryCreator />
        </main>
      </div>
    </ThemedBackground>
  );
};

export default CreateStory;
