
import React, { createContext, useContext, ReactNode } from 'react';

interface User {
  avatar_url?: string;
}

interface UserContextType {
  user: User | null;
}

const UserContext = createContext<UserContextType>({
  user: null,
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  // Mock implementation
  const user = {
    avatar_url: '',
  };

  return <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);
