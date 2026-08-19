#!/usr/bin/env node
import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const dir = join(__dir, '../src/pages/central');

function read(n) {
  return readFileSync(join(dir, n), 'utf8');
}
function write(n, s) {
  writeFileSync(join(dir, n), s);
  console.log('wrote', n, s.length);
}

let cab = read('cabinet-body.tsx.txt');
cab = cab.replace('function PMCabinetSection', 'export default function PMCabinetSection');
cab = cab.replace(
  "  const isHi = i18n.language === 'hi';",
  `  const isHi = i18n.language === 'hi';
  const namesHi = useHiJson<Record<string, string>>('person-names-hi', () => import('@/data/person-names-hi.json'), isHi) ?? {};
  const officialTitlesHi = useHiJson<Record<string, string>>('official-titles-hi', () => import('@/data/official-titles-hi.json'), isHi) ?? {};
  const ministerMinistriesHi = useHiJson<Record<string, string>>('minister-ministries-hi', () => import('@/data/minister-ministries-hi.json'), isHi) ?? {};`,
);
write('cabinet-section.tsx', `import { useState } from 'react';
import { Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp, Info, X } from 'lucide-react';
import { PM_PROFILE, CABINET_PROFILES } from '@/data/ministers';
import { computeIntegrityScore, assetGrowthPenalty } from '@/lib/scoring';
import { useHiJson } from '@/lib/use-hi-json';
import { MemberAvatar, ScoreBar, hiDate } from './shared';

const PM = PM_PROFILE;
const CABINET = CABINET_PROFILES;

const CABINET_SUMMARY = {
  total: 71, withCriminalCases: 28, withSeriousCases: 19,
  percentCriminal: 39, percentSerious: 27,
  source: 'ADR / National Election Watch — Analysis of 71 of 72 Union Council of Ministers, 11 June 2024',
};

${cab}
`);

let ind = read('indicators-body.tsx.txt');
ind = ind.replace('function IndicatorsSection', 'export default function IndicatorsSection');
ind = ind.replace(
  "const isHi = i18n.language === 'hi';\n  const [activeKey",
  "const isHi = i18n.language === 'hi';\n  const niHi = useHiJson<NiHi>('national-indicators-hi', () => import('@/data/national-indicators-hi.json'), isHi) ?? {};\n  const [activeKey",
);
write('indicators-section.tsx', `import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ReferenceLine, CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { useHiJson } from '@/lib/use-hi-json';
import { scoreColor } from './shared';
import { NATIONAL_INDICATORS } from './national-indicators-data';
import type { ChartConfig } from './types';

interface NiHiStat { labelHi?: string; noteHi?: string; }
interface NiHi { labels?: Record<string,string>; summaries?: Record<string,string>; stats?: Record<string,NiHiStat[]>; }

${ind}
`);

let sch = read('schemes-body.tsx.txt');
sch = sch.replace('function SchemesSection', 'export default function SchemesSection');
sch = sch
  .replace(
    `<Select value={catFilter} onValueChange={setCatFilter}>
              <SelectTrigger className="h-8 text-xs w-full sm:w-44">
                <SelectValue placeholder={t('allCategories')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allCategories')}</SelectItem>
                {categories.map(c => (
                  <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>`,
    `<NativeSelect value={catFilter} onValueChange={setCatFilter} className="h-8 text-xs w-full sm:w-44">
              <option value="all">{t('allCategories')}</option>
              {categories.map(c => (
                <option key={c.id} value={String(c.id)}>{c.name}</option>
              ))}
            </NativeSelect>`,
  )
  .replace(
    `<Select value={sevFilter} onValueChange={setSevFilter}>
              <SelectTrigger className="h-8 text-xs w-full sm:w-36">
                <SelectValue placeholder={t('allSeverities')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allSeverities')}</SelectItem>
                <SelectItem value="critical">{t('critical')}</SelectItem>
                <SelectItem value="major">{t('major')}</SelectItem>
                <SelectItem value="minor">{t('minor')}</SelectItem>
                <SelectItem value="null">{t('unaudited')}</SelectItem>
              </SelectContent>
            </Select>`,
    `<NativeSelect value={sevFilter} onValueChange={setSevFilter} className="h-8 text-xs w-full sm:w-36">
              <option value="all">{t('allSeverities')}</option>
              <option value="critical">{t('critical')}</option>
              <option value="major">{t('major')}</option>
              <option value="minor">{t('minor')}</option>
              <option value="null">{t('unaudited')}</option>
            </NativeSelect>`,
  );
write('schemes-section.tsx', `import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, ListFilter, ChevronDown, ChevronUp } from 'lucide-react';
import { useListSchemes, useListCategories } from '@workspace/api-client-react';
import { catalogOrLive, STATIC_SCHEMES, STATIC_CATEGORIES } from '@/lib/static-catalog';
import { SchemeCard } from '@/components/scheme-card';
import { PaginationBar, usePagination } from '@/components/pagination-bar';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/native-select';

${sch}
`);

let cag = read('cag-body.tsx.txt');
cag = cag.replace('function CagSection', 'export default function CagSection');
cag = cag.replace(
  "const { t, i18n } = useTranslation();",
  `const { t, i18n } = useTranslation();
  const isHiLang = i18n.language === 'hi';
  const schemeDetailHi = useHiJson<{ cagMap?: Record<string, { findingHi?: string; claimedHi?: string; actualHi?: string }> }>('scheme-detail-hi', () => import('@/data/scheme-detail-hi.json'), isHiLang);
  const cagAuditHi = schemeDetailHi?.cagMap ?? {};
  const schemeHi = useHiJson<Record<string, { nameHi?: string }>>('scheme-hi', () => import('@/data/scheme-translations-hi.json'), isHiLang) ?? {};
  const ministriesHi = useHiJson<Record<string, string>>('ministries-hi', () => import('@/data/ministries-hi.json'), isHiLang) ?? {};`,
);
cag = cag.replace(
  `<Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="h-8 text-xs w-full sm:w-36">
                <SelectValue placeholder={t('allSeverities')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allSeverities')}</SelectItem>
                <SelectItem value="critical">{t('critical')}</SelectItem>
                <SelectItem value="major">{t('major')}</SelectItem>
                <SelectItem value="minor">{t('minor')}</SelectItem>
              </SelectContent>
            </Select>`,
  `<NativeSelect value={severityFilter} onValueChange={setSeverityFilter} className="h-8 text-xs w-full sm:w-36">
              <option value="all">{t('allSeverities')}</option>
              <option value="critical">{t('critical')}</option>
              <option value="major">{t('major')}</option>
              <option value="minor">{t('minor')}</option>
            </NativeSelect>`,
);
write('cag-section.tsx', `import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { FileSearch, ExternalLink, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { catalogOrLive, STATIC_CAG_2025 } from '@/lib/static-catalog';
import { PaginationBar, usePagination } from '@/components/pagination-bar';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/native-select';
import { useHiJson } from '@/lib/use-hi-json';
import { SEVERITY_META } from './shared';
import type { LiveCagAudit } from './types';

${cag}
`);

let man = read('manifesto-body.tsx.txt');
man = man.replace('function ManifestoSection', 'export default function ManifestoSection');
write('manifesto-section.tsx', `import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { ALL_MANIFESTOS } from './manifesto-data';
import type { PromiseStatus } from './types';

${man}
`);

for (const tmp of [
  'cabinet-body.tsx.txt',
  'indicators-body.tsx.txt',
  'schemes-body.tsx.txt',
  'cag-body.tsx.txt',
  'manifesto-body.tsx.txt',
]) {
  const p = join(dir, tmp);
  if (existsSync(p)) unlinkSync(p);
}
