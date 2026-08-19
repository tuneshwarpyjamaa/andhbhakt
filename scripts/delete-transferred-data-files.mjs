import { existsSync, readdirSync, rmSync, statSync, unlinkSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const targets = [
  join(root, 'lib/db/seed.sql'),
  join(root, 'artifacts/govlens/public/data/cag-reports'),
  join(root, 'artifacts/govlens/public/data/state-facts'),
];

const srcData = join(root, 'artifacts/govlens/src/data');
for (const name of readdirSync(srcData)) {
  if (name.endsWith('.json')) targets.push(join(srcData, name));
}

let removed = 0;
let bytes = 0;

function sizeOf(p) {
  const st = statSync(p);
  if (st.isFile()) return st.size;
  let n = 0;
  for (const name of readdirSync(p)) n += sizeOf(join(p, name));
  return n;
}

for (const target of targets) {
  if (!existsSync(target)) {
    console.log('missing', target);
    continue;
  }
  const n = sizeOf(target);
  rmSync(target, { recursive: true, force: true });
  removed += 1;
  bytes += n;
  console.log('removed', target.replace(root + '\\', '').replace(root + '/', ''), `(${(n / 1e6).toFixed(2)} MB)`);
}

console.log(`deleted ${removed} paths, ${(bytes / 1e6).toFixed(2)} MB`);
