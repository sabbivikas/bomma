import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, MoreHorizontal, X } from "lucide-react";
import { Doodle, Comment } from '@/types/doodle';
import { formatDistanceToNow } from 'date-fns';
import { likeDoodle, addComment, getCommentsForDoodle, getSessionId } from '@/utils/doodleService';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";

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
    const text = comment.text;
    const words = text.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return text.substring(0, 2).toUpperCase();
  };
  
  const handleShare = async () => {
    // If Web Share API is available
    if (navigator.share) {
      try {
        await navigator.share({
          title: doodle.prompt,
          text: `Check out this amazing doodle: ${doodle.prompt}`,
          url: window.location.href
        });
        toast({
          title: "Shared successfully",
          description: "The doodle was shared successfully"
        });
      } catch (error) {
        // User probably canceled the share operation
        console.log('Share canceled');
      }
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "The link has been copied to your clipboard"
      });
    }
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
          <p className="font-medium text-sm">{doodle.prompt.length > 20 
            ? doodle.prompt.substring(0, 20) + '...' 
            : doodle.prompt}
          </p>
          <p className="text-xs text-gray-500">{timeAgo}</p>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
          <MoreHorizontal size={15} />
        </Button>
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
            <span className="text-sm">Comment</span>
          </Button>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          className="p-0 hover:bg-transparent"
          onClick={handleShare}
        >
          <Share2 size={18} strokeWidth={2} />
        </Button>
      </CardFooter>

      {/* Comment Section */}
      {showComments && (
        <div className="px-4 pb-4 border-t border-gray-100">
          <div className="flex items-center justify-between py-2">
            <h4 className="text-sm font-medium">Comments</h4>
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
                      <p className="text-xs">{comment.text}</p>
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        {comment.sessionId === sessionId && " · You"}
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
    </Card>
  );
};

export default DoodleCard;
