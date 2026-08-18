#!/usr/bin/env node
/**
 * Derives a slim rankings table from state-facts-data.ts.
 * Rankings only needs stateCode/name/region plus indicator scores —
 * not the 2.5 MB of notes, findings, and manifesto prose.
 *
 * Usage: node scripts/extract-state-fact-scores.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const SRC = join(__dir, '../artifacts/govlens/src/data/state-facts-data.ts');
const OUT = join(__dir, '../artifacts/govlens/src/data/state-facts-scores.json');

const src = readFileSync(SRC, 'utf8');
const marker = 'export const STATE_FACTS';
const start = src.indexOf(marker);
if (start < 0) throw new Error('STATE_FACTS export not found');

const body = src.slice(start);
const blocks = body.split(/\n    stateCode: /).slice(1);

function extractSectionScores(block, sectionName) {
  const header = `${sectionName}:`;
  const headerAt = block.indexOf(header);
  if (headerAt < 0) return {};

  const after = block.slice(headerAt + header.length);
  const nextTop = after.search(/\n    [a-zA-Z]/);
  const section = nextTop >= 0 ? after.slice(0, nextTop) : after;

  const scores = {};
  const objRe = /\{\s*key:\s*'([^']+)'[\s\S]*?score:\s*(-?\d+)/g;
  let m;
  while ((m = objRe.exec(section)) !== null) {
    scores[m[1]] = Number(m[2]);
  }
  return scores;
}

function field(block, name) {
  const re = new RegExp(`\\n    ${name}:\\s*(['\`])([\\s\\S]*?)\\1`);
  return block.match(re)?.[2];
}

const rows = blocks.map((block) => {
  const stateCode = block.match(/^['`]([^'`]+)['`]/)?.[1];
  const name = field(block, 'name');
  const region = field(block, 'region');
  if (!stateCode || !name || !region) {
    throw new Error(`Failed to parse a state block starting: ${block.slice(0, 80)}`);
  }
  return {
    stateCode,
    name,
    region,
    accountability: extractSectionScores(block, 'accountabilityRatings'),
    indicators: extractSectionScores(block, 'indicators'),
  };
});

if (rows.length === 0) throw new Error('No state rows extracted');

writeFileSync(OUT, `${JSON.stringify(rows, null, 2)}\n`);
console.log(`Wrote ${rows.length} state score rows → ${OUT}`);
