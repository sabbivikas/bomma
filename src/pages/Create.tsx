
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import DrawingCanvas from '@/components/DrawingCanvas';
import { createDoodle, getSessionId } from '@/utils/doodleService';
import { useToast } from '@/hooks/use-toast';
import { getTodaysPrompt } from '@/data/prompts';

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
    });
    
    // Redirect to feed
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-3">Create Your Doodle</h1>
          <p className="text-muted-foreground">
            Let your creativity flow and create something wonderful.
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <DrawingCanvas onSave={handleSave} prompt={prompt} />
        </div>
      </main>
    </div>
  );
};

export default Create;
