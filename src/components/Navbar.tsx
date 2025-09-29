
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import FunkyText from './FunkyText';
import { GalleryHorizontalEnd, Palette, BookOpenCheck, ShieldAlert, LogOut, LogIn } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { useAuth } from '@/hooks/useAuth';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';

const Navbar = () => {
  const { pathname } = useLocation();
  const isMobile = useIsMobile();
  const { isAdmin } = useAdminAuth();
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: 'Signed out',
      description: 'You have been signed out successfully.',
    });
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Palette className="h-6 w-6 text-[#6C2DC7]" />
          <FunkyText text="Bomma" className="font-bold text-lg" />
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

          {/* Only show Moderation Link to admins */}
          {isAdmin && (
            <Link
              to="/admin/moderation"
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                pathname === '/admin/moderation' ? 'bg-red-100 text-red-900' : 'text-red-600 hover:text-red-900 hover:bg-red-50'
              }`}
            >
              {isMobile ? <ShieldAlert className="h-5 w-5" /> : 'Moderation'}
            </Link>
          )}

          {/* Auth buttons */}
          {user ? (
            <Button
              onClick={handleSignOut}
              variant="ghost"
              size="sm"
              className="gap-2"
            >
              {isMobile ? <LogOut className="h-5 w-5" /> : <>
                <LogOut className="h-4 w-4" />
                Sign Out
              </>}
            </Button>
          ) : (
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="gap-2">
                {isMobile ? <LogIn className="h-5 w-5" /> : <>
                  <LogIn className="h-4 w-4" />
                  Sign In
                </>}
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
