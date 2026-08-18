import { fetchJson } from '@/lib/public-url';
import type { CagReport } from '@/data/cag-reports';

export type CagReportListItem = Omit<CagReport, 'stats' | 'keyFindings' | 'recommendations'> & {
  stats?: CagReport['stats'];
  keyFindings?: CagReport['keyFindings'];
  recommendations?: CagReport['recommendations'];
};

export interface CagHiEntry {
  titleHi?: string;
  overviewHi?: string;
  findingsHi?: string[];
  statsLabelsHi?: string[];
  statsValuesHi?: string[];
  statsNotesHi?: (string | null)[];
}

const listCache = new Map<string, Promise<CagReportListItem[]>>();
const reportCache = new Map<string, Promise<CagReport>>();
const hiIndexCache = new Map<string, Promise<Record<string, CagHiEntry>>>();
const hiDetailCache = new Map<string, Promise<CagHiEntry>>();

export function loadCagReportIndex(): Promise<CagReportListItem[]> {
  const key = 'index';
  let pending = listCache.get(key);
  if (!pending) {
    pending = fetchJson<CagReportListItem[]>('data/cag-reports/index.json');
    listCache.set(key, pending);
  }
  return pending;
}

export function loadCagReport(id: string): Promise<CagReport> {
  let pending = reportCache.get(id);
  if (!pending) {
    pending = fetchJson<CagReport>(`data/cag-reports/full/${id}.json`);
    reportCache.set(id, pending);
  }
  return pending;
}

export function loadCagReportsByIds(ids: string[]): Promise<CagReport[]> {
  return Promise.all(ids.map((id) => loadCagReport(id)));
}

export function loadCagHiIndex(): Promise<Record<string, CagHiEntry>> {
  const key = 'hi-index';
  let pending = hiIndexCache.get(key);
  if (!pending) {
    pending = fetchJson<Record<string, CagHiEntry>>('data/cag-reports/hi-index.json');
    hiIndexCache.set(key, pending);
  }
  return pending;
}

export function loadCagHiEntry(id: string): Promise<CagHiEntry> {
  let pending = hiDetailCache.get(id);
  if (!pending) {
    pending = fetchJson<CagHiEntry>(`data/cag-reports/hi/${id}.json`).catch(() => ({}));
    hiDetailCache.set(id, pending);
  }
  return pending;
}
