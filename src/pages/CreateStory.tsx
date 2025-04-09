
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
        
        <main className="flex-1 container mx-auto px-3 md:px-4 py-4 relative z-10 pb-16">
          <div className="bg-gradient-to-b from-purple-50/80 to-blue-50/80 rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 backdrop-blur-sm">
            <StoryCreator />
          </div>
        </main>
      </div>
    </ThemedBackground>
  );
};

export default CreateStory;
