
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
        
        // Make multiple attempts if needed
        let retries = 0;
        let success = false;
        
        while (retries < 3 && !success) {
          const { error } = await supabase.rpc('set_session_id', { 
            session_id: sessionId 
          });
          
          if (error) {
            console.error(`Failed to initialize session ID (attempt ${retries + 1}):`, error);
            retries++;
            // Small delay before retry
            await new Promise(resolve => setTimeout(resolve, 500));
          } else {
            console.log("Session ID initialized successfully on Worlds page");
            success = true;
          }
        }
        
        if (!success) {
          console.error('All attempts to initialize session ID failed');
        }
      } catch (err) {
        console.error('Error initializing session on Worlds page:', err);
      }
    };
    
    // Initialize immediately
    initSession();
    
    // Also initialize on visibility change (when tab becomes active again)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log("Page became visible, refreshing session ID");
        initSession();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
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
