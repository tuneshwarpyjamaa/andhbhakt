// Types only. Cabinet payloads live in content_documents
// (ministers-index, minister:{slug}, minister-hi:{slug}).

export interface MinisterProfile {
  name: string;
  title: 'Prime Minister' | 'Cabinet Minister' | 'MoS (Independent Charge)' | 'Minister of State';
  ministry: string;
  party: string;
  since: string;
  education: string;
  educationHi?: string;
  educationScore: number;
  criminalCases: number;
  seriousCriminalCases?: number;
  criminalCaseNote?: string;
  criminalCaseNoteHi?: string;
  affidavitYear?: number;
  wikiTitle?: string;
  assetGrowthPct?: number | null;
  assetGrowthNote?: string;
  assetGrowthNoteHi?: string;
  slug: string;
  controversies?: string[];
  controversiesHi?: string[];
  caseLinks?: { label: string; url: string }[];
  declaredAssetsCr?: number;
  declaredAssetsPrevCr?: number;
  declaredAssetsYear?: number;
  declaredAssetsPrevYear?: number;
  officialResidence?: string;
  govtExpenditure?: {
    label: string;
    labelHi?: string;
    value: string;
    period: string;
    periodHi?: string;
    source: string;
    sourceUrl?: string;
  }[];
  cagReportIds?: string[];
}

export function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/["'()]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
