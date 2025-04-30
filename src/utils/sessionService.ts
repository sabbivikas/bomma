
import { v4 as uuidv4 } from 'uuid';

// Storage key for session ID
export const SESSION_ID_KEY = 'bomma_session_id';

// Get and set session ID (user's unique identifier stored in local storage)
export function getSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = uuidv4();
    console.log("Generated new session ID:", sessionId);
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  return sessionId;
}

// Initialize the session ID in Supabase
export async function initializeSessionId() {
  const { supabase } = await import('@/integrations/supabase/client');
  const sessionId = getSessionId();
  
  try {
    const { error } = await supabase.rpc('set_session_id', { 
      session_id: sessionId 
    });
    
    if (error) {
      console.error('Failed to initialize session ID:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Error initializing session:', err);
    return false;
  }
}
