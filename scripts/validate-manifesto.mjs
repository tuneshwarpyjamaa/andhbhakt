#!/usr/bin/env node
/**
 * validate-manifesto.mjs
 *
 * Validates state manifesto data in state-facts-data.ts by parsing the source
 * file as text — no React/Vite import needed, works standalone.
 *
 * Encodes every lesson learned from the AR (Arunachal Pradesh) audit.
 *
 * Usage:
 *   node scripts/validate-manifesto.mjs AR
 *   node scripts/validate-manifesto.mjs UP
 *   node scripts/validate-manifesto.mjs --all
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { URL, fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, '../artifacts/govlens/src/data/state-facts-data.ts');

// ─── Terminal colours ─────────────────────────────────────────────────────────
const R  = s => `\x1b[31m${s}\x1b[0m`;
const G  = s => `\x1b[32m${s}\x1b[0m`;
const Y  = s => `\x1b[33m${s}\x1b[0m`;
const B  = s => `\x1b[1m${s}\x1b[0m`;

// ─────────────────────────────────────────────────────────────────────────────
// RULES — every lesson from the AR audit is encoded here
// ─────────────────────────────────────────────────────────────────────────────

/**
 * LESSON 1 — Institution name traps.
 * Common names that are correct for one state but wrong for others.
 */
const INSTITUTION_TRAPS = [
  {
    pattern: /\bRIMS\b(?!\s*(Manipur|Imphal))/,
    wrongIn: ['AR','UP','GJ','RJ','HP','UK','CG','JH','AS','ML','MZ','NL','SK','TR','BR','OR','HR'],
    hint:    'RIMS = Regional Institute of Medical Sciences, Imphal (Manipur only). Use the correct local institution name — e.g. TRIHMS for Arunachal Pradesh.',
  },
  {
    pattern: /AIIMS\s+(Pasighat|Itanagar|Naharlagun)/i,
    wrongIn: ['AR'],
    hint:    'No AIIMS was sanctioned at Pasighat/Itanagar/Naharlagun. The apex medical institution in AP is TRIHMS Naharlagun. Use "Government Medical College (GMC)" instead.',
  },
  {
    pattern: /Ranganadi\s+Stage.?II/i,
    wrongIn: ['AR'],
    hint:    'Ranganadi Stage-II was NOT commissioned in the 2019–2024 term. Only Ranganadi Stage-I (405 MW, commissioned 2002) exists. Remove it and correct the MW total.',
  },
];

/**
 * LESSON 2 — CAG URL format.
 * The /en/audit-report/details/<id> pages return 404. Use the PDF download URL.
 */
const BAD_CAG_URL_RE = /cag\.gov\.in\/en\/audit-report\/details\/\d+/;

/**
 * LESSON 3 — Hydropower MW arithmetic.
 * "X MW commissioned YYYY–YYYY: A (N MW), B (M MW)"
 * The stated X must equal N + M + ...
 */
function checkHydroMath(text) {
  const m = text.match(/(\d+)\s*MW\s+commissioned[^:]*:\s*([^.]+)\./i);
  if (!m) return null;
  const stated = parseInt(m[1]);
  const projectStr = m[2];
  const mwVals = [...projectStr.matchAll(/\((\d+)\s*MW/gi)].map(x => parseInt(x[1]));
  if (mwVals.length < 2) return null;
  const sum = mwVals.reduce((a, b) => a + b, 0);
  if (Math.abs(sum - stated) > 5) {
    return `Hydro MW mismatch: note says "${stated} MW total" but projects sum to ${sum} MW (${mwVals.join(' + ')}).`;
  }
  return null;
}

/**
 * LESSON 4 — Tourist arrivals must be consistent with the Indicator section.
 * Flag if manifesto note is 3× higher than the indicator.
 */
function checkTourismConsistency(indicatorBlock, manifestoBlock) {
  const re = /~?([\d.]+)\s*lakh[^\n]*tourist/gi;
  const manifVals = [...manifestoBlock.matchAll(re)].map(m => parseFloat(m[1]));
  const indicVals = [...indicatorBlock.matchAll(re)].map(m => parseFloat(m[1]));
  if (!manifVals.length || !indicVals.length) return null;
  const maxManif = Math.max(...manifVals);
  const maxIndic = Math.max(...indicVals);
  if (maxManif > maxIndic * 3) {
    return (
      `Tourist arrivals in manifesto note (${maxManif} lakh) are >3× higher than ` +
      `the Indicator section (${maxIndic} lakh). ` +
      `Use the same source and year in both places.`
    );
  }
  return null;
}

// ─── HTTP HEAD checker ────────────────────────────────────────────────────────

function checkUrl(rawUrl) {
  return new Promise(resolve => {
    try {
      const parsed = new URL(rawUrl);
      const lib = parsed.protocol === 'https:' ? https : http;
      const req = lib.request(
        {
          hostname: parsed.hostname,
          path: parsed.pathname + parsed.search,
          method: 'HEAD',
          timeout: 12000,
          headers: { 'User-Agent': 'GovLens-Validator/2.0' },
        },
        res => resolve({ status: res.statusCode ?? 0, ok: (res.statusCode ?? 0) < 400 }),
      );
      req.on('error', () => resolve({ status: 0, ok: false }));
      req.on('timeout', () => { req.destroy(); resolve({ status: 0, ok: false }); });
      req.end();
    } catch {
      resolve({ status: 0, ok: false });
    }
  });
}

// ─── Source-file parser (text-based, no import) ───────────────────────────────

function extractStateBlock(src, stateCode) {
  const marker = `stateCode: '${stateCode}'`;
  const pos = src.indexOf(marker);
  if (pos === -1) return null;
  // Walk back to find the opening '{' of this state object
  let start = pos;
  while (start > 0 && src[start] !== '{') start--;
  let depth = 0, i = start;
  while (i < src.length) {
    if (src[i] === '{') depth++;
    if (src[i] === '}') { depth--; if (depth === 0) return src.slice(start, i + 1); }
    i++;
  }
  return src.slice(start);
}

function hasManifestos(block) {
  return /manifestos\s*:\s*\[/.test(block);
}

function getManifestoSection(block) {
  const idx = block.indexOf('manifestos');
  return idx === -1 ? '' : block.slice(idx);
}

function countOccurrences(text, re) {
  return (text.match(re) ?? []).length;
}

function extractUrls(text) {
  const seen = new Set();
  const out = [];
  for (const m of text.matchAll(/https?:\/\/[^\s'"`),\]]+/g)) {
    const url = m[0].replace(/[.,)]+$/, '');
    if (!seen.has(url)) { seen.add(url); out.push(url); }
  }
  return out;
}

function extractCagSources(manifestoSection) {
  return [...manifestoSection.matchAll(/cagSource\s*:\s*['"]([^'"]+)['"]/g)]
    .map(m => m[1]);
}

function extractStatuses(text) {
  return [...text.matchAll(/\bstatus\s*:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
}

// ─── Validator core ───────────────────────────────────────────────────────────

const VALID_STATUSES = new Set(['implemented','partial','in-progress','not-fulfilled','pending']);

async function validateState(stateCode, block) {
  const issues = [];
  const err  = msg => issues.push({ level: 'error', msg });
  const warn = msg => issues.push({ level: 'warn',  msg });

  if (!hasManifestos(block)) { warn('No manifesto data found for this state.'); return issues; }

  const manifSection   = getManifestoSection(block);
  const indicatorBlock = block.slice(0, block.indexOf('manifestos'));

  // ── L1: Institution name traps ─────────────────────────────────────────
  for (const trap of INSTITUTION_TRAPS) {
    if (!trap.wrongIn.includes(stateCode)) continue;
    if (trap.pattern.test(manifSection)) {
      err(`Wrong institution name in manifesto\n      → ${trap.hint}`);
    }
  }

  // ── L2: Bad CAG URL format ─────────────────────────────────────────────
  for (const url of extractUrls(manifSection)) {
    if (BAD_CAG_URL_RE.test(url)) {
      err(`CAG /details/ URL returns 404:\n      ${url}\n      → Use the actual PDF download URL from cag.gov.in/uploads/...`);
    }
  }

  // ── L3: Hydropower math ────────────────────────────────────────────────
  const hydroErr = checkHydroMath(manifSection);
  if (hydroErr) err(hydroErr);

  // ── L4: Tourism number consistency ────────────────────────────────────
  const tourismErr = checkTourismConsistency(indicatorBlock, manifSection);
  if (tourismErr) err(tourismErr);

  // ── L5: Valid status values ────────────────────────────────────────────
  for (const s of extractStatuses(manifSection)) {
    if (!VALID_STATUSES.has(s)) {
      err(`Invalid status value: "${s}". Must be one of: ${[...VALID_STATUSES].join(', ')}`);
    }
  }

  // ── L6: cagVerdict ↔ cagSource pairing ────────────────────────────────
  const nVerdict   = countOccurrences(manifSection, /\bcagVerdict\s*:/g);
  const nVerdictHi = countOccurrences(manifSection, /\bcagVerdictHi\s*:/g);
  const nSource    = countOccurrences(manifSection, /\bcagSource\s*:/g);
  if (nVerdict !== nSource)   warn(`cagVerdict count (${nVerdict}) ≠ cagSource count (${nSource}) — every verdict needs a source.`);
  if (nVerdict > nVerdictHi)  warn(`${nVerdict - nVerdictHi} cagVerdict(s) missing Hindi cagVerdictHi translation.`);

  // ── L7: Hindi field parity ─────────────────────────────────────────────
  const nNote    = countOccurrences(manifSection, /\bnote\s*:/g);
  const nNoteHi  = countOccurrences(manifSection, /\bnoteHi\s*:/g);
  const nProm    = countOccurrences(manifSection, /\bpromise\s*:/g);
  const nPromHi  = countOccurrences(manifSection, /\bpromiseHi\s*:/g);
  if (nNote !== nNoteHi)   warn(`note/noteHi mismatch: ${nNote} EN vs ${nNoteHi} HI.`);
  if (nProm !== nPromHi)   warn(`promise/promiseHi mismatch: ${nProm} EN vs ${nPromHi} HI.`);

  // ── L8: Promise count ─────────────────────────────────────────────────
  const nPromises = countOccurrences(manifSection, /\bpromise\s*:/g);
  if (nPromises < 15) warn(`Only ${nPromises} promise(s) — typical manifesto has 20–30. Add more categories.`);

  // ── L9: Status distribution ────────────────────────────────────────────
  const allStatuses = extractStatuses(manifSection);
  if (allStatuses.length > 0) {
    if (allStatuses.every(s => s === 'pending'))      warn('All statuses are "pending" — fill in actual research.');
    if (allStatuses.every(s => s === 'implemented'))  warn('All statuses are "implemented" — suspiciously optimistic.');
  }

  // ── Live URL checks on cagSources ─────────────────────────────────────
  const cagUrls = [...new Set(extractCagSources(manifSection))];
  if (cagUrls.length === 0) {
    warn('No cagSource URLs found — adding CAG verdicts with citations increases credibility.');
  } else {
    console.log(`\n    Checking ${cagUrls.length} cagSource URL(s)...`);
    const urlResults = await Promise.all(cagUrls.map(async url => ({ url, ...(await checkUrl(url)) })));
    for (const r of urlResults) {
      if (r.ok) {
        console.log(`    ${G('✅')} [${r.status}] ...${r.url.slice(-65)}`);
      } else {
        err(`Dead cagSource [HTTP ${r.status}]:\n      ${r.url}`);
      }
    }
  }

  return issues;
}

// ─── CLI ──────────────────────────────────────────────────────────────────────

async function main() {
  const arg = process.argv[2];
  if (!arg) {
    console.error('Usage: node scripts/validate-manifesto.mjs <STATE_CODE|--all>');
    process.exit(1);
  }

  const src = fs.readFileSync(DATA_FILE, 'utf8');
  const allCodes = [...src.matchAll(/stateCode:\s*'([A-Z]+)'/g)].map(m => m[1]);

  const targets = arg === '--all'
    ? allCodes.filter(code => { const b = extractStateBlock(src, code); return b && hasManifestos(b); })
    : [arg.toUpperCase()];

  if (targets.length === 0) {
    console.log(Y(arg === '--all'
      ? 'No states have manifesto data yet.'
      : `State "${arg.toUpperCase()}" not found or has no manifesto data.`));
    process.exit(0);
  }

  let totalErrors = 0, totalWarnings = 0;

  for (const code of targets) {
    const block = extractStateBlock(src, code);
    if (!block) { console.log(Y(`  "${code}" not found.`)); continue; }

    console.log(`\n${'═'.repeat(64)}`);
    console.log(B(`  ${code} — manifesto validation`));
    console.log('═'.repeat(64));

    const issues = await validateState(code, block);
    const errors   = issues.filter(i => i.level === 'error');
    const warnings = issues.filter(i => i.level === 'warn');

    if (errors.length)   { console.log(R(`\n  ❌ ERRORS (${errors.length}):`));   errors.forEach(e   => console.log(`    • ${e.msg}`)); }
    if (warnings.length) { console.log(Y(`\n  ⚠️  WARNINGS (${warnings.length}):`)); warnings.forEach(w => console.log(`    • ${w.msg}`)); }
    if (!errors.length && !warnings.length) console.log(G('\n  ✅ All checks passed.'));

    totalErrors   += errors.length;
    totalWarnings += warnings.length;
  }

  console.log(`\n${'─'.repeat(64)}`);
  const summary = `  ${totalErrors} error(s), ${totalWarnings} warning(s) across ${targets.length} state(s)`;
  console.log(totalErrors > 0 ? R(summary) : totalWarnings > 0 ? Y(summary) : G(summary));
  if (totalErrors > 0) process.exit(1);
}

main().catch(e => { console.error(e); process.exit(1); });
