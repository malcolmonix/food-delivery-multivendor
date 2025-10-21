import React, { createContext, useState, useEffect } from 'react';
import { IUserReponse } from '@/lib/utils/interfaces';

interface IUserContext {
  user: IUserReponse | null;
  setUser: (user: IUserReponse | null) => void;
}

export const UserContext = createContext<IUserContext | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<IUserReponse | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user-Multivendor-Admin');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      setUser(null);
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

