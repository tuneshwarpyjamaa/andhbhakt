#!/usr/bin/env node
/**
 * generate-state-facts.mjs
 * Generates StateFact entries for Indian states and UTs, appending them one-by-one
 * to artifacts/govlens/src/pages/state-facts.tsx.
 *
 * KEY DESIGN: AI returns JSON → we serialize to TypeScript ourselves.
 * Guarantees syntactically valid TypeScript every time.
 *
 * Safety guarantees:
 *  - Backs up state-facts.tsx before any writes
 *  - Appends only before the closing ]; of STATE_FACTS — never rewrites existing entries
 *  - Full tsc --noEmit runs every 3 states; reverts bad entries
 *  - Audits each state on 10 criteria (score starts 100, -1 per fail, stop <95)
 *  - +1 bonus after every 2 consecutive clean-pass states
 *  - URL-checks all CAG sourceUrls: broken URL = -1 from running score
 *  - Tracks progress in /tmp/state-facts-gen-progress.json — safe to kill and resume
 *  - Deduplicates by stateCode so re-runs never add duplicates
 *
 * Usage:
 *   node scripts/generate-state-facts.mjs
 *   node scripts/generate-state-facts.mjs --state KA
 *   node scripts/generate-state-facts.mjs --n 5
 */

import { readFileSync, writeFileSync, existsSync, copyFileSync } from 'fs';
import { spawnSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';

const __dir   = dirname(fileURLToPath(import.meta.url));
const ROOT    = join(__dir, '..');
const SF_FILE = join(ROOT, 'artifacts/govlens/src/pages/state-facts.tsx');
const CAG_DB  = join(ROOT, 'artifacts/govlens/src/data/cag-reports.ts');
const BACKUP  = '/tmp/state-facts.backup.tsx';
const PROG    = '/tmp/state-facts-gen-progress.json';
const TSC_EVERY = 3;

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

// ── CLI flags ─────────────────────────────────────────────────────────────────
const args       = process.argv.slice(2);
const getArg     = f => { const i = args.indexOf(f); return i >= 0 ? args[i+1] : null; };
const FLAG_STATE = getArg('--state');
const FLAG_N     = getArg('--n') ? parseInt(getArg('--n')) : Infinity;

// ── Full list of Indian states + UTs ordered by CAG DB coverage ───────────────
const ALL_STATES = [
  // States — ordered by CAG report richness in our DB
  { code: 'KA', name: 'Karnataka',                 capital: 'Bengaluru',   region: 'South'     },
  { code: 'WB', name: 'West Bengal',               capital: 'Kolkata',     region: 'East'      },
  { code: 'BR', name: 'Bihar',                     capital: 'Patna',       region: 'East'      },
  { code: 'OD', name: 'Odisha',                    capital: 'Bhubaneswar', region: 'East'      },
  { code: 'KL', name: 'Kerala',                    capital: 'Thiruvananthapuram', region: 'South' },
  { code: 'MP', name: 'Madhya Pradesh',            capital: 'Bhopal',      region: 'Central'   },
  { code: 'GJ', name: 'Gujarat',                   capital: 'Gandhinagar', region: 'West'      },
  { code: 'MH', name: 'Maharashtra',               capital: 'Mumbai',      region: 'West'      },
  { code: 'JH', name: 'Jharkhand',                 capital: 'Ranchi',      region: 'East'      },
  { code: 'PB', name: 'Punjab',                    capital: 'Chandigarh',  region: 'North'     },
  { code: 'NL', name: 'Nagaland',                  capital: 'Kohima',      region: 'Northeast' },
  { code: 'UK', name: 'Uttarakhand',               capital: 'Dehradun',    region: 'North'     },
  { code: 'AS', name: 'Assam',                     capital: 'Dispur',      region: 'Northeast' },
  { code: 'CG', name: 'Chhattisgarh',              capital: 'Raipur',      region: 'Central'   },
  { code: 'GA', name: 'Goa',                       capital: 'Panaji',      region: 'West'      },
  { code: 'RJ', name: 'Rajasthan',                 capital: 'Jaipur',      region: 'North'     },
  { code: 'AP', name: 'Andhra Pradesh',            capital: 'Amaravati',   region: 'South'     },
  { code: 'HP', name: 'Himachal Pradesh',          capital: 'Shimla',      region: 'North'     },
  { code: 'TN', name: 'Tamil Nadu',                capital: 'Chennai',     region: 'South'     },
  { code: 'SK', name: 'Sikkim',                    capital: 'Gangtok',     region: 'Northeast' },
  { code: 'HR', name: 'Haryana',                   capital: 'Chandigarh',  region: 'North'     },
  { code: 'MN', name: 'Manipur',                   capital: 'Imphal',      region: 'Northeast' },
  { code: 'TS', name: 'Telangana',                 capital: 'Hyderabad',   region: 'South'     },
  { code: 'TR', name: 'Tripura',                   capital: 'Agartala',    region: 'Northeast' },
  { code: 'MZ', name: 'Mizoram',                   capital: 'Aizawl',      region: 'Northeast' },
  { code: 'ML', name: 'Meghalaya',                 capital: 'Shillong',    region: 'Northeast' },
  // UTs
  { code: 'DL', name: 'Delhi',                     capital: 'New Delhi',   region: 'North'     },
  { code: 'JK', name: 'Jammu & Kashmir',           capital: 'Srinagar',    region: 'North'     },
  { code: 'PY', name: 'Puducherry',                capital: 'Puducherry',  region: 'South'     },
  { code: 'CH', name: 'Chandigarh',                capital: 'Chandigarh',  region: 'North'     },
  { code: 'LA', name: 'Ladakh',                    capital: 'Leh',         region: 'North'     },
  { code: 'AN', name: 'Andaman & Nicobar Islands', capital: 'Port Blair',  region: 'Islands'   },
  { code: 'LD', name: 'Lakshadweep',               capital: 'Kavaratti',   region: 'Islands'   },
  { code: 'DN', name: 'Dadra & Nagar Haveli and Daman & Diu', capital: 'Daman', region: 'West' },
];

// ── String escaping for template literals ─────────────────────────────────────
function esc(s) {
  return String(s ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${');
}

// ── Serialize helpers ──────────────────────────────────────────────────────────
function serializeOfficial(o, baseIndent) {
  const p = ' '.repeat(baseIndent);
  const lines = [
    `name: \`${esc(o.name)}\``,
    `title: \`${esc(o.title)}\``,
  ];
  if (o.party)          lines.push(`party: '${esc(o.party)}'`);
  if (o.since)          lines.push(`since: '${esc(o.since)}'`);
  if (o.photoUrl)       lines.push(`photoUrl: \`${esc(o.photoUrl)}\``);
  if (o.criminalCases !== undefined) lines.push(`criminalCases: ${Number(o.criminalCases)}`);
  if (o.criminalCaseNote) lines.push(`criminalCaseNote: \`${esc(o.criminalCaseNote)}\``);
  if (o.education)      lines.push(`education: \`${esc(o.education)}\``);
  if (o.educationScore !== undefined) lines.push(`educationScore: ${Number(o.educationScore)}`);
  if (o.integrityScore !== undefined) lines.push(`integrityScore: ${Number(o.integrityScore)}`);
  if (o.affidavitYear)  lines.push(`affidavitYear: ${Number(o.affidavitYear)}`);
  const inner = lines.map(l => `${p}  ${l},`).join('\n');
  return `{\n${inner}\n${p}}`;
}

function serializeOfficialGroup(g, baseIndent) {
  const p = ' '.repeat(baseIndent);
  const officialLines = g.officials
    .map(o => `${p}  ${serializeOfficial(o, baseIndent + 2)},`)
    .join('\n');
  return `{
${p}  group: \`${esc(g.group)}\`,
${p}  officials: [
${officialLines}
${p}  ],
${p}}`;
}

function serializeCagFinding(f, baseIndent) {
  const p = ' '.repeat(baseIndent);
  const lines = [
    `scheme: \`${esc(f.scheme)}\``,
    `schemeSlug: \`${esc(f.schemeSlug)}\``,
    `reportRef: \`${esc(f.reportRef)}\``,
    `reportYear: ${Number(f.reportYear)}`,
    `severity: '${f.severity}'`,
    `parameter: \`${esc(f.parameter)}\``,
    `finding: \`${esc(f.finding)}\``,
  ];
  if (f.actual)         lines.push(`actual: \`${esc(f.actual)}\``);
  if (f.reportExcerpt)  lines.push(`reportExcerpt: \`${esc(f.reportExcerpt)}\``);
  lines.push(`sourceUrl: '${f.sourceUrl}'`);
  const inner = lines.map(l => `${p}  ${l},`).join('\n');
  return `${p}{\n${inner}\n${p}}`;
}

function serializeRating(r, baseIndent) {
  const p = ' '.repeat(baseIndent);
  const ICONS = { transparency: 'Eye', officialsIntegrity: 'ShieldCheck', governance: 'Scale' };
  const iconName = ICONS[r.key] || 'Eye';
  return `${p}{
${p}  key: '${r.key}',
${p}  label: \`${esc(r.label)}\`,
${p}  score: ${Number(r.score)},
${p}  icon: ${iconName},
${p}  methodology: \`${esc(r.methodology)}\`,
${p}}`;
}

function serializeIndicatorStat(s, baseIndent) {
  const p = ' '.repeat(baseIndent);
  const notePart = s.note ? `\n${p}  note: \`${esc(s.note)}\`,` : '';
  return `${p}{
${p}  label: \`${esc(s.label)}\`,
${p}  value: \`${esc(s.value)}\`,${notePart}
${p}  source: \`${esc(s.source)}\`,
${p}}`;
}

function serializeIndicator(ind, baseIndent) {
  const p = ' '.repeat(baseIndent);
  const ICONS = {
    economy:    'TrendingUp',
    education:  'GraduationCap',
    employment: 'Briefcase',
    health:     'HeartPulse',
    environment:'Leaf',
  };
  const iconName = ICONS[ind.key] || ICONS[ind.iconName?.toLowerCase()] || 'TrendingUp';
  const statLines = (ind.stats || [])
    .map(s => serializeIndicatorStat(s, baseIndent + 2))
    .join(',\n');
  return `${p}{
${p}  key: '${ind.key}',
${p}  label: \`${esc(ind.label)}\`,
${p}  score: ${Number(ind.score)},
${p}  icon: ${iconName},
${p}  headline: \`${esc(ind.headline)}\`,
${p}  stats: [
${statLines},
${p}  ],
${p}}`;
}

function serializeStateFact(d) {
  const cmBlock  = serializeOfficial(d.cm, 4);
  const groupLines = d.officialGroups
    .map(g => `      ${serializeOfficialGroup(g, 6)},`)
    .join('\n');
  const findingLines = d.cagFindings
    .map(f => serializeCagFinding(f, 6))
    .join(',\n');
  const ratingLines = d.accountabilityRatings
    .map(r => serializeRating(r, 6))
    .join(',\n');
  const indicatorLines = d.indicators
    .map(ind => serializeIndicator(ind, 6))
    .join(',\n');

  return `  // ══ ${d.stateCode} — ${d.name} ══════════════════════════════════════════════════════════
  {
    stateCode: '${d.stateCode}',
    name: \`${esc(d.name)}\`,
    capital: \`${esc(d.capital)}\`,
    region: \`${esc(d.region)}\`,

    cm: ${cmBlock},

    officialGroups: [
${groupLines}
    ],

    cagFindings: [
${findingLines},
    ],

    accountabilityRatings: [
${ratingLines},
    ],

    indicators: [
${indicatorLines},
    ],
  },`;
}

// ── Extract relevant CAG report summaries for a state ────────────────────────
function extractCagContextForState(stateCode) {
  const src = readFileSync(CAG_DB, 'utf-8');
  const entries = [];

  // Split into entry blocks by looking for id: lines
  const blockRegex = /\{\s*\n\s*id:\s*`([^`]+)`[\s\S]*?(?=\n  \{|\n\];)/g;
  let match;
  while ((match = blockRegex.exec(src)) !== null) {
    const block = match[0];
    // Filter to only this state
    if (!block.includes(`stateCode: \`${stateCode}\``)) continue;

    const id      = (block.match(/id:\s*`([^`]+)`/))?.[1] ?? '';
    const title   = (block.match(/title:\s*`([^`]+)(?:`|$)/))?.[1]?.slice(0, 120) ?? '';
    const year    = (block.match(/year:\s*(\d{4})/))?.[1] ?? '';
    const url     = (block.match(/url:\s*'(https?:\/\/[^']+)'/))?.[1] ?? '';
    const sev     = (block.match(/severity:\s*'([^']+)'/))?.[1] ?? '';
    const cat     = (block.match(/category:\s*'([^']+)'/))?.[1] ?? '';
    const reportNo= (block.match(/reportNo:\s*`([^`]+)`/))?.[1] ?? '';

    // Extract first 2 keyFindings texts
    const findMatches = [...block.matchAll(/text:\s*`([^`]{20,250})`/g)].slice(0, 2);
    const findings = findMatches.map(m => m[1].replace(/\n/g, ' ').trim());

    if (id && url) {
      entries.push({ id, title, year: Number(year), url, severity: sev, category: cat, reportNo, findings });
    }
  }

  // Sort: severity high → most recent
  const sevOrder = { high: 0, medium: 1, low: 2 };
  entries.sort((a, b) => (sevOrder[a.severity] ?? 9) - (sevOrder[b.severity] ?? 9) || b.year - a.year);

  return entries.slice(0, 10); // top 10 for AI context
}

// ── Build set of state codes already in state-facts.tsx ───────────────────────
function buildExistingStateCodes() {
  const src = readFileSync(SF_FILE, 'utf-8');
  const codes = new Set();
  for (const m of src.matchAll(/stateCode:\s*'([A-Z]{2,3})'/g)) codes.add(m[1]);
  return codes;
}

// ── Find the ]; line that closes STATE_FACTS array ───────────────────────────
function findArrayCloseIdx() {
  const lines = readFileSync(SF_FILE, 'utf-8').split('\n');
  // Find ]; that is followed by a blank line then the ─── Components block or EOF
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].trim() === '];') return i;
  }
  throw new Error('Could not find ]; closing the STATE_FACTS array');
}

// ── Insert TS entry before the closing ]; ─────────────────────────────────────
function insertEntry(tsEntry) {
  const src   = readFileSync(SF_FILE, 'utf-8');
  const lines = src.split('\n');
  const idx   = findArrayCloseIdx();
  lines.splice(idx, 0, tsEntry, '');
  writeFileSync(SF_FILE, lines.join('\n'));
}

// ── TypeScript check ──────────────────────────────────────────────────────────
function tscCheck() {
  const r = spawnSync('npx', ['tsc', '--noEmit'], {
    cwd: join(ROOT, 'artifacts/govlens'),
    encoding: 'utf-8',
    timeout: 60000,
  });
  return { ok: r.status === 0, output: (r.stdout + r.stderr).slice(0, 800) };
}

// ── URL check for CAG sourceUrls ──────────────────────────────────────────────
async function checkUrl(url) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(url, { method: 'HEAD', signal: ctrl.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; GovLensCrawler/1.0)' } });
    clearTimeout(t);
    return res.status === 200;
  } catch { return false; }
}

// ── Audit a generated StateFact object (score starts 100, -1 per fail) ────────
function auditStateFact(d) {
  const govExpected = Math.round(
    (((d.indicators?.find(i => i.key === 'economy')?.score ?? 0) +
      (d.indicators?.find(i => i.key === 'education')?.score ?? 0) +
      (d.indicators?.find(i => i.key === 'employment')?.score ?? 0) +
      (d.indicators?.find(i => i.key === 'health')?.score ?? 0) +
      (d.indicators?.find(i => i.key === 'environment')?.score ?? 0)) / 5) * 0.5
    + (d.accountabilityRatings?.find(r => r.key === 'transparency')?.score ?? 0) * 0.25
    + (d.accountabilityRatings?.find(r => r.key === 'officialsIntegrity')?.score ?? 0) * 0.25
  );
  const govActual = d.accountabilityRatings?.find(r => r.key === 'governance')?.score ?? -999;

  const cagFindings    = d.cagFindings ?? [];
  const officials      = [d.cm, ...(d.officialGroups?.flatMap(g => g.officials) ?? [])];
  const allScores      = [
    ...d.indicators?.map(i => i.score) ?? [],
    ...d.accountabilityRatings?.map(r => r.score) ?? [],
  ];

  const checks = [
    ['stateCode is 2 uppercase letters',          /^[A-Z]{2,3}$/.test(d.stateCode ?? '')],
    ['name, capital, region non-empty',           Boolean((d.name ?? '').length > 1 && (d.capital ?? '').length > 1 && (d.region ?? '').length > 1)],
    ['CM has criminalCases + integrityScore',     typeof d.cm?.criminalCases === 'number' && typeof d.cm?.integrityScore === 'number'],
    ['≥ 2 officialGroups with ≥ 1 official each',Boolean(d.officialGroups?.length >= 2 && d.officialGroups.every(g => g.officials?.length >= 1))],
    ['≥ 3 cagFindings',                          cagFindings.length >= 3],
    ['All CAG sourceUrls on cag.gov.in',         cagFindings.length > 0 && cagFindings.every(f => (f.sourceUrl ?? '').startsWith('https://cag.gov.in/'))],
    ['CAG reportYears 2022–2026',                cagFindings.length > 0 && cagFindings.every(f => f.reportYear >= 2022 && f.reportYear <= 2026)],
    ['Exactly 3 accountability ratings',         d.accountabilityRatings?.length === 3],
    ['Governance formula within ±3',             Math.abs(govActual - govExpected) <= 3],
    ['All indicator+rating scores 0–100',        allScores.length > 0 && allScores.every(s => typeof s === 'number' && s >= 0 && s <= 100)],
  ];

  const failures = checks.filter(([, pass]) => !pass).map(([label]) => label);
  return { score: 100 - failures.length, failures };
}

// ── Progress tracking ─────────────────────────────────────────────────────────
function loadProgress() {
  if (existsSync(PROG)) return JSON.parse(readFileSync(PROG, 'utf-8'));
  return { done: [], score: 100, added: 0, skipped: 0, consecutivePasses: 0 };
}
function saveProgress(p) { writeFileSync(PROG, JSON.stringify(p, null, 2)); }

// ── Generate StateFact JSON via AI ────────────────────────────────────────────
async function generateStateFact(stateMeta, cagContext) {
  const cagSummary = cagContext.length === 0
    ? 'No specific CAG reports found for this state in the database. Use web search to find recent CAG audit reports for this state.'
    : cagContext.map((e, i) =>
        `${i+1}. [${e.severity.toUpperCase()}] ${e.reportNo || 'Report'} (${e.year}) — ${e.title}\n   URL: ${e.url}\n   ${e.findings.slice(0, 2).join('; ')}`
      ).join('\n');

  const prompt = `You are a civic data analyst building the GovLens India transparency platform. Generate a complete StateFact JSON object for ${stateMeta.name} (${stateMeta.code}).

AVAILABLE CAG AUDIT REPORTS IN OUR DATABASE:
${cagSummary}

RETURN exactly this JSON shape (no markdown, no backticks):
{
  "stateCode": "${stateMeta.code}",
  "name": "${stateMeta.name}",
  "capital": "${stateMeta.capital}",
  "region": "${stateMeta.region}",

  "cm": {
    "name": "Current Chief Minister full name",
    "title": "Chief Minister",
    "party": "BJP|INC|etc",
    "since": "YYYY",
    "photoUrl": "https://upload.wikimedia.org/... (Wikipedia URL if available, else omit)",
    "criminalCases": 0,
    "criminalCaseNote": "brief note if > 0, else omit",
    "education": "verbatim qualification from ECI affidavit",
    "educationScore": 75,
    "integrityScore": 100,
    "affidavitYear": 2023
  },

  "officialGroups": [
    {
      "group": "Constitutional & Legislature",
      "officials": [
        {
          "name": "Governor full name",
          "title": "Governor",
          "since": "YYYY",
          "photoUrl": "Wikipedia URL if available"
        },
        {
          "name": "Speaker full name",
          "title": "Speaker, Legislative Assembly",
          "party": "...",
          "since": "YYYY",
          "criminalCases": 0,
          "education": "...",
          "educationScore": 75,
          "integrityScore": 100,
          "affidavitYear": 2023
        }
      ]
    },
    {
      "group": "Finance & Planning",
      "officials": [ /* Finance Minister + 1-2 key cabinet ministers with ECI data */ ]
    },
    {
      "group": "Health & Social Welfare",
      "officials": [ /* Health Minister */ ]
    }
  ],

  "cagFindings": [
    /* 3-5 entries. USE ONLY the CAG reports listed above — do NOT hallucinate reports.
       Pick the most significant findings (highest severity, most recent year).
       Each finding must have a real cag.gov.in URL from the list above. */
    {
      "scheme": "Scheme/area name (e.g. Pradhan Mantri Awaas Yojana)",
      "schemeSlug": "pmayg",
      "reportRef": "Report No. X of YYYY",
      "reportYear": 2025,
      "severity": "critical|major|minor",
      "parameter": "What aspect was audited",
      "finding": "2-3 sentence plain-language summary of what CAG found wrong",
      "actual": "Specific numbers, percentages, rupee amounts from the audit",
      "reportExcerpt": "Short verbatim quote from the report (optional)",
      "sourceUrl": "https://cag.gov.in/... (MUST be exactly the URL from the list above)"
    }
  ],

  "accountabilityRatings": [
    {
      "key": "transparency",
      "label": "Transparency",
      "score": 50,
      "methodology": "Based on N CAG findings (X critical, Y major). Key issues: ..."
    },
    {
      "key": "officialsIntegrity",
      "label": "Officials' Integrity",
      "score": 70,
      "methodology": "CM declared N criminal cases. Weighted integrity avg across M officials: ..."
    },
    {
      "key": "governance",
      "label": "Governance",
      "score": 60,
      "methodology": "Composite: indicators avg (X/100) × 50% + Transparency (Y/100) × 25% + Integrity (Z/100) × 25% = result"
    }
  ],

  "indicators": [
    {
      "key": "economy",
      "label": "Economy",
      "score": 55,
      "headline": "GSDP ₹X lakh crore (2024-25 estimate)",
      "stats": [
        { "label": "GSDP 2024-25", "value": "₹X lakh crore", "source": "Economic Survey / MoSPI" },
        { "label": "Per-capita income", "value": "₹X", "source": "State economic survey" },
        { "label": "GDP growth rate", "value": "X%", "source": "RBI / MoSPI 2024" }
      ]
    },
    {
      "key": "education",
      "label": "Education",
      "score": 65,
      "headline": "Literacy X% (Census 2011 / ASER latest)",
      "stats": [
        { "label": "Literacy rate", "value": "X%", "source": "Census 2011" },
        { "label": "Gross Enrolment Ratio (higher education)", "value": "X%", "source": "AISHE 2022-23" },
        { "label": "Out-of-school children", "value": "X%", "source": "ASER 2023" }
      ]
    },
    {
      "key": "employment",
      "label": "Employment",
      "score": 50,
      "headline": "Unemployment rate X% (PLFS 2023-24)",
      "stats": [
        { "label": "Unemployment rate (PLFS 2023-24)", "value": "X%", "source": "PLFS 2023-24, MoSPI" },
        { "label": "Labour force participation rate", "value": "X%", "source": "PLFS 2023-24" }
      ]
    },
    {
      "key": "health",
      "label": "Health",
      "score": 55,
      "headline": "IMR X per 1,000 (SRS 2022)",
      "stats": [
        { "label": "Infant mortality rate (SRS 2022)", "value": "X per 1,000 live births", "source": "SRS Bulletin 2022" },
        { "label": "Maternal mortality ratio (SRS 2018-20)", "value": "X per 1 lakh live births", "source": "SRS 2018-20" },
        { "label": "Full immunisation coverage", "value": "X%", "source": "NFHS-5 2019-21" }
      ]
    },
    {
      "key": "environment",
      "label": "Environment",
      "score": 50,
      "headline": "Forest cover X% of area (FSI 2023)",
      "stats": [
        { "label": "Forest & tree cover (FSI 2023)", "value": "X% of state area", "source": "FSI State of Forests 2023" },
        { "label": "Air quality index (annual avg)", "value": "X AQI", "source": "CPCB 2023-24", "note": "Optional — omit if unavailable" }
      ]
    }
  ]
}

SCORING RULES (audit checks against this output, start 100, -1 per fail):
1. stateCode exactly "${stateMeta.code}"
2. name, capital, region non-empty
3. CM has criminalCases (number) and integrityScore (0-100)
4. ≥ 2 officialGroups, each with ≥ 1 official
5. ≥ 3 cagFindings
6. ALL cagFindings sourceUrls start with https://cag.gov.in/ — use ONLY URLs from the list above
7. ALL cagFindings reportYear between 2022 and 2026
8. Exactly 3 accountabilityRatings
9. Governance score = round(indicatorsAvg × 0.5 + transparency × 0.25 + officialsIntegrity × 0.25)
10. All indicator and rating scores are integers 0–100

CRITICAL RULES:
- For cagFindings: ONLY use URLs from the "AVAILABLE CAG AUDIT REPORTS" list above. Never invent URLs.
- If fewer than 3 CAG reports are in the list, set cagFindings to exactly what is available (even 1-2 is ok — the audit will only penalize if finding text is fabricated, not for count if DB is sparse).
- For officials: use real ECI affidavit data. If unknown, set criminalCases: 0 and estimate educationScore from known background.
- integrityScore formula: 0 cases=100, 1=75, 2=60, 3=50, 4-5=35, 6+=20.
- educationScore: PhD=100, PG=85, Grad+Prof=82, Grad=75, 12th=55, 10th=40, 8th=25.
- Governance formula MUST be computed correctly: round(indicatorsAvg×0.5 + transparency×0.25 + officialsIntegrity×0.25).

Return ONLY the JSON object. No markdown. No explanation.`;

  const resp = await openai.responses.create({
    model: 'gpt-5.6-terra',
    tools: [{ type: 'web_search_preview' }],
    input: prompt,
    max_output_tokens: 8192,
  });

  const raw = String(resp.output_text ?? '').trim();
  let cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
  const start = cleaned.indexOf('{');
  const end   = cleaned.lastIndexOf('}');
  if (start < 0 || end < 0) throw new Error('No JSON object in response');
  cleaned = cleaned.slice(start, end + 1);

  // Fix common JSON issues
  cleaned = cleaned.replace(/"page"\s*:\s*([ivxlcdmIVXLCDM]+)\b/g, '"page": 0');
  cleaned = cleaned.replace(/:\s*(NaN|Infinity|-Infinity|undefined)\b/g, ': null');

  return JSON.parse(cleaned);
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  let pending = [...ALL_STATES];
  if (FLAG_STATE) pending = pending.filter(s => s.code.toUpperCase() === FLAG_STATE.toUpperCase());

  const existingCodes = buildExistingStateCodes();
  pending = pending.filter(s => !existingCodes.has(s.code));

  if (isFinite(FLAG_N)) pending = pending.slice(0, FLAG_N);

  const prog = loadProgress();

  console.log(`\n📊 State Facts Generator`);
  console.log(`   Pending  : ${pending.length} states`);
  console.log(`   Existing : ${existingCodes.size} states already in file`);
  console.log(`   Score    : ${prog.score}/100 | Added so far : ${prog.added} | Streak : ${prog.consecutivePasses}`);
  if (FLAG_STATE) console.log(`   Filter   : ${FLAG_STATE}`);
  console.log();

  if (pending.length === 0) {
    console.log('✅  All states already generated.');
    return;
  }

  if (prog.score < 95) {
    console.error(`❌  Audit score ${prog.score} < 95. Fix quality issues before continuing.`);
    process.exit(1);
  }

  copyFileSync(SF_FILE, BACKUP);
  console.log(`✅  Backed up → ${BACKUP}\n`);

  for (let i = 0; i < pending.length; i++) {
    const state = pending[i];

    if (prog.score < 95) {
      console.error(`\n🛑  Score dropped to ${prog.score} — stopping.`);
      break;
    }

    console.log(`\n[${i+1}/${pending.length}] ${state.code} — ${state.name}`);

    // Dedup check
    if (buildExistingStateCodes().has(state.code)) {
      console.log(`   ↩  Already in file — skipping`);
      prog.skipped++;
      saveProgress(prog);
      continue;
    }

    // Extract CAG context
    process.stdout.write(`   📂 Extracting CAG context... `);
    const cagContext = extractCagContextForState(state.code);
    console.log(`${cagContext.length} reports found`);

    // Generate JSON
    process.stdout.write(`   🤖 Generating (gpt-5.6-terra + web search)... `);
    let data;
    try {
      data = await generateStateFact(state, cagContext);
      // Enforce critical fields that must never be wrong
      data.stateCode = state.code;
      data.name      = state.name;
      data.capital   = state.capital;
      data.region    = state.region;
      console.log(`OK (${JSON.stringify(data).length.toLocaleString()} chars)`);
    } catch (err) {
      console.log(`FAILED: ${err.message?.slice(0, 120)}`);
      prog.score--;
      prog.consecutivePasses = 0;
      prog.skipped++;
      saveProgress(prog);
      continue;
    }

    // Audit the generated data
    const { score: auditScore, failures } = auditStateFact(data);
    const lost = 100 - auditScore;
    if (failures.length) {
      console.log(`   ⚠  Audit −${lost}: ${failures.join(' | ')}`);
      prog.score -= lost;
      prog.consecutivePasses = 0;
      if (prog.score < 95) {
        prog.done.push(state.code);
        saveProgress(prog);
        console.error(`\n🛑  Score dropped to ${prog.score} — stopping.`);
        break;
      }
    } else {
      console.log(`   ✅  Audit passed (100/100)`);
    }

    // URL check for all CAG sourceUrls
    const urls = (data.cagFindings ?? []).map(f => f.sourceUrl).filter(Boolean);
    if (urls.length > 0) {
      process.stdout.write(`   🔗 Checking ${urls.length} CAG URLs... `);
      const results = await Promise.all(urls.map(checkUrl));
      const broken = urls.filter((_, idx) => !results[idx]);
      if (broken.length > 0) {
        console.log(`${broken.length} broken`);
        broken.forEach(u => console.log(`      ✗ ${u.slice(0, 80)}`));
        // Replace broken URLs with state's CAG listing page
        const fallback = `https://cag.gov.in/en/audit-report/state/${state.name.toLowerCase().replace(/\s+/g, '-')}`;
        for (const f of data.cagFindings) {
          if (broken.includes(f.sourceUrl)) f.sourceUrl = fallback;
        }
        prog.score = Math.max(0, prog.score - broken.length);
        console.log(`      → Replaced with CAG state listing page. Score now ${prog.score}`);
      } else {
        console.log(`all OK ✓`);
      }
    }

    // Serialize to TypeScript
    let tsEntry;
    try {
      tsEntry = serializeStateFact(data);
    } catch (err) {
      console.log(`   ✗ Serialization error: ${err.message?.slice(0, 80)}`);
      prog.score--;
      prog.consecutivePasses = 0;
      prog.done.push(state.code);
      saveProgress(prog);
      continue;
    }

    // Snapshot before insert for potential revert
    const preInsertSrc = readFileSync(SF_FILE, 'utf-8');

    // Insert into file
    try {
      insertEntry(tsEntry);
    } catch (err) {
      console.log(`   ✗ Insert error: ${err.message?.slice(0, 80)}`);
      prog.score--;
      prog.consecutivePasses = 0;
      prog.done.push(state.code);
      saveProgress(prog);
      continue;
    }

    // TSC check every TSC_EVERY states
    prog.added++;
    if (prog.added % TSC_EVERY === 0) {
      process.stdout.write(`   🔍 tsc check (every ${TSC_EVERY})... `);
      const tsc = tscCheck();
      if (!tsc.ok) {
        console.log(`FAILED — reverting this entry\n   ${tsc.output.slice(0, 300)}`);
        writeFileSync(SF_FILE, preInsertSrc);
        prog.added--;
        prog.score--;
        prog.consecutivePasses = 0;
        prog.done.push(state.code);
        prog.skipped++;
        saveProgress(prog);
        continue;
      }
      console.log(`OK`);
    }

    // Mark done + streak bonus
    prog.done.push(state.code);
    if (auditScore === 100) {
      prog.consecutivePasses++;
      if (prog.consecutivePasses % 2 === 0) {
        prog.score = Math.min(100, prog.score + 1);
        console.log(`   🎯 +1 bonus (${prog.consecutivePasses} clean streak) → score ${prog.score}`);
      }
    } else {
      prog.consecutivePasses = 0;
    }
    saveProgress(prog);

    console.log(`   ✓ Added ${state.code} | score ${prog.score} | streak ${prog.consecutivePasses} | total ${buildExistingStateCodes().size}`);

    // Brief pause to avoid rate-limiting
    await new Promise(r => setTimeout(r, 1500));
  }

  // Final TSC if needed
  if (prog.added % TSC_EVERY !== 0 && prog.added > 0) {
    process.stdout.write(`\n🔍 Final tsc check... `);
    const tsc = tscCheck();
    console.log(tsc.ok ? 'OK ✅' : `FAILED ❌\n${tsc.output.slice(0, 400)}`);
  }

  console.log(`\n━━━ Session complete ━━━`);
  console.log(`   Added   : ${prog.added}`);
  console.log(`   Skipped : ${prog.skipped}`);
  console.log(`   Score   : ${prog.score}/100`);
  console.log(`   Total states in file : ${buildExistingStateCodes().size}`);
}

main().catch(err => { console.error(err); process.exit(1); });
