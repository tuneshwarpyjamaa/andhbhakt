#!/usr/bin/env node
/**
 * CAG Report Catalogue Crawler
 * Scrapes all ~1,376 reports from cag.gov.in/en/audit-report (pages 0-275)
 * Output: scripts/data/cag-catalogue.json
 *
 * Usage:
 *   node scripts/crawl-cag-catalogue.mjs           # listing pages only (~3 min)
 *   node scripts/crawl-cag-catalogue.mjs --enrich  # also fetch detail pages for PDF URLs (~20 min)
 */

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dir, 'data/cag-catalogue.json');
const EXISTING_DATA = join(__dir, '../artifacts/govlens/src/data/cag-reports.ts');

const BASE = 'https://cag.gov.in';
const CONCURRENCY = 10;
const ENRICH = process.argv.includes('--enrich');

// ── State name → stateCode ────────────────────────────────────────────────────
const STATE_MAP = {
  'Andhra Pradesh': 'AP', 'Arunachal Pradesh': 'AR', 'Assam': 'AS',
  'Bihar': 'BR', 'Chhattisgarh': 'CG', 'Goa': 'GA', 'Gujarat': 'GJ',
  'Haryana': 'HR', 'Himachal Pradesh': 'HP', 'Jharkhand': 'JH',
  'Karnataka': 'KA', 'Kerala': 'KL', 'Madhya Pradesh': 'MP',
  'Maharashtra': 'MH', 'Manipur': 'MN', 'Meghalaya': 'ML',
  'Mizoram': 'MZ', 'Nagaland': 'NL', 'Odisha': 'OD', 'Punjab': 'PB',
  'Rajasthan': 'RJ', 'Sikkim': 'SK', 'Tamil Nadu': 'TN', 'Telangana': 'TS',
  'Tripura': 'TR', 'Uttar Pradesh': 'UP', 'Uttarakhand': 'UK',
  'West Bengal': 'WB', 'Delhi': 'DL', 'Jammu and Kashmir': 'JK',
  'Jammu & Kashmir': 'JK', 'Ladakh': 'LA', 'Puducherry': 'PY',
  'Puduchery': 'PY', 'Chandigarh': 'CH', 'Andaman': 'AN',
  'Lakshadweep': 'LD', 'Dadra': 'DN', 'Daman': 'DD',
};

// ── Inference helpers ─────────────────────────────────────────────────────────
function inferType(title, sector) {
  const t = title.toLowerCase();
  const s = (sector || '').toLowerCase();

  if (t.includes('state finances') || t.includes('state finance') ||
      s.includes('finance')) return 'State Finances';
  if (t.includes('subject specific compliance') || t.includes('ssca')) return 'SSCA';
  if (t.includes('performance audit') || t.match(/\bpa\b.*audit/)) return 'Performance Audit';
  if (t.includes('state public sector') || t.includes('public sector enterprise') ||
      t.includes(' psu') || t.includes('pses')) return 'PSU Audit';
  if (t.includes('compliance audit') || t.includes('compliance audit')) return 'Compliance Audit';
  if (t.includes('local bodies') || t.includes('local body') ||
      t.includes('panchayati raj') || t.includes('urban local') ||
      s.includes('local bodies')) return 'Local Bodies';
  if (t.includes('revenue receipts') || t.includes('indirect tax') ||
      t.includes('direct tax') || t.includes('customs') ||
      t.includes(' gst') || t.includes('income tax') || t.includes('excise') ||
      s.includes('revenue')) return 'Revenue & Tax';
  // Generic compliance/general audit reports
  if (t.match(/report no\.\s*\d+ of \d{4}/i) && !t.includes('performance')) return 'Compliance Audit';
  return 'General';
}

function inferState(title) {
  for (const [state] of Object.entries(STATE_MAP)) {
    if (title.includes(state)) return state;
  }
  if (/union government|government of india/i.test(title)) return 'Central';
  return null;
}

function inferLevel(title, state) {
  if (!state || state === 'Central') {
    if (/union government|government of india|ministry of|union territory/i.test(title))
      return 'Central';
  }
  if (state && state !== 'Central') return 'State';
  return null;
}

function parseReportNo(title) {
  const m = title.match(/Report\s+No[.:]?\s*(\d+)\s+of\s+(\d{4})/i)
    || title.match(/\bNo[.:]?\s*(\d+)\s+of\s+(?:the\s+year\s+)?(\d{4})/i)
    || title.match(/\(Report\s+(\d+)\s+of\s+(\d{4})\)/i);
  if (m) return { no: parseInt(m[1], 10), year: parseInt(m[2], 10), text: `${m[1]} of ${m[2]}` };
  // Try "year 2025" or "for the year ended March 2025"
  const yearOnly = title.match(/(?:year|ended|ending)\s+(?:March\s+)?(\d{4})/i)
    || title.match(/\b(20[12]\d)\b/);
  if (yearOnly) return { no: null, year: parseInt(yearOnly[1], 10), text: null };
  return null;
}

// ── HTML parsing ──────────────────────────────────────────────────────────────
const HINDI_RE = /[\u0900-\u097F\u0980-\u09FF\u0B00-\u0B7F\u0C00-\u0C7F]/;

function extractReportsFromPage(html) {
  const reports = [];
  // Find all <a href="/en/audit-report/details/ID"> tags anywhere in the page
  // Then back-locate them in the nearest reportDetail block
  const blockRe = /<div\s+class="reportDetail">([\s\S]*?)(?=<div\s+class="reportDetail">|<\/div>\s*<\/div>\s*<\/div>)/g;
  let m;
  while ((m = blockRe.exec(html)) !== null) {
    const block = m[1];
    const linkM = block.match(/href="\/en\/audit-report\/details\/(\d+)"[^>]*>([\s\S]*?)<\/a>/);
    if (!linkM) continue;
    const id = parseInt(linkM[1], 10);
    const rawTitle = linkM[2].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
    if (HINDI_RE.test(rawTitle)) continue; // skip non-English
    if (rawTitle.length < 10) continue;

    // Extract sector from <div class="sectorDetail">
    const sectorM = block.match(/class="sectorDetail"[\s\S]*?<\/div>\s*<div[^>]*>([\s\S]*?)<\/div>/);
    const sector = sectorM
      ? sectorM[1].replace(/<[^>]+>/g, '').replace(/\|/g, ',').replace(/\s+/g, ' ').trim()
      : null;

    reports.push({ id, title: rawTitle, sector: sector || null });
  }

  // Fallback: simpler link extraction (catches any missed by the block regex)
  const linkRe = /href="\/en\/audit-report\/details\/(\d+)"[^>]*>([\s\S]*?)<\/a>/g;
  const seenIds = new Set(reports.map(r => r.id));
  let lm;
  while ((lm = linkRe.exec(html)) !== null) {
    const id = parseInt(lm[1], 10);
    if (seenIds.has(id)) continue;
    const rawTitle = lm[2].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
    if (HINDI_RE.test(rawTitle)) continue;
    if (rawTitle.length < 10) continue;
    seenIds.add(id);
    reports.push({ id, title: rawTitle, sector: null });
  }
  return reports;
}

function extractDetailMeta(html) {
  // PDF URL — prefer English, non-Hindi PDF
  const pdfRe = /href="(https:\/\/cag\.gov\.in\/uploads\/download_audit_report\/[^"]+\.pdf)"/g;
  let pm; const pdfs = [];
  while ((pm = pdfRe.exec(html)) !== null) pdfs.push(pm[1]);
  // Pick the English one (not Hindi/regional) — shorter filename or contains "English" or "_Eng"
  const pdfUrl = pdfs.find(p => /[Ee]ng|[Ee]nglish|_E_|PDF-A/i.test(p)) || pdfs[0] || null;

  // Government type
  const govM = html.match(/Government Type[\s\S]{0,200}?<\/div>\s*<div[^>]*>\s*([^<]{3,60})\s*<\/div>/);
  const govType = govM ? govM[1].trim() : null;

  // Date tabled
  const dateM = html.match(/Date on which Report Tabled[\s\S]{0,100}?([A-Z][a-z]+ \d{1,2},?\s*\d{4})/);
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

async function fetchHtml(url, retries = 3) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; GovLensCrawler/1.0; +https://andhbhakt.org)' },
        signal: AbortSignal.timeout(15000),
      });
      if (res.ok) return await res.text();
      if (res.status === 404) return null;
    } catch { /* retry */ }
    if (attempt < retries) await new Promise(r => setTimeout(r, 800 * (attempt + 1)));
  }
  return null;
}

// ── Load already-detailed report URLs from cag-reports.ts ────────────────────
function loadDetailedUrls() {
  if (!existsSync(EXISTING_DATA)) return new Set();
  const src = readFileSync(EXISTING_DATA, 'utf-8');
  const urls = new Set();
  for (const m of src.matchAll(/url:\s*'(https:\/\/cag\.gov\.in\/[^']+)'/g)) urls.add(m[1]);
  return urls;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('📚 CAG Catalogue Crawler starting...\n');

  // Step 1: Detect total pages
  console.log('Step 1: Detecting page count...');
  const firstHtml = await fetchHtml(`${BASE}/en/audit-report`);
  if (!firstHtml) throw new Error('Could not fetch listing page');

  const pageNums = [...firstHtml.matchAll(/[?&]page=(\d+)/g)].map(m => parseInt(m[1], 10));
  const maxPage = pageNums.length ? Math.max(...pageNums) : 275;
  const totalPages = maxPage + 1; // pages 0..maxPage
  console.log(`  Max page param: ${maxPage} → ${totalPages} total pages\n`);

  // Step 2: Build page URL list (page 0 = base URL, pages 1-N use ?page=N)
  const pageUrls = Array.from({ length: totalPages }, (_, i) =>
    i === 0 ? `${BASE}/en/audit-report` : `${BASE}/en/audit-report?page=${i}`
  );

  // Step 3: Crawl all listing pages concurrently
  console.log(`Step 2: Crawling ${totalPages} listing pages (concurrency=${CONCURRENCY})...`);
  const allRaw = [];
  let pagesDone = 0;

  await pool(pageUrls, CONCURRENCY, async (url) => {
    const html = await fetchHtml(url);
    if (html) {
      const reports = extractReportsFromPage(html);
      allRaw.push(...reports);
    }
    pagesDone++;
    if (pagesDone % 20 === 0 || pagesDone === totalPages) {
      process.stdout.write(`\r  Pages: ${pagesDone}/${totalPages}  Reports found: ${allRaw.length}   `);
    }
  });
  console.log(`\n  ✅ Listing crawl done. Raw entries: ${allRaw.length}`);

  // Step 4: Deduplicate by ID (keep first occurrence = most recent listing context)
  const seen = new Set();
  const unique = allRaw.filter(r => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });
  console.log(`  🔢 Unique report IDs: ${unique.length}\n`);

  // Step 5: Parse metadata from title + sector
  const catalogue = unique.map(({ id, title, sector }) => {
    const parsed = parseReportNo(title);
    const state = inferState(title);
    const level = inferLevel(title, state);
    const stateCode = state && state !== 'Central' ? STATE_MAP[state] || null : (level === 'Central' ? 'IN' : null);
    const type = inferType(title, sector);
    return {
      id,
      title,
      reportNo:     parsed?.text    ?? null,
      reportNoInt:  parsed?.no      ?? null,
      year:         parsed?.year    ?? null,
      state:        state ?? null,
      stateCode:    stateCode ?? null,
      level:        level ?? null,
      type,
      sector:       sector ?? null,
      detailUrl:    `${BASE}/en/audit-report/details/${id}`,
      pdfUrl:       null,
      govType:      null,
      dateTabled:   null,
      isDetailed:   false,
    };
  });

  // Sort by year desc, then id desc
  catalogue.sort((a, b) => (b.year ?? 0) - (a.year ?? 0) || b.id - a.id);

  // Step 6: Mark already-detailed entries
  const detailedUrls = loadDetailedUrls();
  // Also mark by matching catalogue IDs against known detail page IDs we've used
  // (for entries that don't yet have pdfUrl enriched, we use rough title matching)
  let markedCount = 0;
  for (const row of catalogue) {
    if (row.pdfUrl && detailedUrls.has(row.pdfUrl)) {
      row.isDetailed = true;
      markedCount++;
    }
  }
  console.log(`  🏷  Already detailed: ${markedCount} (PDF URL match; will increase after --enrich)\n`);

  // Step 7 (optional): Enrich with detail page data
  if (ENRICH) {
    console.log(`Step 3: Enriching ${catalogue.length} entries with detail page data...`);
    let enrichDone = 0;
    await pool(catalogue, 12, async (row) => {
      const html = await fetchHtml(row.detailUrl);
      if (html) {
        const meta = extractDetailMeta(html);
        Object.assign(row, meta);
        if (meta.pdfUrl && detailedUrls.has(meta.pdfUrl)) row.isDetailed = true;
      }
      enrichDone++;
      if (enrichDone % 50 === 0 || enrichDone === catalogue.length)
        process.stdout.write(`\r  Detail pages: ${enrichDone}/${catalogue.length}   `);
    });
    markedCount = catalogue.filter(r => r.isDetailed).length;
    console.log(`\n  ✅ Enrichment done. Detailed: ${markedCount}`);
  }

  // Step 8: Write output
  const output = {
    meta: {
      crawledAt:     new Date().toISOString(),
      totalReports:  catalogue.length,
      enriched:      ENRICH,
      detailedCount: catalogue.filter(r => r.isDetailed).length,
    },
    reports: catalogue,
  };
  writeFileSync(OUT, JSON.stringify(output, null, 2));

  // Summary
  const byType  = {};
  const byYear  = {};
  const byLevel = {};
  for (const r of catalogue) {
    byType[r.type]   = (byType[r.type]   || 0) + 1;
    byLevel[r.level || 'Unknown'] = (byLevel[r.level || 'Unknown'] || 0) + 1;
    if (r.year) byYear[r.year] = (byYear[r.year] || 0) + 1;
  }
  const topYears = Object.entries(byYear).sort((a, b) => +b[0] - +a[0]).slice(0, 8);

  console.log(`\n📊 Catalogue Summary`);
  console.log(`  Total entries:     ${catalogue.length}`);
  console.log(`  Already detailed:  ${output.meta.detailedCount}`);
  console.log(`  Remaining:         ${catalogue.length - output.meta.detailedCount}`);
  console.log(`  By level:`, byLevel);
  console.log(`  By type:`, byType);
  console.log(`  By year (recent):`, Object.fromEntries(topYears));
  console.log(`\n✅ Written → ${OUT}`);
}

main().catch(e => { console.error(e); process.exit(1); });
