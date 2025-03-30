
import React, { useState, useEffect } from 'react';
import { Doodle } from '@/types/doodle';
import { getAllDoodles, generateSampleDoodles } from '@/utils/doodleService';
import DoodleCard from './DoodleCard';
import { Smile } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const DoodleFeed: React.FC = () => {
  const [doodles, setDoodles] = useState<Doodle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    // Generate sample doodles if needed
    generateSampleDoodles();
    
    // Load doodles
    loadDoodles();
  }, []);
  
  const loadDoodles = () => {
    setIsLoading(true);
    const loadedDoodles = getAllDoodles();
    setDoodles(loadedDoodles);
    setIsLoading(false);
  };
  
  const handleDoodleLiked = (updatedDoodle: Doodle) => {
    setDoodles((prevDoodles) =>
      prevDoodles.map((doodle) =>
        doodle.id === updatedDoodle.id ? updatedDoodle : doodle
      )
    );
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {doodles.map((doodle) => (
          <DoodleCard key={doodle.id} doodle={doodle} onLike={handleDoodleLiked} />
        ))}
      </div>
      
      {doodles.length === 0 && (
        <div className="text-center py-12 border border-gray-200 rounded-lg bg-white shadow-sm">
          <Smile className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-xl font-medium">No doodles yet</p>
          <p className="text-gray-500 mt-2">Be the first to create something wonderful!</p>
        </div>
      )}
    </div>
  );
};

export default DoodleFeed;
