
import React from 'react';
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, Boxes } from "lucide-react";

interface DoodleCardActionsProps {
  likes: number;
  is3D: boolean;
  commentCount: number;
  onLike: () => void;
  onCommentToggle: () => void;
  onShare: (e: React.MouseEvent) => void;
  on3DView: () => void;
}

const DoodleCardActions: React.FC<DoodleCardActionsProps> = ({ 
  likes, 
  is3D, 
  commentCount, 
  onLike, 
  onCommentToggle, 
  onShare, 
  on3DView 
}) => {
  return (
    <div className="pt-0 px-4 pb-3 flex justify-between border-t border-gray-100 mt-2">
      <div className="flex space-x-4">
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-1 p-0 hover:bg-transparent hover:text-black"
          onClick={onLike}
        >
          <Heart 
            size={18} 
            className={likes > 0 ? "fill-red-500 text-red-500" : ""} 
            strokeWidth={2} 
          />
          <span className="text-sm">{likes}</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1 p-0 hover:bg-transparent hover:text-black"
          onClick={onCommentToggle}
        >
          <MessageCircle size={18} strokeWidth={2} />
          <span className="text-sm">
            {commentCount > 0 ? `${commentCount} ${commentCount === 1 ? 'Comment' : 'Comments'}` : 'Comment'}
          </span>
        </Button>
        
        {is3D && (
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 p-0 hover:bg-transparent hover:text-black"
            onClick={on3DView}
          >
            <Boxes size={18} strokeWidth={2} />
            <span className="text-sm">3D View</span>
          </Button>
        )}
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        className="p-0 hover:bg-transparent hover:text-black"
        onClick={onShare}
        aria-label="Share doodle"
      >
        <Share2 size={18} strokeWidth={2} />
      </Button>
    </div>
  );
};

export default DoodleCardActions;
