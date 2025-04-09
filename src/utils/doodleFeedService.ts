
import { supabase } from '@/integrations/supabase/client';
import { Doodle } from '@/types/doodle';

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
    is3D: (item as any).metadata ? (typeof (item as any).metadata === 'object' && 'is_3d' in ((item as any).metadata as any) ? !!((item as any).metadata as any).is_3d : false) : false
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
      is3D: (updatedDoodle as any).metadata ? (typeof (updatedDoodle as any).metadata === 'object' && 'is_3d' in ((updatedDoodle as any).metadata as any) ? !!((updatedDoodle as any).metadata as any).is_3d : false) : false
    };
  } catch (error) {
    console.error('Error in likeDoodle:', error);
    return null;
  }
}
