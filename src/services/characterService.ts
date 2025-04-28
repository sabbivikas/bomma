
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
  const sessionId = getSessionId();
  // Using the correct parameter name and ensuring proper error handling
  const { error } = await supabase.rpc('set_session_id', { session_id: sessionId });
  
  if (error) {
    console.error('Error setting session ID:', error);
    throw error;
  }
}

export async function fetchCharacters(): Promise<Character[]> {
  // Set the session ID for RLS before fetching
  await setSessionIdForRLS();

  const { data, error } = await supabase
    .from('characters')
    .select('*');

  if (error) {
    console.error('Error fetching characters:', error);
    throw error;
  }

  return data.map(char => ({
    id: char.id,
    name: char.name,
    imageUrl: char.image_url,
    createdAt: new Date(char.created_at)
  }));
}

export async function createCharacter(name: string, imageUrl: string): Promise<Character> {
  // Set the session ID for RLS before creating
  await setSessionIdForRLS();
  
  const sessionId = getSessionId(); // Get session ID explicitly
  
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

  return {
    id: data.id,
    name: data.name,
    imageUrl: data.image_url,
    createdAt: new Date(data.created_at)
  };
}

export async function deleteCharacter(id: string): Promise<void> {
  // Set the session ID for RLS before deleting
  await setSessionIdForRLS();
  
  const { error } = await supabase
    .from('characters')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting character:', error);
    throw error;
  }
}
