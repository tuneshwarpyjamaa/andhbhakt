#!/usr/bin/env node
// Translates education, controversies, and govtExpenditure labels in ministers.ts
// Adds educationHi, controversiesHi, labelHi, periodHi fields.

import { readFileSync, writeFileSync } from 'fs';

const FILE = 'artifacts/govlens/src/data/ministers.ts';
let src = readFileSync(FILE, 'utf8');

// ── Helper: call OpenAI ────────────────────────────────────────────────────────
async function translate(texts) {
  if (texts.length === 0) return [];
  const payload = texts.map((t, i) => `${i + 1}. ${t}`).join('\n');
  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-mini',
      temperature: 0.1,
      messages: [
        {
          role: 'system',
          content: `You are a professional Hindi translator for Indian government and political content.
Translate each numbered English line to fluent Hindi.
Rules:
- Keep proper nouns, institution names, university names, acronyms (IPC, ECI, ADR, BJP, etc.), degrees (MA, MBA, BSc, LLB, PhD), city/state names, and numbers in English.
- For degrees: translate contextual words (e.g. "Political Science" → "राजनीति विज्ञान", "Economics" → "अर्थशास्त्र") but keep the degree abbreviation in English.
- Return ONLY a numbered list matching input, one per line: 1. <Hindi> 2. <Hindi> etc.`,
        },
        { role: 'user', content: payload },
      ],
    }),
  });
  if (!resp.ok) throw new Error(`OpenAI ${resp.status}: ${await resp.text()}`);
  const json = await resp.json();
  const lines = json.choices[0].message.content.trim().split('\n').filter(l => /^\d+\./.test(l));
  return lines.map(l => l.replace(/^\d+\.\s*/, ''));
}

// ── 1. EDUCATION: extract all `education: '...'` lines ────────────────────────
// Match: education: 'some text', (possibly followed by other props)
const EDU_RE = /( {2,4}education: ')((?:[^'\\]|\\.)*)(')/g;
const eduMatches = [];
let m;
while ((m = EDU_RE.exec(src)) !== null) {
  // Skip if the very next sibling is already educationHi (already translated)
  const after = src.slice(m.index + m[0].length, m.index + m[0].length + 30);
  if (!after.includes('educationHi')) {
    eduMatches.push({ index: m.index, full: m[0], pre: m[1], text: m[2], post: m[3] });
  }
}
console.error(`Education entries: ${eduMatches.length}`);

const eduHi = await translate(eduMatches.map(e => e.text));
console.error(`Education translated: ${eduHi.length}`);

// Apply education translations in reverse order (to preserve indices)
const eduReplacements = eduMatches.map((e, i) => ({
  index: e.index,
  len: e.full.length,
  newText: `${e.pre}${e.text}${e.post}`,
  hiField: `\n  educationHi: '${(eduHi[i] ?? '').replace(/\\/g, '\\\\').replace(/'/g, "\\'")}',`,
}));
eduReplacements.sort((a, b) => b.index - a.index);

for (const r of eduReplacements) {
  // Insert educationHi after the education line
  const insertAt = r.index + r.len;
  src = src.slice(0, insertAt) + r.hiField + src.slice(insertAt);
}

// ── 2. CONTROVERSIES: extract all string items from controversies arrays ───────
// Find each controversies: [ ... ] block and extract items
const CONT_BLOCK_RE = /controversies: \[([\s\S]*?)\],/g;
const contItems = []; // { blockStart, blockEnd, items: [{start,end,text}] }

while ((m = CONT_BLOCK_RE.exec(src)) !== null) {
  const block = m[1];
  const blockStart = m.index;
  const blockEnd = m.index + m[0].length;
  const ITEM_RE = /'((?:[^'\\]|\\.)*)'/g;
  const items = [];
  let im;
  while ((im = ITEM_RE.exec(block)) !== null) {
    items.push({ relStart: im.index, relEnd: im.index + im[0].length, text: im[1] });
  }
  contItems.push({ blockStart, blockEnd, raw: m[0], blockOffset: m.index + 'controversies: ['.length, items });
}
console.error(`Controversy blocks: ${contItems.length}`);

const allContTexts = contItems.flatMap(b => b.items.map(it => it.text));
console.error(`Controversy strings: ${allContTexts.length}`);

const contHiAll = await translate(allContTexts);
console.error(`Controversies translated: ${contHiAll.length}`);

// Build a map: text → hi
let contIdx = 0;
for (const block of contItems) {
  block.hiTranslations = block.items.map(() => contHiAll[contIdx++] ?? '');
}

// Apply: add controversiesHi: [...] after each controversies: [...] block (in reverse)
const contReplacements = contItems.map(b => {
  const hiArray = b.hiTranslations.map(h => `    '${h.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`).join(',\n');
  const insertion = `\n  controversiesHi: [\n${hiArray},\n  ],`;
  return { index: b.blockEnd, insertion };
});
contReplacements.sort((a, b) => b.index - a.index);
for (const r of contReplacements) {
  src = src.slice(0, r.index) + r.insertion + src.slice(r.index);
}

// ── 3. GOVT EXPENDITURE labels and periods ────────────────────────────────────
// Find label: '...' and period: '...' inside govtExpenditure arrays
// We'll match them globally but skip labels that follow labelHi (already done)
const LABEL_RE = /( {6}label: ')((?:[^'\\]|\\.)*)(')/g;
const PERIOD_RE = /( {6}period: ')((?:[^'\\]|\\.)*)(')/g;

const labelMatches = [];
while ((m = LABEL_RE.exec(src)) !== null) {
  const after = src.slice(m.index + m[0].length, m.index + m[0].length + 20);
  if (!after.includes('labelHi')) {
    labelMatches.push({ index: m.index, full: m[0], pre: m[1], text: m[2], post: m[3] });
  }
}
const periodMatches = [];
while ((m = PERIOD_RE.exec(src)) !== null) {
  const after = src.slice(m.index + m[0].length, m.index + m[0].length + 20);
  if (!after.includes('periodHi')) {
    periodMatches.push({ index: m.index, full: m[0], pre: m[1], text: m[2], post: m[3] });
  }
}
console.error(`Expenditure labels: ${labelMatches.length}, periods: ${periodMatches.length}`);

const allExpTexts = [...labelMatches.map(l => l.text), ...periodMatches.map(p => p.text)];
const expHiAll = await translate(allExpTexts);
const labelHiAll = expHiAll.slice(0, labelMatches.length);
const periodHiAll = expHiAll.slice(labelMatches.length);

// Apply in reverse order
const expReplacements = [
  ...labelMatches.map((l, i) => ({
    index: l.index + l.full.length,
    insertion: `\n      labelHi: '${(labelHiAll[i] ?? '').replace(/\\/g, '\\\\').replace(/'/g, "\\'")}',`,
  })),
  ...periodMatches.map((p, i) => ({
    index: p.index + p.full.length,
    insertion: `\n      periodHi: '${(periodHiAll[i] ?? '').replace(/\\/g, '\\\\').replace(/'/g, "\\'")}',`,
  })),
];
expReplacements.sort((a, b) => b.index - a.index);
for (const r of expReplacements) {
  src = src.slice(0, r.index) + r.insertion + src.slice(r.index);
}

writeFileSync(FILE, src, 'utf8');
console.error('Done — ministers.ts written.');
