
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UserProfile {
  id?: string;
  name?: string;
  avatar_url?: string;
  email?: string;
}

interface UserContextType {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  updateUserProfile: (data: Partial<UserProfile>) => void;
}

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  updateUserProfile: () => {},
});

export const useUser = () => useContext(UserContext);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    // Try to get user from localStorage
    const savedUser = localStorage.getItem('bomma-user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const updateUserProfile = (data: Partial<UserProfile>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('bomma-user', JSON.stringify(updatedUser));
    }
  };

  // Save user to localStorage whenever it changes
  React.useEffect(() => {
    if (user) {
      localStorage.setItem('bomma-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('bomma-user');
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser, updateUserProfile }}>
      {children}
    </UserContext.Provider>
  );
};
