import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, MoreHorizontal, X, Flag, ShieldAlert } from "lucide-react";
import { Doodle, Comment } from '@/types/doodle';
import { formatDistanceToNow } from 'date-fns';
import { likeDoodle, addComment, getCommentsForDoodle, getSessionId } from '@/utils/doodleService';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { getUsernameForSession } from '@/utils/usernameGenerator';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import ReportContent from './ReportContent';

interface DoodleCardProps {
  doodle: Doodle;
  onLike?: (doodle: Doodle) => void;
  highlight?: boolean;
}

const DoodleCard: React.FC<DoodleCardProps> = ({ doodle, onLike, highlight = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const timeAgo = formatDistanceToNow(new Date(doodle.createdAt), { addSuffix: true });
  const sessionId = getSessionId();
  
  // Reference to the card element for scrolling into view
  const cardRef = React.useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (highlight && cardRef.current) {
      // Scroll the highlighted card into view with smooth behavior
      setTimeout(() => {
        cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [highlight]);
  
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
  
  useEffect(() => {
    if (showComments) {
      // Load comments when comment section is opened
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
  
  // Get initials from prompt for avatar
  const getInitials = () => {
    const words = doodle.prompt.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return doodle.prompt.substring(0, 2).toUpperCase();
  };

  // Get username for doodle creator
  const getDoodleUsername = () => {
    return getUsernameForSession(doodle.sessionId);
  };
  
  // Get username for comment
  const getCommentUsername = (comment: Comment) => {
    return getUsernameForSession(comment.sessionId);
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
  
  const getCommentInitials = (comment: Comment) => {
    // Get initials from the username
    const username = getCommentUsername(comment);
    return username.substring(0, 2).toUpperCase();
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
  
  // Add new state for report dialog
  const [showReportDialog, setShowReportDialog] = useState(false);
  
  const handleReportDoodle = () => {
    setShowReportDialog(true);
  };
  
  return (
    <Card 
      ref={cardRef}
      className={`w-full overflow-hidden rounded-lg border shadow-sm transition-all duration-300 hover:shadow-md bg-white ${
        highlight ? 'ring-4 ring-blue-400 animate-pulse-once shadow-lg' : 'border-gray-200'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Card Header with Avatar and Username */}
      <div className="flex items-center p-4 border-b border-gray-100">
        <Avatar className="h-8 w-8 mr-3">
          <AvatarFallback className="bg-black text-white text-xs">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-medium text-sm">{getDoodleUsername()}</p>
          <p className="text-xs text-gray-500">{timeAgo}</p>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
              <MoreHorizontal size={15} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" />
              <span>Share</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleReportDoodle} className="text-red-600">
              <Flag className="mr-2 h-4 w-4" />
              <span>Report content</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Image Content */}
      <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
        <img 
          src={doodle.imageUrl} 
          alt={doodle.prompt}
          className={`object-contain max-h-full max-w-full transform transition-transform duration-300 ${isHovered ? 'scale-105' : 'scale-100'}`}
        />
      </div>
      
      {/* Caption */}
      <CardContent className="pt-3 pb-1">
        <p className="font-medium text-sm">{doodle.prompt}</p>
      </CardContent>
      
      {/* Interaction Footer */}
      <CardFooter className="pt-0 px-4 pb-3 flex justify-between border-t border-gray-100 mt-2">
        <div className="flex space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-1 p-0 hover:bg-transparent hover:text-black"
            onClick={handleLike}
          >
            <Heart 
              size={18} 
              className={doodle.likes > 0 ? "fill-red-500 text-red-500" : ""} 
              strokeWidth={2} 
            />
            <span className="text-sm">{doodle.likes}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 p-0 hover:bg-transparent hover:text-black"
            onClick={handleCommentToggle}
          >
            <MessageCircle size={18} strokeWidth={2} />
            <span className="text-sm">
              {commentCount > 0 ? `${commentCount} ${commentCount === 1 ? 'Comment' : 'Comments'}` : 'Comment'}
            </span>
          </Button>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          className="p-0 hover:bg-transparent hover:text-black"
          onClick={handleShare}
          aria-label="Share doodle"
        >
          <Share2 size={18} strokeWidth={2} />
        </Button>
      </CardFooter>

      {/* Comment Section */}
      {showComments && (
        <div className="px-4 pb-4 border-t border-gray-100">
          <div className="flex items-center justify-between py-2">
            <h4 className="text-sm font-medium">Comments {commentCount > 0 && `(${commentCount})`}</h4>
            <Button variant="ghost" size="sm" className="p-1 h-6" onClick={handleCommentToggle}>
              <X size={16} />
            </Button>
          </div>
          
          <div className="max-h-36 overflow-y-auto mb-3">
            {isLoading ? (
              <div className="py-2 text-center text-sm text-gray-500">Loading comments...</div>
            ) : comments.length > 0 ? (
              <div className="space-y-2">
                {comments.map(comment => (
                  <div key={comment.id} className="flex gap-2 p-2 rounded-md bg-gray-50">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-gray-200 text-gray-700 text-xs">
                        {getCommentInitials(comment)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <p className="text-xs font-medium">{getCommentUsername(comment)}</p>
                        {comment.sessionId === sessionId && (
                          <span className="ml-1 text-[10px] bg-gray-100 px-1 rounded text-gray-500">You</span>
                        )}
                      </div>
                      <p className="text-xs mt-1">{comment.text}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic text-center py-2">No comments yet</p>
            )}
          </div>
          
          <form onSubmit={handleCommentSubmit} className="flex gap-2">
            <input 
              type="text" 
              placeholder="Add a comment..." 
              className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              variant="secondary" 
              size="sm" 
              className="px-3"
              disabled={!commentText.trim() || isLoading}
            >
              Post
            </Button>
          </form>
        </div>
      )}
      
      {/* Report Dialog */}
      {showReportDialog && (
        <ReportContent
          contentId={doodle.id}
          contentType="doodle"
          isOpen={showReportDialog}
          onClose={() => setShowReportDialog(false)}
        />
      )}
    </Card>
  );
};

export default DoodleCard;
