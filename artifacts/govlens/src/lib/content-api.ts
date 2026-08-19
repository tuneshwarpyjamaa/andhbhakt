export async function fetchContent<T>(key: string): Promise<T> {
  const res = await fetch(`/api/content/${encodeURIComponent(key)}`);
  if (!res.ok) throw new Error(`Failed to load content ${key} (${res.status})`);
  return res.json() as Promise<T>;
}

export async function fetchStaticJson<T>(name: string): Promise<T> {
  const res = await fetch(`/api/static/json/${encodeURIComponent(name)}`);
  if (!res.ok) throw new Error(`Failed to load json ${name} (${res.status})`);
  return res.json() as Promise<T>;
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
