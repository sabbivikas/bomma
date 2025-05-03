
import React from 'react';
import Navbar from '@/components/Navbar';
import CoDrawing from '@/components/co-drawing/CoDrawing';

const CoDraw = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-purple-50">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Co-Drawing with AI</h1>
          <p className="text-gray-600 mb-6">
            Draw something and use prompts to have AI enhance your drawing.
            Try prompts like "add eyes", "draw a smile", or "add a hat".
          </p>
          
          <CoDrawing />
        </div>
      </main>
    </div>
  );
};

export default CoDraw;
