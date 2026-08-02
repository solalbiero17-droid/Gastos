import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import { auth, firebaseConfigured } from '../firebase';

WebBrowser.maybeCompleteAuthSession();

interface AuthContextValue {
  user: User | null;
  initializing: boolean;
  googleRequestReady: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    if (!firebaseConfigured) {
      setInitializing(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setInitializing(false);
    });
    return unsub;
  }, []);

  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  const platformClientId = Platform.select({ ios: iosClientId, android: androidClientId, default: webClientId });
  const googleConfigured = !!platformClientId;

  // expo-auth-session's Google provider throws during render if the platform's client id is
  // undefined, so a placeholder keeps the hook happy until real credentials are configured —
  // loginWithGoogle() below refuses to prompt in that case instead.
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: iosClientId ?? 'not-configured.apps.googleusercontent.com',
    androidClientId: androidClientId ?? 'not-configured.apps.googleusercontent.com',
    webClientId: webClientId ?? 'not-configured.apps.googleusercontent.com',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const idToken = response.authentication?.idToken ?? (response.params as any)?.id_token;
      if (idToken) {
        const credential = GoogleAuthProvider.credential(idToken);
        signInWithCredential(auth, credential).catch((e) => console.warn('Google sign-in failed', e));
      }
    }
  }, [response]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      initializing,
      googleRequestReady: !!request && googleConfigured,
      loginWithGoogle: async () => {
        if (!googleConfigured) {
          throw new Error('Google Sign-In no está configurado (falta el client id en el .env).');
        }
        await promptAsync();
      },
      loginWithEmail: async (email: string, password: string) => {
        try {
          await signInWithEmailAndPassword(auth, email, password);
        } catch (e: any) {
          if (e?.code === 'auth/user-not-found' || e?.code === 'auth/invalid-credential') {
            await createUserWithEmailAndPassword(auth, email, password);
          } else {
            throw e;
          }
        }
      },
      logout: async () => {
        await signOut(auth);
      },
    }),
    [user, initializing, request, promptAsync, googleConfigured]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
