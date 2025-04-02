
import React, { useState, useEffect } from 'react';
import { Story } from '@/types/doodle';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, SkipForward, Rewind } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface StoryPlayerProps {
  story: Story;
  autoPlay?: boolean;
}

const StoryPlayer: React.FC<StoryPlayerProps> = ({ story, autoPlay = false }) => {
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [progress, setProgress] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  
  const currentFrame = story.frames[currentFrameIndex];
  const totalFrames = story.frames.length;
  
  // Auto-play effect
  useEffect(() => {
    if (!isPlaying || !currentFrame) return;
    
    const frameDuration = currentFrame.duration / playbackSpeed;
    let animationFrameId: number;
    let startTime: number;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      
      const elapsed = timestamp - startTime;
      const newProgress = Math.min(elapsed / frameDuration * 100, 100);
      setProgress(newProgress);
      
      if (elapsed < frameDuration) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        // Move to the next frame
        if (currentFrameIndex < totalFrames - 1) {
          setCurrentFrameIndex(prev => prev + 1);
          setProgress(0);
        } else {
          // End of animation
          setIsPlaying(false);
          setProgress(100);
        }
      }
    };
    
    animationFrameId = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, currentFrameIndex, currentFrame, totalFrames, playbackSpeed]);
  
  const handlePlay = () => {
    if (currentFrameIndex === totalFrames - 1 && progress === 100) {
      // If at the end, restart from beginning
      setCurrentFrameIndex(0);
      setProgress(0);
    }
    setIsPlaying(true);
  };
  
  const handlePause = () => {
    setIsPlaying(false);
  };
  
  const handlePrevious = () => {
    setIsPlaying(false);
    setCurrentFrameIndex(prev => Math.max(0, prev - 1));
    setProgress(0);
  };
  
  const handleNext = () => {
    setIsPlaying(false);
    setCurrentFrameIndex(prev => Math.min(totalFrames - 1, prev + 1));
    setProgress(0);
  };
  
  const handleRestart = () => {
    setIsPlaying(false);
    setCurrentFrameIndex(0);
    setProgress(0);
  };
  
  const handleSpeedChange = (value: number[]) => {
    setPlaybackSpeed(value[0]);
  };
  
  if (!story || story.frames.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-gray-100 rounded-lg">
        <p className="text-gray-500">No frames to display</p>
      </div>
    );
  }
  
  return (
    <Card className="overflow-hidden">
      <div className="aspect-square bg-black relative overflow-hidden">
        {currentFrame && (
          <img 
            src={currentFrame.imageUrl} 
            alt={`Frame ${currentFrameIndex + 1}`}
            className="object-contain w-full h-full"
          />
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
          <div className="flex justify-between text-white text-sm mb-2">
            <span>Frame {currentFrameIndex + 1}/{totalFrames}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-300 h-1 rounded-full overflow-hidden">
            <div 
              className="bg-white h-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <div className="space-x-2">
            <Button variant="outline" size="icon" onClick={handleRestart}>
              <Rewind className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handlePrevious}>
              <SkipBack className="h-4 w-4" />
            </Button>
            {isPlaying ? (
              <Button variant="outline" size="icon" onClick={handlePause}>
                <Pause className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="outline" size="icon" onClick={handlePlay}>
                <Play className="h-4 w-4" />
              </Button>
            )}
            <Button variant="outline" size="icon" onClick={handleNext}>
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center space-x-2 w-32">
            <span className="text-xs">Speed: {playbackSpeed}x</span>
            <Slider
              value={[playbackSpeed]}
              onValueChange={handleSpeedChange}
              min={0.5}
              max={2}
              step={0.5}
              className="w-24"
            />
          </div>
        </div>
        
        <div>
          <h3 className="font-medium">{story.title}</h3>
          <p className="text-sm text-gray-500">
            {story.isAnimation ? "Animation" : "Story"} with {totalFrames} frames
          </p>
        </div>
      </div>
    </Card>
  );
};

export default StoryPlayer;
