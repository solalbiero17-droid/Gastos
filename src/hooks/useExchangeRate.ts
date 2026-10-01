import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchOfficialRate, getCachedRate, type ExchangeRate } from '../services/exchangeRate';

interface UseExchangeRateResult {
  rate: ExchangeRate | null;
  loading: boolean;
  /** True when the fresh fetch failed and `rate` (if any) is a cached/stale value. */
  error: boolean;
  refresh: () => void;
}

/**
 * Loads Banco Nación's official dollar rate for currency-conversion transfers: shows
 * the last cached value immediately (if any), then refreshes it from the network.
 * Falls back silently to the cached value if the network fetch fails — the UI decides
 * whether to warn the user and/or let them type a rate by hand.
 */
export function useExchangeRate(): UseExchangeRateResult {
  const [rate, setRate] = useState<ExchangeRate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const mounted = useRef(true);

  const load = useCallback(async () => {
    setLoading(true);
    const cached = await getCachedRate();
    if (mounted.current && cached) setRate(cached);
    try {
      const fresh = await fetchOfficialRate();
      if (mounted.current) {
        setRate(fresh);
        setError(false);
      }
    } catch {
      if (mounted.current) setError(true);
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    load();
    return () => {
      mounted.current = false;
    };
  }, [load]);

  return { rate, loading, error, refresh: load };
}
