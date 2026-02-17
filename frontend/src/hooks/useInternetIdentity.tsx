import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { Identity } from '@dfinity/agent';

interface InternetIdentityContextType {
  identity: Identity | null;
  isAuthenticated: boolean;
  loginStatus: 'idle' | 'logging-in' | 'authenticated' | 'unauthenticated';
  login: () => Promise<void>;
  clear: () => Promise<void>;
  authClient: AuthClient | null;
}

const InternetIdentityContext = createContext<InternetIdentityContextType>({
  identity: null,
  isAuthenticated: false,
  loginStatus: 'idle',
  login: async () => { },
  clear: async () => { },
  authClient: null,
});

export function InternetIdentityProvider({ children }: { children: React.ReactNode }) {
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginStatus, setLoginStatus] = useState<'idle' | 'logging-in' | 'authenticated' | 'unauthenticated'>('idle');

  useEffect(() => {
    initAuth();
  }, []);

  async function initAuth() {
    const client = await AuthClient.create();
    setAuthClient(client);

    const isAuth = await client.isAuthenticated();
    setIsAuthenticated(isAuth);
    setLoginStatus(isAuth ? 'authenticated' : 'unauthenticated');

    if (isAuth) {
      const id = client.getIdentity();
      setIdentity(id);
    }
  }

  async function login() {
    if (!authClient) return;

    setLoginStatus('logging-in');

    const identityProvider = import.meta.env.VITE_II_URL || process.env.II_URL || 'https://identity.ic0.app';

    await new Promise<void>((resolve, reject) => {
      authClient.login({
        identityProvider,
        onSuccess: () => {
          const id = authClient.getIdentity();
          setIdentity(id);
          setIsAuthenticated(true);
          setLoginStatus('authenticated');
          resolve();
        },
        onError: (error) => {
          console.error('Login failed:', error);
          setLoginStatus('unauthenticated');
          reject(error);
        },
      });
    });
  }

  async function clear() {
    if (!authClient) return;

    await authClient.logout();
    setIdentity(null);
    setIsAuthenticated(false);
    setLoginStatus('unauthenticated');
  }

  return (
    <InternetIdentityContext.Provider
      value={{
        identity,
        isAuthenticated,
        loginStatus,
        login,
        clear,
        authClient,
      }}
    >
      {children}
    </InternetIdentityContext.Provider>
  );
}

export function useInternetIdentity() {
  return useContext(InternetIdentityContext);
}
