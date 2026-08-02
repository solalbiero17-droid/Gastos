import type { Currency } from '../types';

export function fmtArs(value: number): string {
  return '$ ' + Math.round(value).toLocaleString('es-AR');
}

export function fmtUsd(value: number): string {
  return 'US$ ' + Math.round(value).toLocaleString('es-AR');
}

export function fmt(value: number, currency: Currency): string {
  return currency === 'USD' ? fmtUsd(value) : fmtArs(value);
}

/** Signed amount, e.g. "−$ 1.200" / "$ 1.200" without a leading "+". */
export function fmtSigned(value: number, currency: Currency): string {
  return value < 0 ? '−' + fmt(-value, currency) : fmt(value, currency);
}

const MONTH_NAMES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];
const MONTH_ABBR = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
];

export function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function monthKeyToDate(key: string): Date {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1);
}

export function monthLabel(key: string, currentKey: string): string {
  const d = monthKeyToDate(key);
  const currentYear = monthKeyToDate(currentKey).getFullYear();
  if (d.getFullYear() === currentYear) {
    const name = MONTH_NAMES[d.getMonth()];
    return name[0].toUpperCase() + name.slice(1);
  }
  return `${MONTH_ABBR[d.getMonth()]} ${d.getFullYear()}`;
}

export function monthTitle(key: string): string {
  const d = monthKeyToDate(key);
  const name = MONTH_NAMES[d.getMonth()];
  return `${name[0].toUpperCase() + name.slice(1)} ${d.getFullYear()}`;
}

export function dayLabel(timestamp: number, now = new Date()): string {
  const d = new Date(timestamp);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((today.getTime() - target.getTime()) / 86400000);
  if (diffDays === 0) return 'HOY';
  if (diffDays === 1) return 'AYER';
  const name = MONTH_NAMES[d.getMonth()];
  return `${d.getDate()} DE ${name.toUpperCase()}`;
}

export function isValidEmail(value: string): boolean {
  return /.+@.+\..+/.test(value);
}
