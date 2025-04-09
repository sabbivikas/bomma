
import React from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Share2, MoreHorizontal, Flag, Boxes } from "lucide-react";
import { Doodle } from '@/types/doodle';
import { formatDistanceToNow } from 'date-fns';
import { getUsernameForSession } from '@/utils/usernameGenerator';

interface DoodleCardHeaderProps {
  doodle: Doodle;
  onShare: (e: React.MouseEvent) => void;
  onReport: () => void;
  on3DView: () => void;
}

const DoodleCardHeader: React.FC<DoodleCardHeaderProps> = ({ 
  doodle, 
  onShare, 
  onReport, 
  on3DView 
}) => {
  const timeAgo = formatDistanceToNow(new Date(doodle.createdAt), { addSuffix: true });
  
  // Get initials from prompt for avatar
  const getInitials = () => {
    const words = doodle.prompt.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return doodle.prompt.substring(0, 2).toUpperCase();
  };

  // Get username for doodle creator
  const getDoodleUsername = () => {
    return getUsernameForSession(doodle.sessionId);
  };
  
  return (
    <div className="flex items-center p-4 border-b border-gray-100">
      <Avatar className="h-8 w-8 mr-3">
        <AvatarFallback className="bg-black text-white text-xs">
          {getInitials()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm">{getDoodleUsername()}</p>
          {doodle.is3D && (
            <Badge 
              variant="outline" 
              className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1 px-2 py-0 h-5 cursor-pointer hover:bg-blue-100"
              onClick={on3DView}
            >
              <Boxes className="h-3 w-3" />
              <span className="text-[10px]">3D</span>
            </Badge>
          )}
        </div>
        <p className="text-xs text-gray-500">{timeAgo}</p>
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
            <MoreHorizontal size={15} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onShare}>
            <Share2 className="mr-2 h-4 w-4" />
            <span>Share</span>
          </DropdownMenuItem>
          {doodle.is3D && (
            <DropdownMenuItem onClick={on3DView}>
              <Boxes className="mr-2 h-4 w-4" />
              <span>View in 3D</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onReport} className="text-red-600">
            <Flag className="mr-2 h-4 w-4" />
            <span>Report content</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default DoodleCardHeader;
