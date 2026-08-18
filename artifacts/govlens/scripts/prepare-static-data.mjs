#!/usr/bin/env node
/**
 * Derive public/ on-demand JSON from the canonical src/data files.
 * Source files are never deleted — they stay the authoring copy.
 *
 * Usage: node scripts/prepare-static-data.mjs
 */
import { createHash } from 'crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync, statSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, '..');
const SRC = join(ROOT, 'src', 'data');
const OUT = join(ROOT, 'public', 'data');

const CAG_SRC = join(SRC, 'cag-reports-data.json');
const CAG_HI_SRC = join(SRC, 'cag-reports-hi.json');
const SF_SRC = join(SRC, 'state-facts-data.ts');

const LIST_FIELDS = [
  'id', 'reportNo', 'year', 'title', 'overview', 'auditPeriod', 'datePresented',
  'state', 'stateCode', 'level', 'category', 'ministry', 'severity', 'url', 'fileName',
];

function ensureDir(dir) {
  mkdirSync(dir, { recursive: true });
}

function stampPath(name) {
  return join(OUT, `.stamp-${name}`);
}

function sourceStamp(files) {
  const h = createHash('sha1');
  for (const file of files) {
    const st = statSync(file);
    h.update(file);
    h.update(String(st.mtimeMs));
    h.update(String(st.size));
  }
  return h.digest('hex');
}

function isFresh(name, files) {
  const stamp = stampPath(name);
  if (!existsSync(stamp)) return false;
  return readFileSync(stamp, 'utf8') === sourceStamp(files);
}

function writeStamp(name, files) {
  writeFileSync(stampPath(name), sourceStamp(files));
}

function writeJson(file, value) {
  ensureDir(dirname(file));
  writeFileSync(file, JSON.stringify(value));
}

function prepareCagReports() {
  const sources = [CAG_SRC, CAG_HI_SRC];
  if (isFresh('cag', sources)) {
    console.log('cag-reports: up to date');
    return;
  }

  const reports = JSON.parse(readFileSync(CAG_SRC, 'utf8'));
  if (!Array.isArray(reports)) throw new Error('cag-reports-data.json must be an array');

  const index = reports.map((r) => {
    const item = {};
    for (const key of LIST_FIELDS) {
      if (r[key] !== undefined) item[key] = r[key];
    }
    return item;
  });

  const fullDir = join(OUT, 'cag-reports', 'full');
  const hiDir = join(OUT, 'cag-reports', 'hi');
  ensureDir(fullDir);
  ensureDir(hiDir);

  writeJson(join(OUT, 'cag-reports', 'index.json'), index);

  for (const report of reports) {
    writeJson(join(fullDir, `${report.id}.json`), report);
  }

  const hi = JSON.parse(readFileSync(CAG_HI_SRC, 'utf8'));
  const hiIndex = {};
  for (const [id, entry] of Object.entries(hi)) {
    hiIndex[id] = {
      titleHi: entry.titleHi,
      overviewHi: entry.overviewHi,
    };
    writeJson(join(hiDir, `${id}.json`), entry);
  }
  writeJson(join(OUT, 'cag-reports', 'hi-index.json'), hiIndex);

  writeStamp('cag', sources);
  console.log(`cag-reports: ${reports.length} reports + ${Object.keys(hi).length} hi entries`);
}

async function prepareStateFacts() {
  const sources = [SF_SRC];
  if (isFresh('sf', sources)) {
    console.log('state-facts: up to date');
    return;
  }

  const mod = await import(`${pathToFileURL(SF_SRC).href}?t=${Date.now()}`);
  const facts = mod.STATE_FACTS;
  if (!Array.isArray(facts)) throw new Error('STATE_FACTS export missing');

  const sfDir = join(OUT, 'state-facts');
  ensureDir(sfDir);

  const index = facts.map((f) => ({
    stateCode: f.stateCode,
    name: f.name,
    region: f.region,
  }));
  writeJson(join(sfDir, 'index.json'), index);

  for (const fact of facts) {
    writeJson(join(sfDir, `${fact.stateCode}.json`), fact);
  }

  writeStamp('sf', sources);
  console.log(`state-facts: ${facts.length} states`);
}

export async function prepareStaticData() {
  ensureDir(OUT);
  prepareCagReports();
  await prepareStateFacts();
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  prepareStaticData().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
