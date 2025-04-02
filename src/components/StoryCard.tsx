
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Story } from '@/types/doodle';
import { useNavigate } from 'react-router-dom';
import { Heart, Film, BookOpen } from 'lucide-react';
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
        
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1"
          onClick={handleLike}
        >
          <Heart className={story.likes > 0 ? "fill-red-500 text-red-500" : ""} size={16} />
          <span>{story.likes}</span>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default StoryCard;
