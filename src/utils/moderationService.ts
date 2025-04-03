
import { supabase } from '@/integrations/supabase/client';
import { getSessionId } from '@/utils/doodleService';
import { ContentReport } from '@/types/doodle';

// Report threshold for auto-hiding content
const AUTO_HIDE_THRESHOLD = 3;

// Report content function
export async function reportContent(
  contentId: string,
  contentType: 'doodle' | 'story',
  reason: string,
  details?: string
): Promise<boolean> {
  try {
    const sessionId = getSessionId();
    
    // Check if this user has already reported this content
    const { data: existingReports, error: checkError } = await supabase
      .from('content_reports')
      .select('id')
      .eq('content_id', contentId)
      .eq('session_id', sessionId);
    
    if (checkError) {
      console.error('Error checking existing reports:', checkError);
      return false;
    }
    
    // If user already reported this content, don't allow duplicate reports
    if (existingReports && existingReports.length > 0) {
      console.log('User already reported this content');
      return false;
    }
    
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
    
    // Get current report count for this content
    const table = contentType === 'doodle' ? 'doodles' : 'stories';
    
    // Use direct update with reported flag and increment report count
    const { data: updatedContent, error: flagError } = await supabase
      .from(table)
      .update({ 
        reported: true,
        report_count: supabase.rpc('increment_report_count', { 
          row_id: contentId,
          table_name: table
        })
      })
      .eq('id', contentId)
      .select('report_count');
    
    if (flagError) {
      console.error(`Error flagging ${contentType}:`, flagError);
      // Don't return false here as the report was still created
    }
    
    // If the report count exceeds threshold, auto-hide content by changing moderation status
    if (updatedContent && updatedContent.length > 0 && updatedContent[0].report_count >= AUTO_HIDE_THRESHOLD) {
      const { error: hideError } = await supabase
        .from(table)
        .update({ 
          moderation_status: 'pending'
        })
        .eq('id', contentId);
        
      if (hideError) {
        console.error(`Error auto-hiding ${contentType}:`, hideError);
      } else {
        console.log(`Content ${contentId} auto-hidden due to ${updatedContent[0].report_count} reports`);
      }
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
    return data.map((item: any) => ({
      id: item.id,
      contentId: item.content_id,
      contentType: item.content_type,
      reason: item.reason,
      details: item.details,
      sessionId: item.session_id,
      status: item.status,
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

// Get moderation guide - new function to explain the moderation process
export function getModerationGuide(): { steps: string[], statuses: Record<string, string> } {
  return {
    steps: [
      "Review reports in the 'Pending' tab",
      "Mark content as 'Under Review' if it requires further investigation",
      "View the reported content to determine if it violates community guidelines",
      "Approve content that doesn't violate guidelines or reject content that does",
      "All actions are recorded and affect content visibility on the platform"
    ],
    statuses: {
      "pending": "New reports that haven't been reviewed yet",
      "reviewed": "Reports that have been seen but require further investigation",
      "resolved": "Reports that have been addressed with a final decision",
      "approved": "Content that has been reviewed and allowed to remain on the platform",
      "rejected": "Content that has been removed from public view due to violations"
    }
  };
}

// New function to check if content is visible based on moderation status
export function isContentVisible(moderationStatus?: string): boolean {
  // Only show content with approved status or no status (defaults to approved)
  return moderationStatus === 'approved' || !moderationStatus;
}

