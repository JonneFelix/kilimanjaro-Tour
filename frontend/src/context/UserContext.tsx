import React, { createContext, useContext, useEffect, useState } from 'react';
import type { UserId } from '../shared-types';

interface UserContextType {
  user: UserId | null;
  setUser: (user: UserId | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<UserId | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('currentUser');
    if (stored === 'jonne' || stored === 'frank') {
      setUserState(stored);
    }
  }, []);

  const setUser = (u: UserId | null) => {
    setUserState(u);
    if (u) {
      localStorage.setItem('currentUser', u);
    } else {
      localStorage.removeItem('currentUser');
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

