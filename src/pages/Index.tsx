
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

const Index = () => {
  const [showOpening, setShowOpening] = useState(true);
  
  const handleOpeningComplete = () => {
    setShowOpening(false);
  };

  if (showOpening) {
    return <OpeningSequence onComplete={handleOpeningComplete} />;
  }
  
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <GhibliAnimations />
      <Cloud />
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 relative z-10">
        <div className="mb-12 relative animate-pop-in max-w-2xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 relative inline-block">
            <FunkyText text="Discover Wonderful Creations" />
            <Laugh className="inline-block ml-3 mb-2 animate-float" />
          </h1>
          
          <div className="artsy-divider" />
          
          <p className="text-xl mb-8 font-funky">
            Create your own cartoon worlds and characters, then share them with our community!
          </p>
          
          <Link to="/create" className="inline-block transform hover:scale-105 transition-transform">
            <Button className="sketchy-button font-funky">
              <Pen className="h-5 w-5 mr-2" />
              Create Your Doodle
            </Button>
          </Link>

          <div className="relative h-24 mt-6">
            <RunningHuman />
          </div>
        </div>
        
        <div className="mt-16">
          <DoodleFeed />
        </div>
      </main>
    </div>
  );
};

export default Index;
