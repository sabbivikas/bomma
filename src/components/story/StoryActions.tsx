
import React from 'react';
import { Button } from "@/components/ui/button";
import { Trash2, BookOpen, Eye, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StoryActionsProps {
  canCreateStory: boolean;
  hasFrames: boolean;
  isCreatingStory: boolean;
  onClearFrames: () => void;
  onCreateStory: () => void;
  isTitleEmpty: boolean;
  hasNoFrames: boolean;
}

const StoryActions: React.FC<StoryActionsProps> = ({
  canCreateStory,
  hasFrames,
  isCreatingStory,
  onClearFrames,
  onCreateStory,
  isTitleEmpty,
  hasNoFrames
}) => {
  const navigate = useNavigate();

  return (
    <div className="mt-4 space-y-4">
      <div className="flex justify-between">
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => navigate('/stories')}
        >
          <Eye className="h-4 w-4" />
          View All Stories
        </Button>
        
        <div className="space-x-4">
          {hasFrames && (
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={onClearFrames}
            >
              <Trash2 className="h-4 w-4" />
              Clear All Frames
            </Button>
          )}
          
          <Button
            className="flex items-center gap-2"
            disabled={!canCreateStory}
            onClick={onCreateStory}
            title={isTitleEmpty ? "Please enter a title" : hasNoFrames ? "Add at least one frame" : ""}
          >
            <BookOpen className="h-4 w-4" />
            Create Story
          </Button>
        </div>
      </div>
      
      {/* Validation message */}
      {!canCreateStory && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-700">
          <span className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            To create your story, you need:
          </span>
          <ul className="list-disc ml-6 mt-1">
            {isTitleEmpty && <li>A title for your story</li>}
            {hasNoFrames && <li>At least one frame (drawing)</li>}
          </ul>
        </div>
      )}
    </div>
  );
};

export default StoryActions;
