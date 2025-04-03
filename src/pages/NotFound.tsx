
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    // Update the page title when this component mounts
    document.title = "Bomma | Page Not Found";
    
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
    
    // Restore the original title when component unmounts
    return () => {
      document.title = "Bomma";
    };
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="text-center max-w-md space-y-6">
        <div className="w-24 h-24 mx-auto rounded-full bg-muted flex items-center justify-center animate-float">
          <span className="text-4xl">🖌️</span>
        </div>
        <h1 className="text-4xl font-bold">Page not found</h1>
        <p className="text-muted-foreground">
          Oops! It seems like the page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/">
          <Button>Go back to the homepage</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
