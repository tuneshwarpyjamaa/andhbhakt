/**
 * Rebuilds scheme-detail-hi.json using normalized headline/parameter as keys
 * instead of database auto-increment IDs (which differ between dev and prod).
 *
 * Key format: first 120 chars of headline/parameter, lowercased, whitespace-normalized.
 * This is stable across any environment with the same source data.
 *
 * Run: node scripts/remap-to-content-keys.mjs
 */

import pg from 'pg';
import fs from 'fs';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const HI_FILE = 'artifacts/govlens/src/data/scheme-detail-hi.json';

function contentKey(text) {
  if (!text) return '';
  return text.trim().toLowerCase().replace(/\s+/g, ' ').slice(0, 120);
}

async function main() {
  const sdHi = JSON.parse(fs.readFileSync(HI_FILE, 'utf8'));

  const pibIds = Object.keys(sdHi.pibMap).map(Number);
  const cagIds = Object.keys(sdHi.cagMap).map(Number);

  // Fetch headlines/parameters for the current dev-ID-keyed entries
  const { rows: pibRows } = await pool.query(
    `SELECT id, headline FROM pib_entries WHERE id = ANY($1::int[])`,
    [pibIds]
  );
  const { rows: cagRows } = await pool.query(
    `SELECT id, parameter FROM cag_audits WHERE id = ANY($1::int[])`,
    [cagIds]
  );

  console.log(`Fetched ${pibRows.length} PIB headlines, ${cagRows.length} CAG parameters from dev DB`);

  // Build id→contentKey maps
  const pibIdToKey = {};
  for (const r of pibRows) pibIdToKey[r.id] = contentKey(r.headline);
  const cagIdToKey = {};
  for (const r of cagRows) cagIdToKey[r.id] = contentKey(r.parameter);

  // Rebuild maps with content-based keys
  let pibOk = 0, pibSkipped = 0;
  const newPibMap = {};
  for (const [id, trans] of Object.entries(sdHi.pibMap)) {
    const key = pibIdToKey[id];
    if (key) { newPibMap[key] = trans; pibOk++; }
    else pibSkipped++;
  }

  let cagOk = 0, cagSkipped = 0;
  const newCagMap = {};
  for (const [id, trans] of Object.entries(sdHi.cagMap)) {
    const key = cagIdToKey[id];
    if (key) { newCagMap[key] = trans; cagOk++; }
    else cagSkipped++;
  }

  console.log(`PIB: ${pibOk} remapped, ${pibSkipped} skipped (no headline found)`);
  console.log(`CAG: ${cagOk} remapped, ${cagSkipped} skipped (no parameter found)`);

  const updated = { ...sdHi, pibMap: newPibMap, cagMap: newCagMap };
  fs.writeFileSync(HI_FILE, JSON.stringify(updated, null, 2));
  console.log(`✅ Written ${HI_FILE} with content-based keys`);

  await pool.end();
}

main().catch(console.error);
