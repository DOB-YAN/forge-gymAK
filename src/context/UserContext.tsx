import { createContext, useContext, useState, type ReactNode } from 'react';
import type { UserId } from '../types';

interface UserContextType {
  activeUser: UserId;
  setActiveUser: (user: UserId) => void;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [activeUser, setActiveUser] = useState<UserId>('abel');

  return (
    <UserContext.Provider value={{ activeUser, setActiveUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextType {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
