
import { useState, useEffect } from 'react';
import { getSessionId } from '@/utils/doodleService';

// List of admin session IDs (in a real application, this would be in a database or API)
const ADMIN_SESSION_IDS = [
  // Add the admin's session ID here - we'll use the current user's session ID for demo
  // In a real app, this would be stored securely in the database with proper authentication
];

export function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const sessionId = getSessionId();
        
        // For demo purposes, we'll make the current user an admin when they visit the page
        // In a real app, this would check against a secured database of admin users
        // This is ONLY for demonstration - in production use a proper auth system
        if (sessionId) {
          // Check if this session ID is in our admin list
          // OR add it to the list for demo purposes (remove this in production!)
          const isAdminUser = ADMIN_SESSION_IDS.includes(sessionId);
          
          // For demo purposes only - make current user an admin if they're not already
          if (!isAdminUser && !ADMIN_SESSION_IDS.includes(sessionId)) {
            ADMIN_SESSION_IDS.push(sessionId);
          }
          
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, []);

  return { isAdmin, isLoading };
}
