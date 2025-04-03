
import { Route, Routes } from 'react-router-dom';
import Index from '@/pages/Index';
import Create from '@/pages/Create';
import CreateStory from '@/pages/CreateStory';
import Stories from '@/pages/Stories';
import ViewStory from '@/pages/ViewStory';
import CreateAnimation from '@/pages/CreateAnimation';
import NotFound from '@/pages/NotFound';
import AdminModeration from '@/pages/AdminModeration';
import AdminRoute from '@/components/AdminRoute';
import GameCreator from '@/pages/GameCreator';
import GamePlayerPage from '@/pages/GamePlayerPage';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/contexts/ThemeContext';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/create" element={<Create />} />
        <Route path="/create-story" element={<CreateStory />} />
        <Route path="/stories" element={<Stories />} />
        <Route path="/stories/:id" element={<ViewStory />} />
        <Route path="/create-animation" element={<CreateAnimation />} />
        <Route path="/create-game" element={<GameCreator />} />
        <Route path="/play-game" element={<GamePlayerPage />} />
        <Route path="/admin/moderation" element={<AdminRoute><AdminModeration /></AdminRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
