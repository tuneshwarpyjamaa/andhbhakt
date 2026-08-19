// ─── Types ────────────────────────────────────────────────────────────────────
// State fact payloads live in Postgres (content_documents / content_files).

export interface Official {
  name: string;
  title: string;
  party?: string;
  since?: string;
  photoUrl?: string;
  criminalCases?: number;
  criminalCaseNote?: string;
  education?: string;
  educationScore?: number;
  seriousCriminalCases?: number;
  affidavitYear?: number;
}

export interface OfficialGroup {
  group: string;
  officials: Official[];
}

export interface IndicatorStat {
  label: string;
  value: string;
  note?: string;
  noteHi?: string;
  source: string;
}

export interface Indicator {
  key: string;
  label: string;
  score: number;
  icon: string;
  headline: string;
  headlineHi?: string;
  stats: IndicatorStat[];
}

export interface CagFinding {
  scheme: string;
  schemeSlug: string;
  reportRef: string;
  reportYear: number;
  severity: 'critical' | 'major' | 'minor';
  parameter: string;
  finding: string;
  findingHi?: string;
  actual?: string;
  reportExcerpt?: string;
  reportExcerptHi?: string;
  sourceUrl: string;
}

export interface AccountabilityRating {
  key: string;
  label: string;
  score: number;
  icon: string;
  methodology: string;
}

export interface NewGovtCabinetMember {
  name: string;
  party: string;
  portfolio: string;
  criminalCases?: number;
  seriousCriminalCases?: number;
  education?: string;
  educationScore?: number;
}

export interface NewGovtDetails {
  cm: {
    name: string;
    party: string;
    since: string;
    note?: string;
    criminalCases: number;
    criminalCaseNote?: string;
    seriousCriminalCases?: number;
    education: string;
    educationScore: number;
  };
  cabinet: NewGovtCabinetMember[];
}

export type StatePromiseStatus = 'implemented' | 'partial' | 'in-progress' | 'not-fulfilled' | 'pending';

export interface StateManifestoPromise {
  promise: string;
  promiseHi: string;
  status: StatePromiseStatus;
  note: string;
  noteHi: string;
  cagVerdict?: string;
  cagVerdictHi?: string;
  cagSource?: string;
  cagAmountCrore?: number;
}
export interface StateManifestoCategory {
  name: string;
  nameHi: string;
  promises: StateManifestoPromise[];
}
export interface StateManifesto {
  year: number;
  party: string;
  partyHi: string;
  title: string;
  titleHi: string;
  tagline: string;
  taglineHi: string;
  sourceUrl: string;
  categories: StateManifestoCategory[];
}

export interface StateFact {
  stateCode: string;
  name: string;
  capital: string;
  region: string;
  cm: Official;
  officialGroups: OfficialGroup[];
  cagFindings: CagFinding[];
  accountabilityRatings: AccountabilityRating[];
  indicators: Indicator[];
  newGovtYear?: number;
  newGovtLabel?: string;
  newGovtDetails?: NewGovtDetails;
  manifestos?: StateManifesto[];
}
