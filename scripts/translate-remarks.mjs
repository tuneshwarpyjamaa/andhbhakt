#!/usr/bin/env node
// Translates all ChartRemark `note` fields in central-data.tsx to Hindi,
// adding a `noteHi` field alongside each existing `note` field.

import { readFileSync, writeFileSync } from 'fs';

const FILE = 'artifacts/govlens/src/pages/central-data.tsx';
let src = readFileSync(FILE, 'utf8');

// ── 1. Extract all { years: ..., note: ... } entries ─────────────────────────
// We match the whole remark object line so we can reconstruct it
const REMARK_RE = /(\{ years: (?:'[^']*'|`[^`]*`), note: )((?:'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`))( \})/g;

const notes = [];
let m;
while ((m = REMARK_RE.exec(src)) !== null) {
  let raw = m[2];
  // strip surrounding quotes
  let text;
  if (raw.startsWith("'")) text = raw.slice(1, -1).replace(/\\'/g, "'").replace(/\\\\/g, '\\');
  else text = raw.slice(1, -1).replace(/\\`/g, '`').replace(/\\\\/g, '\\');
  notes.push({ index: m.index, full: m[0], prefix: m[1], noteRaw: m[2], suffix: m[3], text });
}
console.error(`Found ${notes.length} remark notes.`);

// ── 2. Translate in one big batch via OpenAI ─────────────────────────────────
const BATCH_SIZE = 50;
const translations = [];

for (let i = 0; i < notes.length; i += BATCH_SIZE) {
  const batch = notes.slice(i, i + BATCH_SIZE);
  const payload = batch.map((n, j) => `${i + j + 1}. ${n.text}`).join('\n');

  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-mini',
      temperature: 0.1,
      messages: [
        {
          role: 'system',
          content: `You are a professional Hindi translator specialising in government, economics, and public policy. 
Translate each numbered English sentence/paragraph into fluent, readable Hindi. 
Keep technical terms, proper nouns, numbers, acronyms (GDP, NCRB, PLFS, etc.), scheme names, and organisation names in English. 
Return ONLY a numbered list matching the input, one per line, in the exact format:
1. <Hindi translation>
2. <Hindi translation>
...
Do not add any other text.`,
        },
        { role: 'user', content: payload },
      ],
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`OpenAI error: ${resp.status} ${err}`);
  }

  const json = await resp.json();
  const raw = json.choices[0].message.content.trim();
  const lines = raw.split('\n').filter(l => /^\d+\./.test(l));

  if (lines.length !== batch.length) {
    console.error(`Batch ${i}–${i+BATCH_SIZE}: expected ${batch.length} lines, got ${lines.length}`);
    console.error('Raw:', raw.slice(0, 300));
  }

  for (const line of lines) {
    const hi = line.replace(/^\d+\.\s*/, '');
    translations.push(hi);
  }
  console.error(`Translated batch ${i}–${i + batch.length} (${translations.length}/${notes.length})`);
}

console.error(`Total translations: ${translations.length}`);

// ── 3. Rebuild file — insert noteHi after each note field ─────────────────────
// Work backwards so indices stay valid
const replacements = [];
for (let i = 0; i < notes.length; i++) {
  const hi = translations[i] ?? '';
  const escaped = hi.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  const newFull = `${notes[i].prefix}${notes[i].noteRaw}, noteHi: '${escaped}'${notes[i].suffix}`;
  replacements.push({ index: notes[i].index, len: notes[i].full.length, newFull });
}

// Apply in reverse order
replacements.sort((a, b) => b.index - a.index);
for (const r of replacements) {
  src = src.slice(0, r.index) + r.newFull + src.slice(r.index + r.len);
}

writeFileSync(FILE, src, 'utf8');
console.error('Done — file written.');
