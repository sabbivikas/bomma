
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Index from '@/pages/Index';
import Create from '@/pages/Create';
import Stories from '@/pages/Stories';
import ViewStory from '@/pages/ViewStory';
import CreateStory from '@/pages/CreateStory';
import CreateAnimation from '@/pages/CreateAnimation';
import AdminModeration from '@/pages/AdminModeration';
import NotFound from '@/pages/NotFound';
import ShortUrlRedirect from '@/components/ShortUrlRedirect';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { UserProvider } from '@/contexts/UserContext';
import ThemedBackground from '@/components/ThemedBackground';
import { Toaster } from '@/components/ui/toaster';
import AdminRoute from '@/components/AdminRoute';
import CoDraw from '@/pages/CoDraw';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <UserProvider>
            <ThemedBackground>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/create" element={<Create />} />
                <Route path="/stories" element={<Stories />} />
                <Route path="/story/:id" element={<ViewStory />} />
                <Route path="/create-story" element={<CreateStory />} />
                <Route path="/create-animation" element={<CreateAnimation />} />
                <Route path="/co-draw" element={<CoDraw />} />
                <Route path="/admin/*" element={<AdminRoute><AdminModeration /></AdminRoute>} />
                <Route path="/s/:shortId" element={<ShortUrlRedirect type="story" />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </ThemedBackground>
          </UserProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
