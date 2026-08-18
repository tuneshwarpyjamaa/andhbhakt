export type VerdictKey = 'on_track' | 'off_track' | 'critical' | 'unaudited';
export type SeverityKey = 'critical' | 'major' | 'minor' | 'unaudited';
export type ClaimTypeKey = 'achievement' | 'update' | 'launch' | 'target';
export type ScoreBand = 'good' | 'off' | 'risk';

export function asVerdict(value: string | null | undefined): VerdictKey {
  if (value === 'on_track' || value === 'off_track' || value === 'critical' || value === 'unaudited') {
    return value;
  }
  return 'unaudited';
}

export function asSeverity(value: string | null | undefined): SeverityKey {
  if (value === 'critical' || value === 'major' || value === 'minor') return value;
  return 'unaudited';
}

export function asClaimType(value: string | null | undefined): ClaimTypeKey {
  if (value === 'achievement' || value === 'update' || value === 'launch' || value === 'target') {
    return value;
  }
  return 'update';
}

export function scoreBand(score: number): ScoreBand {
  if (score >= 75) return 'good';
  if (score >= 40) return 'off';
  return 'risk';
}

export function bandFromVerdict(verdict: VerdictKey, score: number): ScoreBand {
  if (verdict === 'on_track') return 'good';
  if (verdict === 'off_track') return 'off';
  if (verdict === 'critical') return 'risk';
  return scoreBand(score);
}

export function formatDisplayDate(value: string | number, language: string): string {
  const locale = language.startsWith('hi') ? 'hi-IN' : 'en-IN';
  const date = typeof value === 'number' ? new Date(value, 0, 1) : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  if (typeof value === 'number') {
    return date.toLocaleDateString(locale, { year: 'numeric' });
  }
  return date.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function eventYear(value: string | number): number {
  if (typeof value === 'number') return value;
  const year = new Date(value).getFullYear();
  return Number.isNaN(year) ? 0 : year;
}

export function withUnit(value: string | null | undefined, unit?: string | null): string | null {
  if (!value) return null;
  if (!unit) return value;
  const hay = value.toLowerCase();
  const needle = unit.toLowerCase();
  if (hay.includes(needle)) return value;
  if (needle === 'percent' && (hay.includes('per cent') || hay.includes('%'))) return value;
  return `${value} ${unit}`;
}
