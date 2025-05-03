
import React from 'react';
import { CheckCircle } from 'lucide-react';

interface DrawingSuccessMessageProps {
  show: boolean;
}

const DrawingSuccessMessage: React.FC<DrawingSuccessMessageProps> = ({ show }) => {
  if (!show) return null;
  
  return (
    <div className="mb-1 text-xs text-green-600 font-medium flex items-center px-3 pt-2">
      <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
      <span>Frame added successfully</span>
    </div>
  );
};

export default DrawingSuccessMessage;
