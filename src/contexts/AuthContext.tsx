
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    // Check localStorage for an existing login state
    const savedLoginState = localStorage.getItem('bomma-auth');
    return savedLoginState === 'true';
  });

  const login = () => {
    setIsLoggedIn(true);
    localStorage.setItem('bomma-auth', 'true');
  };

  const logout = () => {
    setIsLoggedIn(false);
    localStorage.setItem('bomma-auth', 'false');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
