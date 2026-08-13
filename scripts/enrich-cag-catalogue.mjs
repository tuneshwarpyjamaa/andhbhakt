#!/usr/bin/env node
/**
 * Incremental enrichment for cag-catalogue.json
 * Fetches detail page metadata (PDF URL, govType, dateTabled) for entries that don't have it yet.
 * Saves progress every SAVE_EVERY entries — safe to kill and resume.
 *
 * Usage:
 *   node scripts/enrich-cag-catalogue.mjs           # enrich all missing
 *   node scripts/enrich-cag-catalogue.mjs --recent  # only 2018-present
 */

import { writeFileSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const CATALOGUE = join(__dir, '../artifacts/govlens/src/data/cag-catalogue.json');
const EXISTING  = join(__dir, '../artifacts/govlens/src/data/cag-reports.ts');

const CONCURRENCY = 12;
const SAVE_EVERY  = 100;
const RECENT_ONLY = process.argv.includes('--recent');
const RECENT_CUTOFF = 2018;

// ── HTML parsers ──────────────────────────────────────────────────────────────
function extractDetailMeta(html) {
  // PDF URLs — collect all, prefer English
  const pdfRe = /href="(https:\/\/cag\.gov\.in\/uploads\/download_audit_report\/[^"]+\.pdf)"/g;
  let pm; const pdfs = [];
  while ((pm = pdfRe.exec(html)) !== null) pdfs.push(pm[1]);
  const pdfUrl = pdfs.find(p => /[Ee]ng|[Ee]nglish|_E_|PDF-A/i.test(p)) || pdfs[0] || null;

  // Government type label
  const govM = html.match(/Government Type[\s\S]{0,300}?<\/div>\s*<div[^>]*>\s*([^<\n]{2,60})\s*<\/div>/);
  const govType = govM ? govM[1].trim() : null;

  // Date tabled
  const dateM = html.match(/Date on which Report Tabled[\s\S]{0,200}?([A-Z][a-z]+ \d{1,2},?\s*\d{4})/);
  const dateTabled = dateM ? dateM[1].trim() : null;

  return { pdfUrl, govType, dateTabled };
}

// ── Concurrency pool ──────────────────────────────────────────────────────────
async function pool(tasks, limit, fn) {
  const results = new Array(tasks.length).fill(null);
  let idx = 0;
  async function worker() {
    while (idx < tasks.length) {
      const i = idx++;
      try { results[i] = await fn(tasks[i], i); } catch { /* null */ }
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker));
  return results;
}

async function fetchHtml(url, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; GovLensCrawler/1.0)' },
        signal: AbortSignal.timeout(12000),
      });
      if (res.ok) return await res.text();
      if (res.status === 404) return null;
    } catch { /* retry */ }
    if (attempt < retries) await new Promise(r => setTimeout(r, 600 * (attempt + 1)));
  }
  return null;
}

// ── Cross-reference: mark existing detailed entries by report no + state ─────
function buildDetailedSet() {
  const src = readFileSync(EXISTING, 'utf-8');
  // Extract pdfUrls from cag-reports.ts
  const urls = new Set();
  for (const m of src.matchAll(/url:\s*'(https:\/\/cag\.gov\.in\/[^']+)'/g)) urls.add(m[1]);
  return urls;
}

function save(data) {
  writeFileSync(CATALOGUE, JSON.stringify(data, null, 2));
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const data = JSON.parse(readFileSync(CATALOGUE, 'utf-8'));
  const reports = data.reports;

  // Filter to entries that still need enrichment
  let toEnrich = reports.filter(r => !r.pdfUrl);
  if (RECENT_ONLY) toEnrich = toEnrich.filter(r => !r.year || r.year >= RECENT_CUTOFF);

  console.log(`📋 Catalogue: ${reports.length} total | ${toEnrich.length} need enrichment${RECENT_ONLY ? ` (≥${RECENT_CUTOFF} only)` : ''}`);

  if (toEnrich.length === 0) {
    console.log('✅ Nothing to enrich.');
    return;
  }

  // Build index for quick lookup
  const byId = Object.fromEntries(reports.map(r => [r.id, r]));
  const detailedUrls = buildDetailedSet();

  let done = 0;
  let savedAt = 0;

  // Process in batches of SAVE_EVERY
  for (let start = 0; start < toEnrich.length; start += SAVE_EVERY) {
    const batch = toEnrich.slice(start, start + SAVE_EVERY);

    await pool(batch, CONCURRENCY, async (row) => {
      const html = await fetchHtml(row.detailUrl);
      if (html) {
        const meta = extractDetailMeta(html);
        // Update the row in-place (byId lookup)
        const entry = byId[row.id];
        if (entry) {
          if (meta.pdfUrl)    entry.pdfUrl    = meta.pdfUrl;
          if (meta.govType)   entry.govType   = meta.govType;
          if (meta.dateTabled) entry.dateTabled = meta.dateTabled;
          if (meta.pdfUrl && detailedUrls.has(meta.pdfUrl)) entry.isDetailed = true;
          // Also infer level from govType
          if (!entry.level || entry.level === 'Unknown') {
            if (meta.govType?.toLowerCase().includes('central')) entry.level = 'Central';
            else if (meta.govType?.toLowerCase().includes('state')) entry.level = 'State';
          }
        }
      }
    });

    done += batch.length;
    // Save progress
    data.meta.enrichedAt = new Date().toISOString();
    data.meta.detailedCount = reports.filter(r => r.isDetailed).length;
    save(data);
    savedAt = done;
    process.stdout.write(`\r  Enriched: ${done}/${toEnrich.length} | Detailed: ${data.meta.detailedCount} | Saved ✓   `);
  }

  // Final summary
  const withPdf = reports.filter(r => r.pdfUrl).length;
  const detailed = reports.filter(r => r.isDetailed).length;
  const byLevel  = {};
  reports.forEach(r => { byLevel[r.level||'Unknown'] = (byLevel[r.level||'Unknown']||0)+1; });

  console.log(`\n\n✅ Enrichment complete`);
  console.log(`   Total:         ${reports.length}`);
  console.log(`   With PDF URL:  ${withPdf}`);
  console.log(`   isDetailed:    ${detailed}`);
  console.log(`   By level:      `, byLevel);
  console.log(`   Written →      ${CATALOGUE}`);
}

main().catch(e => { console.error(e); process.exit(1); });
