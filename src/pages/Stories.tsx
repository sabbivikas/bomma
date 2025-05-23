
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import ThemedBackground from '@/components/ThemedBackground';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StoryCard from '@/components/StoryCard';
import { getAllStories, getMyStories } from '@/utils/storyService';
import { Story } from '@/types/doodle';
import { Film, BookOpen, RefreshCw, Paintbrush, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';

const Stories = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [stories, setStories] = useState<Story[]>([]);
  const [myStories, setMyStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Set page title
  useEffect(() => {
    document.title = "Bomma | Stories";
    return () => {
      document.title = "Bomma";
    };
  }, []);

  // Memoized load stories function
  const loadStories = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    
    try {
      // Load all stories
      const allStoriesData = await getAllStories();
      setStories(allStoriesData);
      
      // Load my stories
      const myStoriesData = await getMyStories();
      setMyStories(myStoriesData);

      if (isRefresh) {
        toast({
          title: "Stories refreshed",
          description: "The latest stories have been loaded",
        });
      }
    } catch (error) {
      console.error('Error loading stories:', error);
      toast({
        title: "Error loading stories",
        description: "Please try refreshing the page",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [toast]);
  
  // Initial load
  useEffect(() => {
    loadStories();
  }, [loadStories]);

  // Listen for story published events
  useEffect(() => {
    const handleStoryPublished = () => {
      loadStories(true);
    };
    
    window.addEventListener('story-published', handleStoryPublished);
    return () => {
      window.removeEventListener('story-published', handleStoryPublished);
    };
  }, [loadStories]);
  
  const handleStoryLiked = useCallback((updatedStory: Story) => {
    // Update the story in both lists
    setStories(prevStories => 
      prevStories.map(story => 
        story.id === updatedStory.id ? updatedStory : story
      )
    );
    
    setMyStories(prevStories => 
      prevStories.map(story => 
        story.id === updatedStory.id ? updatedStory : story
      )
    );
  }, []);
  
  const handleCreateStory = useCallback(() => {
    navigate('/create-story');
  }, [navigate]);
  
  const handleCreateAnimation = useCallback(() => {
    navigate('/create-animation');
  }, [navigate]);

  const handleRefresh = useCallback(() => {
    loadStories(true);
  }, [loadStories]);

  // Render loading state
  if (isLoading) {
    return (
      <ThemedBackground>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1 container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Stories & Animations</h1>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <Skeleton className="h-64 w-full" />
                </div>
              ))}
            </div>
          </main>
        </div>
      </ThemedBackground>
    );
  }

  const renderStoryList = (storiesToRender: Story[]) => {
    if (storiesToRender.length === 0) {
      return (
        <div className="text-center py-12 border border-gray-200 rounded-lg bg-white shadow-sm">
          <Paintbrush className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-xl font-medium">No stories yet</p>
          <p className="text-gray-500 mt-2">Create your first story or animation and share it with the world!</p>
          <div className="flex flex-wrap gap-4 justify-center mt-4">
            <Button 
              variant="secondary" 
              className="flex items-center gap-2"
              onClick={handleCreateStory}
            >
              <BookOpen className="w-4 h-4" />
              Create Story
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={handleCreateAnimation}
            >
              <Film className="w-4 h-4" />
              Create Animation
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {storiesToRender.map(story => (
          <StoryCard 
            key={story.id} 
            story={story} 
            onLike={handleStoryLiked} 
          />
        ))}
      </div>
    );
  };

  return (
    <ThemedBackground>
      <div className="min-h-screen flex flex-col relative">
        <Navbar />
        
        <main className="flex-1 container mx-auto px-4 py-8 relative z-10 pb-24">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h1 className="text-2xl font-bold">Stories & Animations</h1>
            
            <div className="flex mt-4 sm:mt-0 space-x-2">
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
              
              <Button 
                className="flex items-center gap-2"
                onClick={() => navigate('/create')}
              >
                <Plus className="h-4 w-4" />
                Create New
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="all" className="flex items-center gap-2 flex-1 sm:flex-initial">
                <Paintbrush className="h-4 w-4" />
                All Stories
              </TabsTrigger>
              <TabsTrigger value="my" className="flex items-center gap-2 flex-1 sm:flex-initial">
                <BookOpen className="h-4 w-4" />
                My Stories
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-6">
              {renderStoryList(stories)}
            </TabsContent>
            
            <TabsContent value="my" className="mt-6">
              {renderStoryList(myStories)}
            </TabsContent>
          </Tabs>
          
          {/* Create new buttons - optimized for mobile */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleCreateStory}
              className="flex items-center gap-2 py-6 px-8 w-full sm:w-auto"
            >
              <BookOpen className="h-5 w-5" />
              Create New Story
            </Button>
            
            <Button 
              onClick={handleCreateAnimation}
              className="flex items-center gap-2 py-6 px-8 w-full sm:w-auto"
              variant="outline"
            >
              <Film className="h-5 w-5" />
              Create New Animation
            </Button>
          </div>
        </main>
      </div>
    </ThemedBackground>
  );
};

export default Stories;
