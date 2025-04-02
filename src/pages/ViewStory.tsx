
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { getStoryById, likeStory } from '@/utils/storyService';
import { Story, Comment } from '@/types/doodle';
import { Heart, ArrowLeft, Trash2, MessageCircle, X, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import Cloud from '@/components/Cloud';
import GhibliAnimations from '@/components/GhibliAnimations';
import StoryPlayer from '@/components/StoryPlayer';
import { deleteStory } from '@/utils/storyService';
import { getSessionId } from '@/utils/doodleService';
import { getUsernameForSession } from '@/utils/usernameGenerator';
import { addCommentToStory, getCommentsForStory } from '@/utils/storyService';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const ViewStory = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [story, setStory] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMyStory, setIsMyStory] = useState(false);
  const [showComments, setShowComments] = useState(searchParams.get('comments') === 'open');
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const sessionId = getSessionId();

  useEffect(() => {
    if (!id) return;
    loadStory(id);
  }, [id]);

  useEffect(() => {
    if (showComments && story) {
      loadComments();
    }
  }, [showComments, story?.id]);

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
  
  const loadComments = async () => {
    if (!story?.id) return;
    
    setIsLoadingComments(true);
    try {
      const storyComments = await getCommentsForStory(story.id);
      setComments(storyComments);
    } catch (error) {
      console.error('Error loading comments:', error);
      toast({
        title: "Error",
        description: "Could not load comments",
        variant: "destructive",
      });
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!story?.id || !commentText.trim()) return;
    
    setIsSubmittingComment(true);
    try {
      const newComment = await addCommentToStory(story.id, commentText.trim());
      
      if (newComment) {
        setComments(prevComments => [newComment, ...prevComments]);
        setCommentText('');
        toast({
          title: "Comment added",
          description: "Your comment has been added to the story"
        });
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Could not add your comment",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingComment(false);
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

  // Get initials for comment avatars
  const getCommentInitials = (comment: Comment) => {
    const username = getUsernameForSession(comment.sessionId);
    return username.substring(0, 2).toUpperCase();
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
                onClick={() => setShowComments(!showComments)}
              >
                <MessageCircle 
                  className={showComments ? "text-blue-500" : ""} 
                  size={18} 
                />
                <span>{comments.length}</span>
              </Button>
              
              <Button 
                variant="ghost" 
                className="flex items-center gap-2"
                onClick={handleLike}
              >
                <Heart 
                  className={story.likes > 0 ? "fill-red-500 text-red-500" : ""} 
                  size={18} 
                />
                <span>{story.likes}</span>
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
          
          {/* Comments section */}
          {showComments && (
            <div className="mt-6 bg-white rounded-lg border shadow p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium">Comments</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowComments(false)}
                >
                  <X size={18} />
                </Button>
              </div>
              
              <form onSubmit={handleCommentSubmit} className="mb-6">
                <Textarea
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="mb-2 min-h-24"
                  disabled={isSubmittingComment}
                />
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={!commentText.trim() || isSubmittingComment}
                    className="flex items-center gap-2"
                  >
                    <Send size={16} />
                    {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                  </Button>
                </div>
              </form>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {isLoadingComments ? (
                  <div className="text-center py-4">
                    <p className="text-gray-500">Loading comments...</p>
                  </div>
                ) : comments.length > 0 ? (
                  comments.map(comment => (
                    <div key={comment.id} className="flex gap-3 p-3 bg-gray-50 rounded-md">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gray-200 text-gray-700">
                          {getCommentInitials(comment)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center">
                          <span className="font-medium text-sm">{getUsernameForSession(comment.sessionId)}</span>
                          {comment.sessionId === sessionId && (
                            <span className="ml-2 text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">You</span>
                          )}
                        </div>
                        
                        <p className="mt-1 text-sm">{comment.text}</p>
                        
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 italic">No comments yet. Be the first to comment!</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ViewStory;
