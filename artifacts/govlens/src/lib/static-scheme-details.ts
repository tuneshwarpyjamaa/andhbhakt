import type { CAGAudit, PIBEntry, Scheme, SchemeVerdict } from '@workspace/api-client-react';
import schemeDetailsStatic from '@/data/scheme-details-static.json';

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
