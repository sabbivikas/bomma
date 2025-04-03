
import { supabase } from '@/integrations/supabase/client';
import { getSessionId } from '@/utils/doodleService';

// Interface for content reports
export interface ContentReport {
  id: string;
  contentId: string;
  contentType: 'doodle' | 'story';
  reason: string;
  details?: string;
  sessionId: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: string;
}

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

// Get reports for moderators (future implementation)
export async function getReports(status?: 'pending' | 'reviewed' | 'resolved'): Promise<ContentReport[]> {
  try {
    let query = supabase
      .from('content_reports')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching reports:', error);
      return [];
    }
    
    // Convert to our ContentReport type
    return data.map(item => ({
      id: item.id,
      contentId: item.content_id,
      contentType: item.content_type,
      reason: item.reason,
      details: item.details,
      sessionId: item.session_id,
      status: item.status,
      createdAt: item.created_at
    }));
  } catch (error) {
    console.error('Error in getReports:', error);
    return [];
  }
}
