import { useEffect, useState } from 'react';
import { fetchStaticJson, HI_JSON_KEYS } from '@/lib/content-api';

const cache = new Map<string, unknown>();
const inflight = new Map<string, Promise<unknown>>();

/**
 * Load a Hindi JSON document only when `enabled` is true.
 * English visitors never download the file.
 */
export function useHiJson<T>(
  key: string,
  enabled: boolean,
): T | undefined {
  const [data, setData] = useState<T | undefined>(() => cache.get(key) as T | undefined);

  useEffect(() => {
    if (!enabled) return;
    if (cache.has(key)) {
      setData(cache.get(key) as T);
      return;
    }
    let cancelled = false;
    let pending = inflight.get(key);
    if (!pending) {
      const jsonName = HI_JSON_KEYS[key] ?? key;
      pending = fetchStaticJson<T>(jsonName)
        .then((value) => {
          cache.set(key, value);
          inflight.delete(key);
          return value;
        })
        .catch((err) => {
          inflight.delete(key);
          throw err;
        });
      inflight.set(key, pending);
    }
    pending
      .then((value) => {
        if (!cancelled) setData(value as T);
      })
      .catch(() => {
        /* caller falls back to English */
      });
    return () => {
      cancelled = true;
    };
  }, [key, enabled]);

  return data;
}

export function hiOr<T>(isHi: boolean, translated: T | undefined | null, fallback: T): T {
  return isHi && translated != null && translated !== '' ? translated : fallback;
}
