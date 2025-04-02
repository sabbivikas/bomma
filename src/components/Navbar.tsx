
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Menu,
  Paintbrush,
  Home,
  Film,
  BookOpen,
  Globe,
  GalleryHorizontalEnd
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const navItems = [
    {
      path: "/",
      label: "Home",
      icon: <Home className="h-4 w-4" />,
    },
    {
      path: "/create",
      label: "Draw",
      icon: <Paintbrush className="h-4 w-4" />,
    },
    {
      path: "/stories",
      label: "Stories",
      icon: <GalleryHorizontalEnd className="h-4 w-4" />,
    },
    {
      path: "/create-story",
      label: "Create Story",
      icon: <BookOpen className="h-4 w-4" />,
      hideOnMobile: true,
    },
    {
      path: "/create-animation",
      label: "Create Animation",
      icon: <Film className="h-4 w-4" />,
      hideOnMobile: true,
    },
  ];

  return (
    <header className="bg-gradient-to-r from-purple-600 to-blue-500 p-4 relative z-20 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link
          to="/"
          className="text-white font-bold text-xl flex items-center"
        >
          <Globe className="mr-2 h-6 w-6" />
          <span className="flex flex-col leading-tight">
            <span className="font-bold select-none">Doodle World</span>
            <span className="text-xs opacity-75 select-none">Create & Share</span>
          </span>
        </Link>

        {/* Mobile menu button */}
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-white md:hidden"
          >
            <Menu className="h-6 w-6" />
          </Button>
        )}

        {/* Desktop navigation */}
        {!isMobile && (
          <nav className="hidden md:flex space-x-1">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant="ghost"
                  className={cn(
                    "text-white hover:bg-white/20",
                    isActive(item.path) && "bg-white/20"
                  )}
                >
                  {item.icon}
                  <span className="ml-2">{item.label}</span>
                </Button>
              </Link>
            ))}
          </nav>
        )}

        {/* Mobile navigation menu */}
        {isMobile && menuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white shadow-lg rounded-b-lg z-30">
            <nav className="flex flex-col p-2">
              {navItems
                .filter((item) => !item.hideOnMobile)
                .map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMenuOpen(false)}
                  >
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start mb-1",
                        isActive(item.path) && "bg-gray-100"
                      )}
                    >
                      {item.icon}
                      <span className="ml-2">{item.label}</span>
                    </Button>
                  </Link>
                ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
