
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Box, Image as ImageIcon, Loader2 } from 'lucide-react';

interface PublishOptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string; // The 2D image URL
  onPublish: (mode: '2d' | '3d') => void;
  isPublishing: boolean;
}

const PublishOptionsDialog: React.FC<PublishOptionsDialogProps> = ({
  open,
  onOpenChange,
  imageUrl,
  onPublish,
  isPublishing
}) => {
  const [selectedMode, setSelectedMode] = useState<'2d' | '3d'>('2d');
  
  const handlePublish = () => {
    onPublish(selectedMode);
  };
  
  // This is a placeholder - in an actual implementation, you would
  // create a 3D representation of the 2D image here
  const renderPreview = () => {
    if (selectedMode === '2d') {
      return (
        <div className="relative w-full aspect-square max-w-md mx-auto overflow-hidden rounded-md border border-gray-200 bg-white">
          <img 
            src={imageUrl} 
            alt="Your drawing" 
            className="w-full h-full object-contain"
          />
        </div>
      );
    } else {
      return (
        <div className="relative w-full aspect-square max-w-md mx-auto overflow-hidden rounded-md border border-gray-200 bg-gradient-to-b from-blue-50 to-indigo-50 flex flex-col items-center justify-center p-4">
          {/* Placeholder for 3D preview */}
          <div className="relative">
            <img 
              src={imageUrl} 
              alt="Your drawing (3D preview)" 
              className="w-48 h-48 object-contain opacity-80"
              style={{ 
                transform: "perspective(500px) rotateY(15deg) rotateX(5deg)",
                boxShadow: "5px 5px 15px rgba(0,0,0,0.2)"
              }}
            />
            <div 
              className="absolute inset-0" 
              style={{ 
                transform: "perspective(500px) rotateY(15deg) rotateX(5deg) translateZ(-10px)",
                background: "rgba(255,255,255,0.7)",
                boxShadow: "5px 5px 15px rgba(0,0,0,0.1)"
              }}
            ></div>
          </div>
          <p className="mt-4 text-sm text-gray-500 text-center">
            3D conversion preview <br/>
            <span className="text-xs text-indigo-600">(Full 3D rendering will be generated when published)</span>
          </p>
        </div>
      );
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Publish Your Creation</DialogTitle>
          <DialogDescription>
            Choose how you want to publish your drawing
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="2d" value={selectedMode} onValueChange={(value) => setSelectedMode(value as '2d' | '3d')} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="2d" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              <span>2D Drawing</span>
            </TabsTrigger>
            <TabsTrigger value="3d" className="flex items-center gap-2">
              <Box className="h-4 w-4" />
              <span>3D Model</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="2d" className="mt-0">
            <div className="space-y-3">
              <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-900">
                Publish as a standard 2D drawing that can be viewed in your feed.
              </div>
              {renderPreview()}
            </div>
          </TabsContent>
          
          <TabsContent value="3d" className="mt-0">
            <div className="space-y-3">
              <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-900">
                Convert your drawing into a 3D model that can be rotated and viewed from different angles.
              </div>
              {renderPreview()}
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
          <Button
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isPublishing}
          >
            Cancel
          </Button>
          <Button 
            onClick={handlePublish}
            disabled={isPublishing}
            className="flex items-center gap-2"
          >
            {isPublishing && <Loader2 className="h-4 w-4 animate-spin" />}
            {isPublishing ? 'Publishing...' : 'Publish Now'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PublishOptionsDialog;
