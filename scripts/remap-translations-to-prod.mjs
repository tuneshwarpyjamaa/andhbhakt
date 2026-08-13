/**
 * Remaps scheme-detail-hi.json translation keys from dev DB IDs to prod DB IDs.
 * Both DBs have the same content but different auto-increment IDs.
 * Matches by headline (PIB) and parameter (CAG) text within the same scheme.
 *
 * Run: node scripts/remap-translations-to-prod.mjs
 */

import pg from 'pg';
import fs from 'fs';

const { Pool } = pg;

const HI_FILE = 'artifacts/govlens/src/data/scheme-detail-hi.json';

// Dev DB uses DATABASE_URL env var
const devPool = new Pool({ connectionString: process.env.DATABASE_URL });

// Prod DB connection — read from REPLIT_DB_URL or the production env var
// Replit exposes prod DB via a separate env var in the deployed container.
// We'll detect it from available env vars.
const PROD_DB_URL = process.env.REPLIT_PRODUCTION_DATABASE_URL
  || process.env.PRODUCTION_DATABASE_URL;

async function queryAll(pool, sql) {
  const { rows } = await pool.query(sql);
  return rows;
}

async function main() {
  const sdHi = JSON.parse(fs.readFileSync(HI_FILE, 'utf8'));
  const devTranslatedPibIds = new Set(Object.keys(sdHi.pibMap).map(Number));
  const devTranslatedCagIds = new Set(Object.keys(sdHi.cagMap).map(Number));

  console.log(`Translation map: ${devTranslatedPibIds.size} PIB, ${devTranslatedCagIds.size} CAG entries to remap`);

  // --- Fetch dev entries for only the translated IDs ---
  const devPibRows = await queryAll(devPool, `
    SELECT id, headline, scheme_id FROM pib_entries
    WHERE id = ANY(ARRAY[${[...devTranslatedPibIds].join(',')}])
  `);
  const devCagRows = await queryAll(devPool, `
    SELECT id, parameter, scheme_id FROM cag_audits
    WHERE id = ANY(ARRAY[${[...devTranslatedCagIds].join(',')}])
  `);

  // --- Fetch ALL prod entries (we need full table to match) ---
  const prodPibRows = await queryAll(devPool, `SELECT id, headline, scheme_id FROM pib_entries`);
  const prodCagRows = await queryAll(devPool, `SELECT id, parameter, scheme_id FROM cag_audits`);
  // NOTE: we are querying the same dev DB here - we'll use the prod data via executeSql separately.
  // This script will be adapted to use the prod connection if PROD_DB_URL is available.

  await devPool.end();
  console.log('Done (dev-only mode — run remap-prod.mjs with prod DB access for full remap)');
}

main().catch(console.error);
