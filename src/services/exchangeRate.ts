import { readJson, writeJson, StorageKeys } from '../storage';

export interface ExchangeRate {
  /** Pesos the bank pays you per dollar when you sell dollars (use for USD → ARS). */
  compra: number;
  /** Pesos you pay the bank per dollar when you buy dollars (use for ARS → USD). */
  venta: number;
  /** ISO timestamp the rate was last updated, as reported by the source. */
  fechaActualizacion: string;
  /** When this device fetched/cached it. */
  fetchedAt: number;
}

const DOLARAPI_URL = 'https://dolarapi.com/v1/dolares/oficial';
const FETCH_TIMEOUT_MS = 8000;

/**
 * Mirrors Banco Nación's official dollar rate. Fetched client-side from a public,
 * CORS-enabled API — bna.com.ar itself doesn't allow cross-origin requests, so the
 * app can't read it directly.
 */
export async function fetchOfficialRate(): Promise<ExchangeRate> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(DOLARAPI_URL, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (typeof data?.compra !== 'number' || typeof data?.venta !== 'number') {
      throw new Error('Unexpected response shape');
    }
    const rate: ExchangeRate = {
      compra: data.compra,
      venta: data.venta,
      fechaActualizacion: data.fechaActualizacion ?? new Date().toISOString(),
      fetchedAt: Date.now(),
    };
    await writeJson(StorageKeys.exchangeRate, rate);
    return rate;
  } finally {
    clearTimeout(timeout);
  }
}

export function getCachedRate(): Promise<ExchangeRate | null> {
  return readJson<ExchangeRate | null>(StorageKeys.exchangeRate, null);
}
