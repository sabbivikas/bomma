
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { useToast } from '@/hooks/use-toast';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAdmin, isLoading } = useAdminAuth();
  const { toast } = useToast();
  
  // Show loading state while checking admin status
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // If not an admin, redirect to home page with a toast message
  if (!isAdmin) {
    // Show unauthorized access message
    toast({
      title: "Unauthorized Access",
      description: "You don't have permission to access this area",
      variant: "destructive",
    });
    
    return <Navigate to="/" replace />;
  }

  // If admin, render the children
  return <>{children}</>;
};

export default AdminRoute;
