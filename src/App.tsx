
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import Create from "./pages/Create";
import NotFound from "./pages/NotFound";
import Stories from "./pages/Stories";
import CreateStory from "./pages/CreateStory";
import CreateAnimation from "./pages/CreateAnimation";
import ViewStory from "./pages/ViewStory";
import AdminModeration from "./pages/AdminModeration";
import AdminRoute from "./components/AdminRoute";
import ShortUrlRedirect from "./components/ShortUrlRedirect";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
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
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
