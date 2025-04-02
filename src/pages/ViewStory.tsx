
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { getStoryById, likeStory } from '@/utils/storyService';
import { Story } from '@/types/doodle';
import { Heart, ArrowLeft, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import Cloud from '@/components/Cloud';
import GhibliAnimations from '@/components/GhibliAnimations';
import StoryPlayer from '@/components/StoryPlayer';
import { deleteStory } from '@/utils/storyService';
import { getSessionId } from '@/utils/doodleService';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const ViewStory = () => {
  const { id } = useParams<{ id: string }>();
  const [story, setStory] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMyStory, setIsMyStory] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!id) return;
    loadStory(id);
  }, [id]);

  const loadStory = async (storyId: string) => {
    setIsLoading(true);
    
    try {
      const storyData = await getStoryById(storyId);
      
      if (!storyData) {
        toast({
          title: "Story not found",
          description: "The requested story could not be found",
          variant: "destructive",
        });
        navigate('/stories');
        return;
      }
      
      setStory(storyData);
      
      // Check if this is my story
      const sessionId = getSessionId();
      setIsMyStory(storyData.sessionId === sessionId);
      
    } catch (error) {
      console.error('Error loading story:', error);
      toast({
        title: "Error loading story",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLike = async () => {
    if (!story) return;
    
    try {
      const updatedStory = await likeStory(story.id);
      if (updatedStory) {
        setStory(updatedStory);
        toast({
          title: "Story liked",
          description: "You liked this story",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error liking story:', error);
      toast({
        title: "Error liking story",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };
  
  const handleDelete = async () => {
    if (!story) return;
    
    try {
      const success = await deleteStory(story.id);
      
      if (success) {
        toast({
          title: "Story deleted",
          description: "Your story has been deleted successfully",
          variant: "success",
        });
        navigate('/stories');
      } else {
        throw new Error("Failed to delete story");
      }
    } catch (error) {
      console.error('Error deleting story:', error);
      toast({
        title: "Error deleting story",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Skeleton className="h-8 w-40 mb-4" />
            <Skeleton className="h-64 w-full mb-4" />
            <Skeleton className="h-8 w-full mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </main>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Story Not Found</h1>
            <p className="mb-6">The story you're looking for doesn't exist or may have been deleted.</p>
            <Button onClick={() => navigate('/stories')}>
              Back to Stories
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#E0F7FA] via-[#B3E5FC] to-[#D1C4E9] opacity-70 z-0"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.8),transparent_70%)] z-0"></div>
      <GhibliAnimations />
      <Cloud />
      
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6 flex justify-between items-center">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => navigate('/stories')}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Stories
            </Button>
            
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                className="flex items-center gap-2"
                onClick={handleLike}
              >
                <Heart 
                  className={story.likes > 0 ? "fill-red-500 text-red-500" : ""} 
                  size={18} 
                />
                {story.likes}
              </Button>
              
              {isMyStory && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="h-9 w-9"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Story</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this story? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
          
          <h1 className="text-2xl font-bold mb-4">{story.title}</h1>
          
          <StoryPlayer story={story} autoPlay={true} />
        </div>
      </main>
    </div>
  );
};

export default ViewStory;
