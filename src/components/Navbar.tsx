
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Paintbrush, BookOpen, Film, GamepadIcon } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const Navbar: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-gray-900">Bomma</span>
          </Link>
          
          <nav className="flex items-center gap-2 md:gap-4">
            <Link to="/">
              <Button variant="ghost" size={isMobile ? "sm" : "default"} className="flex items-center gap-1">
                <Paintbrush className="h-4 w-4" />
                {!isMobile && <span>Doodles</span>}
              </Button>
            </Link>
            
            <Link to="/stories">
              <Button variant="ghost" size={isMobile ? "sm" : "default"} className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                {!isMobile && <span>Stories</span>}
              </Button>
            </Link>
            
            <Link to="/create-animation">
              <Button variant="ghost" size={isMobile ? "sm" : "default"} className="flex items-center gap-1">
                <Film className="h-4 w-4" />
                {!isMobile && <span>Animations</span>}
              </Button>
            </Link>
            
            <Link to="/play-game">
              <Button variant="ghost" size={isMobile ? "sm" : "default"} className="flex items-center gap-1">
                <GamepadIcon className="h-4 w-4" />
                {!isMobile && <span>Games</span>}
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
