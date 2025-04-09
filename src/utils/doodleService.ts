
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
    reported: (item as any).reported || false,
    reportCount: (item as any).report_count || 0,
    moderationStatus: (item as any).moderation_status || 'approved',
    is3D: item.metadata?.is_3d || false // Get is3D from metadata
  }));
}
