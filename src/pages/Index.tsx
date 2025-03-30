
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
        <div className={`mb-8 ${isMobile ? 'py-4' : 'py-12'} text-center bg-white rounded-lg shadow-sm border border-gray-100 max-w-3xl mx-auto`}>
          <h1 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-elegant mb-3`}>
            Make Something Wonderful
            <Sparkles className={`inline-block ml-2 mb-1 ${isMobile ? 'h-4 w-4' : 'h-6 w-6'}`} />
          </h1>
          
          <div className="h-px bg-gray-200 my-4 w-24 mx-auto" />
          
          <p className={`${isMobile ? 'text-sm px-4' : 'text-base px-8'} mb-6 font-elegant text-gray-600 max-w-lg mx-auto`}>
            Share your creativity with the world. Create unique doodles and join our growing community of artists.
          </p>
          
          <Link to="/create" className="inline-block">
            <Button className="bg-black hover:bg-black/80 text-white font-elegant px-6 py-2 rounded-full">
              <Pen className="h-4 w-4 mr-2" />
              Create Now
            </Button>
          </Link>
        </div>
        
        <div className={`${isMobile ? 'mt-6' : 'mt-8'} max-w-6xl mx-auto`}>
          <h2 className="text-xl font-elegant mb-4 flex items-center">
            <span className="bg-black h-5 w-1 rounded-full inline-block mr-3"></span>
            Explore Creations
          </h2>
          <DoodleFeed />
        </div>
      </main>
    </div>
  );
};

export default Index;
