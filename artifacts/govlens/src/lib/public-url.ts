/** Resolve a path under Vite `base` (works with `/` and a subpath). */
export function publicUrl(path: string): string {
  const base = import.meta.env.BASE_URL ?? '/';
  const prefix = base.endsWith('/') ? base : `${base}/`;
  return `${prefix}${path.replace(/^\//, '')}`;
}

export async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(publicUrl(path));
  if (!res.ok) throw new Error(`Failed to load ${path} (${res.status})`);
  return res.json() as Promise<T>;
}
