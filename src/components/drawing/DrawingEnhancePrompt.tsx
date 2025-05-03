
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lightbulb, Palette } from 'lucide-react';

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

  // Quick prompt suggestions
  const promptSuggestions = [
    "Add eyes",
    "Draw a smile",
    "Add spiky hair",
    "Color it blue",
    "Add a hat"
  ];
  
  const handleSuggestionClick = (suggestion: string) => {
    onSendPrompt(suggestion);
  };
  
  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200 p-3 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Palette className="h-4 w-4 text-pink-500" />
          <h3 className="font-medium text-gray-800 text-sm">AI Drawing Enhancement</h3>
        </div>
        
        {/* Quick suggestion buttons */}
        <div className="flex flex-wrap gap-2 mb-3">
          {promptSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              disabled={isLoading}
              className="text-xs bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 py-1 px-2 rounded-full"
            >
              {suggestion}
            </button>
          ))}
        </div>
        
        <div className="flex gap-2">
          <Input
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="Tell AI what to add or modify..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !promptText.trim()}>
            {isLoading ? "Enhancing..." : "Enhance"}
          </Button>
        </div>
        
        <div className="mt-2 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Lightbulb className="h-3 w-3 text-amber-500" />
            Try color requests like "color it blue" or "add red eyes"
          </span>
        </div>
      </div>
    </form>
  );
};

export default DrawingEnhancePrompt;
