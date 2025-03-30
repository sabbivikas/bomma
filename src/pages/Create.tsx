
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import DrawingCanvas from '@/components/DrawingCanvas';
import { createDoodle, getSessionId } from '@/utils/doodleService';
import { useToast } from '@/hooks/use-toast';
import { getTodaysPrompt } from '@/data/prompts';
import { Lightbulb, CheckCircle2 } from 'lucide-react';
import FunkyText from '@/components/FunkyText';
import Cloud from '@/components/Cloud';
import GhibliAnimations from '@/components/GhibliAnimations';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useIsMobile } from '@/hooks/use-mobile';

const Create = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [prompt] = useState(getTodaysPrompt());
  const [stayOnPage, setStayOnPage] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const isMobile = useIsMobile();
  
  // Add dreamy dust particles
  useEffect(() => {
    // Only add particles if not on mobile to avoid performance issues
    if (isMobile) return;
    
    const createDreamyDustParticles = () => {
      const container = document.querySelector('.create-page-container');
      if (!container) return;
      
      // Create dust particles
      for (let i = 0; i < 15; i++) {
        const dust = document.createElement('div');
        dust.className = 'dreamy-dust';
        
        // Random positioning
        dust.style.left = `${Math.random() * 100}%`;
        dust.style.top = `${Math.random() * 100}%`;
        dust.style.opacity = `${0.4 + Math.random() * 0.5}`;
        dust.style.width = `${3 + Math.random() * 4}px`;
        dust.style.height = dust.style.width;
        
        // Random animation duration and delay
        dust.style.animationDuration = `${5 + Math.random() * 10}s`;
        dust.style.animationDelay = `${Math.random() * 5}s`;
        
        container.appendChild(dust);
      }
      
      // Add floating sparkles
      for (let i = 0; i < 8; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'ghibli-sparkle';
        
        // Random positioning
        sparkle.style.left = `${Math.random() * 100}%`;
        sparkle.style.top = `${Math.random() * 100}%`;
        sparkle.style.opacity = `${0.3 + Math.random() * 0.3}`;
        
        // Random size
        const size = 4 + Math.random() * 8;
        sparkle.style.width = `${size}px`;
        sparkle.style.height = `${size}px`;
        
        // Animation
        sparkle.style.animationDuration = `${3 + Math.random() * 7}s`;
        sparkle.style.animationDelay = `${Math.random() * 5}s`;
        
        container.appendChild(sparkle);
      }
    };
    
    createDreamyDustParticles();
    
    return () => {
      const dusts = document.querySelectorAll('.dreamy-dust, .ghibli-sparkle');
      dusts.forEach(dust => dust.remove());
    };
  }, [isMobile]);
  
  const handleSave = (canvas: HTMLCanvasElement) => {
    // Convert canvas to data URL
    const imageUrl = canvas.toDataURL('image/png');
    
    // Save the doodle to local storage
    const sessionId = getSessionId();
    const newDoodle = createDoodle({
      imageUrl,
      prompt,
      sessionId,
    });
    
    // Show success message
    toast({
      title: "Doodle published!",
      description: "Your doodle has been added to the feed.",
      variant: "success",
    });

    // Set success message to display on page
    if (stayOnPage) {
      setSuccessMessage("Your doodle was published successfully!");
      
      // Clear success message after 4 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 4000);
    } else {
      // Redirect to feed
      navigate('/', { 
        state: { 
          newDoodle: newDoodle.id,
          justCreated: true
        } 
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative create-page-container overflow-hidden">
      {/* Enhanced background gradient for Ghibli effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#E0F7FA] via-[#B3E5FC] to-[#D1C4E9] opacity-70 z-0"></div>
      
      {/* Light rays */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.8),transparent_70%)] z-0"></div>
      
      {/* The background ghibli elements */}
      <GhibliAnimations />
      <Cloud />
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 relative z-10">
        <div className="mb-8 animate-pop-in">
          <h1 className="text-4xl font-bold mb-3 sketchy-text inline-block font-funky">
            <FunkyText text="Create Your Doodle" />
          </h1>
          <div className="sketchy-divider my-4"></div>
          <div className="flex items-center gap-2">
            <Lightbulb className="text-black animate-pulse-light" />
            <p className="text-muted-foreground">
              Let your creativity flow and create something wonderful!
            </p>
          </div>
        </div>

        {successMessage && (
          <div className="bg-green-50 border-2 border-green-200 rounded-md p-4 mb-6 flex items-center animate-fade-in">
            <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
            <p className="text-green-700">{successMessage}</p>
          </div>
        )}
        
        <div className="max-w-3xl mx-auto">
          <DrawingCanvas onSave={handleSave} prompt={prompt} />

          <div className="mt-4 flex items-center space-x-2">
            <Checkbox 
              id="stay-on-page" 
              checked={stayOnPage} 
              onCheckedChange={(checked) => setStayOnPage(checked === true)}
            />
            <Label htmlFor="stay-on-page" className="text-sm text-gray-600">
              Stay on this page after publishing (create multiple doodles)
            </Label>
          </div>
        </div>
      </main>
      
      {/* Add CSS for enhanced dreamy effects */}
      <style>
        {`
        .ghibli-sparkle {
          position: absolute;
          background-color: white;
          border-radius: 50%;
          box-shadow: 0 0 10px 2px white;
          animation: sparkle-float 8s ease-in-out infinite;
          z-index: 5;
        }
        
        @keyframes sparkle-float {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
          50% { transform: translateY(-30px) scale(1.2); opacity: 0.7; }
        }
        `}
      </style>
    </div>
  );
};

export default Create;
