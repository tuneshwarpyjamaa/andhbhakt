import type { SchemeSummary } from '@workspace/api-client-react';
import { asArray } from '@/lib/utils';

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

export const STATIC_SCHEMES: SchemeSummary[] = [];
export const STATIC_CATEGORIES: StaticCategory[] = [];
export const STATIC_CAG_2025: StaticCagAudit[] = [];
export const STATIC_MINISTRIES = Array.from(new Set(STATIC_SCHEMES.map((s) => s.ministry))).sort();

export function catalogOrLive<T>(live: T[] | unknown, fallback: T[]): T[] {
  const list = asArray<T>(live);
  return list.length > 0 ? list : fallback;
}
