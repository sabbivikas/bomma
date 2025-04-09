
import React from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Comment } from '@/types/doodle';
import { formatDistanceToNow } from 'date-fns';
import { getUsernameForSession } from '@/utils/usernameGenerator';
import { getSessionId } from '@/utils/sessionService';

interface DoodleCardCommentsProps {
  comments: Comment[];
  commentCount: number;
  isLoading: boolean;
  commentText: string;
  setCommentText: (text: string) => void;
  onToggleComments: () => void;
  onSubmitComment: (e: React.FormEvent) => void;
}

const DoodleCardComments: React.FC<DoodleCardCommentsProps> = ({
  comments,
  commentCount,
  isLoading,
  commentText,
  setCommentText,
  onToggleComments,
  onSubmitComment
}) => {
  const sessionId = getSessionId();

  const getCommentUsername = (comment: Comment) => {
    return getUsernameForSession(comment.sessionId);
  };

  const getCommentInitials = (comment: Comment) => {
    // Get initials from the username
    const username = getCommentUsername(comment);
    return username.substring(0, 2).toUpperCase();
  };

  return (
    <div className="px-4 pb-4 border-t border-gray-100">
      <div className="flex items-center justify-between py-2">
        <h4 className="text-sm font-medium">Comments {commentCount > 0 && `(${commentCount})`}</h4>
        <Button variant="ghost" size="sm" className="p-1 h-6" onClick={onToggleComments}>
          <X size={16} />
        </Button>
      </div>
      
      <div className="max-h-36 overflow-y-auto mb-3">
        {isLoading ? (
          <div className="py-2 text-center text-sm text-gray-500">Loading comments...</div>
        ) : comments.length > 0 ? (
          <div className="space-y-2">
            {comments.map(comment => (
              <div key={comment.id} className="flex gap-2 p-2 rounded-md bg-gray-50">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="bg-gray-200 text-gray-700 text-xs">
                    {getCommentInitials(comment)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center">
                    <p className="text-xs font-medium">{getCommentUsername(comment)}</p>
                    {comment.sessionId === sessionId && (
                      <span className="ml-1 text-[10px] bg-gray-100 px-1 rounded text-gray-500">You</span>
                    )}
                  </div>
                  <p className="text-xs mt-1">{comment.text}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500 italic text-center py-2">No comments yet</p>
        )}
      </div>
      
      <form onSubmit={onSubmitComment} className="flex gap-2">
        <input 
          type="text" 
          placeholder="Add a comment..." 
          className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          disabled={isLoading}
        />
        <Button 
          type="submit" 
          variant="secondary" 
          size="sm" 
          className="px-3"
          disabled={!commentText.trim() || isLoading}
        >
          Post
        </Button>
      </form>
    </div>
  );
};

export default DoodleCardComments;
