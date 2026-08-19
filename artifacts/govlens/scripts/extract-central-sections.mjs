#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const PAGE = join(__dir, '../src/pages/central-data.tsx');
const OUT = join(__dir, '../src/pages/central');

const src = readFileSync(PAGE, 'utf8');
if (!src.includes('const MANIFESTO_2014')) {
  console.log('central-data.tsx already split — skipping');
  process.exit(0);
}

const lines = src.replace(/\r\n/g, '\n').split('\n');
function slice(from, to) {
  return lines.slice(from - 1, to).join('\n');
}

mkdirSync(OUT, { recursive: true });

const indicatorsBody = slice(173, 1140).replace(
  'const NATIONAL_INDICATORS: NationalIndicator[] = [',
  'export const NATIONAL_INDICATORS: NationalIndicator[] = [',
);
writeFileSync(
  join(OUT, 'national-indicators-data.ts'),
  [
    "import {",
    "  TrendingUp, GraduationCap, Briefcase, HeartPulse, ShieldCheck, Leaf,",
    "} from 'lucide-react';",
    "import {",
    "  ECONOMY_SCORE,",
    "  EDUCATION_SCORE,",
    "  EMPLOYMENT_SCORE,",
    "  HEALTH_SCORE,",
    "  SAFETY_SCORE,",
    "  ENVIRONMENT_SCORE,",
    "} from '@/lib/scoring';",
    "import type { NationalIndicator } from './types';",
    "",
    indicatorsBody,
    "",
  ].join('\n'),
);

const manifestoBody = slice(2230, 3818);
writeFileSync(
  join(OUT, 'manifesto-data.ts'),
  [
    "import type { ManifestoYear } from './types';",
    "",
    manifestoBody,
    "",
    "export const ALL_MANIFESTOS: ManifestoYear[] = [MANIFESTO_2014, MANIFESTO_2019, MANIFESTO_2024];",
    "",
  ].join('\n'),
);

writeFileSync(join(OUT, 'cabinet-body.tsx.txt'), slice(1301, 1640));
writeFileSync(join(OUT, 'indicators-body.tsx.txt'), slice(1644, 1849));
writeFileSync(join(OUT, 'schemes-body.tsx.txt'), slice(1853, 1981));
writeFileSync(join(OUT, 'cag-body.tsx.txt'), slice(1985, 2197));
writeFileSync(join(OUT, 'manifesto-body.tsx.txt'), slice(3822, 4244));

console.log('extracted data + body snippets');
