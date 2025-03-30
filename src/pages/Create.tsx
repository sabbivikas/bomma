
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import DrawingCanvas from '@/components/DrawingCanvas';
import { createDoodle, getSessionId } from '@/utils/doodleService';
import { useToast } from '@/hooks/use-toast';
import { getTodaysPrompt } from '@/data/prompts';
import { Lightbulb, CheckCircle2 } from 'lucide-react';
import FunkyText from '@/components/FunkyText';
import Cloud from '@/components/Cloud';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const Create = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [prompt] = useState(getTodaysPrompt());
  const [stayOnPage, setStayOnPage] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const handleSave = (canvas: HTMLCanvasElement) => {
    // Convert canvas to data URL
    const imageUrl = canvas.toDataURL('image/png');
    
    // Save the doodle to local storage
    const sessionId = getSessionId();
    const newDoodle = createDoodle({
      imageUrl,
      prompt,
      sessionId,
    });
    
    // Show success message
    toast({
      title: "Doodle published!",
      description: "Your doodle has been added to the feed.",
      variant: "success",
    });

    // Set success message to display on page
    if (stayOnPage) {
      setSuccessMessage("Your doodle was published successfully!");
      
      // Clear success message after 4 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 4000);
    } else {
      // Redirect to feed
      navigate('/', { 
        state: { 
          newDoodle: newDoodle.id,
          justCreated: true
        } 
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <Cloud />
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 relative z-10">
        <div className="mb-8 animate-pop-in">
          <h1 className="text-4xl font-bold mb-3 sketchy-text inline-block font-funky">
            <FunkyText text="Create Your Doodle" />
          </h1>
          <div className="sketchy-divider my-4"></div>
          <div className="flex items-center gap-2">
            <Lightbulb className="text-black animate-pulse-light" />
            <p className="text-muted-foreground">
              Let your creativity flow and create something wonderful!
            </p>
          </div>
        </div>

        {successMessage && (
          <div className="bg-green-50 border-2 border-green-200 rounded-md p-4 mb-6 flex items-center animate-fade-in">
            <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
            <p className="text-green-700">{successMessage}</p>
          </div>
        )}
        
        <div className="max-w-3xl mx-auto">
          <DrawingCanvas onSave={handleSave} prompt={prompt} />

          <div className="mt-4 flex items-center space-x-2">
            <Checkbox 
              id="stay-on-page" 
              checked={stayOnPage} 
              onCheckedChange={(checked) => setStayOnPage(checked === true)}
            />
            <Label htmlFor="stay-on-page" className="text-sm text-gray-600">
              Stay on this page after publishing (create multiple doodles)
            </Label>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Create;
