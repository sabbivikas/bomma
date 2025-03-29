
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import DrawingCanvas from '@/components/DrawingCanvas';
import { createDoodle, getSessionId } from '@/utils/doodleService';
import { useToast } from '@/hooks/use-toast';
import { getTodaysPrompt } from '@/data/prompts';
import { Lightbulb } from 'lucide-react';

const Create = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [prompt] = useState(getTodaysPrompt());
  
  const handleSave = (canvas: HTMLCanvasElement) => {
    // Convert canvas to data URL
    const imageUrl = canvas.toDataURL('image/png');
    
    // Save the doodle to local storage
    const sessionId = getSessionId();
    createDoodle({
      imageUrl,
      prompt,
      sessionId,
    });
    
    // Show success message
    toast({
      title: "Doodle saved!",
      description: "Your doodle has been added to the feed.",
      variant: "default",
    });
    
    // Redirect to feed
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8 animate-pop-in">
          <h1 className="text-4xl font-bold mb-3 sketchy-text inline-block">Create Your Doodle</h1>
          <div className="sketchy-divider my-4"></div>
          <div className="flex items-center gap-2">
            <Lightbulb className="text-black animate-pulse-light" />
            <p className="text-muted-foreground">
              Let your creativity flow and create something wonderful!
            </p>
          </div>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <DrawingCanvas onSave={handleSave} prompt={prompt} />
        </div>
      </main>
    </div>
  );
};

export default Create;
