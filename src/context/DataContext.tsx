import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import type { Account, Category, Goal, Limits, Transaction } from '../types';
import { DEFAULT_CATEGORY_LIMIT, DEFAULT_WARN_THRESHOLD, NEW_CATEGORY_HUES } from '../constants/theme';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'ropa', name: 'Ropa', hue: 25 },
  { id: 'comida', name: 'Comida', hue: 145 },
  { id: 'delivery', name: 'Delivery', hue: 60 },
  { id: 'diversion', name: 'Diversión', hue: 320 },
  { id: 'deportes', name: 'Deportes', hue: 250 },
  { id: 'higiene', name: 'Higiene', hue: 200 },
  { id: 'sube', name: 'Sube', hue: 100 },
  { id: 'uber', name: 'Uber', hue: 285 },
];

export const DEFAULT_ACCOUNTS: Account[] = [
  { id: 'efectivo', name: 'Efectivo', currency: 'ARS', hue: 60, baseBalance: 0 },
  { id: 'bbva', name: 'BBVA', currency: 'ARS', hue: 250, baseBalance: 0 },
  { id: 'mp', name: 'MercadoPago', currency: 'ARS', hue: 200, baseBalance: 0 },
  { id: 'dni', name: 'Cuenta DNI', currency: 'ARS', hue: 320, baseBalance: 0 },
  { id: 'galicia', name: 'Galicia', currency: 'ARS', hue: 25, baseBalance: 0 },
  { id: 'papa', name: 'Plata Papá', currency: 'ARS', hue: 145, baseBalance: 0 },
  { id: 'usdwf', name: 'Dólares Wells Fargo', currency: 'USD', hue: 285, baseBalance: 0 },
  { id: 'usdef', name: 'Dólares efectivo', currency: 'USD', hue: 100, baseBalance: 0 },
];

interface ConfigDoc {
  categories: Category[];
  accounts: Account[];
  limits: Limits;
}

interface ProfileDoc {
  setupComplete: boolean;
  warnThreshold: number;
}

interface DataContextValue {
  loading: boolean;
  setupComplete: boolean;
  warnThreshold: number;
  categories: Category[];
  accounts: Account[];
  limits: Limits;
  transactions: Transaction[];
  goals: Goal[];
  completeSetup: (accounts: Account[], categories: Category[], limits: Limits) => Promise<void>;
  addCategory: (name: string) => Promise<void>;
  removeCategory: (id: string) => Promise<void>;
  setLimit: (categoryId: string, amount: number) => Promise<void>;
  addTransaction: (tx: Omit<Transaction, 'id'>) => Promise<void>;
  addGoal: (name: string, target: number) => Promise<void>;
  contributeToGoal: (goalId: string, amount: number) => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const uid = user?.uid ?? null;

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileDoc>({ setupComplete: false, warnThreshold: DEFAULT_WARN_THRESHOLD });
  const [config, setConfig] = useState<ConfigDoc>({ categories: [], accounts: [], limits: {} });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }
    setLoading(true);
    let pending = 4;
    const settle = () => {
      pending -= 1;
      if (pending <= 0) setLoading(false);
    };

    const unsubs: Unsubscribe[] = [];

    unsubs.push(
      onSnapshot(doc(db, 'users', uid), (snap) => {
        const data = snap.data() as ProfileDoc | undefined;
        setProfile(data ?? { setupComplete: false, warnThreshold: DEFAULT_WARN_THRESHOLD });
        settle();
      })
    );

    unsubs.push(
      onSnapshot(doc(db, 'users', uid, 'config', 'data'), (snap) => {
        const data = snap.data() as ConfigDoc | undefined;
        setConfig(data ?? { categories: [], accounts: [], limits: {} });
        settle();
      })
    );

    unsubs.push(
      onSnapshot(query(collection(db, 'users', uid, 'transactions'), orderBy('createdAt', 'desc')), (snap) => {
        setTransactions(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Transaction, 'id'>) })));
        settle();
      })
    );

    unsubs.push(
      onSnapshot(collection(db, 'users', uid, 'goals'), (snap) => {
        setGoals(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Goal, 'id'>) })));
        settle();
      })
    );

    return () => unsubs.forEach((u) => u());
  }, [uid]);

  const value = useMemo<DataContextValue>(() => {
    const configRef = () => doc(db, 'users', uid!, 'config', 'data');
    const profileRef = () => doc(db, 'users', uid!);

    return {
      loading,
      setupComplete: profile.setupComplete,
      warnThreshold: profile.warnThreshold ?? DEFAULT_WARN_THRESHOLD,
      categories: config.categories,
      accounts: config.accounts,
      limits: config.limits,
      transactions,
      goals,
      completeSetup: async (accounts, categories, limits) => {
        if (!uid) return;
        await setDoc(configRef(), { accounts, categories, limits });
        await setDoc(profileRef(), { setupComplete: true, warnThreshold: DEFAULT_WARN_THRESHOLD }, { merge: true });
      },
      addCategory: async (name) => {
        if (!uid) return;
        const id = 'c' + Date.now();
        const hue = NEW_CATEGORY_HUES[config.categories.length % NEW_CATEGORY_HUES.length];
        const nextCategories = [...config.categories, { id, name, hue }];
        const nextLimits = { ...config.limits, [id]: DEFAULT_CATEGORY_LIMIT };
        await updateDoc(configRef(), { categories: nextCategories, limits: nextLimits });
      },
      removeCategory: async (id) => {
        if (!uid) return;
        const nextCategories = config.categories.filter((c) => c.id !== id);
        const nextLimits = { ...config.limits };
        delete nextLimits[id];
        await updateDoc(configRef(), { categories: nextCategories, limits: nextLimits });
      },
      setLimit: async (categoryId, amount) => {
        if (!uid) return;
        const nextLimits = { ...config.limits, [categoryId]: Math.max(0, amount) };
        await updateDoc(configRef(), { limits: nextLimits });
      },
      addTransaction: async (tx) => {
        if (!uid) return;
        await addDoc(collection(db, 'users', uid, 'transactions'), tx);
      },
      addGoal: async (name, target) => {
        if (!uid) return;
        const hues = [25, 60, 145, 200, 250, 285, 320];
        const hue = hues[goals.length % hues.length];
        await addDoc(collection(db, 'users', uid, 'goals'), { name, target, saved: 0, hue });
      },
      contributeToGoal: async (goalId, amount) => {
        if (!uid) return;
        const g = goals.find((x) => x.id === goalId);
        if (!g) return;
        const nextSaved = Math.min(g.target, g.saved + amount);
        await updateDoc(doc(db, 'users', uid, 'goals', goalId), { saved: nextSaved });
      },
    };
  }, [uid, loading, profile, config, transactions, goals]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
