import { useEffect, useState } from 'react';

/**
 * There is no backend, so this fakes a short fetch: it reports `true` on first render and again
 * whenever `key` changes, until `delayMs` has passed.
 */
export function useSimulatedLoading(key: string | number, delayMs: number): boolean {
  const [loadedKey, setLoadedKey] = useState<string | number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadedKey(key);
    }, delayMs);
    return () => {
      clearTimeout(timer);
    };
  }, [key, delayMs]);

  return loadedKey !== key;
}
