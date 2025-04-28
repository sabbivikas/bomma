
import { supabase } from "@/integrations/supabase/client";
import { getSessionId } from "@/utils/sessionService";

export interface Character {
  id: string;
  name: string;
  imageUrl: string;
  createdAt: Date;
}

/**
 * Sets the session ID in the database connection for Row Level Security
 */
async function setSessionIdForRLS(): Promise<void> {
  try {
    const sessionId = getSessionId();
    console.log("Setting session ID for RLS:", sessionId);
    
    const { error } = await supabase.rpc('set_session_id', { 
      session_id: sessionId 
    });
    
    if (error) {
      console.error('Error setting session ID:', error);
      throw error;
    }
    
    console.log("Session ID set successfully");
  } catch (error) {
    console.error('Failed to set session ID for RLS:', error);
    throw error;
  }
}

export async function fetchCharacters(): Promise<Character[]> {
  try {
    // Set the session ID for RLS before fetching
    await setSessionIdForRLS();
    
    const sessionId = getSessionId();
    console.log("Fetching characters for session:", sessionId);

    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false }); // Order by creation date, newest first

    if (error) {
      console.error('Error fetching characters:', error);
      throw error;
    }

    console.log("Characters fetched:", data?.length || 0);
    return (data || []).map(char => ({
      id: char.id,
      name: char.name,
      imageUrl: char.image_url,
      createdAt: new Date(char.created_at)
    }));
  } catch (error) {
    console.error('Failed to fetch characters:', error);
    throw error;
  }
}

export async function createCharacter(name: string, imageUrl: string): Promise<Character> {
  try {
    // Make sure we have a valid session ID and it's set before creating
    const sessionId = getSessionId();
    if (!sessionId) {
      throw new Error('No session ID available');
    }
    
    // Set the session ID for RLS before creating
    await setSessionIdForRLS();
    
    console.log("Creating character with session ID:", sessionId);
    console.log("Image URL length:", imageUrl?.length || 0);
    
    // Verify image URL is not empty
    if (!imageUrl || imageUrl.trim().length === 0) {
      throw new Error('Invalid image URL');
    }
    
    // Insert the character with explicit session_id
    const { data, error } = await supabase
      .from('characters')
      .insert([{
        name,
        image_url: imageUrl,
        session_id: sessionId // Explicitly set the session_id
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating character:', error);
      throw error;
    }

    console.log("Character created successfully:", data);
    return {
      id: data.id,
      name: data.name,
      imageUrl: data.image_url,
      createdAt: new Date(data.created_at)
    };
  } catch (error) {
    console.error('Error creating character:', error);
    throw error;
  }
}

export async function deleteCharacter(id: string): Promise<void> {
  try {
    // Set the session ID for RLS before deleting
    await setSessionIdForRLS();
    
    const sessionId = getSessionId();
    console.log("Deleting character with ID:", id, "for session:", sessionId);
    
    const { error } = await supabase
      .from('characters')
      .delete()
      .eq('id', id)
      .eq('session_id', sessionId); // Explicitly filter by session_id

    if (error) {
      console.error('Error deleting character:', error);
      throw error;
    }
    
    console.log("Character deleted successfully");
  } catch (error) {
    console.error('Error deleting character:', error);
    throw error;
  }
}
