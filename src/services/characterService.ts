
import { supabase } from "@/integrations/supabase/client";
import { getSessionId } from "@/utils/sessionService";

export interface Character {
  id: string;
  name: string;
  imageUrl: string;
  createdAt: Date;
}

export async function fetchCharacters(): Promise<Character[]> {
  const { data, error } = await supabase
    .from('characters')
    .select('*')
    .eq('session_id', getSessionId());

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
  // Set the session_id header for RLS policies
  const { data: configData, error: configError } = await supabase.rpc(
    'set_session_id',
    { session_id: getSessionId() }
  ).select('set_config');

  if (configError) {
    console.error('Error setting session ID:', configError);
    throw configError;
  }

  // Now insert the character
  const { data, error } = await supabase
    .from('characters')
    .insert([{
      name,
      image_url: imageUrl,
      session_id: getSessionId()
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
  // Set the session_id header for RLS policies
  const { error: configError } = await supabase.rpc(
    'set_session_id',
    { session_id: getSessionId() }
  );

  if (configError) {
    console.error('Error setting session ID:', configError);
    throw configError;
  }

  const { error } = await supabase
    .from('characters')
    .delete()
    .eq('id', id)
    .eq('session_id', getSessionId());

  if (error) {
    console.error('Error deleting character:', error);
    throw error;
  }
}
