
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import DoodleFeed from '@/components/DoodleFeed';
import { Button } from '@/components/ui/button';
import { Pen, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Cloud from '@/components/Cloud';
import GhibliAnimations from '@/components/GhibliAnimations';
import OpeningSequence from '@/components/OpeningSequence';
import { useIsMobile } from '@/hooks/use-mobile';
import RunningHuman from '@/components/RunningHuman';

const Index = () => {
  const [showOpening, setShowOpening] = useState(true);
  const isMobile = useIsMobile();
  
  const handleOpeningComplete = () => {
    setShowOpening(false);
  };

  if (showOpening) {
    return <OpeningSequence onComplete={handleOpeningComplete} />;
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-50">
      <GhibliAnimations />
      <Cloud />
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-6 relative z-10">
        <div className={`mb-8 ${isMobile ? 'py-4' : 'py-12'} text-center max-w-3xl mx-auto`}>
          <h1 className={`${isMobile ? 'text-4xl' : 'text-6xl'} font-elegant mb-6 tracking-tight`}>
            Discover Wonderful Creations
          </h1>
          
          <div className="h-px bg-gray-200 my-6 w-24 mx-auto" />
          
          <p className={`${isMobile ? 'text-sm px-4' : 'text-lg px-8'} mb-8 font-elegant text-gray-600 max-w-lg mx-auto`}>
            Create your own worlds and characters, then share them with our community.
          </p>
          
          <Link to="/create" className="inline-block">
            <Button className="bg-black hover:bg-black/80 text-white font-elegant px-8 py-3 rounded-full">
              <Pen className="h-4 w-4 mr-2" />
              Create Your Design
            </Button>
          </Link>
        </div>
        
        <div className="absolute bottom-0 right-0 pointer-events-none">
          <RunningHuman />
        </div>
        
        <div className={`${isMobile ? 'mt-12' : 'mt-16'} max-w-6xl mx-auto`}>
          <DoodleFeed />
        </div>
      </main>
    </div>
  );
};

export default Index;
