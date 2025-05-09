import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { getSeasonalGreeting } from '@/utils/themeHelpers';
import { Pen, Palette } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

// Lazy load components that aren't needed immediately
const DoodleFeed = lazy(() => import('@/components/DoodleFeed'));
const ThemeSelector = lazy(() => import('@/components/ThemeSelector'));
const ThemePreview = lazy(() => import('@/components/ThemePreview'));
const ThemedBackground = lazy(() => import('@/components/ThemedBackground'));

// Loading fallbacks
const FeedSkeleton = () => (
  <div className="w-full py-6 animate-pulse">
    <div className="h-8 bg-gray-200 w-48 rounded mb-6"></div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array(3).fill(0).map((_, i) => (
        <div key={i} className="bg-gray-100 rounded-lg aspect-square"></div>
      ))}
    </div>
  </div>
);

const ThemeFallback = () => (
  <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-auto p-8">
      <div className="animate-pulse flex flex-col space-y-4">
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        <div className="h-32 bg-gray-200 rounded w-full"></div>
        <div className="h-8 bg-gray-200 rounded w-full"></div>
      </div>
    </div>
  </div>
);

const Index = () => {
  const [showOpening, setShowOpening] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();
  const [newDoodleId, setNewDoodleId] = useState<string | null>(null);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const { theme } = useTheme();
  const seasonalGreeting = getSeasonalGreeting(theme);
  
  useEffect(() => {
    // Update the page title when this component mounts
    document.title = "Bomma | Home";
    
    // Restore the original title when component unmounts
    return () => {
      document.title = "Bomma";
    };
  }, []);
  
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

  // Add dreamy dust particles - only when needed and with rAF for performance
  useEffect(() => {
    if (isMobile) return; // Skip on mobile devices
    
    let animationFrameId: number;
    let particles: HTMLDivElement[] = [];
    
    const createDreamyDustParticles = () => {
      const container = document.querySelector('.index-page-container');
      if (!container) return;
      
      // Create particles arrays to manage them
      particles = [];
      
      // Create dust particles - reduced count for better performance
      for (let i = 0; i < 15; i++) {
        const dust = document.createElement('div');
        dust.className = 'dreamy-dust';
        
        // Random positioning
        dust.style.left = `${Math.random() * 100}%`;
        dust.style.top = `${Math.random() * 100}%`;
        dust.style.opacity = `${0.4 + Math.random() * 0.5}`;
        dust.style.width = `${3 + Math.random() * 4}px`;
        dust.style.height = dust.style.width;
        
        // Random animation duration and delay for more natural movement
        dust.style.animationDuration = `${5 + Math.random() * 10}s`;
        dust.style.animationDelay = `${Math.random() * 5}s`;
        
        container.appendChild(dust);
        particles.push(dust);
      }
      
      // Add floating sparkles - reduced for better performance
      for (let i = 0; i < 8; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'ghibli-sparkle';
        
        // Random positioning
        sparkle.style.left = `${Math.random() * 100}%`;
        sparkle.style.top = `${Math.random() * 100}%`;
        sparkle.style.opacity = `${0.3 + Math.random() * 0.3}`;
        
        // Random size
        const size = 5 + Math.random() * 10;
        sparkle.style.width = `${size}px`;
        sparkle.style.height = `${size}px`;
        
        // Animation
        sparkle.style.animationDuration = `${3 + Math.random() * 7}s`;
        sparkle.style.animationDelay = `${Math.random() * 5}s`;
        
        container.appendChild(sparkle);
        particles.push(sparkle);
      }
    };
    
    // Use requestAnimationFrame to avoid layout thrashing
    const initParticles = () => {
      // Wait for DOM to be ready
      setTimeout(() => {
        createDreamyDustParticles();
      }, 100);
    };
    
    animationFrameId = requestAnimationFrame(initParticles);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      // Clean up particles
      particles.forEach(p => p.remove());
    };
  }, [isMobile]);

  const toggleThemeSelector = () => {
    setShowThemeSelector(!showThemeSelector);
  };

  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <ThemedBackground>
        <div className="min-h-screen flex flex-col relative index-page-container overflow-hidden">
          <Navbar />
          
          <main className="flex-1 container mx-auto px-4 py-6 relative z-10">
            {/* Theme switcher button */}
            <div className="absolute top-4 right-4 z-20">
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full"
                onClick={toggleThemeSelector}
              >
                <Palette className="h-4 w-4 mr-2" />
                Themes
              </Button>
            </div>
            
            {/* Theme selector - lazy loaded */}
            {showThemeSelector && (
              <Suspense fallback={<ThemeFallback />}>
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-auto">
                    <div className="p-4 border-b flex justify-between items-center">
                      <h2 className="font-bold">Theme Settings</h2>
                      <Button variant="ghost" size="sm" onClick={toggleThemeSelector}>
                        Close
                      </Button>
                    </div>
                    
                    <div className="p-4">
                      <ThemePreview 
                        className="mb-6" 
                        visualTheme={theme.visualTheme}
                        seasonalTheme={theme.seasonalTheme}
                      />
                      <ThemeSelector />
                    </div>
                  </div>
                </div>
              </Suspense>
            )}
            
            <div className={`mb-8 ${isMobile ? 'py-4' : 'py-12'} text-center max-w-3xl mx-auto`}>
              {/* Show seasonal greeting if available */}
              {seasonalGreeting && (
                <div className="mb-4 py-2 px-4 rounded-full bg-white/30 backdrop-blur-sm inline-block animate-fade-in">
                  {seasonalGreeting}
                </div>
              )}
              
              <h1 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-elegant mb-6 tracking-tight ghibli-shine relative`}>
                Discover{' '}
                <span className="wonderful-wrapper">
                  W<span>o</span>nd<span>e</span>rful
                </span>{' '}
                Creations
              </h1>
              
              <div className="h-px bg-gray-200 my-6 w-24 mx-auto" />
              
              <p className={`${isMobile ? 'text-sm px-4' : 'text-lg px-8'} mb-8 font-elegant text-gray-600 max-w-lg mx-auto`}>
                Create your own worlds and characters, then share them with our community.
              </p>
              
              <Link to="/create" className="inline-block">
                <Button className="bg-black hover:bg-black/80 text-white font-elegant px-8 py-3 rounded-full ghibli-button relative overflow-hidden">
                  <span className="relative z-10 flex items-center">
                    <Pen className="h-4 w-4 mr-2" />
                    Create Your Design
                  </span>
                </Button>
              </Link>
            </div>
            
            <div className={`${isMobile ? 'mt-12' : 'mt-16'} max-w-6xl mx-auto`}>
              <Suspense fallback={<FeedSkeleton />}>
                <DoodleFeed highlightDoodleId={newDoodleId} />
              </Suspense>
            </div>
          </main>

          {/* Enhanced CSS for dreamy effects - optimized animations */}
          <style>
            {`
            .ghibli-button::before {
              content: '';
              position: absolute;
              top: -50%;
              left: -60%;
              width: 20%;
              height: 200%;
              background: rgba(255, 255, 255, 0.3);
              transform: rotate(30deg);
              will-change: transform;
              animation: button-shine 6s ease-in-out infinite;
            }
            
            @keyframes button-shine {
              0% { transform: rotate(30deg) translateX(-300%); }
              30%, 100% { transform: rotate(30deg) translateX(400%); }
            }
            
            .ghibli-sparkle {
              position: absolute;
              background-color: white;
              border-radius: 50%;
              box-shadow: 0 0 10px 2px white;
              will-change: transform, opacity;
              animation: sparkle-float 8s ease-in-out infinite;
              z-index: 5;
            }
            
            @keyframes sparkle-float {
              0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
              50% { transform: translateY(-30px) scale(1.2); opacity: 0.7; }
            }
            
            .dreamy-dust {
              position: absolute;
              background-color: white;
              border-radius: 50%;
              box-shadow: 0 0 5px 1px rgba(255,255,255,0.7);
              will-change: transform;
              animation: dust-float 10s ease-in-out infinite;
              z-index: 3;
            }
            
            @keyframes dust-float {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-20px) translateX(10px); }
            }
            `}
          </style>
        </div>
      </ThemedBackground>
    </Suspense>
  );
};

export default Index;
