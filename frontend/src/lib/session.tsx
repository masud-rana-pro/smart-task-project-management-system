import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from './api';
import type { User } from './types';

const SessionContext = createContext<{
  user: User | null;
  pending: boolean;
  error: Error | null;
  expired: boolean;
  refresh: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
} | null>(null);
export function SessionProvider({ children }: { children: ReactNode }) {
  const client = useQueryClient();
  const [expired, setExpired] = useState(false);
  const session = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      try {
        return (await api<{ user: User }>('/auth/me')).user;
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) return null;
        throw error;
      }
    },
    retry: false,
    staleTime: 60_000,
  });
  useEffect(() => {
    const expire = () => {
      if (!client.getQueryData(['session'])) return;
      client.removeQueries({
        predicate: (query) => query.queryKey[0] !== 'session',
      });
      client.setQueryData(['session'], null);
      setExpired(true);
    };
    window.addEventListener('session-expired', expire);
    return () => window.removeEventListener('session-expired', expire);
  }, [client]);
  async function signIn(email: string, password: string) {
    const { user } = await api<{ user: User }>('/auth/login', 'POST', {
      email,
      password,
    });
    client.removeQueries({
      predicate: (query) => query.queryKey[0] !== 'session',
    });
    client.setQueryData(['session'], user);
    setExpired(false);
  }
  async function signOut() {
    await api('/auth/logout', 'POST');
    client.removeQueries({
      predicate: (query) => query.queryKey[0] !== 'session',
    });
    client.setQueryData(['session'], null);
  }
  return (
    <SessionContext
      value={{
        user: session.data ?? null,
        pending: session.isPending,
        error: session.error,
        expired,
        refresh: () => void session.refetch(),
        signIn,
        signOut,
      }}
    >
      {children}
    </SessionContext>
  );
}
// This module exports a provider and its matching consumer hook.
// eslint-disable-next-line react-refresh/only-export-components
export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error('Session provider missing');
  return context;
}
