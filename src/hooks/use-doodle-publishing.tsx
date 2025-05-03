
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createDoodle, getSessionId } from '@/utils/doodleService';
import { useToast } from '@/hooks/use-toast';
import { Doodle } from '@/types/doodle';

interface UseDoodlePublishingOptions {
  stayOnPage: boolean;
  prompt?: string;
}

export const useDoodlePublishing = ({ stayOnPage, prompt }: UseDoodlePublishingOptions) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [publishedDoodle, setPublishedDoodle] = useState<Doodle | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [pendingCanvas, setPendingCanvas] = useState<HTMLCanvasElement | null>(null);
  const [pendingImageUrl, setPendingImageUrl] = useState<string>('');
  const [showPublishDialog, setShowPublishDialog] = useState(false);

  const handleSave = async (canvas: HTMLCanvasElement) => {
    // Convert canvas to data URL for preview
    const imageUrl = canvas.toDataURL('image/png');
    
    // Store the canvas and image URL for later use
    setPendingCanvas(canvas);
    setPendingImageUrl(imageUrl);
    
    // Show publish options dialog
    setShowPublishDialog(true);
  };

  const handlePublish = async (mode: '2d' | '3d') => {
    // Set publishing state
    setIsPublishing(true);
    
    if (!pendingCanvas) {
      toast({
        title: "Error",
        description: "Canvas data is missing. Please try again.",
        variant: "destructive",
      });
      setIsPublishing(false);
      return;
    }
    
    // Convert canvas to data URL
    const imageUrl = pendingCanvas.toDataURL('image/png');
    
    // Save the doodle to Supabase
    const sessionId = getSessionId();
    try {
      // In a real implementation, you would handle 3D conversion here
      // For now, we'll just add a flag to indicate the mode
      const newDoodle = await createDoodle({
        imageUrl,
        prompt,
        sessionId,
        is3D: mode === '3d', // This would need to be added to the DoodleCreateInput type
      });
      
      if (!newDoodle) {
        throw new Error("Failed to create doodle");
      }
      
      // Show success message
      toast({
        title: `Doodle published in ${mode.toUpperCase()} mode!`,
        description: "Your doodle has been added to the feed.",
        variant: "success",
      });

      // Set success message to display on page
      if (stayOnPage) {
        setSuccessMessage(`Your doodle was published successfully in ${mode.toUpperCase()} mode!`);
        setPublishedDoodle(newDoodle);
        
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
    } catch (error) {
      console.error('Error publishing doodle:', error);
      toast({
        title: "Error publishing doodle",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
      setShowPublishDialog(false);
      setPendingCanvas(null);
      setPendingImageUrl('');
    }
  };

  const handleCreateNew = () => {
    setPublishedDoodle(null);
  };

  const handleDoodleLiked = (updatedDoodle: Doodle) => {
    if (publishedDoodle && updatedDoodle.id === publishedDoodle.id) {
      setPublishedDoodle(updatedDoodle);
    }
  };

  return {
    successMessage,
    publishedDoodle,
    isPublishing,
    pendingCanvas,
    pendingImageUrl,
    showPublishDialog,
    setShowPublishDialog,
    handleSave,
    handlePublish,
    handleCreateNew,
    handleDoodleLiked
  };
};
