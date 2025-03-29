
import React, { useState, useEffect } from 'react';
import { Doodle } from '@/types/doodle';
import { getAllDoodles, generateSampleDoodles } from '@/utils/doodleService';
import DoodleCard from './DoodleCard';

const DoodleFeed: React.FC = () => {
  const [doodles, setDoodles] = useState<Doodle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
      <div className="w-full py-12 flex justify-center">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-6">
            <div className="h-40 bg-muted rounded"></div>
            <div className="space-y-3">
              <div className="h-2 bg-muted rounded"></div>
              <div className="h-2 bg-muted rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {doodles.map((doodle) => (
          <DoodleCard key={doodle.id} doodle={doodle} onLike={handleDoodleLiked} />
        ))}
      </div>
      {doodles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg font-medium">No doodles yet</p>
          <p className="text-muted-foreground mt-2">Be the first to create something wonderful!</p>
        </div>
      )}
    </div>
  );
};

export default DoodleFeed;
