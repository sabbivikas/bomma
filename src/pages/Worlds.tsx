
import React, { useEffect } from 'react';
import { CharacterProvider } from '@/contexts/CharacterContext';
import ThemedBackground from '@/components/ThemedBackground';
import Navbar from '@/components/Navbar';
import WorldsContent from '@/components/worlds/WorldsContent';
import { getSessionId } from '@/utils/sessionService';
import { supabase } from '@/integrations/supabase/client';

const Worlds = () => {
  // Initialize session ID as soon as the Worlds page loads
  useEffect(() => {
    const initSession = async () => {
      try {
        const sessionId = getSessionId();
        console.log("Initializing session ID on Worlds page:", sessionId);
        
        const { error } = await supabase.rpc('set_session_id', { 
          session_id: sessionId 
        });
        
        if (error) {
          console.error('Failed to initialize session ID:', error);
        } else {
          console.log("Session ID initialized successfully");
        }
      } catch (err) {
        console.error('Error initializing session:', err);
      }
    };
    
    initSession();
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
