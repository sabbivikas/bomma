
import React, { useState, useEffect } from 'react';
import { Story } from '@/types/doodle';
import { Button } from './ui/button';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { Progress } from './ui/progress';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTheme } from '@/contexts/ThemeContext';
import { getThemeConfig } from '@/utils/themeConfig';

interface StoryPlayerProps {
  story: Story;
  autoPlay?: boolean;
}

const StoryPlayer: React.FC<StoryPlayerProps> = ({ story, autoPlay = false }) => {
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [progress, setProgress] = useState(0);
  const isMobile = useIsMobile();
  const { theme } = useTheme();
  
  // Get theme configuration
  const visualThemeConfig = getThemeConfig(theme.visualTheme);
  const seasonalThemeConfig = theme.seasonalTheme !== 'none' ? getThemeConfig(theme.seasonalTheme) : null;
  
  const currentFrame = story.frames[currentFrameIndex];
  const totalFrames = story.frames.length;
  
  // Reset player when story changes
  useEffect(() => {
    setCurrentFrameIndex(0);
    setProgress(0);
    setIsPlaying(autoPlay);
  }, [story.id, autoPlay]);
  
  // Handle auto-play and frame transitions
  useEffect(() => {
    if (!isPlaying || story.frames.length === 0) return;
    
    const frameDuration = currentFrame?.duration || 3000;
    let startTime: number;
    let animationFrameId: number;
    
    const updateProgress = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      
      const elapsed = timestamp - startTime;
      const newProgress = Math.min(100, (elapsed / frameDuration) * 100);
      
      setProgress(newProgress);
      
      if (newProgress < 100) {
        animationFrameId = requestAnimationFrame(updateProgress);
      } else {
        // Move to next frame
        setCurrentFrameIndex(prevIndex => {
          const nextIndex = (prevIndex + 1) % totalFrames;
          
          // If we're at the end and it's not an animation, stop playing
          if (nextIndex === 0 && !story.isAnimation) {
            setIsPlaying(false);
            return prevIndex;
          }
          
          return nextIndex;
        });
        
        setProgress(0);
      }
    };
    
    animationFrameId = requestAnimationFrame(updateProgress);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, currentFrameIndex, story.frames, currentFrame, totalFrames, story.isAnimation]);
  
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };
  
  const goToNextFrame = () => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentFrameIndex(prevIndex => (prevIndex + 1) % totalFrames);
  };
  
  const goToPreviousFrame = () => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentFrameIndex(prevIndex => (prevIndex - 1 + totalFrames) % totalFrames);
  };
  
  // Generate theme-based background style
  const getThemeBackgroundStyle = () => {
    let style = visualThemeConfig?.backgroundStyle || 'bg-gray-100';
    
    // Add seasonal overlays if applicable
    if (seasonalThemeConfig && seasonalThemeConfig.id !== 'none') {
      return `${style} bg-blend-overlay relative`;
    }
    
    return style;
  };
  
  // If no frames, show placeholder
  if (story.frames.length === 0) {
    return (
      <div className="bg-gray-100 border rounded-md flex items-center justify-center h-64">
        <p className="text-gray-500">No frames in this story yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-md overflow-hidden shadow-sm">
      {/* Display current frame */}
      <div className={`relative flex items-center justify-center ${getThemeBackgroundStyle()}`}>
        {/* Seasonal overlay if applicable */}
        {seasonalThemeConfig && seasonalThemeConfig.id !== 'none' && (
          <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
            {seasonalThemeConfig.id === 'autumn' && (
              <div className="absolute inset-0 bg-orange-100 bg-[url('/themes/autumn-leaves.svg')] bg-repeat opacity-30"></div>
            )}
            {seasonalThemeConfig.id === 'winter' && (
              <div className="absolute inset-0 bg-blue-50 bg-[url('/themes/snowflakes.svg')] bg-repeat opacity-30"></div>
            )}
            {seasonalThemeConfig.id === 'spring' && (
              <div className="absolute inset-0 bg-green-50 bg-[url('/themes/flowers.svg')] bg-repeat opacity-30"></div>
            )}
            {seasonalThemeConfig.id === 'summer' && (
              <div className="absolute inset-0 bg-yellow-50 bg-[url('/themes/sun.svg')] bg-repeat opacity-30"></div>
            )}
            {seasonalThemeConfig.id === 'halloween' && (
              <div className="absolute inset-0 bg-purple-900 bg-[url('/themes/pumpkin.svg')] bg-repeat opacity-30"></div>
            )}
            {seasonalThemeConfig.id === 'christmas' && (
              <div className="absolute inset-0 bg-red-100 bg-[url('/themes/snowflake.svg')] bg-repeat opacity-30"></div>
            )}
          </div>
        )}
        
        <img 
          src={currentFrame.imageUrl} 
          alt={`Frame ${currentFrameIndex + 1} of "${story.title}"`}
          className="max-w-full max-h-[500px] object-contain relative z-10"
        />
        
        {/* Frame counter overlay */}
        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full z-20">
          {currentFrameIndex + 1} / {totalFrames}
        </div>
      </div>
      
      {/* Controls */}
      <div className="p-4">
        <Progress value={progress} className="mb-2" />
        
        <div className="flex justify-between items-center">
          <div className="flex space-x-1">
            <Button 
              variant="outline" 
              size="icon"
              onClick={goToPreviousFrame}
              disabled={totalFrames <= 1}
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={togglePlayPause}
              disabled={totalFrames <= 1}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={goToNextFrame}
              disabled={totalFrames <= 1}
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="text-sm text-gray-500">
            {story.isAnimation ? 'Animation' : 'Story'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryPlayer;
