
import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Eye, Film, BookOpen, Share2 } from "lucide-react";
import { Story } from '@/types/doodle';
import { formatDistanceToNow } from 'date-fns';
import { likeStory } from '@/utils/storyService';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { getUsernameForSession } from '@/utils/usernameGenerator';
import { useNavigate } from 'react-router-dom';

interface StoryCardProps {
  story: Story;
  onLike?: (story: Story) => void;
  highlight?: boolean;
}

const StoryCard: React.FC<StoryCardProps> = ({ story, onLike, highlight = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  const timeAgo = formatDistanceToNow(new Date(story.createdAt), { addSuffix: true });
  const navigate = useNavigate();
  
  // Reference to the card element for scrolling into view
  const cardRef = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    if (highlight && cardRef.current) {
      // Scroll the highlighted card into view with smooth behavior
      setTimeout(() => {
        cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [highlight]);
  
  // Get username for story creator
  const getStoryUsername = () => {
    return getUsernameForSession(story.sessionId);
  };
  
  // Get initials from title for avatar
  const getInitials = () => {
    const words = story.title.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return story.title.substring(0, 2).toUpperCase();
  };
  
  const handleLike = async () => {
    try {
      const updatedStory = await likeStory(story.id);
      if (updatedStory && onLike) {
        onLike(updatedStory);
      }
    } catch (error) {
      console.error('Error liking story:', error);
      toast({
        title: "Error",
        description: "Could not like this story. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleView = () => {
    navigate(`/stories/${story.id}`);
  };
  
  const handleShare = async () => {
    // If Web Share API is available
    if (navigator.share) {
      try {
        await navigator.share({
          title: story.title,
          text: `Check out this amazing ${story.isAnimation ? 'animation' : 'story'}: ${story.title}`,
          url: `${window.location.origin}/stories/${story.id}`
        });
        toast({
          title: "Shared successfully",
          description: "The story was shared successfully"
        });
      } catch (error) {
        // User probably canceled the share operation
        console.log('Share canceled');
      }
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(`${window.location.origin}/stories/${story.id}`);
      toast({
        title: "Link copied",
        description: "The link has been copied to your clipboard"
      });
    }
  };

  // Display a preview of the first frame
  const previewImage = story.frames.length > 0 ? story.frames[0].imageUrl : '';

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
          <p className="font-medium text-sm">{getStoryUsername()}</p>
          <p className="text-xs text-gray-500">{timeAgo}</p>
        </div>
        <div className="flex items-center">
          {story.isAnimation ? (
            <Film className="h-4 w-4 mr-1 text-blue-500" />
          ) : (
            <BookOpen className="h-4 w-4 mr-1 text-green-500" />
          )}
          <span className="text-xs text-gray-500">
            {story.isAnimation ? "Animation" : "Story"}
          </span>
        </div>
      </div>
      
      {/* Preview Image */}
      <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden relative">
        {previewImage ? (
          <img 
            src={previewImage}
            alt={story.title}
            className={`object-contain max-h-full max-w-full transform transition-transform duration-300 ${isHovered ? 'scale-105' : 'scale-100'}`}
          />
        ) : (
          <div className="text-gray-400">No preview available</div>
        )}
        
        {/* Frame count badge */}
        <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
          {story.frames.length} frame{story.frames.length !== 1 ? 's' : ''}
        </div>
      </div>
      
      {/* Caption */}
      <CardContent className="pt-3 pb-1">
        <p className="font-medium text-sm">{story.title}</p>
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
              className={story.likes > 0 ? "fill-red-500 text-red-500" : ""} 
              strokeWidth={2} 
            />
            <span className="text-sm">{story.likes}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 p-0 hover:bg-transparent hover:text-black"
            onClick={handleView}
          >
            <Eye size={18} strokeWidth={2} />
            <span className="text-sm">View</span>
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
    </Card>
  );
};

export default StoryCard;
