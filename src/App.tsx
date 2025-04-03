
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Create from "./pages/Create";
import NotFound from "./pages/NotFound";
import Stories from "./pages/Stories";
import CreateStory from "./pages/CreateStory";
import CreateAnimation from "./pages/CreateAnimation";
import ViewStory from "./pages/ViewStory";
import AdminModeration from "./pages/AdminModeration";
import AdminRoute from "./components/AdminRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/create" element={<Create />} />
          <Route path="/stories" element={<Stories />} />
          <Route path="/create-story" element={<CreateStory />} />
          <Route path="/create-animation" element={<CreateAnimation />} />
          <Route path="/stories/:id" element={<ViewStory />} />
          {/* Protected admin route */}
          <Route path="/admin/moderation" element={
            <AdminRoute>
              <AdminModeration />
            </AdminRoute>
          } />
          {/* Short URL routes */}
          <Route path="/s/:shortId" element={<ShortUrlRedirect type="story" />} />
          <Route path="/d/:shortId" element={<ShortUrlRedirect type="doodle" />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

// Component to handle short URL redirects
function ShortUrlRedirect({ type }: { type: 'story' | 'doodle' }) {
  const shortId = window.location.pathname.split('/')[2]; // Extract shortId from URL
  
  // In a real implementation, we would look up the full ID from a database
  // For this demo, we'll simply redirect to the appropriate page
  // assuming the shortId is just the first part of the full ID
  const redirectPath = type === 'story' 
    ? `/stories/${shortId}` 
    : `/doodles/${shortId}`;
    
  return <Navigate to={redirectPath} replace />;
}

export default App;
