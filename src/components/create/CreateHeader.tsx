
import React from 'react';
import FunkyText from '@/components/FunkyText';

const CreateHeader = ({ 
  publishedDoodle 
}: { 
  publishedDoodle: any | null 
}) => {
  return (
    <div className="mb-4 animate-pop-in">
      <h1 className="text-2xl md:text-3xl font-bold mb-2 sketchy-text inline-block font-funky">
        <FunkyText text={publishedDoodle ? "Your Published Doodle" : "Create Your Doodle"} />
      </h1>
      <div className="sketchy-divider mb-3"></div>
    </div>
  );
};

export default CreateHeader;
