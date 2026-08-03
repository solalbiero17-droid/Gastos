import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { readJson, writeJson, StorageKeys } from '../storage';
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

const EMPTY_CONFIG: ConfigDoc = { categories: [], accounts: [], limits: {} };
const DEFAULT_PROFILE: ProfileDoc = { setupComplete: false, warnThreshold: DEFAULT_WARN_THRESHOLD };

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
  setAccountBalance: (accountId: string, currentBalance: number) => Promise<void>;
  addTransaction: (tx: Omit<Transaction, 'id'>) => Promise<void>;
  addGoal: (name: string, target: number) => Promise<void>;
  contributeToGoal: (goalId: string, amount: number) => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileDoc>(DEFAULT_PROFILE);
  const [config, setConfig] = useState<ConfigDoc>(EMPTY_CONFIG);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    (async () => {
      const [p, c, t, g] = await Promise.all([
        readJson(StorageKeys.profile, DEFAULT_PROFILE),
        readJson(StorageKeys.config, EMPTY_CONFIG),
        readJson(StorageKeys.transactions, [] as Transaction[]),
        readJson(StorageKeys.goals, [] as Goal[]),
      ]);
      setProfile(p);
      setConfig(c);
      setTransactions(t);
      setGoals(g);
      setLoading(false);
    })();
  }, []);

  const value = useMemo<DataContextValue>(
    () => ({
      loading,
      setupComplete: profile.setupComplete,
      warnThreshold: profile.warnThreshold ?? DEFAULT_WARN_THRESHOLD,
      categories: config.categories,
      accounts: config.accounts,
      limits: config.limits,
      transactions,
      goals,
      completeSetup: async (accounts, categories, limits) => {
        const nextConfig = { accounts, categories, limits };
        const nextProfile = { setupComplete: true, warnThreshold: DEFAULT_WARN_THRESHOLD };
        setConfig(nextConfig);
        setProfile(nextProfile);
        await Promise.all([writeJson(StorageKeys.config, nextConfig), writeJson(StorageKeys.profile, nextProfile)]);
      },
      addCategory: async (name) => {
        const id = 'c' + Date.now();
        const hue = NEW_CATEGORY_HUES[config.categories.length % NEW_CATEGORY_HUES.length];
        const nextConfig: ConfigDoc = {
          ...config,
          categories: [...config.categories, { id, name, hue }],
          limits: { ...config.limits, [id]: DEFAULT_CATEGORY_LIMIT },
        };
        setConfig(nextConfig);
        await writeJson(StorageKeys.config, nextConfig);
      },
      removeCategory: async (id) => {
        const nextLimits = { ...config.limits };
        delete nextLimits[id];
        const nextConfig: ConfigDoc = {
          ...config,
          categories: config.categories.filter((c) => c.id !== id),
          limits: nextLimits,
        };
        setConfig(nextConfig);
        await writeJson(StorageKeys.config, nextConfig);
      },
      setLimit: async (categoryId, amount) => {
        const nextConfig: ConfigDoc = { ...config, limits: { ...config.limits, [categoryId]: Math.max(0, amount) } };
        setConfig(nextConfig);
        await writeJson(StorageKeys.config, nextConfig);
      },
      setAccountBalance: async (accountId, currentBalance) => {
        const net = transactions
          .filter((t) => t.accountId === accountId)
          .reduce((sum, t) => sum + (t.type === 'ingreso' ? t.amount : -t.amount), 0);
        const nextConfig: ConfigDoc = {
          ...config,
          accounts: config.accounts.map((a) =>
            a.id === accountId ? { ...a, baseBalance: currentBalance - net } : a
          ),
        };
        setConfig(nextConfig);
        await writeJson(StorageKeys.config, nextConfig);
      },
      addTransaction: async (tx) => {
        const next = [...transactions, { ...tx, id: 't' + Date.now() }];
        setTransactions(next);
        await writeJson(StorageKeys.transactions, next);
      },
      addGoal: async (name, target) => {
        const hues = [25, 60, 145, 200, 250, 285, 320];
        const hue = hues[goals.length % hues.length];
        const next = [...goals, { id: 'g' + Date.now(), name, target, saved: 0, hue }];
        setGoals(next);
        await writeJson(StorageKeys.goals, next);
      },
      contributeToGoal: async (goalId, amount) => {
        const next = goals.map((g) => (g.id === goalId ? { ...g, saved: Math.min(g.target, g.saved + amount) } : g));
        setGoals(next);
        await writeJson(StorageKeys.goals, next);
      },
    }),
    [loading, profile, config, transactions, goals]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
