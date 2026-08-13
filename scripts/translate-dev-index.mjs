#!/usr/bin/env node
// Adds nameHi, interpretationHi, trendNoteHi, noteHi, scoreUnitHi to every INDICES entry.

import { readFileSync, writeFileSync } from 'fs';

const FILE = 'artifacts/govlens/src/pages/development-index.tsx';
let src = readFileSync(FILE, 'utf8');

async function translate(texts) {
  if (!texts.length) return [];
  const payload = texts.map((t, i) => `${i + 1}. ${t}`).join('\n');
  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4.1-mini',
      temperature: 0.1,
      messages: [{
        role: 'system',
        content: `You are a professional Hindi translator for international development data.
Translate each numbered English line to fluent Hindi.
Rules:
- Keep: index acronyms (HDI, GHI, CPI, etc.), org/publisher names, country names, number values/years, currency, URLs, technical abbreviations.
- Translate: all descriptive English text.
- Return ONLY a numbered list: 1. <Hindi> 2. <Hindi> etc., one per line.`,
      }, { role: 'user', content: payload }],
    }),
  });
  if (!resp.ok) throw new Error(`${resp.status}: ${await resp.text()}`);
  const json = await resp.json();
  return json.choices[0].message.content.trim()
    .split('\n').filter(l => /^\d+\./.test(l))
    .map(l => l.replace(/^\d+\.\s*/, ''));
}

// Pull out each field from all INDICES entries.
// We'll do it by parsing the source for each field pattern within the array.
// Strategy: find the INDICES = [ ... ]; block, then within it find each entry object.

const INDICES_START = src.indexOf('const INDICES: IndexEntry[] = [');
const INDICES_END = src.indexOf('\n];', INDICES_START) + 3;
const indicesSrc = src.slice(INDICES_START, INDICES_END);

// Extract entries: split on "  {" at the top level
// Each entry has specific fields we want to translate
const fieldRE = (field) => new RegExp(`  ${field}: '((?:[^'\\\\]|\\\\.)*)'`, 'g');

function extractField(text, field) {
  const re = fieldRE(field);
  const results = [];
  let m;
  while ((m = re.exec(text)) !== null) {
    results.push({ index: m.index, full: m[0], value: m[1] });
  }
  return results;
}

const names          = extractField(indicesSrc, 'name');
const interpretations = extractField(indicesSrc, 'interpretation');
const trendNotes     = extractField(indicesSrc, 'trendNote');
const notes          = extractField(indicesSrc, 'note');
const scoreUnits     = extractField(indicesSrc, 'scoreUnit');

console.error(`names:${names.length} interps:${interpretations.length} trends:${trendNotes.length} notes:${notes.length} units:${scoreUnits.length}`);

// Translate all batches
const [namesHi, interpsHi, trendsHi, notesHi, unitsHi] = await Promise.all([
  translate(names.map(n => n.value)),
  translate(interpretations.map(n => n.value)),
  translate(trendNotes.map(n => n.value)),
  translate(notes.map(n => n.value)),
  translate(scoreUnits.map(n => n.value)),
]);

console.error(`namesHi:${namesHi.length} interpsHi:${interpsHi.length} trendsHi:${trendsHi.length} notesHi:${notesHi.length} unitsHi:${unitsHi.length}`);

// Build insertion list: each item = { absoluteIndex, insertion }
// absoluteIndex = position in `src` where we insert (right after the field's closing quote)
const insertions = [];

function escape(s) {
  return (s ?? '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function addInsertions(matches, translations, hiField, indentSpaces) {
  const indent = ' '.repeat(indentSpaces);
  matches.forEach((m, i) => {
    // Absolute position in src = INDICES_START + m.index + m.full.length
    const absPos = INDICES_START + m.index + m.full.length;
    const hi = translations[i] ?? '';
    insertions.push({ pos: absPos, text: `\n${indent}${hiField}: '${escape(hi)}',` });
  });
}

addInsertions(names,          namesHi,   'nameHi',           2);
addInsertions(interpretations, interpsHi, 'interpretationHi', 2);
addInsertions(trendNotes,     trendsHi,  'trendNoteHi',      2);
addInsertions(notes,          notesHi,   'noteHi',           2);
addInsertions(scoreUnits,     unitsHi,   'scoreUnitHi',      2);

// Apply in reverse order so positions stay valid
insertions.sort((a, b) => b.pos - a.pos);

for (const ins of insertions) {
  src = src.slice(0, ins.pos) + ins.text + src.slice(ins.pos);
}

writeFileSync(FILE, src, 'utf8');
console.error('Done.');
