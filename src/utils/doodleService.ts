import { Doodle, DoodleCreateInput, Comment } from '@/types/doodle';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';

// Key for storing session ID in local storage
const SESSION_ID_KEY = 'make-something-wonderful-session-id';

// Custom event for doodle publishing
const publishEvent = new Event('doodle-published');

// Get session ID or generate a new one
export function getSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  
  return sessionId;
}

// Get all doodles from Supabase
export async function getAllDoodles(): Promise<Doodle[]> {
  const { data, error } = await supabase
    .from('doodles')
    .select('*')
    .eq('moderation_status', 'approved') // Only show approved content
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching doodles:', error);
    return [];
  }
  
  // Convert the data to match our Doodle type
  return data.map(item => ({
    id: item.id,
    imageUrl: item.image_url,
    prompt: item.prompt,
    sessionId: item.session_id,
    createdAt: item.created_at,
    likes: item.likes,
    reported: item.reported,
    reportCount: item.report_count,
    moderationStatus: item.moderation_status
  }));
}

// Add a new doodle to Supabase
export async function createDoodle(input: DoodleCreateInput): Promise<Doodle | null> {
  // Additional validation before saving to database
  if (!input.imageUrl || input.imageUrl.length < 1000 || !input.prompt || input.prompt.trim().length < 3) {
    console.error('Invalid doodle data - missing required fields or content');
    return null;
  }
  
  const newDoodle = {
    image_url: input.imageUrl,
    prompt: input.prompt,
    session_id: input.sessionId,
    likes: 0
  };
  
  const { data, error } = await supabase
    .from('doodles')
    .insert(newDoodle)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating doodle:', error);
    return null;
  }
  
  // Dispatch event to notify other components that a doodle was published
  window.dispatchEvent(publishEvent);
  
  // Convert to our Doodle type
  return {
    id: data.id,
    imageUrl: data.image_url,
    prompt: data.prompt,
    sessionId: data.session_id,
    createdAt: data.created_at,
    likes: data.likes,
    reported: data.reported,
    reportCount: data.report_count,
    moderationStatus: data.moderation_status
  };
}

// Like a doodle
export async function likeDoodle(id: string): Promise<Doodle | null> {
  // First get the current doodle to increment likes
  const { data: currentDoodle, error: fetchError } = await supabase
    .from('doodles')
    .select('likes')
    .eq('id', id)
    .single();
    
  if (fetchError) {
    console.error('Error fetching doodle for like:', fetchError);
    return null;
  }
  
  const updatedLikes = (currentDoodle.likes || 0) + 1;
  
  // Update the likes count
  const { data, error } = await supabase
    .from('doodles')
    .update({ likes: updatedLikes })
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error('Error updating doodle likes:', error);
    return null;
  }
  
  // Convert to our Doodle type
  return {
    id: data.id,
    imageUrl: data.image_url,
    prompt: data.prompt,
    sessionId: data.session_id,
    createdAt: data.created_at,
    likes: data.likes,
    reported: data.reported,
    reportCount: data.report_count,
    moderationStatus: data.moderation_status
  };
}

// Get doodles by session ID (user's doodles)
export async function getMyDoodles(): Promise<Doodle[]> {
  const sessionId = getSessionId();
  
  const { data, error } = await supabase
    .from('doodles')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching my doodles:', error);
    return [];
  }
  
  // Convert the data to match our Doodle type
  return data.map(item => ({
    id: item.id,
    imageUrl: item.image_url,
    prompt: item.prompt,
    sessionId: item.session_id,
    createdAt: item.created_at,
    likes: item.likes,
    reported: item.reported,
    reportCount: item.report_count,
    moderationStatus: item.moderation_status
  }));
}

// Delete a doodle (only if it belongs to the current session)
export async function deleteDoodle(id: string): Promise<boolean> {
  const sessionId = getSessionId();
  
  // First check if doodle belongs to current session
  const { data: doodleData, error: checkError } = await supabase
    .from('doodles')
    .select('session_id')
    .eq('id', id)
    .single();
  
  if (checkError || !doodleData) {
    console.error('Error checking doodle ownership:', checkError);
    return false;
  }
  
  if (doodleData.session_id !== sessionId) {
    console.error('Cannot delete doodle owned by another session');
    return false;
  }
  
  // Delete the doodle
  const { error } = await supabase
    .from('doodles')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting doodle:', error);
    return false;
  }
  
  return true;
}

// Comments related functions
export async function getCommentsForDoodle(doodleId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('doodle_id', doodleId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
  
  // Convert the data to match our Comment type
  return data.map(item => ({
    id: item.id,
    doodleId: item.doodle_id,
    text: item.text,
    createdAt: item.created_at,
    sessionId: item.session_id
  }));
}

export async function addComment(doodleId: string, text: string): Promise<Comment | null> {
  const sessionId = getSessionId();
  
  const newComment = {
    doodle_id: doodleId,
    text,
    session_id: sessionId
  };
  
  const { data, error } = await supabase
    .from('comments')
    .insert(newComment)
    .select()
    .single();
  
  if (error) {
    console.error('Error adding comment:', error);
    return null;
  }
  
  // Convert to our Comment type
  return {
    id: data.id,
    doodleId: data.doodle_id,
    text: data.text,
    createdAt: data.created_at,
    sessionId: data.session_id
  };
}

// Generate sample doodles for new users - completely disable this functionality
export async function generateSampleDoodles(): Promise<Doodle[]> {
  // Explicitly return empty array, no sample doodles anymore
  return [];
}
