
import React from 'react';
import { Button } from '@/components/ui/button';
import { Globe, Plus } from 'lucide-react';

interface NoCharactersProps {
  onCreateNew: () => void;
}

const NoCharacters: React.FC<NoCharactersProps> = ({ onCreateNew }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="bg-purple-100 rounded-full p-6 mb-4">
        <Globe className="h-12 w-12 text-purple-600" />
      </div>
      <h2 className="text-2xl font-bold mb-2">No Characters Yet</h2>
      <p className="text-gray-600 mb-6 max-w-md">
        Create your first character to begin your adventure in our action games!
      </p>
      <Button 
        onClick={onCreateNew} 
        className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
      >
        <Plus size={16} />
        Create Your First Character
      </Button>
    </div>
  );
};

export default NoCharacters;
