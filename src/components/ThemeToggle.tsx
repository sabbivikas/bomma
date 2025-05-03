
import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, setVisualTheme } = useTheme();

  // Check if current visual theme is dark (darkFantasy is our dark theme)
  const isDarkTheme = theme.visualTheme === 'darkFantasy';

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setVisualTheme(isDarkTheme ? 'default' : 'darkFantasy')}
      className="w-9 px-0"
    >
      {isDarkTheme ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
