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
    likes: item.likes
  }));
}

// Add a new doodle to Supabase
export async function createDoodle(input: DoodleCreateInput): Promise<Doodle | null> {
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
    likes: data.likes
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
    likes: data.likes
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
    likes: item.likes
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

// Generate sample doodles for new users
export async function generateSampleDoodles(): Promise<Doodle[]> {
  // Check if we already have doodles in the database
  const { data: existingData, error: existingError } = await supabase
    .from('doodles')
    .select('id')
    .limit(1);
    
  if (!existingError && existingData && existingData.length > 0) {
    // We already have doodles, no need to generate samples
    return getAllDoodles();
  }
  
  // Shorter sample cartoon-style doodle images to avoid string issues
  const sampleDoodles = [
    {
      prompt: "Happy cartoon smiley face",
      imageUrl: "data:image/png;base64,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"
    },
    {
      prompt: "Simple red cartoon heart",
      imageUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAEiElEQVR4Xu2dT2sTQRjGn0mbtE1rLVStilb8gCIeBG/2C3jwohe/gAcP3qUXT30vHqQXT+JFvFREpLRFDKKI1VYUP0CLtmm67tbZzRubmd1JZpOdeZPMefadnWfzm5l3k02yFB9jCFBiVREJCCRiEAgEEgkBREUkKgkIJGIQCIFEQgBREYlKAgKJGAQCgURCQFERiQlCyOXpdP7TnysrdDHKXc33D+aqwcH6v5NeL3CbcEPC5PXixu+vtyYQJaIgafK70KbYISGBUz5tgQQA5YLcOXz42smDwr8+//l84aASEAg+7e6Rd9wGFwj7SILb2d7fOLpwPct2d0/YKfW8wfzQeZWD7nkMIcHmA1zb9Jj7q5fvdxycffnNfNwwp97KaRTXiGXrhw7jVzpkIzEOiSQDEQnCVskEgSDYBBIBnYo5xA2Xxg2lItAQtdGIkAnFra2fusmuS5S+8mnAy1ExKKQBCKkLZRrORkhVAKYeTFM2QkwIMIxNuFnCcIBJz1eAJBIPCbB8wAyUAEYprX/MVsu19sHTf/3XE7L7L1G1nuPDZnDZsdvXXeXz7JN39kjhjdWf1+yXG89yPUDpiwNYtcHTuIrXctbJFQClq3dfTeW7DEpz73fF1XhQjEx87u9c05qKgyeBddsLc+pEJC1tEapG6SbQmkbuCOz5dAJAgEAvHLcxeHB7ibXOHlXdgie5tXbcvK3YWpLiRkm9TlsAVpm9h6J9M8ixuCo/MW6R1IlRfiZZQ5FO7SKJxdPpd+H9Pv9/nL79sd5uYfm7NYat0kDDVP1k0c7bxV+4ccoPmibXIJBA2Cm0AgEAgEApEtmAQCgUAg6IxP40IgEAjbCfj9fvszPSKg9wYg1Q7LETQnBcoJpDgduJcuWAp1qzOM022zuJedQDKv14xPJhAIxPs+hEAkCJbpuW1jnENkfJYKQTDQSXhZSdhjF/d9wWUoRyCZn9rX/LdKBBI6i/Rl8G5QwC0SSgRCII4KUe3Ang7M3imN+9/qetrJmgtEteAmKsQ0qXXy6vIvLrjPJmz2QfjYUWwLbjJCGp9MtMAJpAEsJ1VGIAI5DASCQNgKQTAQSAZKmUMQDNtJeBsh3FtmXkaSIDIMYXoOkSC0BBJs1ZUQoMnIAkktQbA9a9hUlorkoQVS9QeswTSSLJjU3oXt2yZaIFVu+nDGJzvpPmvoDlJdVkpAH8ZLkKwmDfbGD4GAgwcCgUAyYOQwhwAYCASBQCAZ2CGYQwAMBAJk4C3K6hAXtuqdQ2wXGQl5K8n4uF2f9xGbV6Pt9Itq83QVchj+Z1Sh11573799OI0ID7bfFo+8t+cK16Oqcsp46vJP2oVr2/6xF96t3RHoQfXiPgKcMreOvyc5p+2+nN6kPd6proT4NMpnrKwVIvir3tm3T9/cXsj9ubzYePRhv9ht2Pr1a7/Y6R49dmoa+1ZRxm5Vra4duTnY+XNnbe3ytNfbnLb3nyVdHIjkwVbpNs4+EEjkUBEIBBIJAURFJCoJCCRiEAgEEgkBREUkKgkIJGIQSERB/gOBU5WIqLI8gwAAAABJRU5ErkJggg=="
    }
  ];
  
  // Insert sample doodles one by one to ensure all are created properly
  for (const doodle of sampleDoodles) {
    const sessionId = getSessionId();
    
    try {
      await createDoodle({
        imageUrl: doodle.imageUrl,
        prompt: doodle.prompt,
        sessionId
      });
    } catch (error) {
      console.error('Error creating sample doodle:', error);
    }
  }

  // Return all doodles after creating samples
  return await getAllDoodles();
}
