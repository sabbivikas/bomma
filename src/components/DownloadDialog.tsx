
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { DownloadFormat, downloadStory } from '@/utils/downloadUtils';
import { Story } from '@/types/doodle';
import { Download, FileDown, FileImage, Film, FileVideo, Video } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface DownloadDialogProps {
  story: Story;
  isOpen: boolean;
  onClose: () => void;
  currentFrameIndex?: number;
}

const DownloadDialog: React.FC<DownloadDialogProps> = ({ 
  story, 
  isOpen, 
  onClose,
  currentFrameIndex = 0
}) => {
  const [format, setFormat] = useState<DownloadFormat>('original');
  const [downloadType, setDownloadType] = useState<'all' | 'current'>(
    story.frames.length > 1 ? 'all' : 'current'
  );
  const [fileFormat, setFileFormat] = useState<'mp4' | 'gif' | 'zip'>(
    story.isAnimation ? 'mp4' : 'zip'
  );
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      if (story.isAnimation && downloadType === 'all') {
        // For animations, handle special download with format options
        await downloadStory(story, format, downloadType, currentFrameIndex, fileFormat);
        toast({
          title: "Download complete",
          description: `Your animation has been downloaded successfully as ${
            fileFormat === 'mp4' ? 'an MP4 video' : 
            fileFormat === 'gif' ? 'a GIF' : 
            'frame images'
          }`,
          variant: "success",
        });
      } else {
        // For regular story or single frame download
        await downloadStory(story, format, downloadType, currentFrameIndex);
        toast({
          title: "Download complete",
          description: `Your ${story.isAnimation ? 'animation' : 'story'} has been downloaded successfully`,
          variant: "success",
        });
      }
      onClose();
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download failed",
        description: "There was an error downloading your content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Download {story.isAnimation ? 'Animation' : 'Story'}</DialogTitle>
          <DialogDescription>
            Choose a format and download options for "{story.title}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="format">Select Format</Label>
            <RadioGroup 
              id="format" 
              value={format} 
              onValueChange={(value) => setFormat(value as DownloadFormat)}
              className="grid grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-2 border rounded-md p-2">
                <RadioGroupItem value="original" id="format-original" />
                <Label htmlFor="format-original">Original</Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-md p-2">
                <RadioGroupItem value="square" id="format-square" />
                <Label htmlFor="format-square">Square (1:1)</Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-md p-2">
                <RadioGroupItem value="reel" id="format-reel" />
                <Label htmlFor="format-reel">Reel (9:16)</Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-md p-2">
                <RadioGroupItem value="landscape" id="format-landscape" />
                <Label htmlFor="format-landscape">Landscape (16:9)</Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-md p-2">
                <RadioGroupItem value="portrait" id="format-portrait" />
                <Label htmlFor="format-portrait">Portrait (4:5)</Label>
              </div>
            </RadioGroup>
          </div>

          {story.frames.length > 1 && (
            <div className="space-y-2">
              <Label htmlFor="download-type">What to download</Label>
              <RadioGroup 
                id="download-type" 
                value={downloadType} 
                onValueChange={(value) => setDownloadType(value as 'all' | 'current')}
                className="grid grid-cols-2 gap-4"
              >
                <div className="flex items-center space-x-2 border rounded-md p-2">
                  <RadioGroupItem value="all" id="type-all" />
                  <Label htmlFor="type-all" className="flex items-center gap-1">
                    {story.isAnimation ? (
                      <>
                        <Film className="h-4 w-4" />
                        <span>Full animation</span>
                      </>
                    ) : (
                      <>
                        <FileImage className="h-4 w-4" />
                        <span>All frames</span>
                      </>
                    )}
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-md p-2">
                  <RadioGroupItem value="current" id="type-current" />
                  <Label htmlFor="type-current" className="flex items-center gap-1">
                    <FileDown className="h-4 w-4" />
                    <span>Current frame</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {story.isAnimation && downloadType === 'all' && (
            <div className="space-y-2">
              <Label htmlFor="file-format">File Format</Label>
              <RadioGroup 
                id="file-format" 
                value={fileFormat} 
                onValueChange={(value) => setFileFormat(value as 'mp4' | 'gif' | 'zip')}
                className="grid grid-cols-3 gap-4"
              >
                <div className="flex items-center space-x-2 border rounded-md p-2">
                  <RadioGroupItem value="mp4" id="format-mp4" />
                  <Label htmlFor="format-mp4" className="flex items-center gap-1">
                    <Video className="h-4 w-4" />
                    <span>MP4 Video</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-md p-2">
                  <RadioGroupItem value="gif" id="format-gif" />
                  <Label htmlFor="format-gif" className="flex items-center gap-1">
                    <FileVideo className="h-4 w-4" />
                    <span>GIF Animation</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-md p-2">
                  <RadioGroupItem value="zip" id="format-zip" />
                  <Label htmlFor="format-zip" className="flex items-center gap-1">
                    <FileImage className="h-4 w-4" />
                    <span>ZIP of Frames</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDownloading}>
            Cancel
          </Button>
          <Button 
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {isDownloading ? 'Downloading...' : 'Download'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DownloadDialog;
