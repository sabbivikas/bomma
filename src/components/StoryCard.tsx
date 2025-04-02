
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Story } from '@/types/doodle';
import { useNavigate } from 'react-router-dom';
import { Heart, Film, BookOpen, MessageCircle, Share2 } from 'lucide-react';
import { likeStory } from '@/utils/storyService';
import { getSessionId } from '@/utils/doodleService';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface StoryCardProps {
  story: Story;
  onLike: (updatedStory: Story) => void;
}

const StoryCard: React.FC<StoryCardProps> = ({ story, onLike }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMyStory = story.sessionId === getSessionId();
  
  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const updatedStory = await likeStory(story.id);
      if (updatedStory) {
        onLike(updatedStory);
      }
    } catch (error) {
      console.error('Error liking story:', error);
      toast({
        title: "Error",
        description: "Could not like the story",
        variant: "destructive",
      });
    }
  };
  
  const handleClick = () => {
    navigate(`/stories/${story.id}`);
  };
  
  const handleCommentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/stories/${story.id}?comments=open`);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation when sharing
    
    try {
      // Create a much shorter URL using just the ID fragment
      const shortId = story.id.substring(0, 8); // Take just the first 8 characters of the ID
      const shortPath = `/s/${shortId}`; // Relative URL path
      
      // Convert to absolute URL for sharing
      const shareUrl = new URL(shortPath, window.location.origin).toString();
      
      const shareTitle = story.title;
      const shareText = `Check out this amazing ${story.isAnimation ? 'animation' : 'story'}: ${story.title}`;
      
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
            description: `The ${story.isAnimation ? 'animation' : 'story'} was shared successfully`,
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
        description: "Could not share this story. Try copying the URL manually.",
        variant: "destructive"
      });
    }
  };
  
  // Get the first frame as the thumbnail
  const thumbnailFrame = story.frames[0];
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={handleClick}>
      <div className="relative aspect-square bg-gray-100">
        {thumbnailFrame ? (
          <img 
            src={thumbnailFrame.imageUrl} 
            alt={story.title} 
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No preview available
          </div>
        )}
        
        <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-white/80 shadow-sm flex items-center gap-1.5">
          {story.isAnimation ? (
            <>
              <Film className="h-3 w-3 text-purple-500" />
              <span className="text-xs font-medium">Animation</span>
            </>
          ) : (
            <>
              <BookOpen className="h-3 w-3 text-blue-500" />
              <span className="text-xs font-medium">Story</span>
            </>
          )}
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
          <h3 className="font-medium text-white truncate">
            {story.title}
          </h3>
        </div>
      </div>
      
      <CardFooter className="flex justify-between items-center p-3 bg-white">
        <div className="text-xs text-gray-500">
          {formatDistanceToNow(new Date(story.createdAt), { addSuffix: true })}
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 px-2"
            onClick={handleCommentClick}
            aria-label="Comment on story"
          >
            <MessageCircle size={16} />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 px-2"
            onClick={handleLike}
            aria-label="Like story"
          >
            <Heart className={story.likes > 0 ? "fill-red-500 text-red-500" : ""} size={16} />
            <span>{story.likes}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 px-2"
            onClick={handleShare}
            aria-label="Share story"
          >
            <Share2 size={16} />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default StoryCard;
