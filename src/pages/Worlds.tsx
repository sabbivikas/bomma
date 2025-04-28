
import React from 'react';
import { CharacterProvider } from '@/contexts/CharacterContext';
import ThemedBackground from '@/components/ThemedBackground';
import Navbar from '@/components/Navbar';
import WorldsContent from '@/components/worlds/WorldsContent';

const Worlds = () => {
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
