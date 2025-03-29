
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Pen, Home, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar: React.FC = () => {
  const location = useLocation();

  return (
    <header className="w-full bg-white border-b border-border sticky top-0 z-10">
      <div className="container mx-auto px-4 flex justify-between items-center h-16">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Pen className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg">Make Something Wonderful</span>
        </Link>
        
        <nav className="flex items-center space-x-2">
          <Link to="/">
            <Button variant={location.pathname === "/" ? "default" : "ghost"} size="sm">
              <Home className="w-4 h-4 mr-2" />
              Feed
            </Button>
          </Link>
          <Link to="/create">
            <Button variant={location.pathname === "/create" ? "default" : "ghost"} size="sm">
              <Pen className="w-4 h-4 mr-2" />
              Create
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
