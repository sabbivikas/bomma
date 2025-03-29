
import React from 'react';
import Navbar from '@/components/Navbar';
import DoodleFeed from '@/components/DoodleFeed';
import { Button } from '@/components/ui/button';
import { Pen } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-3">Discover Wonderful Creations</h1>
          <p className="text-muted-foreground mb-6">
            Browse through a collection of doodles made by our creative community.
          </p>
          <Link to="/create">
            <Button className="gap-2">
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
