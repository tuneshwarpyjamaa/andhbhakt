import type { SchemeSummary } from '@workspace/api-client-react';
import { loadStateFactIndex } from '@/lib/state-facts-catalog';
import { fetchStaticJson } from '@/lib/content-api';

export type SearchKind = 'scheme' | 'state' | 'minister' | 'page' | 'reports';

export interface SearchRecord {
  id: string;
  kind: Exclude<SearchKind, 'reports'>;
  href: string;
  title: string;
  titleHi?: string;
  subtitle: string;
  subtitleHi?: string;
  haystack: string;
}

export interface SearchHit {
  id: string;
  kind: SearchKind;
  href: string;
  title: string;
  subtitle: string;
  score: number;
}

export interface PageSearchItem {
  id: string;
  href: string;
  title: string;
  subtitle: string;
  aliases: string;
}

const MAX_PER_KIND = 3;
const MAX_RESULTS = 8;

let cached: Promise<SearchRecord[]> | null = null;

function norm(value: string): string {
  return value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
}

function compact(...parts: Array<string | undefined | null>): string {
  return parts.filter(Boolean).join(' ');
}

async function buildIndex(): Promise<SearchRecord[]> {
  const [
    { ALL_MINISTERS },
    states,
    STATIC_SCHEMES,
    schemeHi,
    namesHi,
    stateHi,
    ministryHi,
  ] = await Promise.all([
    import('@/data/ministers'),
    loadStateFactIndex(),
    fetchStaticJson<SchemeSummary[]>('schemes-static').catch((): SchemeSummary[] => []),
    fetchStaticJson<Record<string, { nameHi?: string; descriptionHi?: string }>>('scheme-translations-hi').catch((): Record<string, { nameHi?: string; descriptionHi?: string }> => ({})),
    fetchStaticJson<Record<string, string>>('person-names-hi').catch((): Record<string, string> => ({})),
    fetchStaticJson<Record<string, string>>('state-names-hi').catch((): Record<string, string> => ({})),
    fetchStaticJson<Record<string, string>>('ministries-hi').catch((): Record<string, string> => ({})),
  ]);

  const schemes: SearchRecord[] = STATIC_SCHEMES.map((scheme) => {
    const hi = schemeHi[scheme.slug];
    return {
      id: `scheme:${scheme.slug}`,
      kind: 'scheme',
      href: `/schemes/${scheme.slug}`,
      title: scheme.name,
      titleHi: hi?.nameHi,
      subtitle: scheme.ministry,
      subtitleHi: ministryHi[scheme.ministry],
      haystack: norm(compact(
        scheme.name,
        scheme.slug.replace(/-/g, ' '),
        scheme.ministry,
        scheme.categoryName,
        scheme.renamedFrom,
        scheme.description,
        hi?.nameHi,
        hi?.descriptionHi,
        ministryHi[scheme.ministry],
      )),
    };
  });

  const stateRecords: SearchRecord[] = states.map((state) => ({
    id: `state:${state.stateCode}`,
    kind: 'state',
    href: `/state-facts?state=${state.stateCode}`,
    title: state.name,
    titleHi: stateHi[state.name],
    subtitle: state.region,
    haystack: norm(compact(
      state.name,
      state.stateCode,
      state.region,
      stateHi[state.name],
    )),
  }));

  const ministers: SearchRecord[] = ALL_MINISTERS.map((minister) => {
    const nameHi = namesHi[minister.name];
    return {
      id: `minister:${minister.slug}`,
      kind: 'minister',
      href: `/minister/${minister.slug}`,
      title: minister.name,
      titleHi: nameHi,
      subtitle: compact(minister.title, minister.ministry),
      haystack: norm(compact(
        minister.name,
        minister.slug.replace(/-/g, ' '),
        minister.title,
        minister.ministry,
        minister.party,
        nameHi,
      )),
    };
  });

  return [...schemes, ...stateRecords, ...ministers];
}

export function loadSearchIndex(): Promise<SearchRecord[]> {
  if (!cached) cached = buildIndex();
  return cached;
}

function scoreRecord(record: SearchRecord, query: string, tokens: string[], isHi: boolean): number {
  const title = norm(isHi && record.titleHi ? record.titleHi : record.title);
  const subtitle = norm(isHi && record.subtitleHi ? record.subtitleHi : record.subtitle);
  const haystack = record.haystack;

  if (!tokens.every((token) => haystack.includes(token) || title.includes(token) || subtitle.includes(token))) {
    return 0;
  }

  let score = 30;
  if (title === query) score = 100;
  else if (title.startsWith(query)) score = 88;
  else if (title.split(/[\s,·/()-]+/).some((word) => word.startsWith(query))) score = 76;
  else if (title.includes(query)) score = 64;
  else if (subtitle.includes(query) || subtitle.startsWith(query)) score = 50;
  else score = 36;

  if (record.kind === 'page') score -= 8;
  if (title.length > 0 && title.length < 18) score += 2;
  return score;
}

export function searchSite(
  records: SearchRecord[],
  rawQuery: string,
  pages: PageSearchItem[],
  isHi: boolean,
  reportsLabel: string,
): SearchHit[] {
  const query = norm(rawQuery.trim());
  if (!query) return [];

  const tokens = query.split(/\s+/).filter(Boolean);
  const pageRecords: SearchRecord[] = pages.map((page) => ({
    id: page.id,
    kind: 'page',
    href: page.href,
    title: page.title,
    subtitle: page.subtitle,
    haystack: norm(compact(page.title, page.subtitle, page.aliases)),
  }));

  const hits: SearchHit[] = [];
  const counts: Partial<Record<SearchKind, number>> = {};

  const ranked = [...records, ...pageRecords]
    .map((record) => ({
      record,
      score: scoreRecord(record, query, tokens, isHi),
    }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.record.title.localeCompare(b.record.title));

  for (const { record, score } of ranked) {
    const used = counts[record.kind] ?? 0;
    if (used >= MAX_PER_KIND || hits.length >= MAX_RESULTS) continue;
    counts[record.kind] = used + 1;
    hits.push({
      id: record.id,
      kind: record.kind,
      href: record.href,
      title: isHi && record.titleHi ? record.titleHi : record.title,
      subtitle: isHi && record.subtitleHi ? record.subtitleHi : record.subtitle,
      score,
    });
  }

  if (query.length >= 2) {
    hits.push({
      id: `reports:${query}`,
      kind: 'reports',
      href: `/reports?q=${encodeURIComponent(rawQuery.trim())}`,
      title: reportsLabel,
      subtitle: '',
      score: 10,
    });
  }

  return hits;
}
