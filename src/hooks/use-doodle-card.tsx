
import { useState, useEffect, useCallback } from 'react';
import { Doodle, Comment } from '@/types/doodle';
import { likeDoodle } from '@/utils/doodleFeedService';
import { addComment, getCommentsForDoodle } from '@/utils/commentService';
import { useToast } from '@/hooks/use-toast';

export function useDoodleCard(doodle: Doodle, onLike?: (doodle: Doodle) => void) {
  const [isHovered, setIsHovered] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [show3DViewer, setShow3DViewer] = useState(false);
  const { toast } = useToast();

  // Load comment count on initial render
  useEffect(() => {
    const fetchCommentCount = async () => {
      try {
        const doodleComments = await getCommentsForDoodle(doodle.id);
        setCommentCount(doodleComments.length);
      } catch (error) {
        console.error('Error loading comment count:', error);
      }
    };
    
    fetchCommentCount();
  }, [doodle.id]);
  
  // Load comments when comment section is opened
  useEffect(() => {
    if (showComments) {
      loadComments();
    }
  }, [showComments, doodle.id]);
  
  const loadComments = async () => {
    setIsLoading(true);
    try {
      const doodleComments = await getCommentsForDoodle(doodle.id);
      setComments(doodleComments);
      setCommentCount(doodleComments.length);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      const updatedDoodle = await likeDoodle(doodle.id);
      if (updatedDoodle && onLike) {
        onLike(updatedDoodle);
      }
    } catch (error) {
      console.error('Error liking doodle:', error);
      toast({
        title: "Error",
        description: "Could not like this doodle. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleCommentToggle = () => {
    setShowComments(!showComments);
  };
  
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      setIsLoading(true);
      
      try {
        const newComment = await addComment(doodle.id, commentText.trim());
        
        if (newComment) {
          // Update local comments state to include the new comment
          setComments(prevComments => [newComment, ...prevComments]);
          setCommentCount(prevCount => prevCount + 1);
          
          toast({
            title: "Comment added",
            description: "Your comment has been added to the doodle."
          });
          setCommentText('');
        } else {
          throw new Error('Failed to add comment');
        }
      } catch (error) {
        console.error('Error adding comment:', error);
        toast({
          title: "Error",
          description: "Could not add your comment. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation when sharing
    
    try {
      // Create a much shorter URL with just the ID fragment
      const shortId = doodle.id.substring(0, 8); // Take just the first 8 characters of the ID
      const shortPath = `/d/${shortId}`; // Relative URL path
      
      // Convert to absolute URL for sharing
      const shareUrl = new URL(shortPath, window.location.origin).toString();
      
      const shareTitle = doodle.prompt;
      const shareText = `Check out this amazing doodle: ${doodle.prompt}`;
      
      // Always first try to use clipboard API as it has better browser support
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link copied",
          description: "Short link copied to clipboard",
          variant: "success"
        });
        return; // Exit after successful clipboard copy
      } catch (clipboardError) {
        console.error('Failed to copy to clipboard:', clipboardError);
        // Continue to try Web Share API if clipboard fails
      }
      
      // If Web Share API is available, try it as fallback
      if (navigator.share) {
        try {
          await navigator.share({
            title: shareTitle,
            text: shareText,
            url: shareUrl
          });
          toast({
            title: "Shared successfully",
            description: "The doodle was shared successfully",
            variant: "success"
          });
        } catch (shareError) {
          // Only show error if it's not a user cancellation
          if (shareError instanceof Error && shareError.name !== 'AbortError') {
            throw shareError; // Re-throw for the outer catch block
          }
        }
      } else {
        // If neither worked, show a message with the URL
        toast({
          title: "Copy this link",
          description: shareUrl,
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Share error:', error);
      toast({
        title: "Sharing failed",
        description: "Could not share this doodle. Try copying the URL manually.",
        variant: "destructive"
      });
    }
  };
  
  const handleReportDoodle = () => {
    setShowReportDialog(true);
  };
  
  const handle3DView = () => {
    if (doodle.is3D) {
      setShow3DViewer(true);
    }
  };

  return {
    isHovered,
    setIsHovered,
    showComments,
    commentText,
    setCommentText,
    comments,
    isLoading,
    commentCount,
    showReportDialog,
    setShowReportDialog,
    show3DViewer,
    setShow3DViewer,
    handleLike,
    handleCommentToggle,
    handleCommentSubmit,
    handleShare,
    handleReportDoodle,
    handle3DView
  };
}
