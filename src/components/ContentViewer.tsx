
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';
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

  if (!report) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Review {report.contentType === 'doodle' ? 'Doodle' : 'Story'} Content
          </DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : content ? (
          <div className="space-y-4">
            <div className="p-4 border rounded-md bg-gray-50">
              <h3 className="font-medium mb-2">Report Details</h3>
              <p><strong>Reason:</strong> {report.reason}</p>
              {report.details && <p><strong>Details:</strong> {report.details}</p>}
            </div>
            
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
