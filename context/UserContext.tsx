"use client";

import React, { createContext, useEffect, useState } from 'react';
import api from '../lib/api';
import { useRouter } from 'next/navigation';
import type { User } from '../types';

type UserContextType = {
  user: User | null;
  setUser: (u: User | null) => void;
  loading: boolean;
};

export const UserContext = createContext<UserContextType | undefined>(undefined);

export default function UserContextProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/users/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data.user ?? null);
      } catch (err) {
        console.error(err);
        setUser(null);
        if (typeof window !== 'undefined') localStorage.removeItem('token');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
}
