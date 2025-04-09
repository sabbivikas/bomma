
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
        
        <main className="flex-1 container mx-auto px-0 sm:px-2 relative z-10 pb-8 w-full">
          <div className="bg-gradient-to-b from-purple-50/90 to-blue-50/90 rounded-lg p-2 sm:p-3 shadow-sm border border-gray-100 backdrop-blur-sm">
            <StoryCreator />
          </div>
        </main>
      </div>
    </ThemedBackground>
  );
};

export default CreateStory;
