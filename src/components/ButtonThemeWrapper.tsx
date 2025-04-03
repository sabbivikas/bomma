
import React, { ReactNode } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { getButtonStyles } from '@/utils/themeHelpers';

interface ButtonThemeWrapperProps {
  children: ReactNode;
  className?: string;
}

const ButtonThemeWrapper: React.FC<ButtonThemeWrapperProps> = ({ 
  children, 
  className = '' 
}) => {
  const { theme } = useTheme();
  const themeStyles = getButtonStyles(theme);
  
  return (
    <div className={`${themeStyles} ${className}`}>
      {children}
    </div>
  );
};

export default ButtonThemeWrapper;
