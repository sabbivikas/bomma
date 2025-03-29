
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Pen, Home, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import FunkyText from "@/components/FunkyText";

const Navbar: React.FC = () => {
  const location = useLocation();

  return (
    <header className="w-full bg-white border-b-[3px] border-black sticky top-0 z-10 animate-pop-in">
      <div className="container mx-auto px-4 flex justify-between items-center h-16">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center sketchy-box">
            <Pen className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg sketchy-text font-funky">
            <FunkyText text="Make Something Wonderful" />
          </span>
        </Link>
        
        <nav className="flex items-center space-x-2">
          <Link to="/">
            <Button 
              variant={location.pathname === "/" ? "default" : "outline"} 
              size="sm"
              className="sketchy-button gap-2 rounded-xl border-2 border-black"
            >
              <Home className="w-4 h-4" />
              <FunkyText text="Feed" />
            </Button>
          </Link>
          <Link to="/create">
            <Button 
              variant={location.pathname === "/create" ? "default" : "outline"} 
              size="sm" 
              className="sketchy-button gap-2 rounded-xl border-2 border-black"
            >
              <Pen className="w-4 h-4" />
              <FunkyText text="Create" />
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
