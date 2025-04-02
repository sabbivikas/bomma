
import React from 'react';
import Navbar from '@/components/Navbar';
import StoryCreator from '@/components/StoryCreator';
import Cloud from '@/components/Cloud';
import GhibliAnimations from '@/components/GhibliAnimations';

const CreateStory = () => {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#E0F7FA] via-[#B3E5FC] to-[#D1C4E9] opacity-70 z-0"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.8),transparent_70%)] z-0"></div>
      <GhibliAnimations />
      <Cloud />
      
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 relative z-10">
        <StoryCreator />
      </main>
    </div>
  );
};

export default CreateStory;
