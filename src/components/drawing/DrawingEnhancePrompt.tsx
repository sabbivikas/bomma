
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lightbulb } from 'lucide-react';

interface DrawingEnhancePromptProps {
  onSendPrompt: (prompt: string) => void;
  isLoading: boolean;
}

const DrawingEnhancePrompt: React.FC<DrawingEnhancePromptProps> = ({
  onSendPrompt,
  isLoading
}) => {
  const [promptText, setPromptText] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim()) return;
    
    onSendPrompt(promptText.trim());
    setPromptText('');
  };
  
  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200 p-3 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          <h3 className="font-medium text-gray-800 text-sm">AI Drawing Enhancement</h3>
        </div>
        
        <div className="flex gap-2">
          <Input
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="Try 'add eyes' or 'draw a hat'"
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !promptText.trim()}>
            {isLoading ? "Enhancing..." : "Enhance"}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default DrawingEnhancePrompt;
