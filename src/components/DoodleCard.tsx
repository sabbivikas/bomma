
import React from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle } from "lucide-react";
import { Doodle } from '@/types/doodle';
import { formatDistanceToNow } from 'date-fns';
import { likeDoodle } from '@/utils/doodleService';

interface DoodleCardProps {
  doodle: Doodle;
  onLike?: (doodle: Doodle) => void;
}

const DoodleCard: React.FC<DoodleCardProps> = ({ doodle, onLike }) => {
  const handleLike = () => {
    const updatedDoodle = likeDoodle(doodle.id);
    if (updatedDoodle && onLike) {
      onLike(updatedDoodle);
    }
  };

  const timeAgo = formatDistanceToNow(new Date(doodle.createdAt), { addSuffix: true });

  return (
    <Card className="w-full overflow-hidden doodle-card border-2 border-black">
      <div className="aspect-square flex items-center justify-center bg-white border-b-2 border-black overflow-hidden">
        <img 
          src={doodle.imageUrl} 
          alt={doodle.prompt}
          className="object-contain max-h-full max-w-full"
        />
      </div>
      <CardContent className="pt-4">
        <p className="font-medium text-sm sketchy-text">{doodle.prompt}</p>
        <p className="text-xs text-muted-foreground">{timeAgo}</p>
      </CardContent>
      <CardFooter className="pb-4 pt-0 flex justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-1 hover:bg-transparent"
          onClick={handleLike}
        >
          <Heart size={16} className={doodle.likes > 0 ? "fill-black" : ""} strokeWidth={2} />
          <span>{doodle.likes}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1 hover:bg-transparent"
        >
          <MessageCircle size={16} strokeWidth={2} />
          <span>Comment</span>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DoodleCard;
