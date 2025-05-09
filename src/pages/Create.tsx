import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import DrawingCanvas from '@/components/DrawingCanvas';
import { createDoodle, getSessionId } from '@/utils/doodleService';
import { useToast } from '@/hooks/use-toast';
import { getTodaysPrompt } from '@/data/prompts';
import { Lightbulb, CheckCircle2, Eye, Trash2 } from 'lucide-react';
import FunkyText from '@/components/FunkyText';
import Cloud from '@/components/Cloud';
import GhibliAnimations from '@/components/GhibliAnimations';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useIsMobile } from '@/hooks/use-mobile';
import { Doodle } from '@/types/doodle';
import DoodleCard from '@/components/DoodleCard';
import DrawingSection from '@/components/DrawingSection';
import PublishOptionsDialog from '@/components/PublishOptionsDialog';

// Helper function to detect if the device is an iPad
const useIsIpad = () => {
  const [isIpad, setIsIpad] = useState(false);

  useEffect(() => {
    const checkIsIpad = () => {
      // Check for iPad specifically
      const isIpadOS = navigator.userAgent.match(/iPad/i) !== null ||
        (navigator.userAgent.match(/Mac/i) !== null && navigator.maxTouchPoints > 0);
      
      // Also check for typical iPad dimensions - width between 750px and 1024px
      const isIpadSize = window.innerWidth >= 750 && window.innerWidth <= 1024;
      
      setIsIpad(isIpadOS || isIpadSize);
    };

    checkIsIpad();
    window.addEventListener('resize', checkIsIpad);
    return () => window.removeEventListener('resize', checkIsIpad);
  }, []);

  return isIpad;
};

const Create = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [prompt] = useState(getTodaysPrompt());
  const [stayOnPage, setStayOnPage] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [publishedDoodle, setPublishedDoodle] = useState<Doodle | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const isMobile = useIsMobile();
  const isIpad = useIsIpad();
  
  // New state variables for publishing flow
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [pendingCanvas, setPendingCanvas] = useState<HTMLCanvasElement | null>(null);
  const [pendingImageUrl, setPendingImageUrl] = useState<string>('');
  
  useEffect(() => {
    // Update the page title when this component mounts
    document.title = "Bomma | Create Doodle";
    
    // Restore the original title when component unmounts
    return () => {
      document.title = "Bomma";
    };
  }, []);

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
    // Convert canvas to data URL for preview
    const imageUrl = canvas.toDataURL('image/png');
    
    // Store the canvas and image URL for later use
    setPendingCanvas(canvas);
    setPendingImageUrl(imageUrl);
    
    // Show publish options dialog
    setShowPublishDialog(true);
  };

  const handlePublish = async (mode: '2d' | '3d') => {
    // Set publishing state
    setIsPublishing(true);
    
    if (!pendingCanvas) {
      toast({
        title: "Error",
        description: "Canvas data is missing. Please try again.",
        variant: "destructive",
      });
      setIsPublishing(false);
      return;
    }
    
    // Convert canvas to data URL
    const imageUrl = pendingCanvas.toDataURL('image/png');
    
    // Save the doodle to Supabase
    const sessionId = getSessionId();
    try {
      // In a real implementation, you would handle 3D conversion here
      // For now, we'll just add a flag to indicate the mode
      const newDoodle = await createDoodle({
        imageUrl,
        prompt,
        sessionId,
        is3D: mode === '3d', // This would need to be added to the DoodleCreateInput type
      });
      
      if (!newDoodle) {
        throw new Error("Failed to create doodle");
      }
      
      // Show success message
      toast({
        title: `Doodle published in ${mode.toUpperCase()} mode!`,
        description: "Your doodle has been added to the feed.",
        variant: "success",
      });

      // Set success message to display on page
      if (stayOnPage) {
        setSuccessMessage(`Your doodle was published successfully in ${mode.toUpperCase()} mode!`);
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
      setShowPublishDialog(false);
      setPendingCanvas(null);
      setPendingImageUrl('');
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
      {!isMobile && <GhibliAnimations />}
      {!isMobile && <Cloud />}
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-6 relative z-10">
        <div className="mb-4 animate-pop-in">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 sketchy-text inline-block font-funky">
            <FunkyText text={publishedDoodle ? "Your Published Doodle" : "Create Your Doodle"} />
          </h1>
          <div className="sketchy-divider mb-3"></div>
        </div>

        {successMessage && (
          <div className="bg-green-50 border-2 border-green-200 rounded-md p-4 mb-4 flex items-center animate-fade-in">
            <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
            <p className="text-green-700">{successMessage}</p>
          </div>
        )}
        
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
          <div className="max-w-3xl mx-auto">
            {/* Drawing section */}
            <DrawingSection 
              framesCount={0}
              hasNoFrames={true}
              onSaveFrame={handleSave}
              prompt={prompt}
            />
            
            {/* Options below the canvas */}
            <div className="mt-4 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Options:</h3>
              
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="stay-on-page" 
                    checked={stayOnPage} 
                    onCheckedChange={(checked) => setStayOnPage(checked === true)}
                  />
                  <Label htmlFor="stay-on-page" className="text-gray-600">
                    Stay on this page after publishing
                  </Label>
                </div>
                
                <Button 
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="flex items-center justify-center gap-2 h-9"
                >
                  <Eye className="h-4 w-4" /> View All Doodles
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* Publish Options Dialog */}
      <PublishOptionsDialog
        open={showPublishDialog}
        onOpenChange={setShowPublishDialog}
        imageUrl={pendingImageUrl}
        onPublish={handlePublish}
        isPublishing={isPublishing}
      />
      
      {/* Add CSS for enhanced dreamy effects and improved canvas styling */}
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

        .dreamy-dust {
          position: absolute;
          background-color: white;
          border-radius: 50%;
          opacity: 0.5;
          animation: float 10s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        
        /* Canvas styling - improved to match design */
        canvas {
          border-radius: 0;
          background: linear-gradient(180deg, rgba(230, 242, 255, 0.8) 0%, rgba(240, 235, 255, 0.8) 100%);
          width: 100% !important;
          max-width: 100% !important;
          height: auto;
          aspect-ratio: 16/10;
          display: block;
          border: none !important;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }
        
        /* Remove any margins or padding that might be causing white space */
        .drawing-canvas-container {
          width: 100% !important;
          max-width: 100% !important;
          padding: 0 !important;
          margin: 0 !important;
          overflow: hidden;
        }
        
        /* Drawing tools container styling */
        .drawing-tools-container {
          background-color: rgba(255, 255, 255, 0.7) !important;
          backdrop-filter: blur(4px);
          border-top: 1px solid rgba(209, 213, 219, 0.5);
          width: 100% !important;
          max-width: 100% !important;
          padding-left: 0 !important;
          padding-right: 0 !important;
          margin-left: 0 !important;
          margin-right: 0 !important;
        }
        
        /* Remove any horizontal scrolling */
        body, html, #root {
          overflow-x: hidden;
        }
        
        /* iPad-specific styles */
        @media (min-width: 768px) and (max-width: 1024px) {
          /* Ensure touch targets are large enough */
          button, .toggle-group-item {
            min-height: 44px;
            min-width: 44px;
          }
          
          /* Better spacing for iPad */
          .gap-2 {
            gap: 0.75rem !important;
          }
        }
        `}
      </style>
    </div>
  );
};

export default Create;
