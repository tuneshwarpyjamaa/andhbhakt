/**
 * Process-local TTL cache for content_documents payloads.
 * Civic docs change rarely; this cuts repeat Postgres hits on the origin.
 */
const TTL_MS = 5 * 60 * 1000;

type Entry = { expires: number; payload: unknown };

const mem = new Map<string, Entry>();

export function getCachedDocument(key: string): unknown | undefined {
  const entry = mem.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expires) {
    mem.delete(key);
    return undefined;
  }
  return entry.payload;
}

export function setCachedDocument(key: string, payload: unknown): void {
  mem.set(key, { expires: Date.now() + TTL_MS, payload });
}

export function invalidateCachedDocument(key?: string): void {
  if (key) mem.delete(key);
  else mem.clear();
}
