const contentCache = new Map<string, unknown>();
const contentInflight = new Map<string, Promise<unknown>>();
const staticCache = new Map<string, unknown>();
const staticInflight = new Map<string, Promise<unknown>>();

async function cachedGet<T>(
  cache: Map<string, unknown>,
  inflight: Map<string, Promise<unknown>>,
  key: string,
  load: () => Promise<T>,
): Promise<T> {
  if (cache.has(key)) return cache.get(key) as T;
  let pending = inflight.get(key) as Promise<T> | undefined;
  if (!pending) {
    pending = load()
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
  return pending;
}

export async function fetchContent<T>(key: string): Promise<T> {
  return cachedGet(contentCache, contentInflight, key, async () => {
    const res = await fetch(`/api/content/${encodeURIComponent(key)}`);
    if (!res.ok) throw new Error(`Failed to load content ${key} (${res.status})`);
    return res.json() as Promise<T>;
  });
}

export async function fetchStaticJson<T>(name: string): Promise<T> {
  return cachedGet(staticCache, staticInflight, name, async () => {
    const res = await fetch(`/api/static/json/${encodeURIComponent(name)}`);
    if (!res.ok) throw new Error(`Failed to load json ${name} (${res.status})`);
    return res.json() as Promise<T>;
  });
}

export const HI_JSON_KEYS: Record<string, string> = {
  'scheme-hi': 'scheme-translations-hi',
  'scheme-detail-hi': 'scheme-detail-hi',
  'ministries-hi': 'ministries-hi',
  'person-names-hi': 'person-names-hi',
  'official-titles-hi': 'official-titles-hi',
  'minister-ministries-hi': 'minister-ministries-hi',
  'ministry-names-hi': 'ministry-names-hi',
  'minister-bio-hi': 'minister-bio-hi',
  'pib-units-hi': 'pib-units-hi',
  'national-indicators-hi': 'national-indicators-hi',
  'state-names-hi': 'state-names-hi',
  'state-facts-hi': 'state-facts-hi',
  'state-facts-hi-extra': 'state-facts-hi-extra',
  'stat-labels-hi': 'stat-labels-hi',
};
