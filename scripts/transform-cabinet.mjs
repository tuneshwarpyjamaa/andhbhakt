/**
 * Transform cabinet minister entries in central-data.tsx:
 *  1. Remove hardcoded integrityScore
 *  2. Add seriousCriminalCases for ministers with cases
 *  3. Add assetGrowthPct + assetGrowthNote for ministers with verified data
 */

import { readFileSync, writeFileSync } from 'fs';

// ── total cases (from original data) ──────────────────────────────────────────
const totalCasesMap = {
  'Amit Shah': 3,
  'Nitin Gadkari': 10,
  'Shivraj Singh Chouhan': 3,
  'H.D. Kumaraswamy': 3,
  'Dharmendra Pradhan': 5,
  'Jitan Ram Manjhi': 4,
  'Rajiv Ranjan Singh': 5,   // "Lalan Singh"
  'Kinjarapu Ram Mohan Naidu': 4,
  'Jueal Oram': 3,
  'Giriraj Singh': 3,
  'Annpurna Devi': 2,
  'S.P. Singh Baghel': 3,
  'Shobha Karandlaje': 5,
  'Nityanand Rai': 3,
  'Anupriya Patel': 2,
  'V. Somanna': 1,
  'Chandra Sekhar Pemmasani': 1,
  'Suresh Gopi': 4,
  'Bandi Sanjay Kumar': 42,
  'Kamlesh Paswan': 9,
  'Sukanta Majumdar': 16,
  'Sanjay Seth': 2,
  'Ravneet Singh Bittu': 3,
  'Shantanu Thakur': 23,
};

// ── serious IPC case counts (verified per session summary) ────────────────────
const seriousMap = {
  'Amit Shah': 3,
  'Nitin Gadkari': 5,
  'Shivraj Singh Chouhan': 0,
  'H.D. Kumaraswamy': 1,
  'Dharmendra Pradhan': 2,
  'Jitan Ram Manjhi': 1,
  'Rajiv Ranjan Singh': 2,
  'Kinjarapu Ram Mohan Naidu': 0,
  'Jueal Oram': 1,
  'Giriraj Singh': 3,
  'Annpurna Devi': 0,
  'S.P. Singh Baghel': 2,
  'Shobha Karandlaje': 4,
  'Nityanand Rai': 3,
  'Anupriya Patel': 1,
  'V. Somanna': 1,
  'Chandra Sekhar Pemmasani': 0,
  'Suresh Gopi': 2,
  'Bandi Sanjay Kumar': 30,
  'Kamlesh Paswan': 4,
  'Sukanta Majumdar': 10,
  'Sanjay Seth': 0,
  'Ravneet Singh Bittu': 2,
  'Shantanu Thakur': 23,
};

// ── verified asset growth % (LS 2019→2024 ECI affidavits, ADR/myneta.info) ───
const assetGrowthMap = {
  'Amit Shah':        { pct: 63,  note: 'LS 2019\u21922024: \u20b940.3cr\u2192\u20b965.7cr (+63%); ADR/myneta.info' },
  'Giriraj Singh':    { pct: 72,  note: 'LS 2019\u21922024: \u20b98.3cr\u2192\u20b914.3cr (+72%); ADR/myneta.info' },
  'Shantanu Thakur':  { pct: 535, note: 'LS 2019\u21922024: \u20b952.6L\u2192\u20b93.34cr (+535%); ADR/myneta.info' },
  'Sukanta Majumdar': { pct: 114, note: 'LS 2019\u21922024: \u20b958.3L\u2192\u20b91.24cr (+114%); ADR/myneta.info' },
  'Kiren Rijiju':     { pct: 223, note: 'LS 2019\u21922024: \u20b91.52cr\u2192\u20b94.94cr (+223%); ADR/myneta.info' },
  'S.P. Singh Baghel':{ pct: 41,  note: 'LS 2019\u21922024: \u20b97.42cr\u2192\u20b910.43cr (+41%); ADR/myneta.info' },
};

// ── Helper: find map entry matching a minister name ───────────────────────────
function findKey(map, name) {
  // Exact match first
  if (name in map) return name;
  // Partial: key is substring of name (e.g. "Rajiv Ranjan Singh" in long name)
  for (const k of Object.keys(map)) {
    if (name.includes(k)) return k;
  }
  return null;
}

// ── Main transformation ───────────────────────────────────────────────────────
const filePath = 'artifacts/govlens/src/pages/central-data.tsx';
const src = readFileSync(filePath, 'utf8');
const lines = src.split('\n');
const out = [];
let changed = 0;

for (const line of lines) {
  const nameMatch = line.match(/name:\s*'([^']+)'/);
  if (!nameMatch) { out.push(line); continue; }

  const name = nameMatch[1];
  let l = line;

  // 1. Remove integrityScore (and its leading comma+space)
  l = l.replace(/,\s*integrityScore:\s*\d+(?=\s*,)/, '');
  // Also handle if integrityScore is at the end before }
  l = l.replace(/,\s*integrityScore:\s*\d+(?=\s*})/, '');

  // 2. Add seriousCriminalCases after criminalCases (for ministers with cases only)
  const sKey = findKey(seriousMap, name);
  if (sKey !== null) {
    const sVal = seriousMap[sKey];
    const totalVal = totalCasesMap[sKey];
    // Replace "criminalCases: N" with "criminalCases: N, seriousCriminalCases: M"
    // Use a function replacer to avoid $1 string ambiguity
    l = l.replace(/criminalCases:\s*\d+/, (m) => `${m}, seriousCriminalCases: ${sVal}`);
  }

  // 3. Add assetGrowthPct + assetGrowthNote after affidavitYear
  const aKey = findKey(assetGrowthMap, name);
  if (aKey !== null) {
    const { pct, note } = assetGrowthMap[aKey];
    l = l.replace(/affidavitYear:\s*\d+/, (m) => `${m}, assetGrowthPct: ${pct}, assetGrowthNote: '${note}'`);
  }

  if (l !== line) changed++;
  out.push(l);
}

writeFileSync(filePath, out.join('\n'));
console.log(`Done. ${changed} lines modified.`);

// Spot check
const result = out.join('\n');
const checkNames = ['Amit Shah', 'Shivraj Singh Chouhan', 'Shantanu Thakur', 'Kiren Rijiju', 'Nitin Gadkari'];
for (const name of checkNames) {
  const l = result.split('\n').find(l => l.includes(`name: '${name}'`));
  if (l) {
    const hasCS = l.match(/criminalCases:\s*(\d+)/);
    const hasSCS = l.match(/seriousCriminalCases:\s*(\d+)/);
    const hasIS = l.match(/integrityScore:/);
    const hasAG = l.match(/assetGrowthPct:\s*(\d+)/);
    console.log(`${name}: criminalCases=${hasCS?.[1]??'—'} seriousCS=${hasSCS?.[1]??'—'} integrityScore=${hasIS?'STILL PRESENT':'removed'} assetGrowthPct=${hasAG?.[1]??'—'}`);
  }
}
