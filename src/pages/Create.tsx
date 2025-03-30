
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import DrawingCanvas from '@/components/DrawingCanvas';
import { createDoodle, getSessionId } from '@/utils/doodleService';
import { useToast } from '@/hooks/use-toast';
import { getTodaysPrompt } from '@/data/prompts';
import { Lightbulb, CheckCircle2, Eye } from 'lucide-react';
import FunkyText from '@/components/FunkyText';
import Cloud from '@/components/Cloud';
import GhibliAnimations from '@/components/GhibliAnimations';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useIsMobile } from '@/hooks/use-mobile';
import { Doodle } from '@/types/doodle';
import DoodleCard from '@/components/DoodleCard';

const Create = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [prompt] = useState(getTodaysPrompt());
  const [stayOnPage, setStayOnPage] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [publishedDoodle, setPublishedDoodle] = useState<Doodle | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
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
  
  const handleDoodleLiked = (updatedDoodle: Doodle) => {
    if (publishedDoodle && updatedDoodle.id === publishedDoodle.id) {
      setPublishedDoodle(updatedDoodle);
    }
  };
  
  const handleSave = async (canvas: HTMLCanvasElement) => {
    // Set publishing state
    setIsPublishing(true);
    
    // Convert canvas to data URL
    const imageUrl = canvas.toDataURL('image/png');
    
    // Save the doodle to Supabase
    const sessionId = getSessionId();
    try {
      const newDoodle = await createDoodle({
        imageUrl,
        prompt,
        sessionId,
      });
      
      if (!newDoodle) {
        throw new Error("Failed to create doodle");
      }
      
      // Show success message
      toast({
        title: "Doodle published!",
        description: "Your doodle has been added to the feed.",
        variant: "success",
      });

      // Set success message to display on page
      if (stayOnPage) {
        setSuccessMessage("Your doodle was published successfully!");
        setPublishedDoodle(newDoodle);
        
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
    } catch (error) {
      console.error('Error publishing doodle:', error);
      toast({
        title: "Error publishing doodle",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCreateNew = () => {
    setPublishedDoodle(null);
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
            <FunkyText text={publishedDoodle ? "Your Published Doodle" : "Create Your Doodle"} />
          </h1>
          <div className="sketchy-divider my-4"></div>
          <div className="flex items-center gap-2">
            <Lightbulb className="text-black animate-pulse-light" />
            <p className="text-muted-foreground">
              {publishedDoodle 
                ? "Amazing! Your creation is now part of our wonderful community." 
                : "Let your creativity flow and create something wonderful!"}
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
          {publishedDoodle ? (
            <div className="flex flex-col items-center">
              <div className="w-full max-w-md animate-pop-in">
                <DoodleCard doodle={publishedDoodle} onLike={handleDoodleLiked} highlight={true} />
              </div>
              
              <div className="flex gap-4 mt-6">
                <Button
                  onClick={handleCreateNew}
                  className="border-2 border-black sketchy-button gap-2 bg-black text-white"
                >
                  Create Another Doodle
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="border-2 border-black sketchy-button gap-2"
                >
                  <Eye className="h-4 w-4" /> View All Doodles
                </Button>
              </div>
            </div>
          ) : (
            <>
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
            </>
          )}
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

        .animate-pop-in {
          animation: pop-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes pop-in {
          0% { opacity: 0; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1); }
        }

        .animate-fade-in {
          animation: fade-in 0.4s ease-in forwards;
        }

        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        `}
      </style>
    </div>
  );
};

export default Create;
