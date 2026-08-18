#!/usr/bin/env node
/**
 * Query the CAG catalogue for the next reports to detail.
 * Usage:
 *   node scripts/next-to-detail.mjs                      # top 20 State PA/CA from 2024+
 *   node scripts/next-to-detail.mjs --year 2025          # filter by year
 *   node scripts/next-to-detail.mjs --state "Kerala"     # filter by state
 *   node scripts/next-to-detail.mjs --type "Performance Audit"
 *   node scripts/next-to-detail.mjs --central            # Central govt reports only
 *   node scripts/next-to-detail.mjs --n 50               # show 50 results
 *   node scripts/next-to-detail.mjs --stats              # show catalogue stats only
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const CATALOGUE = join(__dir, 'data/cag-catalogue.json');

const args = process.argv.slice(2);
const getArg = (flag) => { const i = args.indexOf(flag); return i >= 0 ? args[i+1] : null; };
const hasFlag = (flag) => args.includes(flag);

const data = JSON.parse(readFileSync(CATALOGUE, 'utf-8'));
const reports = data.reports;

if (hasFlag('--stats')) {
  const byType={}, byYear={}, byLevel={};
  reports.forEach(r => {
    byType[r.type] = (byType[r.type]||0)+1;
    if (r.year) byYear[r.year] = (byYear[r.year]||0)+1;
    byLevel[r.level||'Unknown'] = (byLevel[r.level||'Unknown']||0)+1;
  });
  console.log('=== CAG CATALOGUE STATS ===');
  console.log(`Total:         ${reports.length}`);
  console.log(`With PDF URL:  ${reports.filter(r=>r.pdfUrl).length}`);
  console.log(`Already detailed: ${reports.filter(r=>r.isDetailed).length}`);
  console.log(`Remaining:     ${reports.filter(r=>!r.isDetailed && r.pdfUrl).length}`);
  console.log('\nBy type:');
  Object.entries(byType).sort((a,b)=>b[1]-a[1]).forEach(([k,v])=>console.log(`  ${k.padEnd(22)}: ${v}`));
  console.log('\nBy level:', byLevel);
  console.log('\nBy year (2015+):');
  Object.entries(byYear).filter(([y])=>+y>=2015).sort((a,b)=>+b[0]-+a[0])
    .forEach(([y,c])=>console.log(`  ${y}: ${c}`));
  process.exit(0);
}

// Build filter
let filtered = reports.filter(r => !r.isDetailed && r.pdfUrl);

const year  = getArg('--year');
const state = getArg('--state');
const type  = getArg('--type');
const n     = parseInt(getArg('--n') || '20', 10);

if (year)  filtered = filtered.filter(r => String(r.year) === year);
if (state) filtered = filtered.filter(r => r.state?.toLowerCase().includes(state.toLowerCase()));
if (type)  filtered = filtered.filter(r => r.type?.toLowerCase().includes(type.toLowerCase()));
if (hasFlag('--central')) filtered = filtered.filter(r => r.level === 'Central');
else if (!state && !hasFlag('--central')) {
  // Default: State-level PA/CA, 2024+ first
  filtered = filtered.filter(r => r.level === 'State' &&
    (r.type === 'Performance Audit' || r.type === 'Compliance Audit'));
  if (!year) filtered = filtered.filter(r => r.year && r.year >= 2020);
}

// Sort: year desc, id desc
filtered.sort((a, b) => (b.year??0)-(a.year??0) || b.id-a.id);

console.log(`\n=== NEXT TO DETAIL (${filtered.length} matches, showing ${Math.min(n, filtered.length)}) ===\n`);
filtered.slice(0, n).forEach((r, i) => {
  console.log(`${String(i+1).padStart(2)}. [ID ${r.id}] ${r.year ?? '?'} | ${r.state ?? '?'} | ${r.type}`);
  console.log(`    ${r.title.slice(0, 90)}${r.title.length>90?'…':''}`);
  console.log(`    PDF: ${r.pdfUrl}`);
  console.log();
});
