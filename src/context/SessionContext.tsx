import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { readJson, writeJson, StorageKeys } from '../storage';

/**
 * There's no backend, so "session" just means: has this device gone through the
 * login screen. Google/email login don't authenticate anything — they mirror the
 * original design's flow while keeping all data local to the device (see
 * DataContext). Logging out returns to the login screen without touching data,
 * so logging back in resumes exactly where the user left off.
 */
interface SessionContextValue {
  loggedIn: boolean;
  initializing: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    readJson(StorageKeys.session, false).then((value) => {
      setLoggedIn(value);
      setInitializing(false);
    });
  }, []);

  const setSession = async (value: boolean) => {
    setLoggedIn(value);
    await writeJson(StorageKeys.session, value);
  };

  const value = useMemo<SessionContextValue>(
    () => ({
      loggedIn,
      initializing,
      loginWithGoogle: () => setSession(true),
      loginWithEmail: () => setSession(true),
      logout: () => setSession(false),
    }),
    [loggedIn, initializing]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}
