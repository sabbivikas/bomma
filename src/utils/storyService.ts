
import { Story, StoryCreateInput, StoryFrame, StoryFrameCreateInput } from '@/types/doodle';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { getSessionId } from '@/utils/doodleService';

// Helper function to convert database row to StoryFrame model
const mapToStoryFrame = (row: any): StoryFrame => ({
  id: row.id,
  storyId: row.story_id,
  imageUrl: row.image_url,
  order: row.order,
  duration: row.duration,
  createdAt: row.created_at
});

// Helper function to convert database row to Story model
const mapToStory = (row: any, frames: StoryFrame[] = []): Story => ({
  id: row.id,
  title: row.title,
  frames,
  createdAt: row.created_at,
  sessionId: row.session_id,
  likes: row.likes || 0,
  isAnimation: row.is_animation
});

// Get all stories from Supabase
export async function getAllStories(): Promise<Story[]> {
  try {
    // Use any type to bypass TypeScript's type checking since we're handling the mapping manually
    const { data: storiesData, error: storiesError } = await supabase
      .from('stories')
      .select('*')
      .order('created_at', { ascending: false }) as { data: any[], error: any };
    
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
          .order('order', { ascending: true }) as { data: any[], error: any };
        
        if (framesError) {
          console.error(`Error fetching frames for story ${story.id}:`, framesError);
          return mapToStory(story, []);
        }
        
        // Convert to our StoryFrame type
        const frames: StoryFrame[] = framesData.map(mapToStoryFrame);
        
        // Convert to our Story type
        return mapToStory(story, frames);
      })
    );
    
    return stories;
  } catch (err) {
    console.error('Unexpected error in getAllStories:', err);
    return [];
  }
}

// Get a story by ID
export async function getStoryById(id: string): Promise<Story | null> {
  try {
    const { data: storyData, error: storyError } = await supabase
      .from('stories')
      .select('*')
      .eq('id', id)
      .single() as { data: any, error: any };
    
    if (storyError) {
      console.error(`Error fetching story ${id}:`, storyError);
      return null;
    }
    
    const { data: framesData, error: framesError } = await supabase
      .from('story_frames')
      .select('*')
      .eq('story_id', id)
      .order('order', { ascending: true }) as { data: any[], error: any };
    
    if (framesError) {
      console.error(`Error fetching frames for story ${id}:`, framesError);
      return mapToStory(storyData, []);
    }
    
    // Convert to our StoryFrame type
    const frames: StoryFrame[] = framesData.map(mapToStoryFrame);
    
    // Convert to our Story type
    return mapToStory(storyData, frames);
  } catch (err) {
    console.error(`Unexpected error in getStoryById for ${id}:`, err);
    return null;
  }
}

// Create a new story
export async function createStory(input: StoryCreateInput): Promise<Story | null> {
  try {
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
      .single() as { data: any, error: any };
    
    if (storyError) {
      console.error('Error creating story:', storyError);
      return null;
    }
    
    // Return the created story with empty frames
    return mapToStory(storyData, []);
  } catch (err) {
    console.error('Unexpected error in createStory:', err);
    return null;
  }
}

// Add a frame to a story
export async function addFrameToStory(storyId: string, frame: StoryFrameCreateInput): Promise<StoryFrame | null> {
  try {
    // Get the current max order value for the story
    const { data: maxOrderData, error: maxOrderError } = await supabase
      .from('story_frames')
      .select('order')
      .eq('story_id', storyId)
      .order('order', { ascending: false })
      .limit(1) as { data: any[], error: any };
    
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
      .single() as { data: any, error: any };
    
    if (frameError) {
      console.error('Error adding frame to story:', frameError);
      return null;
    }
    
    // Convert to our StoryFrame type
    return mapToStoryFrame(frameData);
  } catch (err) {
    console.error(`Unexpected error in addFrameToStory for ${storyId}:`, err);
    return null;
  }
}

// Update a frame
export async function updateFrame(frameId: string, updates: Partial<StoryFrameCreateInput>): Promise<StoryFrame | null> {
  try {
    const updateData: Record<string, any> = {};
    
    if (updates.imageUrl !== undefined) updateData.image_url = updates.imageUrl;
    if (updates.order !== undefined) updateData.order = updates.order;
    if (updates.duration !== undefined) updateData.duration = updates.duration;
    
    const { data: frameData, error: frameError } = await supabase
      .from('story_frames')
      .update(updateData)
      .eq('id', frameId)
      .select()
      .single() as { data: any, error: any };
    
    if (frameError) {
      console.error(`Error updating frame ${frameId}:`, frameError);
      return null;
    }
    
    // Convert to our StoryFrame type
    return mapToStoryFrame(frameData);
  } catch (err) {
    console.error(`Unexpected error in updateFrame for ${frameId}:`, err);
    return null;
  }
}

// Delete a frame
export async function deleteFrame(frameId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('story_frames')
      .delete()
      .eq('id', frameId) as { error: any };
    
    if (error) {
      console.error(`Error deleting frame ${frameId}:`, error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error(`Unexpected error in deleteFrame for ${frameId}:`, err);
    return false;
  }
}

// Get stories by session ID (user's stories)
export async function getMyStories(): Promise<Story[]> {
  try {
    const sessionId = getSessionId();
    
    const { data: storiesData, error: storiesError } = await supabase
      .from('stories')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false }) as { data: any[], error: any };
    
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
          .order('order', { ascending: true }) as { data: any[], error: any };
        
        if (framesError) {
          console.error(`Error fetching frames for story ${story.id}:`, framesError);
          return mapToStory(story, []);
        }
        
        // Convert to our StoryFrame type
        const frames: StoryFrame[] = framesData.map(mapToStoryFrame);
        
        // Convert to our Story type
        return mapToStory(story, frames);
      })
    );
    
    return stories;
  } catch (err) {
    console.error('Unexpected error in getMyStories:', err);
    return [];
  }
}

// Like a story
export async function likeStory(id: string): Promise<Story | null> {
  try {
    // First get the current story to increment likes
    const { data: currentStory, error: fetchError } = await supabase
      .from('stories')
      .select('likes')
      .eq('id', id)
      .single() as { data: any, error: any };
      
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
      .single() as { data: any, error: any };
      
    if (error) {
      console.error('Error updating story likes:', error);
      return null;
    }
    
    // We need to fetch the frames separately
    const { data: framesData, error: framesError } = await supabase
      .from('story_frames')
      .select('*')
      .eq('story_id', id)
      .order('order', { ascending: true }) as { data: any[], error: any };
    
    if (framesError) {
      console.error(`Error fetching frames for story ${id}:`, framesError);
      return mapToStory(data, []);
    }
    
    // Convert to our StoryFrame type
    const frames: StoryFrame[] = framesData.map(mapToStoryFrame);
    
    // Convert to our Story type
    return mapToStory(data, frames);
  } catch (err) {
    console.error(`Unexpected error in likeStory for ${id}:`, err);
    return null;
  }
}

// Delete a story and all its frames
export async function deleteStory(id: string): Promise<boolean> {
  try {
    const sessionId = getSessionId();
    
    // First check if story belongs to current session
    const { data: storyData, error: checkError } = await supabase
      .from('stories')
      .select('session_id')
      .eq('id', id)
      .single() as { data: any, error: any };
    
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
      .eq('story_id', id) as { error: any };
    
    if (framesError) {
      console.error(`Error deleting frames for story ${id}:`, framesError);
      return false;
    }
    
    // Then delete the story
    const { error: storyError } = await supabase
      .from('stories')
      .delete()
      .eq('id', id) as { error: any };
    
    if (storyError) {
      console.error(`Error deleting story ${id}:`, storyError);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error(`Unexpected error in deleteStory for ${id}:`, err);
    return false;
  }
}
