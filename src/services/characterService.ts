
import { supabase } from "@/integrations/supabase/client";
import { getSessionId } from "@/utils/sessionService";

export interface Character {
  id: string;
  name: string;
  imageUrl: string;
  createdAt: Date;
}

export async function fetchCharacters(): Promise<Character[]> {
  try {
    const sessionId = getSessionId();
    console.log("Fetching characters for session:", sessionId);

    // First, ensure the session ID is set in the database context
    const { error: sessionError } = await supabase.rpc('set_session_id', { 
      session_id: sessionId 
    });
    
    if (sessionError) {
      console.error('Error setting session ID:', sessionError);
      throw sessionError;
    }

    // Then fetch characters
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .eq('session_id', sessionId);

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
  } catch (error) {
    console.error('Failed to fetch characters:', error);
    throw error;
  }
}

export async function createCharacter(name: string, imageUrl: string): Promise<Character> {
  try {
    if (!name || !imageUrl) {
      throw new Error("Name and image URL are required");
    }
    
    const sessionId = getSessionId();
    console.log("Creating character with session ID:", sessionId);
    
    // Ensure the session ID is set in the database context first
    const { error: sessionError } = await supabase.rpc('set_session_id', { 
      session_id: sessionId 
    });
    
    if (sessionError) {
      console.error('Error setting session ID in createCharacter:', sessionError);
      throw sessionError;
    }
    
    // Attempt to create the character
    const { data, error } = await supabase
      .from('characters')
      .insert([{
        name,
        image_url: imageUrl,
        session_id: sessionId
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating character (detailed):', error);
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
    const sessionId = getSessionId();
    console.log("Deleting character with ID:", id, "for session:", sessionId);
    
    // Ensure the session ID is set in the database context first
    const { error: sessionError } = await supabase.rpc('set_session_id', { 
      session_id: sessionId 
    });
    
    if (sessionError) {
      console.error('Error setting session ID:', sessionError);
      throw sessionError;
    }
    
    const { error } = await supabase
      .from('characters')
      .delete()
      .eq('id', id)
      .eq('session_id', sessionId);

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
