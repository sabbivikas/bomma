
import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Trash2 } from 'lucide-react';
import { StoryFrame } from '@/types/doodle';
import { useTheme } from '@/contexts/ThemeContext';
import { getThemeConfig } from '@/utils/themeConfig';

interface FramePreviewProps {
  frames: StoryFrame[];
  onRemoveFrame: (index: number) => void;
}

const FramePreview: React.FC<FramePreviewProps> = ({ frames, onRemoveFrame }) => {
  const framesEndRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  // Get theme configuration
  const visualThemeConfig = getThemeConfig(theme.visualTheme);

  // Generate theme-based background style for frames
  const getThemeBackgroundStyle = () => {
    return visualThemeConfig?.backgroundStyle || 'bg-gradient-to-b from-blue-50/50 to-purple-50/50';
  };

  if (frames.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 bg-white/80 backdrop-blur-sm p-4 rounded-lg border border-gray-200 shadow-sm">
      <h3 className="text-lg font-medium mb-3">Story Frames ({frames.length})</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-60 overflow-y-auto p-2 bg-gray-50/80 rounded-md">
        {frames.map((frame, index) => (
          <div key={index} className="relative group">
            <div className={`aspect-square border rounded-md overflow-hidden ${getThemeBackgroundStyle()} shadow-sm transition-all duration-200 group-hover:shadow-md`}>
              <img 
                src={frame.imageUrl} 
                alt={`Frame ${index + 1}`} 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="absolute top-0 right-0 p-1">
              <Button
                variant="destructive"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onRemoveFrame(index)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-2 py-1">
              Frame {index + 1}
            </div>
          </div>
        ))}
        <div ref={framesEndRef} />
      </div>
    </div>
  );
};

export default FramePreview;
