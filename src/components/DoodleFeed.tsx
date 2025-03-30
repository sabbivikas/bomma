
import React, { useState, useEffect } from 'react';
import { Doodle } from '@/types/doodle';
import { getAllDoodles } from '@/utils/doodleService';
import DoodleCard from './DoodleCard';
import { Smile, RefreshCw, Paintbrush } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';

interface DoodleFeedProps {
  highlightDoodleId?: string | null;
}

const DoodleFeed: React.FC<DoodleFeedProps> = ({ highlightDoodleId }) => {
  const [doodles, setDoodles] = useState<Doodle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [newDoodlesCount, setNewDoodlesCount] = useState<number>(0);
  const [lastLoadedTime, setLastLoadedTime] = useState<Date>(new Date());
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  // Initial load of doodles
  useEffect(() => {
    loadDoodles();
    
    // Set up event listener for doodle publishing from other components/tabs
    window.addEventListener('doodle-published', handleLocalPublish);
    
    return () => {
      window.removeEventListener('doodle-published', handleLocalPublish);
    };
  }, []);
  
  // Set up real-time listener for new doodles
  useEffect(() => {
    const channel = supabase
      .channel('public:doodles')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'doodles' 
        }, 
        (payload) => {
          // Don't show notification for our own doodles
          const publishedDoodleId = highlightDoodleId;
          if (payload.new && payload.new.id !== publishedDoodleId) {
            setNewDoodlesCount(prevCount => prevCount + 1);
            toast({
              title: "New doodle published!",
              description: "Someone just shared a new creation.",
              variant: "default",
            });
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [highlightDoodleId, toast]);
  
  const handleLocalPublish = () => {
    // This is triggered when the current user publishes a doodle
    loadDoodles();
  };
  
  const loadDoodles = async () => {
    setIsLoading(true);
    setNewDoodlesCount(0);
    setLastLoadedTime(new Date());
    
    try {
      let loadedDoodles = await getAllDoodles();
      
      // Strict filtering to ensure we only show valid submitted doodles with actual content
      const validDoodles = loadedDoodles.filter(doodle => {
        // Ensure we have all required fields
        if (!doodle.id || !doodle.imageUrl || !doodle.prompt) {
          return false;
        }
        
        // Ensure the image URL is valid and has actual content
        const hasValidImage = doodle.imageUrl && 
                            doodle.imageUrl.startsWith('data:image') && 
                            doodle.imageUrl.length > 5000; // Requiring substantial image data
        
        // Check for valid prompt - must have actual content
        const hasValidPrompt = doodle.prompt && 
                            doodle.prompt.trim().length > 3; // Minimum 4 characters
        
        return hasValidImage && hasValidPrompt;
      });
      
      // If we have no valid doodles after filtering, set empty array
      setDoodles(validDoodles);
      
      // Log for debugging
      console.log(`Loaded ${loadedDoodles.length} doodles, ${validDoodles.length} are valid`);
      
    } catch (error) {
      console.error('Error loading doodles:', error);
      toast({
        title: "Error loading doodles",
        description: "Please try refreshing the page.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDoodleLiked = (updatedDoodle: Doodle) => {
    setDoodles((prevDoodles) =>
      prevDoodles.map((doodle) =>
        doodle.id === updatedDoodle.id ? updatedDoodle : doodle
      )
    );
  };

  const handleRefresh = () => {
    loadDoodles();
  };

  if (isLoading) {
    return (
      <div className="w-full py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-100 rounded-lg w-full">
                <div className="p-4 flex items-center">
                  <div className="rounded-full bg-gray-200 h-8 w-8 mr-3"></div>
                  <div className="flex-1">
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-2 bg-gray-200 rounded w-1/4 mt-2"></div>
                  </div>
                </div>
                <div className="aspect-square bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-8 bg-gray-100 mt-4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Latest Creations</h2>
        <Button 
          onClick={handleRefresh} 
          variant="outline" 
          className="flex items-center gap-2"
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
          {newDoodlesCount > 0 && (
            <span className="bg-black text-white text-xs rounded-full px-2 py-1 ml-1">
              {newDoodlesCount}
            </span>
          )}
        </Button>
      </div>
      
      {doodles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {doodles.map((doodle) => (
            <DoodleCard 
              key={doodle.id} 
              doodle={doodle} 
              onLike={handleDoodleLiked} 
              highlight={doodle.id === highlightDoodleId}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border border-gray-200 rounded-lg bg-white shadow-sm">
          <Paintbrush className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-xl font-medium">No doodles yet</p>
          <p className="text-gray-500 mt-2">Create your first masterpiece and share it with the world!</p>
          <Button 
            variant="secondary" 
            className="mt-4 flex items-center gap-2 mx-auto"
            onClick={() => window.location.href = '/create'}
          >
            <Paintbrush className="w-4 h-4" />
            Start Drawing
          </Button>
        </div>
      )}
    </div>
  );
};

export default DoodleFeed;
