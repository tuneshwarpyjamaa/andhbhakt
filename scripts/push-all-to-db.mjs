#!/usr/bin/env node
/**
 * Push every local data file + relational seed into DATABASE_URL.
 * Bit-for-bit file copies go to content_files; queryable JSON goes to
 * content_documents; seed.sql fills the relational tables.
 */
import { createHash } from 'crypto';
import { createReadStream, readFileSync, readdirSync, statSync } from 'fs';
import { dirname, join, relative, sep } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function loadEnv() {
  const envPath = join(root, '.env');
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const DATA_ROOTS = [
  join(root, 'artifacts/govlens/src/data'),
  join(root, 'artifacts/govlens/public/data'),
  join(root, 'artifacts/govlens/src/locales'),
  join(root, 'artifacts/govlens/src/pages/central'),
  join(root, 'lib/db/seed.sql'),
  join(root, 'scripts/data'),
];

const TEXT_EXT = new Set([
  '.json', '.ts', '.tsx', '.mjs', '.js', '.sql', '.md', '.yaml', '.yml', '.txt', '.csv',
]);

function walk(entry, out = []) {
  const st = statSync(entry);
  if (st.isDirectory()) {
    for (const name of readdirSync(entry)) {
      if (name === 'node_modules' || name === 'dist' || name.startsWith('.')) continue;
      walk(join(entry, name), out);
    }
    return out;
  }
  out.push(entry);
  return out;
}

function collectFiles() {
  const files = [];
  for (const entry of DATA_ROOTS) {
    try {
      statSync(entry);
    } catch {
      continue;
    }
    walk(entry, files);
  }
  return files.filter((file) => {
    const lower = file.toLowerCase();
    return [...TEXT_EXT].some((ext) => lower.endsWith(ext));
  });
}

function relPath(file) {
  return relative(root, file).split(sep).join('/');
}

function sha256(buf) {
  return createHash('sha256').update(buf).digest('hex');
}

async function execMany(client, sql) {
  const cleaned = sql
    .split(/\r?\n/)
    .filter((line) => !line.startsWith('\\'))
    .join('\n');
  await client.query(cleaned);
}

async function upsertFile(client, path, content, bytes, hash) {
  await client.query(
    `INSERT INTO content_files (path, content, byte_size, sha256, updated_at)
     VALUES ($1, $2, $3, $4, NOW())
     ON CONFLICT (path) DO UPDATE SET
       content = EXCLUDED.content,
       byte_size = EXCLUDED.byte_size,
       sha256 = EXCLUDED.sha256,
       updated_at = NOW()`,
    [path, content, bytes, hash],
  );
}

async function upsertDocument(client, key, kind, payload, sourcePath) {
  const json = JSON.stringify(payload);
  await client.query(
    `INSERT INTO content_documents (key, kind, payload, source_path, byte_size, updated_at)
     VALUES ($1, $2, $3::jsonb, $4, $5, NOW())
     ON CONFLICT (key) DO UPDATE SET
       kind = EXCLUDED.kind,
       payload = EXCLUDED.payload,
       source_path = EXCLUDED.source_path,
       byte_size = EXCLUDED.byte_size,
       updated_at = NOW()`,
    [key, kind, json, sourcePath ?? null, Buffer.byteLength(json)],
  );
}

async function loadSeed(client) {
  const { rows } = await client.query('SELECT count(*)::int AS n FROM schemes');
  if (rows[0].n > 0) {
    console.log(`Skipping seed.sql — schemes already has ${rows[0].n} rows`);
    return;
  }
  const seedPath = join(root, 'lib/db/seed.sql');
  console.log('Loading seed.sql into relational tables…');
  await execMany(client, readFileSync(seedPath, 'utf8'));
  console.log('  seed.sql applied');
}

async function loadStructured(client) {
  const srcData = join(root, 'artifacts/govlens/src/data');
  const publicData = join(root, 'artifacts/govlens/public/data');

  const cagPath = join(srcData, 'cag-reports-data.json');
  const cagHiPath = join(srcData, 'cag-reports-hi.json');
  console.log('Loading CAG reports into content_documents + cag_state_reports…');
  const reports = JSON.parse(readFileSync(cagPath, 'utf8'));
  if (!Array.isArray(reports)) throw new Error('cag-reports-data.json is not an array');

  let i = 0;
  for (const report of reports) {
    await upsertDocument(client, `cag-report:${report.id}`, 'cag-report', report, relPath(cagPath));
    await client.query(
      `INSERT INTO cag_state_reports (
         report_id, report_no, year, title, state, state_code, ministry, category,
         severity, audit_period, date_presented, url, file_name, updated_at
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,NOW())
       ON CONFLICT (report_id) DO UPDATE SET
         report_no = EXCLUDED.report_no,
         year = EXCLUDED.year,
         title = EXCLUDED.title,
         state = EXCLUDED.state,
         state_code = EXCLUDED.state_code,
         ministry = EXCLUDED.ministry,
         category = EXCLUDED.category,
         severity = EXCLUDED.severity,
         audit_period = EXCLUDED.audit_period,
         date_presented = EXCLUDED.date_presented,
         url = EXCLUDED.url,
         file_name = EXCLUDED.file_name,
         updated_at = NOW()`,
      [
        report.id,
        report.reportNo ?? '',
        report.year ?? 0,
        report.title ?? '',
        report.state ?? '',
        report.stateCode ?? '',
        report.ministry ?? '',
        report.category ?? '',
        report.severity ?? 'high',
        report.auditPeriod ?? '',
        report.datePresented ?? '',
        report.url ?? '',
        report.fileName ?? '',
      ],
    );
    i += 1;
    if (i % 200 === 0) console.log(`  cag reports ${i}/${reports.length}`);
  }
  console.log(`  cag reports ${reports.length}/${reports.length}`);

  const hiMap = JSON.parse(readFileSync(cagHiPath, 'utf8'));
  const hiEntries = Object.entries(hiMap);
  console.log(`Loading ${hiEntries.length} CAG Hindi entries…`);
  let h = 0;
  for (const [id, entry] of hiEntries) {
    await upsertDocument(client, `cag-report-hi:${id}`, 'cag-report-hi', entry, relPath(cagHiPath));
    h += 1;
    if (h % 400 === 0) console.log(`  cag hi ${h}/${hiEntries.length}`);
  }
  console.log(`  cag hi ${hiEntries.length}/${hiEntries.length}`);

  const index = reports.map((r) => {
    const item = {};
    for (const key of [
      'id', 'reportNo', 'year', 'title', 'overview', 'auditPeriod', 'datePresented',
      'state', 'stateCode', 'level', 'category', 'ministry', 'severity', 'url', 'fileName',
    ]) {
      if (r[key] !== undefined) item[key] = r[key];
    }
    return item;
  });
  await upsertDocument(client, 'cag-index', 'cag-index', index, relPath(cagPath));

  const hiIndex = {};
  for (const [id, entry] of hiEntries) {
    hiIndex[id] = {
      titleHi: entry.titleHi,
      overviewHi: entry.overviewHi,
    };
  }
  await upsertDocument(client, 'cag-hi-index', 'cag-hi-index', hiIndex, relPath(cagHiPath));

  console.log('Loading state-fact JSON files…');
  const sfDir = join(publicData, 'state-facts');
  const sfFiles = readdirSync(sfDir).filter((n) => n.endsWith('.json'));
  const sfIndex = [];
  for (const name of sfFiles) {
    const file = join(sfDir, name);
    const payload = JSON.parse(readFileSync(file, 'utf8'));
    if (name === 'index.json') {
      await upsertDocument(client, 'state-facts-index', 'state-facts-index', payload, relPath(file));
      continue;
    }
    const code = name.replace(/\.json$/i, '').toUpperCase();
    await upsertDocument(client, `state-fact:${code}`, 'state-fact', payload, relPath(file));
    sfIndex.push({
      stateCode: payload.stateCode ?? code,
      name: payload.name ?? code,
      region: payload.region ?? '',
    });
  }
  if (!sfFiles.includes('index.json')) {
    await upsertDocument(client, 'state-facts-index', 'state-facts-index', sfIndex, 'derived');
  }
  console.log(`  state facts ${sfFiles.length} files`);

  console.log('Loading remaining src/data JSON maps…');
  for (const name of readdirSync(srcData)) {
    if (!name.endsWith('.json')) continue;
    if (name === 'cag-reports-data.json' || name === 'cag-reports-hi.json') continue;
    const file = join(srcData, name);
    const payload = JSON.parse(readFileSync(file, 'utf8'));
    await upsertDocument(client, `json:${name.replace(/\.json$/i, '')}`, 'json', payload, relPath(file));
    console.log(`  json:${name}`);
  }
}

async function verify(client) {
  const tables = [
    'categories', 'schemes', 'pib_entries', 'cag_audits', 'cag_state_reports',
    'content_documents', 'content_files',
  ];
  console.log('\n=== Database counts ===');
  const counts = {};
  for (const table of tables) {
    const { rows } = await client.query(`SELECT count(*)::int AS n FROM ${table}`);
    counts[table] = rows[0].n;
    console.log(`  ${table.padEnd(22)} ${rows[0].n}`);
  }
  const { rows: kinds } = await client.query(
    `SELECT kind, count(*)::int AS n FROM content_documents GROUP BY kind ORDER BY kind`,
  );
  console.log('content_documents by kind:');
  for (const row of kinds) console.log(`  ${row.kind.padEnd(22)} ${row.n}`);
  const { rows: bytes } = await client.query(
    `SELECT coalesce(sum(byte_size),0)::bigint AS n FROM content_files`,
  );
  console.log(`content_files bytes        ${bytes[0].n}`);
  return counts;
}

async function main() {
  const files = collectFiles();
  console.log(`Found ${files.length} local data files to copy`);

  const client = new pg.Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    statement_timeout: 0,
    query_timeout: 0,
  });
  await client.connect();
  await client.query('SET search_path TO public');
  console.log('Connected to Postgres');

  try {
    await client.query('BEGIN');
    await loadSeed(client);
    await client.query('COMMIT');
    await client.query('SET search_path TO public');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  }

  console.log(`Copying ${files.length} files into content_files…`);
  let copied = 0;
  let copiedBytes = 0;
  await client.query('BEGIN');
  try {
    for (const file of files) {
      const buf = readFileSync(file);
      const text = buf.toString('utf8');
      await upsertFile(client, relPath(file), text, buf.length, sha256(buf));
      copied += 1;
      copiedBytes += buf.length;
      if (copied % 250 === 0) console.log(`  files ${copied}/${files.length}`);
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  }
  console.log(`  files ${copied}/${files.length} (${(copiedBytes / 1e6).toFixed(2)} MB)`);

  await client.query('BEGIN');
  try {
    await loadStructured(client);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  }

  const counts = await verify(client);
  await client.end();

  if (counts.categories < 11) throw new Error('categories incomplete');
  if (counts.schemes < 40) throw new Error('schemes incomplete');
  if (counts.pib_entries < 500) throw new Error('pib_entries incomplete');
  if (counts.cag_audits < 200) throw new Error('cag_audits incomplete');
  if (counts.cag_state_reports < 1800) throw new Error('cag_state_reports incomplete');
  if (counts.content_files < files.length) throw new Error('content_files incomplete');
  console.log('\nAll expected row-count checks passed.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
