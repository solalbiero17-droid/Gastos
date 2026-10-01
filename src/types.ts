export type Currency = 'ARS' | 'USD';
export type TxType = 'gasto' | 'ingreso' | 'transferencia';

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
  /** For gasto/ingreso: the transaction's currency. For transferencia: the origin account's currency. */
  currency: Currency;
  /** Category id — only set for ARS gastos. */
  categoryId: string | null;
  /** For gasto/ingreso: the account. For transferencia: the origin account (debited). */
  accountId: string;
  /** For gasto/ingreso: the amount. For transferencia: the amount debited from accountId. */
  amount: number;
  note: string;
  discount?: number;
  /** Millis timestamp, also used for ordering and month bucketing. */
  createdAt: number;
  /** transferencia only: destination account (credited). */
  toAccountId?: string;
  /** transferencia only: amount credited to toAccountId, in its own currency — equals
   * `amount` for a same-currency transfer, or the converted amount otherwise. */
  toAmount?: number;
  /** transferencia only: exchange rate applied when accountId/toAccountId currencies differ. */
  exchangeRate?: number;
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
