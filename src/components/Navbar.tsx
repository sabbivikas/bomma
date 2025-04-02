
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import FunkyText from './FunkyText';
import { GalleryHorizontalEnd, Palette, BookOpenCheck, Film } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const Navbar = () => {
  const { pathname } = useLocation();
  const isMobile = useIsMobile();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Palette className="h-6 w-6 text-[#6C2DC7]" />
          <FunkyText text="Make Something Wonderful" className="font-bold text-lg" />
        </Link>

        <nav className="flex items-center gap-3">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              pathname === '/' ? 'bg-purple-100 text-purple-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {isMobile ? <GalleryHorizontalEnd className="h-5 w-5" /> : 'Gallery'}
          </Link>

          <Link
            to="/stories"
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              pathname === '/stories' ? 'bg-purple-100 text-purple-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {isMobile ? <BookOpenCheck className="h-5 w-5" /> : 'Stories'}
          </Link>
          
          <Link
            to="/create"
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              pathname === '/create' ? 'bg-purple-100 text-purple-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {isMobile ? <Palette className="h-5 w-5" /> : 'Create'}
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
