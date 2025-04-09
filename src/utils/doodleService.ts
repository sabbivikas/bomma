
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { Doodle, DoodleCreateInput, Comment } from '@/types/doodle';

// Get and set session ID (user's unique identifier stored in local storage)
export function getSessionId(): string {
  let sessionId = localStorage.getItem('bomma_session_id');
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem('bomma_session_id', sessionId);
  }
  return sessionId;
}

// Create a new doodle
export async function createDoodle(doodleInput: DoodleCreateInput): Promise<Doodle | null> {
  try {
    // Prepare the doodle data
    const doodleData: any = {
      image_url: doodleInput.imageUrl,
      prompt: doodleInput.prompt,
      session_id: doodleInput.sessionId,
      metadata: { 
        is_3d: doodleInput.is3D || false 
      }
    };
    
    // Insert the doodle
    const { data, error } = await supabase
      .from('doodles')
      .insert(doodleData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating doodle:', error);
      return null;
    }
    
    // Convert to our Doodle type with safe defaults
    const newDoodle: Doodle = {
      id: data.id,
      imageUrl: data.image_url,
      prompt: data.prompt,
      sessionId: data.session_id,
      createdAt: data.created_at,
      likes: data.likes || 0,
      reported: data.reported || false,
      reportCount: data.report_count || 0,
      moderationStatus: (data.moderation_status as "approved" | "pending" | "rejected") || "approved",
      is3D: data.metadata ? (typeof data.metadata === 'object' && 'is_3d' in (data.metadata as any) ? !!(data.metadata as any).is_3d : false) : false
    };
    
    return newDoodle;
  } catch (error) {
    console.error('Error in createDoodle:', error);
    return null;
  }
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
  
  // Convert the data to match our Doodle type with safe fallbacks
  return data.map(item => ({
    id: item.id,
    imageUrl: item.image_url,
    prompt: item.prompt,
    sessionId: item.session_id,
    createdAt: item.created_at,
    likes: item.likes,
    reported: item.reported || false,
    reportCount: item.report_count || 0,
    moderationStatus: (item.moderation_status as "approved" | "pending" | "rejected") || "approved",
    is3D: item.metadata ? (typeof (item.metadata as any) === 'object' && 'is_3d' in (item.metadata as any) ? !!(item.metadata as any).is_3d : false) : false
  }));
}

// Get all doodles for the public feed
export async function getAllDoodles(): Promise<Doodle[]> {
  const { data, error } = await supabase
    .from('doodles')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching all doodles:', error);
    return [];
  }
  
  // Convert the data to match our Doodle type with safe fallbacks
  return data.map(item => ({
    id: item.id,
    imageUrl: item.image_url,
    prompt: item.prompt,
    sessionId: item.session_id,
    createdAt: item.created_at,
    likes: item.likes || 0,
    reported: item.reported || false,
    reportCount: item.report_count || 0,
    moderationStatus: (item.moderation_status as "approved" | "pending" | "rejected") || "approved",
    is3D: item.metadata ? (typeof (item.metadata as any) === 'object' && 'is_3d' in (item.metadata as any) ? !!(item.metadata as any).is_3d : false) : false
  }));
}

// Like a doodle
export async function likeDoodle(doodleId: string): Promise<Doodle | null> {
  try {
    // First increment the likes count
    const { error: updateError } = await supabase.rpc('increment_integer', {
      row_id: doodleId,
      column_name: 'likes'
    });
    
    if (updateError) {
      console.error('Error liking doodle:', updateError);
      return null;
    }
    
    // Get the updated doodle
    const { data: updatedDoodle, error: fetchError } = await supabase
      .from('doodles')
      .select('*')
      .eq('id', doodleId)
      .single();
    
    if (fetchError) {
      console.error('Error fetching updated doodle:', fetchError);
      return null;
    }
    
    // Convert to our Doodle type
    return {
      id: updatedDoodle.id,
      imageUrl: updatedDoodle.image_url,
      prompt: updatedDoodle.prompt,
      sessionId: updatedDoodle.session_id,
      createdAt: updatedDoodle.created_at,
      likes: updatedDoodle.likes,
      reported: updatedDoodle.reported || false,
      reportCount: updatedDoodle.report_count || 0,
      moderationStatus: (updatedDoodle.moderation_status as "approved" | "pending" | "rejected") || "approved",
      is3D: updatedDoodle.metadata ? (typeof (updatedDoodle.metadata as any) === 'object' && 'is_3d' in (updatedDoodle.metadata as any) ? !!(updatedDoodle.metadata as any).is_3d : false) : false
    };
  } catch (error) {
    console.error('Error in likeDoodle:', error);
    return null;
  }
}

// Add a comment to a doodle
export async function addComment(doodleId: string, text: string): Promise<Comment | null> {
  try {
    const sessionId = getSessionId();
    
    const { data, error } = await supabase
      .from('comments')
      .insert({
        doodle_id: doodleId,
        session_id: sessionId,
        text: text
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error adding comment:', error);
      return null;
    }
    
    return {
      id: data.id,
      doodleId: data.doodle_id,
      text: data.text,
      sessionId: data.session_id,
      createdAt: data.created_at
    };
  } catch (error) {
    console.error('Error in addComment:', error);
    return null;
  }
}

// Get comments for a doodle
export async function getCommentsForDoodle(doodleId: string): Promise<Comment[]> {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('doodle_id', doodleId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
    
    return data.map(comment => ({
      id: comment.id,
      doodleId: comment.doodle_id,
      text: comment.text,
      sessionId: comment.session_id,
      createdAt: comment.created_at
    }));
  } catch (error) {
    console.error('Error in getCommentsForDoodle:', error);
    return [];
  }
}
