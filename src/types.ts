export type Currency = 'ARS' | 'USD';
export type TxType = 'gasto' | 'ingreso';

export interface Category {
  id: string;
  name: string;
  hue: number;
}

export interface Account {
  id: string;
  name: string;
  currency: Currency;
  hue: number;
  /** Saldo base: balance before any recorded transactions, backed out at setup time. */
  baseBalance: number;
}

export interface Transaction {
  id: string;
  type: TxType;
  currency: Currency;
  /** Category id — only set for ARS gastos. */
  categoryId: string | null;
  accountId: string;
  amount: number;
  note: string;
  discount?: number;
  /** Millis timestamp, also used for ordering and month bucketing. */
  createdAt: number;
}

export interface Goal {
  id: string;
  name: string;
  target: number;
  saved: number;
  hue: number;
}

export type Limits = Record<string, number>;

export interface UserProfile {
  setupComplete: boolean;
  warnThreshold: number;
}
