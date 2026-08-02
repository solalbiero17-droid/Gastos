import type { Account, Category, Goal, Limits, Transaction } from '../types';
import { categoryColor, colors } from '../constants/theme';
import { monthKey as monthKeyOf } from './format';

export function spentByCategory(transactions: Transaction[], month: string): Record<string, number> {
  const map: Record<string, number> = {};
  for (const t of transactions) {
    if (t.type !== 'gasto' || t.currency !== 'ARS' || !t.categoryId) continue;
    if (monthKeyOf(new Date(t.createdAt)) !== month) continue;
    map[t.categoryId] = (map[t.categoryId] || 0) + t.amount;
  }
  return map;
}

export function incomeForMonth(transactions: Transaction[], month: string, currency: 'ARS' | 'USD' = 'ARS'): number {
  return transactions
    .filter((t) => t.type === 'ingreso' && t.currency === currency && monthKeyOf(new Date(t.createdAt)) === month)
    .reduce((sum, t) => sum + t.amount, 0);
}

export function spentTotalForMonth(transactions: Transaction[], month: string, currency: 'ARS' | 'USD' = 'ARS'): number {
  return transactions
    .filter((t) => t.type === 'gasto' && t.currency === currency && monthKeyOf(new Date(t.createdAt)) === month)
    .reduce((sum, t) => sum + t.amount, 0);
}

export function overallLimit(limits: Limits): number {
  return Object.values(limits).reduce((a, b) => a + b, 0);
}

export function barColorForPct(pct: number, warnThreshold: number): string {
  if (pct >= 1) return colors.over;
  if (pct >= warnThreshold) return colors.warn;
  return colors.ok;
}

export interface CategoryView {
  id: string;
  name: string;
  hue: number;
  spent: number;
  limit: number;
  remaining: number;
  pct: number;
  overLimit: boolean;
}

export function categoryViews(categories: Category[], limits: Limits, spent: Record<string, number>): CategoryView[] {
  return categories.map((c) => {
    const sp = spent[c.id] || 0;
    const lim = limits[c.id] ?? 0;
    const remaining = lim - sp;
    const pct = lim ? sp / lim : 0;
    return { id: c.id, name: c.name, hue: c.hue, spent: sp, limit: lim, remaining, pct, overLimit: remaining < 0 };
  });
}

export function accountBalance(account: Account, transactions: Transaction[]): number {
  let balance = account.baseBalance;
  for (const t of transactions) {
    if (t.accountId !== account.id) continue;
    balance += t.type === 'ingreso' ? t.amount : -t.amount;
  }
  return balance;
}

export interface GoalView extends Goal {
  pct: number;
  projected: number;
}

export function goalViews(goals: Goal[], leftover: number): GoalView[] {
  const positiveLeftover = Math.max(0, leftover);
  const share = goals.length ? Math.floor(positiveLeftover / goals.length) : 0;
  return goals.map((g) => ({
    ...g,
    pct: g.target ? Math.min(1, g.saved / g.target) : 0,
    projected: Math.min(share, Math.max(0, g.target - g.saved)),
  }));
}

export function allMonthKeys(transactions: Transaction[], currentMonth: string): string[] {
  const set = new Set<string>([currentMonth]);
  for (const t of transactions) set.add(monthKeyOf(new Date(t.createdAt)));
  return Array.from(set).sort();
}

export function categoryInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?';
}

export { categoryColor };
