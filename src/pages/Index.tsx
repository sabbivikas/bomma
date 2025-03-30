
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import DoodleFeed from '@/components/DoodleFeed';
import { Button } from '@/components/ui/button';
import { Pen, Laugh } from 'lucide-react';
import { Link } from 'react-router-dom';
import FunkyText from '@/components/FunkyText';
import Cloud from '@/components/Cloud';
import GhibliAnimations from '@/components/GhibliAnimations';
import RunningHuman from '@/components/RunningHuman';
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
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-white">
      <GhibliAnimations />
      <Cloud />
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 relative z-10">
        <div className="mb-12 relative animate-pop-in max-w-2xl mx-auto text-center">
          <h1 className={`${isMobile ? 'text-3xl' : 'text-5xl'} font-elegant mb-6 relative inline-block`}>
            Discover Wonderful Creations
            <Laugh className={`inline-block ml-3 mb-2 animate-float ${isMobile ? 'h-5 w-5' : ''}`} />
          </h1>
          
          <div className="h-px bg-black/20 my-6 w-24 mx-auto" />
          
          <p className={`${isMobile ? 'text-base px-2' : 'text-xl'} mb-8 font-elegant text-gray-700`}>
            Create your own worlds and characters, then share them with our community.
          </p>
          
          <Link to="/create" className="inline-block transform hover:scale-105 transition-transform">
            <Button className="bg-black hover:bg-black/80 text-white font-elegant px-6 py-2 rounded">
              <Pen className="h-5 w-5 mr-2" />
              Create Your Design
            </Button>
          </Link>

          <div className={`relative ${isMobile ? 'h-16' : 'h-24'} mt-6`}>
            <RunningHuman />
          </div>
        </div>
        
        <div className={`${isMobile ? 'mt-8' : 'mt-16'}`}>
          <DoodleFeed />
        </div>
      </main>
    </div>
  );
};

export default Index;
