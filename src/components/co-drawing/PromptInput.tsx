
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Sparkles } from 'lucide-react';

interface PromptInputProps {
  onSendPrompt: (prompt: string) => void;
  isLoading: boolean;
}

const PromptInput: React.FC<PromptInputProps> = ({ onSendPrompt, isLoading }) => {
  const [prompt, setPrompt] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSendPrompt(prompt.trim());
      setPrompt(''); // Clear input after sending
    }
  };
  
  return (
    <div className="w-full py-3">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="h-4 w-4 text-purple-500" />
        <h3 className="text-sm md:text-base font-medium text-gray-700">Enhance with AI</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter a prompt to enhance your drawing..."
          disabled={isLoading}
          className="flex-1"
        />
        <Button 
          type="submit" 
          disabled={!prompt.trim() || isLoading}
          className="flex gap-2 items-center"
        >
          <Send className="h-4 w-4" />
          <span>{isLoading ? 'Enhancing...' : 'Send'}</span>
        </Button>
      </form>
      <p className="text-xs text-gray-500 mt-1">
        Try prompts like "add eyes", "draw a smile", "add blue hair", or "put a hat on"
      </p>
    </div>
  );
};

export default PromptInput;
