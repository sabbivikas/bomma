
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Flag, AlertTriangle, Shield } from 'lucide-react';
import { ContentReport } from '@/types/doodle';
import { supabase } from '@/integrations/supabase/client';
import { updateContentModerationStatus } from '@/utils/moderationService';
import StoryPlayer from './StoryPlayer';

interface ContentViewerProps {
  report: ContentReport | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (reportId: string, status: 'resolved') => void;
}

const ContentViewer: React.FC<ContentViewerProps> = ({ report, isOpen, onClose, onStatusChange }) => {
  const [content, setContent] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [reportCount, setReportCount] = useState<number>(0);

  useEffect(() => {
    const fetchContent = async () => {
      if (!report) return;
      
      setIsLoading(true);
      try {
        const table = report.contentType === 'doodle' ? 'doodles' : 'stories';
        
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .eq('id', report.contentId)
          .single();
        
        if (error) throw error;
        
        // Get report count for this content
        const { data: reportData, error: reportsError } = await supabase
          .from('content_reports')
          .select('id')
          .eq('content_id', report.contentId);
          
        if (!reportsError && reportData) {
          setReportCount(reportData.length);
        }
        
        if (report.contentType === 'story' && data) {
          // Fetch story frames
          const { data: frames, error: framesError } = await supabase
            .from('story_frames')
            .select('*')
            .eq('story_id', data.id)
            .order('order', { ascending: true });
          
          if (framesError) throw framesError;
          
          // Format story data for StoryPlayer
          setContent({
            ...data,
            frames: frames || []
          });
        } else {
          setContent(data);
        }
      } catch (error) {
        console.error('Error fetching content:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchContent();
  }, [report]);

  const handleApproveContent = async () => {
    if (!report) return;
    
    try {
      await updateContentModerationStatus(
        report.contentId,
        report.contentType,
        'approved'
      );
      
      await onStatusChange(report.id, 'resolved');
      onClose();
    } catch (error) {
      console.error('Error approving content:', error);
    }
  };
  
  const handleRejectContent = async () => {
    if (!report) return;
    
    try {
      await updateContentModerationStatus(
        report.contentId,
        report.contentType,
        'rejected'
      );
      
      await onStatusChange(report.id, 'resolved');
      onClose();
    } catch (error) {
      console.error('Error rejecting content:', error);
    }
  };

  // Helper function to get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!report) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-500" />
            Review {report.contentType === 'doodle' ? 'Doodle' : 'Story'} Content
          </DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : content ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Flag className="h-4 w-4 text-red-500" />
                <span className="font-medium">Reports: {reportCount}</span>
              </div>
              
              {content.moderation_status && (
                <div className={`px-3 py-1 rounded-full text-sm flex items-center gap-1.5 ${getStatusColor(content.moderation_status)}`}>
                  {content.moderation_status === 'approved' && <CheckCircle className="h-3.5 w-3.5" />}
                  {content.moderation_status === 'rejected' && <XCircle className="h-3.5 w-3.5" />}
                  {content.moderation_status === 'pending' && <AlertTriangle className="h-3.5 w-3.5" />}
                  <span className="capitalize">{content.moderation_status}</span>
                </div>
              )}
            </div>
            
            <div className="p-4 border rounded-md bg-gray-50">
              <h3 className="font-medium mb-2">Report Details</h3>
              <p><strong>Reason:</strong> {report.reason}</p>
              {report.details && <p><strong>Details:</strong> {report.details}</p>}
            </div>
            
            <div className="border p-4 rounded-md">
              <h3 className="font-medium mb-3">Content to Review</h3>
              {report.contentType === 'doodle' ? (
                <div className="flex flex-col items-center space-y-4">
                  <img 
                    src={content.image_url} 
                    alt="Reported doodle" 
                    className="max-w-full max-h-[50vh] object-contain border rounded-md"
                  />
                  <p className="italic text-gray-700">"{content.prompt}"</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="font-medium text-xl">{content.title}</h3>
                  {content.frames && content.frames.length > 0 && (
                    <StoryPlayer 
                      story={{
                        id: content.id,
                        title: content.title,
                        isAnimation: content.is_animation || false,
                        frames: content.frames.map((frame: any) => ({
                          id: frame.id,
                          imageUrl: frame.image_url,
                          duration: frame.duration || 3000,
                        })),
                        createdAt: content.created_at,
                        sessionId: content.session_id,
                        likes: content.likes || 0,
                        reported: content.reported || false,
                        reportCount: content.report_count || 0,
                        moderationStatus: content.moderation_status || 'pending'
                      }}
                    />
                  )}
                </div>
              )}
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-800">
              <p className="font-medium">Moderation Guidelines:</p>
              <ul className="list-disc pl-4 mt-1 space-y-1">
                <li>Reject content that violates community guidelines including explicit, violent, or harassing content</li>
                <li>Approve content that follows guidelines and is appropriate for all users</li>
                <li>When in doubt, err on the side of caution and reject the content</li>
              </ul>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                variant="outline" 
                onClick={onClose}
              >
                Cancel
              </Button>
              
              <Button 
                variant="destructive"
                onClick={handleRejectContent}
                className="flex items-center gap-2"
              >
                <XCircle className="h-4 w-4" />
                Reject Content
              </Button>
              
              <Button 
                variant="default"
                onClick={handleApproveContent}
                className="flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Approve Content
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            Content not found or has been deleted.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ContentViewer;
