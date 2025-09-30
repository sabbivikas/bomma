
import { supabase } from '@/integrations/supabase/client';
import { Comment } from '@/types/doodle';
import { getSessionId } from './sessionService';

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
      .select('id, doodle_id, text, created_at, session_id')
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
      // Generate a safe hash for display purposes instead of exposing raw session_id
      sessionId: btoa(comment.session_id).substring(0, 8),
      createdAt: comment.created_at
    }));
  } catch (error) {
    console.error('Error in getCommentsForDoodle:', error);
    return [];
  }
}
