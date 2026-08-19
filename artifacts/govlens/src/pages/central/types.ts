import type { ElementType } from 'react';

export interface NationalStat {
  label: string;
  value: string;
  note?: string;
  source: string;
  trend?: 'up' | 'down' | 'neutral';
}

export interface ChartPoint { year: number; [key: string]: number }
export interface ChartRemark { years: string; note: string; noteHi?: string }
export interface ChartSeries { key: string; label: string; color: string }

export interface ChartConfig {
  invertAxis?: boolean;
  yDomain?: [number, number];
  data: ChartPoint[];
  series?: ChartSeries[];
  label: string;
  unit: string;
  source: string;
  remarks?: ChartRemark[];
  yearLabel?: string;
}

export interface NationalIndicator {
  key: string;
  label: string;
  score: number;
  iconKey: string;
  summary: string;
  stats: NationalStat[];
  charts?: ChartConfig[];
}

export interface LiveCagAudit {
  id: number;
  schemeName: string;
  schemeSlug: string;
  ministry: string;
  reportYear: number;
  reportNumber: string | null;
  finding: string;
  severity: 'critical' | 'major' | 'minor';
  parameter: string | null;
  claimed: string | null;
  actual: string | null;
  sourceUrl: string | null;
}

export interface AccountabilityRating {
  key: string;
  label: string;
  score: number;
  icon: ElementType;
  methodology: string;
}

export type PromiseStatus = 'implemented' | 'partial' | 'in-progress' | 'not-fulfilled' | 'pending';

export interface ManifestoPromise {
  promise: string;
  promiseHi?: string;
  status: PromiseStatus;
  note: string;
  noteHi?: string;
  cagVerdict?: string;
  cagVerdictHi?: string;
  cagSource?: string;
  cagAmountCrore?: number;
}

export interface ManifestoCategory {
  name: string;
  nameHi?: string;
  promises: ManifestoPromise[];
}

export interface ManifestoYear {
  year: number;
  title: string;
  titleHi?: string;
  tagline: string;
  taglineHi?: string;
  sourceUrl: string;
  categories: ManifestoCategory[];
}
