import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { User2 } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { ThemeToggle } from './ThemeToggle';

const Navbar = () => {
  const { isLoggedIn, logout } = useAuth();
  const { user } = useUser();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow">
      <div className="container mx-auto px-6 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-gray-800 dark:text-white hover:text-gray-700 dark:hover:text-gray-300">
          Bomma
        </Link>
        
        <div className="flex items-center gap-5">
          <Link to="/" className={`nav-link ${isActive("/") ? 'active' : ''}`}>Browse</Link>
          <Link to="/create" className={`nav-link ${isActive("/create") ? 'active' : ''}`}>Create</Link>
          <Link to="/stories" className={`nav-link ${isActive("/stories") ? 'active' : ''}`}>Stories</Link>
          <Link to="/create-story" className={`nav-link ${isActive("/create-story") ? 'active' : ''}`}>Create Story</Link>
          <Link to="/co-draw" className={`nav-link ${isActive("/co-draw") ? 'active' : ''}`}>Co-Draw</Link>
          <Link to="/worlds" className={`nav-link ${isActive("/worlds") ? 'active' : ''}`}>Worlds</Link>
          
          <ThemeToggle />

          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user?.avatar_url || ""} />
                <AvatarFallback><User2 /></AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm" onClick={logout}>Logout</Button>
            </div>
          ) : (
            <Link to="/login" className="text-blue-500 hover:text-blue-700">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
