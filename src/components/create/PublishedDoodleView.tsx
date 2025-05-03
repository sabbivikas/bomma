
import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DoodleCard from '@/components/DoodleCard';
import { Doodle } from '@/types/doodle';

interface PublishedDoodleViewProps {
  doodle: Doodle;
  onLike: (updatedDoodle: Doodle) => void;
  onCreateNew: () => void;
}

const PublishedDoodleView = ({ doodle, onLike, onCreateNew }: PublishedDoodleViewProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-md animate-pop-in">
        <DoodleCard doodle={doodle} onLike={onLike} highlight={true} />
      </div>
      
      <div className="flex gap-4 mt-6">
        <Button
          onClick={onCreateNew}
          className="border-2 border-black sketchy-button gap-2 bg-black text-white"
        >
          Create Another Doodle
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate('/')}
          className="border-2 border-black sketchy-button gap-2"
        >
          <Eye className="h-4 w-4" /> View All Doodles
        </Button>
      </div>
    </div>
  );
};

export default PublishedDoodleView;
