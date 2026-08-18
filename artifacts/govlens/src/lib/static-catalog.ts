import type { CAGAudit, PIBEntry, Scheme, SchemeSummary, SchemeVerdict } from '@workspace/api-client-react';
import { asArray } from '@/lib/utils';
import schemesStatic from '@/data/schemes-static.json';
import categoriesStatic from '@/data/categories-static.json';
import cag2025Static from '@/data/cag-audits-2025-static.json';
import schemeDetailsStatic from '@/data/scheme-details-static.json';

export interface StaticCategory {
  id: number;
  name: string;
  slug: string;
  icon?: string;
}

export interface StaticCagAudit {
  id: number;
  schemeName: string;
  schemeSlug: string;
  ministry: string;
  reportYear: number;
  reportNumber: string | null;
  finding: string;
  severity: 'critical' | 'major' | 'minor' | string;
  parameter: string | null;
  claimed: string | null;
  actual: string | null;
  sourceUrl: string | null;
}

export const STATIC_SCHEMES = schemesStatic as SchemeSummary[];
export const STATIC_CATEGORIES = categoriesStatic as StaticCategory[];
export const STATIC_CAG_2025 = cag2025Static as StaticCagAudit[];
export const STATIC_MINISTRIES = Array.from(new Set(STATIC_SCHEMES.map((s) => s.ministry))).sort();

export function catalogOrLive<T>(live: T[] | unknown, fallback: T[]): T[] {
  const list = asArray<T>(live);
  return list.length > 0 ? list : fallback;
}

export interface StaticSchemeDetail {
  scheme: Scheme;
  pib: PIBEntry[];
  cag: CAGAudit[];
  verdict: SchemeVerdict;
}

const DETAILS = schemeDetailsStatic as Record<string, StaticSchemeDetail>;

export function getStaticSchemeDetail(slug: string): StaticSchemeDetail | undefined {
  return DETAILS[slug];
}
