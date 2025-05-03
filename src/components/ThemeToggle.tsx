
import React from 'react';
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from '@/contexts/ThemeContext';
import { VisualTheme } from '@/types/theme';

export const ThemeToggle = () => {
  const { theme, setVisualTheme } = useTheme();
  
  const toggleTheme = () => {
    // The issue is that 'dark' is not in the VisualTheme type
    // Looking at the available values in types/theme.ts, use 'darkFantasy' instead of 'dark'
    const newTheme: VisualTheme = theme.visualTheme === 'default' ? 'darkFantasy' : 'default';
    setVisualTheme(newTheme);
    
    // Update the document class for immediate visual feedback
    if (newTheme === 'darkFantasy') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      {theme.visualTheme === 'darkFantasy' ? (
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      )}
    </Button>
  );
};
