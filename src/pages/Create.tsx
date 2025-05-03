
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { getTodaysPrompt } from '@/data/prompts';
import PublishOptionsDialog from '@/components/PublishOptionsDialog';
import CreateHeader from '@/components/create/CreateHeader';
import SuccessMessage from '@/components/create/SuccessMessage';
import PublishedDoodleView from '@/components/create/PublishedDoodleView';
import CreateOptions from '@/components/create/CreateOptions';
import DreamyEffects from '@/components/create/DreamyEffects';
import CreateStyles from '@/components/create/CreateStyles';
import DrawingSection from '@/components/DrawingSection';
import { useIsIpad } from '@/hooks/use-ipad';
import { useDoodlePublishing } from '@/hooks/use-doodle-publishing';

const Create = () => {
  const [prompt] = useState(getTodaysPrompt());
  const [stayOnPage, setStayOnPage] = useState(false);
  const isIpad = useIsIpad();
  
  const {
    successMessage,
    publishedDoodle,
    isPublishing,
    pendingImageUrl,
    showPublishDialog,
    setShowPublishDialog,
    handleSave,
    handlePublish,
    handleCreateNew,
    handleDoodleLiked
  } = useDoodlePublishing({ stayOnPage, prompt });
  
  useEffect(() => {
    // Update the page title when this component mounts
    document.title = "Bomma | Create Doodle";
    
    // Restore the original title when component unmounts
    return () => {
      document.title = "Bomma";
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative create-page-container overflow-hidden">
      {/* Enhanced background gradient for Ghibli effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#E0F7FA] via-[#B3E5FC] to-[#D1C4E9] opacity-70 z-0"></div>
      
      {/* Light rays */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.8),transparent_70%)] z-0"></div>
      
      {/* The background ghibli elements */}
      <DreamyEffects />
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-6 relative z-10">
        <CreateHeader publishedDoodle={publishedDoodle} />

        <SuccessMessage message={successMessage} />
        
        {publishedDoodle ? (
          <PublishedDoodleView 
            doodle={publishedDoodle} 
            onLike={handleDoodleLiked} 
            onCreateNew={handleCreateNew} 
          />
        ) : (
          <div className="max-w-3xl mx-auto">
            {/* Drawing section */}
            <DrawingSection 
              framesCount={0}
              hasNoFrames={true}
              onSaveFrame={handleSave}
              prompt={prompt}
            />
            
            {/* Options below the canvas */}
            <CreateOptions 
              stayOnPage={stayOnPage} 
              onStayOnPageChange={setStayOnPage} 
            />
          </div>
        )}
      </main>
      
      {/* Publish Options Dialog */}
      <PublishOptionsDialog
        open={showPublishDialog}
        onOpenChange={setShowPublishDialog}
        imageUrl={pendingImageUrl}
        onPublish={handlePublish}
        isPublishing={isPublishing}
      />
      
      {/* CSS for dreamy effects and canvas styling */}
      <CreateStyles />
    </div>
  );
};

export default Create;
