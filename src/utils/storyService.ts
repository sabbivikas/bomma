
import { Story, StoryCreateInput, StoryFrame, StoryFrameCreateInput } from '@/types/doodle';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { getSessionId } from '@/utils/doodleService';

// Get all stories from Supabase
export async function getAllStories(): Promise<Story[]> {
  const { data: storiesData, error: storiesError } = await supabase
    .from('stories')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (storiesError) {
    console.error('Error fetching stories:', storiesError);
    return [];
  }
  
  // Fetch frames for each story
  const stories: Story[] = await Promise.all(
    storiesData.map(async (story) => {
      const { data: framesData, error: framesError } = await supabase
        .from('story_frames')
        .select('*')
        .eq('story_id', story.id)
        .order('order', { ascending: true });
      
      if (framesError) {
        console.error(`Error fetching frames for story ${story.id}:`, framesError);
        return {
          id: story.id,
          title: story.title,
          frames: [],
          createdAt: story.created_at,
          sessionId: story.session_id,
          likes: story.likes,
          isAnimation: story.is_animation
        };
      }
      
      // Convert to our StoryFrame type
      const frames: StoryFrame[] = framesData.map(frame => ({
        id: frame.id,
        storyId: frame.story_id,
        imageUrl: frame.image_url,
        order: frame.order,
        duration: frame.duration,
        createdAt: frame.created_at
      }));
      
      // Convert to our Story type
      return {
        id: story.id,
        title: story.title,
        frames,
        createdAt: story.created_at,
        sessionId: story.session_id,
        likes: story.likes,
        isAnimation: story.is_animation
      };
    })
  );
  
  return stories;
}

// Get a story by ID
export async function getStoryById(id: string): Promise<Story | null> {
  const { data: storyData, error: storyError } = await supabase
    .from('stories')
    .select('*')
    .eq('id', id)
    .single();
  
  if (storyError) {
    console.error(`Error fetching story ${id}:`, storyError);
    return null;
  }
  
  const { data: framesData, error: framesError } = await supabase
    .from('story_frames')
    .select('*')
    .eq('story_id', id)
    .order('order', { ascending: true });
  
  if (framesError) {
    console.error(`Error fetching frames for story ${id}:`, framesError);
    return null;
  }
  
  // Convert to our StoryFrame type
  const frames: StoryFrame[] = framesData.map(frame => ({
    id: frame.id,
    storyId: frame.story_id,
    imageUrl: frame.image_url,
    order: frame.order,
    duration: frame.duration,
    createdAt: frame.created_at
  }));
  
  // Convert to our Story type
  return {
    id: storyData.id,
    title: storyData.title,
    frames,
    createdAt: storyData.created_at,
    sessionId: storyData.session_id,
    likes: storyData.likes,
    isAnimation: storyData.is_animation
  };
}

// Create a new story
export async function createStory(input: StoryCreateInput): Promise<Story | null> {
  // Create the story
  const { data: storyData, error: storyError } = await supabase
    .from('stories')
    .insert({
      title: input.title,
      session_id: input.sessionId,
      is_animation: input.isAnimation,
      likes: 0
    })
    .select()
    .single();
  
  if (storyError) {
    console.error('Error creating story:', storyError);
    return null;
  }
  
  // Return the created story with empty frames
  return {
    id: storyData.id,
    title: storyData.title,
    frames: [],
    createdAt: storyData.created_at,
    sessionId: storyData.session_id,
    likes: storyData.likes,
    isAnimation: storyData.is_animation
  };
}

// Add a frame to a story
export async function addFrameToStory(storyId: string, frame: StoryFrameCreateInput): Promise<StoryFrame | null> {
  // Get the current max order value for the story
  const { data: maxOrderData, error: maxOrderError } = await supabase
    .from('story_frames')
    .select('order')
    .eq('story_id', storyId)
    .order('order', { ascending: false })
    .limit(1);
  
  const nextOrder = maxOrderError || !maxOrderData || maxOrderData.length === 0 ? 0 : maxOrderData[0].order + 1;
  
  // Add the frame
  const { data: frameData, error: frameError } = await supabase
    .from('story_frames')
    .insert({
      story_id: storyId,
      image_url: frame.imageUrl,
      order: nextOrder,
      duration: frame.duration
    })
    .select()
    .single();
  
  if (frameError) {
    console.error('Error adding frame to story:', frameError);
    return null;
  }
  
  // Convert to our StoryFrame type
  return {
    id: frameData.id,
    storyId: frameData.story_id,
    imageUrl: frameData.image_url,
    order: frameData.order,
    duration: frameData.duration,
    createdAt: frameData.created_at
  };
}

// Update a frame
export async function updateFrame(frameId: string, updates: Partial<StoryFrameCreateInput>): Promise<StoryFrame | null> {
  const updateData: Record<string, any> = {};
  
  if (updates.imageUrl !== undefined) updateData.image_url = updates.imageUrl;
  if (updates.order !== undefined) updateData.order = updates.order;
  if (updates.duration !== undefined) updateData.duration = updates.duration;
  
  const { data: frameData, error: frameError } = await supabase
    .from('story_frames')
    .update(updateData)
    .eq('id', frameId)
    .select()
    .single();
  
  if (frameError) {
    console.error(`Error updating frame ${frameId}:`, frameError);
    return null;
  }
  
  // Convert to our StoryFrame type
  return {
    id: frameData.id,
    storyId: frameData.story_id,
    imageUrl: frameData.image_url,
    order: frameData.order,
    duration: frameData.duration,
    createdAt: frameData.created_at
  };
}

// Delete a frame
export async function deleteFrame(frameId: string): Promise<boolean> {
  const { error } = await supabase
    .from('story_frames')
    .delete()
    .eq('id', frameId);
  
  if (error) {
    console.error(`Error deleting frame ${frameId}:`, error);
    return false;
  }
  
  return true;
}

// Get stories by session ID (user's stories)
export async function getMyStories(): Promise<Story[]> {
  const sessionId = getSessionId();
  
  const { data: storiesData, error: storiesError } = await supabase
    .from('stories')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false });
  
  if (storiesError) {
    console.error('Error fetching my stories:', storiesError);
    return [];
  }
  
  // Fetch frames for each story
  const stories: Story[] = await Promise.all(
    storiesData.map(async (story) => {
      const { data: framesData, error: framesError } = await supabase
        .from('story_frames')
        .select('*')
        .eq('story_id', story.id)
        .order('order', { ascending: true });
      
      if (framesError) {
        console.error(`Error fetching frames for story ${story.id}:`, framesError);
        return {
          id: story.id,
          title: story.title,
          frames: [],
          createdAt: story.created_at,
          sessionId: story.session_id,
          likes: story.likes,
          isAnimation: story.is_animation
        };
      }
      
      // Convert to our StoryFrame type
      const frames: StoryFrame[] = framesData.map(frame => ({
        id: frame.id,
        storyId: frame.story_id,
        imageUrl: frame.image_url,
        order: frame.order,
        duration: frame.duration,
        createdAt: frame.created_at
      }));
      
      // Convert to our Story type
      return {
        id: story.id,
        title: story.title,
        frames,
        createdAt: story.created_at,
        sessionId: story.session_id,
        likes: story.likes,
        isAnimation: story.is_animation
      };
    })
  );
  
  return stories;
}

// Like a story
export async function likeStory(id: string): Promise<Story | null> {
  // First get the current story to increment likes
  const { data: currentStory, error: fetchError } = await supabase
    .from('stories')
    .select('likes')
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
    .select()
    .single();
    
  if (error) {
    console.error('Error updating story likes:', error);
    return null;
  }
  
  // We need to fetch the frames separately
  const { data: framesData, error: framesError } = await supabase
    .from('story_frames')
    .select('*')
    .eq('story_id', id)
    .order('order', { ascending: true });
  
  if (framesError) {
    console.error(`Error fetching frames for story ${id}:`, framesError);
    return null;
  }
  
  // Convert to our StoryFrame type
  const frames: StoryFrame[] = framesData.map(frame => ({
    id: frame.id,
    storyId: frame.story_id,
    imageUrl: frame.image_url,
    order: frame.order,
    duration: frame.duration,
    createdAt: frame.created_at
  }));
  
  // Convert to our Story type
  return {
    id: data.id,
    title: data.title,
    frames,
    createdAt: data.created_at,
    sessionId: data.session_id,
    likes: data.likes,
    isAnimation: data.is_animation
  };
}

// Delete a story and all its frames
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
  
  // Delete the frames first (due to foreign key constraint)
  const { error: framesError } = await supabase
    .from('story_frames')
    .delete()
    .eq('story_id', id);
  
  if (framesError) {
    console.error(`Error deleting frames for story ${id}:`, framesError);
    return false;
  }
  
  // Then delete the story
  const { error: storyError } = await supabase
    .from('stories')
    .delete()
    .eq('id', id);
  
  if (storyError) {
    console.error(`Error deleting story ${id}:`, storyError);
    return false;
  }
  
  return true;
}
