import { Story, StoryCreateInput, Frame, FrameCreateInput, Comment } from '@/types/doodle';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';

// Key for storing session ID in local storage
const SESSION_ID_KEY = 'make-something-wonderful-session-id';

// Custom event for story publishing
const publishEvent = new Event('story-published');

// Get session ID or generate a new one
export function getSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  
  return sessionId;
}

// Get all stories from Supabase
export async function getAllStories(): Promise<Story[]> {
  const { data, error } = await supabase
    .from('stories')
    .select('*, story_frames(*)')
    .eq('moderation_status', 'approved') // Only show approved content
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching stories:', error);
    return [];
  }
  
  // Convert the data to match our Story type
  return data.map(item => ({
    id: item.id,
    title: item.title,
    isAnimation: item.is_animation,
    frames: (item.story_frames || []).map((frame: any) => ({
      id: frame.id,
      storyId: frame.story_id,
      imageUrl: frame.image_url,
      order: frame.order,
      duration: frame.duration,
      createdAt: frame.created_at
    })),
    sessionId: item.session_id,
    createdAt: item.created_at,
    likes: item.likes,
    reported: item.reported || false,
    reportCount: item.report_count || 0,
    moderationStatus: (item.moderation_status as any) || 'approved'
  }));
}

// Add a new story to Supabase
export async function createStory(input: StoryCreateInput): Promise<Story | null> {
  // Additional validation before saving to database
  if (!input.title || input.title.trim().length < 3) {
    console.error('Invalid story data - missing required fields or content');
    return null;
  }
  
  const newStory = {
    title: input.title,
    is_animation: input.isAnimation,
    session_id: input.sessionId,
    likes: 0
  };
  
  const { data, error } = await supabase
    .from('stories')
    .insert(newStory)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating story:', error);
    return null;
  }
  
  // Dispatch event to notify other components that a story was published
  window.dispatchEvent(publishEvent);
  
  // Convert to our Story type with safe fallbacks for new fields
  return {
    id: data.id,
    title: data.title,
    isAnimation: data.is_animation,
    frames: [], // New story has no frames yet
    sessionId: data.session_id,
    createdAt: data.created_at,
    likes: data.likes,
    reported: (data as any).reported || false,
    reportCount: (data as any).report_count || 0,
    moderationStatus: (data as any).moderation_status || 'approved'
  };
}

// Add a frame to a story
export async function addFrameToStory(storyId: string, frameData: FrameCreateInput): Promise<Frame | null> {
  // Prepare the frame data
  const newFrame = {
    story_id: storyId,
    image_url: frameData.imageUrl,
    order: frameData.order,
    duration: frameData.duration
  };
  
  const { data, error } = await supabase
    .from('story_frames')
    .insert(newFrame)
    .select()
    .single();
  
  if (error) {
    console.error('Error adding frame to story:', error);
    return null;
  }
  
  // Convert to our Frame type
  return {
    id: data.id,
    storyId: data.story_id,
    imageUrl: data.image_url,
    order: data.order,
    duration: data.duration,
    createdAt: data.created_at
  };
}

// Like a story
export async function likeStory(id: string): Promise<Story | null> {
  // First get the current story to increment likes
  const { data: currentStory, error: fetchError } = await supabase
    .from('stories')
    .select('*, story_frames(*)')
    .eq('id', id)
    .single();
    
  if (fetchError) {
    console.error('Error fetching story for like:', fetchError);
    return null;
  }
  
  const updatedLikes = (currentStory.likes || 0) + 1;
  
  // Update the likes count
  const { data, error } = await supabase
    .from('stories')
    .update({ likes: updatedLikes })
    .eq('id', id)
    .select('*, story_frames(*)')
    .single();
    
  if (error) {
    console.error('Error updating story likes:', error);
    return null;
  }
  
  // Convert to our Story type with safe fallbacks for new fields
  return {
    id: data.id,
    title: data.title,
    isAnimation: data.is_animation,
    frames: (data.story_frames || []).map((frame: any) => ({
      id: frame.id,
      storyId: frame.story_id,
      imageUrl: frame.image_url,
      order: frame.order,
      duration: frame.duration,
      createdAt: frame.created_at
    })),
    sessionId: data.session_id,
    createdAt: data.created_at,
    likes: data.likes,
    reported: (data as any).reported || false,
    reportCount: (data as any).report_count || 0,
    moderationStatus: (data as any).moderation_status || 'approved'
  };
}

// Get stories by session ID (user's stories)
export async function getMyStories(): Promise<Story[]> {
  const sessionId = getSessionId();
  
  const { data, error } = await supabase
    .from('stories')
    .select('*, story_frames(*)')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching my stories:', error);
    return [];
  }
  
  // Convert the data to match our Story type with safe fallbacks
  return data.map(item => ({
    id: item.id,
    title: item.title,
    isAnimation: item.is_animation,
    frames: (item.story_frames || []).map((frame: any) => ({
      id: frame.id,
      storyId: frame.story_id,
      imageUrl: frame.image_url,
      order: frame.order,
      duration: frame.duration,
      createdAt: frame.created_at
    })),
    sessionId: item.session_id,
    createdAt: item.created_at,
    likes: item.likes,
    reported: item.reported || false,
    reportCount: item.report_count || 0,
    moderationStatus: (item.moderation_status as any) || 'approved'
  }));
}

// Delete a story (only if it belongs to the current session)
export async function deleteStory(id: string): Promise<boolean> {
  const sessionId = getSessionId();
  
  // First check if story belongs to current session
  const { data: storyData, error: checkError } = await supabase
    .from('stories')
    .select('session_id')
    .eq('id', id)
    .single();
  
  if (checkError || !storyData) {
    console.error('Error checking story ownership:', checkError);
    return false;
  }
  
  if (storyData.session_id !== sessionId) {
    console.error('Cannot delete story owned by another session');
    return false;
  }
  
  // Delete the story
  const { error } = await supabase
    .from('stories')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting story:', error);
    return false;
  }
  
  return true;
}

// Get a specific story by ID
export async function getStoryById(id: string): Promise<Story | null> {
  const { data, error } = await supabase
    .from('stories')
    .select('*, story_frames(*)')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching story:', error);
    return null;
  }
  
  if (!data) {
    return null;
  }
  
  // Convert the data to match our Story type
  return {
    id: data.id,
    title: data.title,
    isAnimation: data.is_animation,
    frames: (data.story_frames || []).map((frame: any) => ({
      id: frame.id,
      storyId: frame.story_id,
      imageUrl: frame.image_url,
      order: frame.order,
      duration: frame.duration,
      createdAt: frame.created_at
    })),
    sessionId: data.session_id,
    createdAt: data.created_at,
    likes: data.likes,
    reported: data.reported || false,
    reportCount: data.report_count || 0,
    moderationStatus: (data.moderation_status as any) || 'approved'
  };
}

// Comments related functions
// Get comments for a story
export async function getCommentsForStory(storyId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select('id, story_id, text, created_at, session_id')
    .eq('story_id', storyId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching story comments:', error);
    return [];
  }
  
  // Convert the data to match our Comment type with safe session handling
  return data.map(item => ({
    id: item.id,
    storyId: item.story_id,
    text: item.text,
    createdAt: item.created_at,
    // Generate a safe hash for display purposes instead of exposing raw session_id
    sessionId: btoa(item.session_id).substring(0, 8)
  }));
}

// Add comment to a story
export async function addCommentToStory(storyId: string, commentText: string): Promise<Comment | null> {
  const sessionId = getSessionId();
  
  const newComment = {
    story_id: storyId,
    text: commentText,
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
  
  return {
    id: data.id,
    storyId: data.story_id,
    text: data.text,
    createdAt: data.created_at,
    sessionId: data.session_id
  };
}

// Get comment count for a story
export async function getCommentCountForStory(storyId: string): Promise<number> {
  const { count, error } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('story_id', storyId);
    
  if (error) {
    console.error('Error getting comment count:', error);
    return 0;
  }
  
  return count || 0;
}
