
import { useState, useEffect } from 'react';
import { getSessionId } from '@/utils/doodleService';
import { supabase } from '@/integrations/supabase/client';

// List of authorized admin session IDs (in a real app, this would be in the database)
// For this demo, we're hardcoding some admin IDs
const ADMIN_SESSION_IDS = [
  "adminuser1234",  // Example admin ID
  "superadmin5678"  // Another example admin ID
  // Add your actual admin session IDs here
];

export function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const sessionId = getSessionId();
        
        if (sessionId && ADMIN_SESSION_IDS.includes(sessionId)) {
          // User is in the admin list
          setIsAdmin(true);
        } else {
          // User is not an admin
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
