
import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import { Doodle } from '@/types/doodle';
import { formatDistanceToNow } from 'date-fns';
import { likeDoodle } from '@/utils/doodleService';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface DoodleCardProps {
  doodle: Doodle;
  onLike?: (doodle: Doodle) => void;
}

const DoodleCard: React.FC<DoodleCardProps> = ({ doodle, onLike }) => {
  const [isHovered, setIsHovered] = useState(false);
  const timeAgo = formatDistanceToNow(new Date(doodle.createdAt), { addSuffix: true });
  
  // Get initials from prompt for avatar
  const getInitials = () => {
    const words = doodle.prompt.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return doodle.prompt.substring(0, 2).toUpperCase();
  };
  
  const handleLike = () => {
    const updatedDoodle = likeDoodle(doodle.id);
    if (updatedDoodle && onLike) {
      onLike(updatedDoodle);
    }
  };

  return (
    <Card 
      className="w-full overflow-hidden rounded-lg border border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md bg-white"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Card Header with Avatar and Username */}
      <div className="flex items-center p-4 border-b border-gray-100">
        <Avatar className="h-8 w-8 mr-3">
          <AvatarFallback className="bg-black text-white text-xs">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-medium text-sm">{doodle.prompt.length > 20 
            ? doodle.prompt.substring(0, 20) + '...' 
            : doodle.prompt}
          </p>
          <p className="text-xs text-gray-500">{timeAgo}</p>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
          <MoreHorizontal size={15} />
        </Button>
      </div>
      
      {/* Image Content */}
      <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
        <img 
          src={doodle.imageUrl} 
          alt={doodle.prompt}
          className={`object-contain max-h-full max-w-full transform transition-transform duration-300 ${isHovered ? 'scale-105' : 'scale-100'}`}
        />
      </div>
      
      {/* Caption */}
      <CardContent className="pt-3 pb-1">
        <p className="font-medium text-sm">{doodle.prompt}</p>
      </CardContent>
      
      {/* Interaction Footer */}
      <CardFooter className="pt-0 px-4 pb-3 flex justify-between border-t border-gray-100 mt-2">
        <div className="flex space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-1 p-0 hover:bg-transparent hover:text-black"
            onClick={handleLike}
          >
            <Heart 
              size={18} 
              className={doodle.likes > 0 ? "fill-red-500 text-red-500" : ""} 
              strokeWidth={2} 
            />
            <span className="text-sm">{doodle.likes}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 p-0 hover:bg-transparent hover:text-black"
          >
            <MessageCircle size={18} strokeWidth={2} />
            <span className="text-sm">Comment</span>
          </Button>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          className="p-0 hover:bg-transparent"
        >
          <Share2 size={18} strokeWidth={2} />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DoodleCard;
