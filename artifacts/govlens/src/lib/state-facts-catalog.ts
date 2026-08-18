import { fetchJson } from '@/lib/public-url';
import type { StateFact } from '@/data/state-facts-data';

export interface StateFactIndexItem {
  stateCode: string;
  name: string;
  region: string;
}

const indexCache: { value?: Promise<StateFactIndexItem[]> } = {};
const factCache = new Map<string, Promise<StateFact>>();

export function loadStateFactIndex(): Promise<StateFactIndexItem[]> {
  if (!indexCache.value) {
    indexCache.value = fetchJson<StateFactIndexItem[]>('data/state-facts/index.json');
  }
  return indexCache.value;
}

export function loadStateFact(code: string): Promise<StateFact> {
  const key = code.toUpperCase();
  let pending = factCache.get(key);
  if (!pending) {
    pending = fetchJson<StateFact>(`data/state-facts/${key}.json`);
    factCache.set(key, pending);
  }
  return pending;
}
