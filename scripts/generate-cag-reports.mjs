#!/usr/bin/env node
/**
 * generate-cag-reports.mjs
 * Generates rich CagReport TypeScript entries from cag-catalogue.json and appends
 * them one-by-one to artifacts/govlens/src/data/cag-reports.ts.
 *
 * KEY DESIGN: model returns JSON → we serialize to TypeScript ourselves.
 * This guarantees syntactically valid TypeScript every time.
 *
 * Safety guarantees:
 *  - Backs up cag-reports.ts before any writes
 *  - Appends only before the closing ]; — never rewrites existing entries
 *  - Full tsc --noEmit runs every 20 entries; reverts bad entries
 *  - Audits each entry on 10 criteria (score starts 100, -1 per fail, stop <95)
 *  - +1 bonus after every 2 consecutive clean-pass entries
 *  - Tracks progress in /tmp/cag-gen-progress.json — safe to kill and resume
 *  - Deduplicates by pdfUrl so re-runs never add duplicates
 *
 * Usage:
 *   node scripts/generate-cag-reports.mjs
 *   node scripts/generate-cag-reports.mjs --type "Performance Audit"
 *   node scripts/generate-cag-reports.mjs --year 2025
 *   node scripts/generate-cag-reports.mjs --state "Kerala"
 *   node scripts/generate-cag-reports.mjs --n 50
 */

import { readFileSync, writeFileSync, existsSync, copyFileSync } from 'fs';
import { spawnSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';

const __dir   = dirname(fileURLToPath(import.meta.url));
const ROOT    = join(__dir, '..');
const REPORTS = join(ROOT, 'artifacts/govlens/src/data/cag-reports.ts');
const CAT     = join(ROOT, 'artifacts/govlens/src/data/cag-catalogue.json');
const BACKUP  = '/tmp/cag-reports.backup.ts';
const PROG    = '/tmp/cag-gen-progress.json';
const PDF_TMP = '/tmp/cag-pdf-current.pdf';
const PDF_TXT = '/tmp/cag-pdf-current.txt';
const TSC_EVERY = 5; // run full tsc every N entries

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

// ── CLI flags ─────────────────────────────────────────────────────────────────
const args       = process.argv.slice(2);
const getArg     = f => { const i = args.indexOf(f); return i >= 0 ? args[i+1] : null; };
const FLAG_TYPE  = getArg('--type');
const FLAG_YEAR  = getArg('--year') ? parseInt(getArg('--year')) : null;
const FLAG_STATE = getArg('--state');
const FLAG_N     = getArg('--n') ? parseInt(getArg('--n')) : Infinity;

// ── Serialise a JSON data object to a TypeScript CagReport block ──────────────
function esc(s) {
  // Escape backticks and ${} for template literals
  return String(s ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${');
}

function serializeToTS(d) {
  const fileName = d.fileName || (d.url || '').split('/').pop() || '';

  const statLines = (d.stats || []).map(s => {
    const pctPart = (s.pct != null && !isNaN(Number(s.pct))) ? `, pct: ${Number(s.pct)}` : '';
    const notePart = s.note ? `\n        note: \`${esc(s.note)}\`,` : '';
    return `      {
        label: \`${esc(s.label)}\`,
        value: \`${esc(s.value)}\`${pctPart}, status: '${s.status || 'warning'}',${notePart}
        source: { page: ${parseInt(s.source?.page) || 0}, section: \`${esc(s.source?.section)}\`, quote: \`${esc(s.source?.quote)}\` },
      },`;
  }).join('\n');

  const findingLines = (d.keyFindings || []).map(f => `      {
        text: \`${esc(f.text)}\`,
        source: { page: ${parseInt(f.source?.page) || 0}, section: \`${esc(f.source?.section)}\`, quote: \`${esc(f.source?.quote)}\` },
      },`).join('\n');

  const recLines = (d.recommendations || []).map(r => `      \`${esc(r)}\`,`).join('\n');

  const overviewParts = (d.overview || '')
    .split(/\n\n+/)
    .filter(Boolean)
    .map(p => `\`${esc(p.trim())}\``)
    .join(' +\n      \'\\n\\n\' +\n      ');

  const statsBlock = statLines
    ? `\n    stats: [\n${statLines}\n    ],`
    : '';

  return `  {
    id: \`${esc(d.id)}\`,
    reportNo: \`${esc(d.reportNo)}\`,
    year: ${Number(d.year) || 2024},
    title: \`${esc(d.title)}\`,
    auditPeriod: \`${esc(d.auditPeriod)}\`,
    datePresented: \`${esc(d.datePresented)}\`,

    overview:
      ${overviewParts},
${statsBlock}
    keyFindings: [
${findingLines}
    ],
    recommendations: [
${recLines}
    ],
    state: \`${esc(d.state)}\`,
    stateCode: \`${esc(d.stateCode)}\`,
    level: '${d.level || 'State'}',
    category: '${d.category || 'Compliance Audit'}',
    ministry: \`${esc(d.ministry)}\`,
    severity: '${d.severity || 'medium'}',
    url: '${d.url}',
    fileName: '${esc(fileName)}',
  },`;
}

// ── Audit criteria (score starts 100, -1 per failure) ────────────────────────
function auditData(d) {
  const checks = [
    ['Has id (kebab-case)',       /^[a-z0-9-]{4,80}$/.test(d.id || '')],
    ['Has url on cag.gov.in',    (d.url || '').startsWith('https://cag.gov.in/')],
    ['Has fileName',             (d.fileName || d.url?.split('/').pop() || '').length > 3],
    ['Overview ≥ 300 chars',     (d.overview || '').length >= 300],
    ['≥ 2 keyFindings',          Array.isArray(d.keyFindings) && d.keyFindings.length >= 2],
    ['≥ 1 stat with page > 0',   Array.isArray(d.stats) && d.stats.length > 0 && d.stats.some(s => (s.source?.page || 0) > 0)],
    ['≥ 2 recommendations',      Array.isArray(d.recommendations) && d.recommendations.length >= 2],
    ['Valid severity',            ['high','medium','low'].includes(d.severity)],
    ['Valid category',            ['State Finances','Compliance Audit','Social Schemes','Performance Audit','Revenue & Tax','PSU Audit','Environment & Mining'].includes(d.category)],
    ['Has auditPeriod',          (d.auditPeriod || '').length >= 4],
  ];
  const failures = checks.filter(([,pass]) => !pass).map(([label]) => label);
  return { score: 100 - failures.length, failures };
}

// ── Build set of URLs already in cag-reports.ts ──────────────────────────────
function buildExistingUrls() {
  const src = readFileSync(REPORTS, 'utf-8');
  const urls = new Set();
  for (const m of src.matchAll(/url:\s*'(https:\/\/cag\.gov\.in\/[^']+)'/g)) urls.add(m[1]);
  return urls;
}

// ── Find the ]; line that closes CAG_REPORTS array ───────────────────────────
function findArrayCloseIdx() {
  const lines = readFileSync(REPORTS, 'utf-8').split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '];') {
      for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
        if (lines[j].trim().startsWith('//') || lines[j].trim().startsWith('export')) {
          return i;
        }
      }
    }
  }
  throw new Error('Could not find ];\u00a0closing the CAG_REPORTS array');
}

// ── Download PDF and extract text ────────────────────────────────────────────
function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms)),
  ]);
}

async function fetchPdfText(pdfUrl) {
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 22000);
    let res;
    try {
      res = await withTimeout(
        fetch(pdfUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; GovLensCrawler/1.0)' }, signal: controller.signal }),
        22000,
      );
    } finally { clearTimeout(t); }
    if (!res?.ok) return null;
    const buf = await withTimeout(res.arrayBuffer(), 18000).catch(() => null);
    if (!buf) return null;
    writeFileSync(PDF_TMP, Buffer.from(buf));
    const r = spawnSync('pdftotext', ['-layout', '-f', '1', '-l', '60', PDF_TMP, PDF_TXT], { timeout: 10000 });
    if (r.status !== 0) return null;
    return readFileSync(PDF_TXT, 'utf-8').slice(0, 48000);
  } catch { return null; }
}

// ── Generate JSON data via OpenAI ─────────────────────────────────────────────
async function generateData(report, pdfText) {
  const pdfSection = pdfText
    ? `\n\n<PDF_TEXT>\nFirst 48,000 characters of the actual CAG report PDF:\n${pdfText}\n</PDF_TEXT>`
    : '\n\n(PDF could not be fetched. Use web_search to find and read the report from cag.gov.in.)';

  const prompt = `You are a CAG audit analyst. Return a JSON object (no markdown, no backticks) for this CAG report that will be displayed on a civic transparency website. Match the exact depth and specificity of real CAG audit reports — use real page numbers and verbatim quotes from the PDF.

REPORT METADATA:
title: ${report.title}
reportNo: ${report.reportNo}
year: ${report.year}
state: ${report.state || 'Central'}
stateCode: ${report.stateCode || 'IN'}
type: ${report.type}
level: ${report.level || 'State'}
pdfUrl: ${report.pdfUrl}
${pdfSection}

RETURN exactly this JSON shape (all fields required unless marked optional):
{
  "id": "ka-health-pa-2024",               // kebab-case: stateCode-keyword-typeabbrev-year
  "reportNo": "Report No. X of YYYY",
  "year": 2024,
  "title": "...",
  "auditPeriod": "2019-20 to 2022-23",
  "datePresented": "2024",
  "overview": "Para 1 with specific numbers...\\n\\nPara 2 headline finding...\\n\\nPara 3 consequences...",
  "stats": [                               // 4-8 items; each MUST have a real page number > 0
    {
      "label": "Fund utilisation 2018-23",
      "value": "44-50%",
      "pct": 47,                           // integer 0-100 if value is a %; omit otherwise
      "status": "critical",                // critical|warning|caution|ok
      "note": "Detailed explanation with actual figures from report",
      "source": { "page": 12, "section": "Executive Summary", "quote": "verbatim ≤120 chars" }
    }
  ],
  "keyFindings": [                         // 4-6 items; each MUST have page > 0
    {
      "text": "Specific finding with numbers",
      "source": { "page": 23, "section": "Chapter II §2.3", "quote": "verbatim ≤120 chars" }
    }
  ],
  "recommendations": [                     // 3-5 actionable strings
    "Fix X by doing Y",
    "Ensure Z"
  ],
  "state": "${report.state || 'Central'}",
  "stateCode": "${report.stateCode || 'IN'}",
  "level": "State",                        // Central|State|UT
  "category": "Performance Audit",        // State Finances|Compliance Audit|Social Schemes|Performance Audit|Revenue & Tax|PSU Audit|Environment & Mining
  "ministry": "...",
  "severity": "high",                     // high|medium|low
  "url": "${report.pdfUrl}",
  "fileName": "${report.pdfUrl.split('/').pop()}"
}

QUALITY RULES:
1. overview must be 400+ chars across 3+ paragraphs. Use specific rupee amounts, percentages, counts from the report.
2. Every stat and keyFinding MUST cite a real page number (> 0) and a verbatim quote ≤ 120 chars from that page.
3. severity=high if >30% target miss OR fund misappropriation OR fraud; medium if significant gaps; low if minor.
4. id pattern: lowercase stateCode + '-' + 2-3 keywords from title + '-' + (pa|ca|sf|psu) + '-' + year.
5. url must be exactly: ${report.pdfUrl}

Return ONLY the JSON object. No markdown fences. No explanation.`;

  const resp = await openai.responses.create({
    model: 'gpt-4.1',
    tools: [{ type: 'web_search_preview' }],
    input: prompt,
  });

  const raw = String(resp.output_text ?? '').trim();

  // Strip markdown fences if model disobeyed
  let cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();

  // Find first { to last }
  const start = cleaned.indexOf('{');
  const end   = cleaned.lastIndexOf('}');
  if (start < 0 || end < 0) throw new Error('No JSON object in response');
  cleaned = cleaned.slice(start, end + 1);

  // Fix unquoted Roman numerals in "page": field (model sometimes writes "page": viii)
  cleaned = cleaned.replace(/"page"\s*:\s*([ivxlcdmIVXLCDM]+)\b/g, '"page": 0');

  // Fix unquoted NaN/Infinity/undefined
  cleaned = cleaned.replace(/:\s*(NaN|Infinity|-Infinity|undefined)\b/g, ': null');

  return JSON.parse(cleaned);
}

// ── Insert TS entry into file before the closing ]; ───────────────────────────
function insertEntry(tsEntry) {
  const src   = readFileSync(REPORTS, 'utf-8');
  const lines = src.split('\n');
  const idx   = findArrayCloseIdx();
  lines.splice(idx, 0, tsEntry, '');
  writeFileSync(REPORTS, lines.join('\n'));
}

// ── TypeScript check ──────────────────────────────────────────────────────────
function tscCheck() {
  const r = spawnSync('npx', ['tsc', '--noEmit', '--project', 'tsconfig.json'], {
    cwd: join(ROOT, 'artifacts/govlens'),
    encoding: 'utf-8',
    timeout: 45000,
  });
  return { ok: r.status === 0, output: (r.stdout + r.stderr).slice(0, 600) };
}

// ── Progress tracking ─────────────────────────────────────────────────────────
function loadProgress() {
  if (existsSync(PROG)) return JSON.parse(readFileSync(PROG, 'utf-8'));
  return { done: [], score: 100, added: 0, skipped: 0, consecutivePasses: 0 };
}
function saveProgress(p) {
  writeFileSync(PROG, JSON.stringify(p, null, 2));
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const cat  = JSON.parse(readFileSync(CAT, 'utf-8'));
  let pending = cat.reports.filter(r => r.pdfUrl);

  if (FLAG_TYPE)  pending = pending.filter(r => r.type?.toLowerCase().includes(FLAG_TYPE.toLowerCase()));
  if (FLAG_YEAR)  pending = pending.filter(r => r.year === FLAG_YEAR);
  if (FLAG_STATE) pending = pending.filter(r => r.state?.toLowerCase().includes(FLAG_STATE.toLowerCase()));

  const existingUrls = buildExistingUrls();
  pending = pending.filter(r => !existingUrls.has(r.pdfUrl));

  const TYPE_PRI = { 'Performance Audit': 0, 'Compliance Audit': 1, 'State Finances': 2, 'Local Bodies': 3, 'PSU Audit': 4, 'Revenue & Tax': 5, 'General': 6, 'SSCA': 7 };
  pending.sort((a, b) => (TYPE_PRI[a.type] ?? 9) - (TYPE_PRI[b.type] ?? 9) || (b.year || 0) - (a.year || 0));

  const prog   = loadProgress();
  const doneSet = new Set(prog.done);
  pending = pending.filter(r => !doneSet.has(r.id));

  if (isFinite(FLAG_N)) pending = pending.slice(0, FLAG_N);

  console.log(`\n📋 CAG Report Generator`);
  console.log(`   Pending : ${pending.length} | Existing : ${existingUrls.size}`);
  console.log(`   Score   : ${prog.score}/100 | Added so far : ${prog.added} | Streak : ${prog.consecutivePasses}`);
  if (FLAG_TYPE)  console.log(`   Type  : ${FLAG_TYPE}`);
  if (FLAG_YEAR)  console.log(`   Year  : ${FLAG_YEAR}`);
  if (FLAG_STATE) console.log(`   State : ${FLAG_STATE}`);
  console.log();

  if (prog.score < 95) {
    console.error(`❌  Audit score ${prog.score} < 95. Fix quality issues before continuing.`);
    process.exit(1);
  }

  copyFileSync(REPORTS, BACKUP);
  console.log(`✅  Backed up → ${BACKUP}\n`);

  for (let i = 0; i < pending.length; i++) {
    const report = pending[i];

    if (prog.score < 95) {
      console.error(`\n🛑  Score dropped to ${prog.score} — stopping.`);
      break;
    }

    console.log(`\n[${i+1}/${pending.length}] ${report.year} | ${report.state || 'Central'} | ${report.type}`);
    console.log(`   ${report.title.slice(0, 88)}${report.title.length > 88 ? '…' : ''}`);

    // Dedup check
    if (buildExistingUrls().has(report.pdfUrl)) {
      console.log(`   ↩  Already in file — skipping`);
      prog.done.push(report.id); prog.skipped++; saveProgress(prog); continue;
    }

    // Fetch PDF
    process.stdout.write(`   📄 Fetching PDF... `);
    const pdfText = await fetchPdfText(report.pdfUrl);
    console.log(pdfText ? `${pdfText.length.toLocaleString()} chars` : 'failed (web search fallback)');

    // Generate JSON data
    process.stdout.write(`   🤖 Generating...   `);
    let data;
    try {
      data = await generateData(report, pdfText);
      // Ensure critical fields are always correct
      data.url       = report.pdfUrl;
      data.fileName  = data.fileName || report.pdfUrl.split('/').pop();
      data.state     = data.state     || report.state     || 'Central';
      data.stateCode = data.stateCode || report.stateCode || 'IN';
      data.year      = data.year      || report.year;
      console.log(`JSON ok (${JSON.stringify(data).length} chars)`);
    } catch (err) {
      console.log(`FAILED: ${err.message?.slice(0, 100)}`);
      prog.score--; prog.consecutivePasses = 0;
      prog.done.push(report.id); prog.skipped++;
      saveProgress(prog); continue;
    }

    // Audit the JSON data
    const { score: auditScore, failures } = auditData(data);
    const lost = 100 - auditScore;
    if (failures.length) {
      console.log(`   ⚠  Audit −${lost}: ${failures.join(', ')}`);
      prog.score -= lost;
      prog.consecutivePasses = 0;
      if (prog.score < 95) {
        prog.done.push(report.id); saveProgress(prog);
        console.error(`\n🛑  Score dropped to ${prog.score} — stopping.`); break;
      }
    }

    // Serialize to TypeScript
    const tsEntry = serializeToTS(data);

    // Snapshot BEFORE insert so TSC failure reverts only this single entry
    const preInsertSrc = readFileSync(REPORTS, 'utf-8');

    // Insert into file
    try {
      insertEntry(tsEntry);
    } catch (err) {
      console.log(`   ✗ Insert error: ${err.message?.slice(0, 80)}`);
      prog.score--; prog.consecutivePasses = 0;
      prog.done.push(report.id); saveProgress(prog); continue;
    }

    // Full TSC check every TSC_EVERY successfully-added entries
    prog.added++;
    if (prog.added % TSC_EVERY === 0) {
      process.stdout.write(`   🔍 tsc (every ${TSC_EVERY})... `);
      const tsc = tscCheck();
      if (!tsc.ok) {
        console.log(`FAILED — reverting this entry\n   ${tsc.output.slice(0, 250)}`);
        writeFileSync(REPORTS, preInsertSrc); // revert only this one entry
        prog.added--;
        prog.score--; prog.consecutivePasses = 0;
        prog.done.push(report.id); prog.skipped++;
        saveProgress(prog); continue;
      }
      console.log(`OK`);
    }

    // Mark done + streak bonus
    prog.done.push(report.id);
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

    // Mark isDetailed in catalogue (batch-save every 10 to avoid hammering disk)
    if (prog.added % 10 === 0) {
      const catData = JSON.parse(readFileSync(CAT, 'utf-8'));
      for (const id of prog.done) {
        const e = catData.reports.find(r => r.id === id);
        if (e) e.isDetailed = true;
      }
      catData.meta.detailedCount = catData.reports.filter(r => r.isDetailed).length;
      writeFileSync(CAT, JSON.stringify(catData, null, 2));
    }

    console.log(`   ✓ Added | score ${prog.score} | streak ${prog.consecutivePasses} | total ${buildExistingUrls().size}`);
  }

  // Final TSC if we haven't just done one
  if (prog.added % TSC_EVERY !== 0 && prog.added > 0) {
    process.stdout.write(`\n🔍 Final tsc check... `);
    const tsc = tscCheck();
    console.log(tsc.ok ? 'OK ✅' : `FAILED ❌\n${tsc.output.slice(0,300)}`);
  }

  console.log(`\n━━━ Session complete ━━━`);
  console.log(`   Added   : ${prog.added}`);
  console.log(`   Skipped : ${prog.skipped}`);
  console.log(`   Score   : ${prog.score}/100`);
  console.log(`   Total in file : ${buildExistingUrls().size}`);
}

main().catch(err => { console.error(err); process.exit(1); });
