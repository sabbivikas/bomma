
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CreateOptionsProps {
  stayOnPage: boolean;
  onStayOnPageChange: (checked: boolean) => void;
}

const CreateOptions = ({ stayOnPage, onStayOnPageChange }: CreateOptionsProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="mt-4 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-800 mb-3">Options:</h3>
      
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="stay-on-page" 
            checked={stayOnPage} 
            onCheckedChange={(checked) => onStayOnPageChange(checked === true)}
          />
          <Label htmlFor="stay-on-page" className="text-gray-600">
            Stay on this page after publishing
          </Label>
        </div>
        
        <Button 
          variant="outline"
          onClick={() => navigate('/')}
          className="flex items-center justify-center gap-2 h-9"
        >
          <Eye className="h-4 w-4" /> View All Doodles
        </Button>
      </div>
    </div>
  );
};

export default CreateOptions;
