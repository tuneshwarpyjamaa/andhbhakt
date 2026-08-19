import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const line = readFileSync(join(root, '.env'), 'utf8').split(/\r?\n/).find((l) => l.startsWith('DATABASE_URL='));
const url = line.slice('DATABASE_URL='.length);

const client = new pg.Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
});
await client.connect();
const info = await client.query('select current_database() as db, current_user as usr');
console.log(info.rows[0]);
const tables = await client.query(
  "select table_name from information_schema.tables where table_schema = 'public' order by 1",
);
console.log('tables', tables.rows.map((r) => r.table_name));
try {
  const n = await client.query(`
    select
      (select count(*)::int from categories) as categories,
      (select count(*)::int from schemes) as schemes,
      (select count(*)::int from pib_entries) as pib_entries,
      (select count(*)::int from cag_audits) as cag_audits,
      (select count(*)::int from cag_state_reports) as cag_state_reports
  `);
  console.log('counts', n.rows[0]);
} catch (err) {
  console.log('count error', err.message);
}
await client.end();
console.log('ok');
