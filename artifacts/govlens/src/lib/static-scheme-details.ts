import type { CAGAudit, PIBEntry, Scheme, SchemeVerdict } from '@workspace/api-client-react';

export interface StaticSchemeDetail {
  scheme: Scheme;
  pib: PIBEntry[];
  cag: CAGAudit[];
  verdict: SchemeVerdict;
}

const DETAILS: Record<string, StaticSchemeDetail> = {};

export function getStaticSchemeDetail(slug: string): StaticSchemeDetail | undefined {
  return DETAILS[slug];
}
