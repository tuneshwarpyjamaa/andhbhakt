#!/usr/bin/env node
/**
 * Remove civic documents published by publish-civic-content.mjs.
 * Does not touch CAG reports, state facts, or other content_documents.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

function loadDotEnv() {
  const envPath = join(ROOT, '.env');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadDotEnv();
const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL not set');

const kinds = [
  'ministers-index',
  'ministers-index-hi',
  'minister',
  'minister-hi',
  'manifesto',
  'manifesto-hi',
  'indicators',
  'indicators-hi',
  'funding',
];

const local = /localhost|127\.0\.0\.1/.test(url);
const pool = new pg.Pool({
  connectionString: url,
  ssl: local ? false : { rejectUnauthorized: false },
});

const before = await pool.query(
  'SELECT kind, count(*)::int AS n FROM content_documents GROUP BY kind ORDER BY kind',
);
console.log('before:');
for (const row of before.rows) console.log(`  ${row.kind}\t${row.n}`);

const del = await pool.query(
  `DELETE FROM content_documents
   WHERE source_path LIKE 'scripts/data/civic/%'
      OR kind = ANY($1::text[])
   RETURNING key`,
  [kinds],
);
console.log(`deleted ${del.rowCount} civic documents`);

const after = await pool.query(
  'SELECT kind, count(*)::int AS n FROM content_documents GROUP BY kind ORDER BY kind',
);
console.log('after:');
for (const row of after.rows) console.log(`  ${row.kind}\t${row.n}`);

await pool.end();
