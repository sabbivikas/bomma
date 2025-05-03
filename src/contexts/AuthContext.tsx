
import React, { createContext, useContext, ReactNode } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Mock implementation
  const isLoggedIn = false;
  const logout = () => {
    console.log('Logout clicked');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
