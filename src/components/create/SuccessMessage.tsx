
import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface SuccessMessageProps {
  message: string | null;
}

const SuccessMessage = ({ message }: SuccessMessageProps) => {
  if (!message) return null;
  
  return (
    <div className="bg-green-50 border-2 border-green-200 rounded-md p-4 mb-4 flex items-center animate-fade-in">
      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
      <p className="text-green-700">{message}</p>
    </div>
  );
};

export default SuccessMessage;
