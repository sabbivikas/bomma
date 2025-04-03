
import { supabase } from '@/integrations/supabase/client';
import { getSessionId } from '@/utils/doodleService';
import { ContentReport } from '@/types/doodle';

// Report content function
export async function reportContent(
  contentId: string,
  contentType: 'doodle' | 'story',
  reason: string,
  details?: string
): Promise<boolean> {
  try {
    const sessionId = getSessionId();
    
    // Create a new report
    const { error } = await supabase
      .from('content_reports')
      .insert({
        content_id: contentId,
        content_type: contentType,
        reason,
        details: details || null,
        session_id: sessionId,
        status: 'pending'
      });
    
    if (error) {
      console.error('Error creating report:', error);
      return false;
    }
    
    // Additionally, flag the content in its respective table
    const table = contentType === 'doodle' ? 'doodles' : 'stories';
    
    // Use a direct update with reported flag and increment report count
    const { error: flagError } = await supabase
      .from(table)
      .update({ 
        reported: true,
        report_count: supabase.rpc('increment_report_count', { 
          row_id: contentId,
          table_name: table
        })
      })
      .eq('id', contentId);
    
    if (flagError) {
      console.error(`Error flagging ${contentType}:`, flagError);
      // Don't return false here as the report was still created
    }
    
    return true;
  } catch (error) {
    console.error('Error in reportContent:', error);
    return false;
  }
}

// Get reports for moderators
export async function getReports(status?: 'pending' | 'reviewed' | 'resolved'): Promise<ContentReport[]> {
  try {
    let query = supabase
      .from('content_reports')
      .select('*');
    
    if (status) {
      query = query.eq('status', status);
    }
    
    query = query.order('created_at', { ascending: false });
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching reports:', error);
      return [];
    }
    
    if (!data) {
      return [];
    }
    
    // Convert to our ContentReport type
    return data.map(item => ({
      id: item.id,
      contentId: item.content_id,
      contentType: item.content_type as 'doodle' | 'story',
      reason: item.reason,
      details: item.details,
      sessionId: item.session_id,
      status: item.status as 'pending' | 'reviewed' | 'resolved',
      createdAt: item.created_at,
      resolvedAt: item.resolved_at
    }));
  } catch (error) {
    console.error('Error in getReports:', error);
    return [];
  }
}

// Update report status
export async function updateReportStatus(
  reportId: string,
  status: 'pending' | 'reviewed' | 'resolved'
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('content_reports')
      .update({ 
        status,
        resolved_at: status === 'resolved' ? new Date().toISOString() : null 
      })
      .eq('id', reportId);
    
    if (error) {
      console.error('Error updating report status:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in updateReportStatus:', error);
    return false;
  }
}

// Update content moderation status
export async function updateContentModerationStatus(
  contentId: string,
  contentType: 'doodle' | 'story',
  moderationStatus: 'pending' | 'approved' | 'rejected'
): Promise<boolean> {
  try {
    const table = contentType === 'doodle' ? 'doodles' : 'stories';
    
    const { error } = await supabase
      .from(table)
      .update({ moderation_status: moderationStatus })
      .eq('id', contentId);
    
    if (error) {
      console.error(`Error updating ${contentType} moderation status:`, error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in updateContentModerationStatus:', error);
    return false;
  }
}
