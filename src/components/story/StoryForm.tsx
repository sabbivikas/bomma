
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AlertCircle } from 'lucide-react';

interface StoryFormProps {
  title: string;
  setTitle: (title: string) => void;
  isTitleEmpty: boolean;
}

const StoryForm: React.FC<StoryFormProps> = ({ title, setTitle, isTitleEmpty }) => {
  return (
    <div className="grid gap-2">
      <Label htmlFor="title" className="flex items-center gap-2">
        Story Title
        {isTitleEmpty && (
          <span className="text-xs text-red-500 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> Required
          </span>
        )}
      </Label>
      <Input 
        id="title" 
        value={title} 
        onChange={e => setTitle(e.target.value)} 
        placeholder="My Amazing Story"
        className={isTitleEmpty ? "border-red-300 focus-visible:ring-red-300" : ""}
      />
    </div>
  );
};

export default StoryForm;
