
import React, { useEffect } from 'react';
import { CharacterProvider } from '@/contexts/CharacterContext';
import ThemedBackground from '@/components/ThemedBackground';
import Navbar from '@/components/Navbar';
import WorldsContent from '@/components/worlds/WorldsContent';
import { initializeSessionId } from '@/utils/sessionService';

const Worlds = () => {
  // Initialize session ID when the worlds page loads
  useEffect(() => {
    initializeSessionId();
  }, []);
  
  return (
    <CharacterProvider>
      <ThemedBackground>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1 relative z-10 pb-12">
            <WorldsContent />
          </main>
        </div>
      </ThemedBackground>
    </CharacterProvider>
  );
};

export default Worlds;
