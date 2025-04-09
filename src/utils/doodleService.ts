
import { supabase } from '@/integrations/supabase/client';
import { Doodle, DoodleCreateInput } from '@/types/doodle';
import { getSessionId } from './sessionService';

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
      is3D: (data as any).metadata ? (typeof (data as any).metadata === 'object' && 'is_3d' in ((data as any).metadata as any) ? !!((data as any).metadata as any).is_3d : false) : false
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
    is3D: (item as any).metadata ? (typeof (item as any).metadata === 'object' && 'is_3d' in ((item as any).metadata as any) ? !!((item as any).metadata as any).is_3d : false) : false
  }));
}

// Export the functions from the other files to maintain backward compatibility
export { getSessionId } from './sessionService';
export { getAllDoodles, likeDoodle } from './doodleFeedService';
export { addComment, getCommentsForDoodle } from './commentService';
