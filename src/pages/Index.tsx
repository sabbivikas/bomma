
import React from 'react';
import Navbar from '@/components/Navbar';
import DoodleFeed from '@/components/DoodleFeed';
import { Button } from '@/components/ui/button';
import { Pen, Laugh } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8 relative animate-pop-in">
          <h1 className="text-4xl font-bold mb-3 sketchy-text inline-block">Discover Wonderful Creations</h1>
          <Laugh className="inline-block ml-2 mb-3 animate-float" />
          <div className="sketchy-divider my-4"></div>
          <p className="text-muted-foreground mb-6">
            Create your own cartoon worlds and characters, then share them with our community!
          </p>
          <Link to="/create">
            <Button className="gap-2 rounded-xl border-2 border-black sketchy-button">
              <Pen className="h-4 w-4" />
              Create Your Doodle
            </Button>
          </Link>
        </div>
        
        <div className="mt-8">
          <DoodleFeed />
        </div>
      </main>
    </div>
  );
};

export default Index;
