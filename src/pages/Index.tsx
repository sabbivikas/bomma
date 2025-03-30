
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import DoodleFeed from '@/components/DoodleFeed';
import { Button } from '@/components/ui/button';
import { Pen } from 'lucide-react';
import { Link } from 'react-router-dom';
import Cloud from '@/components/Cloud';
import GhibliAnimations from '@/components/GhibliAnimations';
import OpeningSequence from '@/components/OpeningSequence';
import { useIsMobile } from '@/hooks/use-mobile';
import WritingHuman from '@/components/WritingHuman';

const Index = () => {
  const [showOpening, setShowOpening] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();
  const [newDoodleId, setNewDoodleId] = useState<string | null>(null);
  
  // Check if we have a newly created doodle from the navigation state
  useEffect(() => {
    if (location.state && location.state.newDoodle) {
      setNewDoodleId(location.state.newDoodle);
      // Clear the state after reading it to prevent it from persisting on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);
  
  // Check if it's the first visit using localStorage
  useEffect(() => {
    const hasSeenOpening = localStorage.getItem('hasSeenOpening');
    
    if (!hasSeenOpening) {
      setShowOpening(true);
      // Don't set localStorage here - we'll do it after user clicks Enter
    }
  }, []);

  // Add dreamy dust particles
  useEffect(() => {
    // Only add particles if not on mobile to avoid performance issues
    if (isMobile) return;
    
    const createDreamyDustParticles = () => {
      const container = document.querySelector('main');
      if (!container) return;
      
      // Limit number of particles for performance
      for (let i = 0; i < 10; i++) {
        const dust = document.createElement('div');
        dust.className = 'dreamy-dust';
        
        // Random positioning
        dust.style.left = `${Math.random() * 100}%`;
        dust.style.top = `${Math.random() * 100}%`;
        dust.style.opacity = `${0.3 + Math.random() * 0.5}`;
        dust.style.width = `${2 + Math.random() * 3}px`;
        dust.style.height = dust.style.width;
        
        // Random animation duration and delay
        dust.style.animationDuration = `${5 + Math.random() * 10}s`;
        dust.style.animationDelay = `${Math.random() * 5}s`;
        
        container.appendChild(dust);
      }
    };
    
    createDreamyDustParticles();
    
    return () => {
      const dusts = document.querySelectorAll('.dreamy-dust');
      dusts.forEach(dust => dust.remove());
    };
  }, [isMobile]);

  const handleOpeningComplete = () => {
    // Save to localStorage that user has seen opening
    localStorage.setItem('hasSeenOpening', 'true');
    setShowOpening(false);
  };

  if (showOpening) {
    return <OpeningSequence onComplete={handleOpeningComplete} />;
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-blue-50 overflow-hidden">
      {/* The background ghibli elements */}
      <GhibliAnimations />
      <Cloud />
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-6 relative z-10">
        <div className={`mb-8 ${isMobile ? 'py-4' : 'py-12'} text-center max-w-3xl mx-auto`}>
          <h1 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-elegant mb-6 tracking-tight ghibli-shine`}>
            Discover{' '}
            <span className="wonderful-wrapper">
              W<span>o</span>nd<span>e</span>
              <span className="relative">
                r
                {/* The human sits on top of the letter "n" */}
                <WritingHuman className="absolute -top-12 -left-2" />
              </span>
              ful
            </span>{' '}
            Creations
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
        
        <div className={`${isMobile ? 'mt-12' : 'mt-16'} max-w-6xl mx-auto`}>
          <DoodleFeed highlightDoodleId={newDoodleId} />
        </div>
      </main>
    </div>
  );
};

export default Index;
