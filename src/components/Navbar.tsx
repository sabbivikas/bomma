
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Pen, Home } from "lucide-react";
import FunkyText from "@/components/FunkyText";

const Navbar: React.FC = () => {
  const location = useLocation();

  return (
    <header className="w-full bg-white sticky top-0 z-10">
      <div className="container mx-auto px-4 flex justify-between items-center h-16">
        <Link to="/" className="flex items-center space-x-2">
          <Pen className="w-5 h-5" />
          <span className="font-bold text-lg font-funky">
            <FunkyText text="Make Something Wonderful" />
          </span>
        </Link>
        
        <nav className="flex items-center space-x-6">
          <Link 
            to="/"
            className={`transition-transform hover:scale-110 ${
              location.pathname === "/" ? "text-black" : "text-gray-500"
            }`}
          >
            <Home className="w-6 h-6" />
          </Link>
          <Link 
            to="/create"
            className={`transition-transform hover:scale-110 ${
              location.pathname === "/create" ? "text-black" : "text-gray-500"
            }`}
          >
            <Pen className="w-6 h-6" />
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
