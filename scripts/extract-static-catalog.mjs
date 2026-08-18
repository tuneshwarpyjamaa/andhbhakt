import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const sql = fs.readFileSync(path.join(root, 'lib/db/seed.sql'), 'utf8');

function parseValues(line) {
  const marker = ' VALUES ';
  const idx = line.toUpperCase().indexOf(marker);
  if (idx < 0) return null;
  let s = line.slice(idx + marker.length).trim();
  if (s.endsWith(';')) s = s.slice(0, -1);
  if (s.startsWith('(')) s = s.slice(1);
  if (s.endsWith(')')) s = s.slice(0, -1);

  const values = [];
  let i = 0;
  while (i < s.length) {
    while (s[i] === ' ' || s[i] === '\t' || s[i] === ',') i++;
    if (i >= s.length) break;
    if (s.startsWith('NULL', i) && (s[i + 4] === undefined || s[i + 4] === ',' || s[i + 4] === ' ')) {
      values.push(null);
      i += 4;
      continue;
    }
    if (s[i] === "'") {
      i++;
      let out = '';
      while (i < s.length) {
        if (s[i] === "'" && s[i + 1] === "'") {
          out += "'";
          i += 2;
          continue;
        }
        if (s[i] === "'") {
          i++;
          break;
        }
        out += s[i++];
      }
      values.push(out);
      continue;
    }
    let j = i;
    while (j < s.length && s[j] !== ',') j++;
    const raw = s.slice(i, j).trim();
    values.push(/^-?\d+(\.\d+)?$/.test(raw) ? Number(raw) : raw);
    i = j;
  }
  return values;
}

const categories = [];
const schemes = [];
const audits = [];
const pibEntries = [];

for (const line of sql.split(/\r?\n/)) {
  if (line.startsWith('INSERT INTO public.categories ')) {
    const v = parseValues(line);
    if (!v) continue;
    categories.push({ id: v[0], name: v[1], slug: v[2], icon: v[3] });
  } else if (line.startsWith('INSERT INTO public.schemes ')) {
    const v = parseValues(line);
    if (!v) continue;
    schemes.push({
      id: v[0],
      name: v[1],
      slug: v[2],
      ministry: v[3],
      launchedYear: v[4],
      renamedFrom: v[5],
      categoryId: v[6],
      description: v[7],
      goals: v[8],
      targetBeneficiaries: v[9],
      targetYear: v[10],
      budgetCrore: v[11],
    });
  } else if (line.startsWith('INSERT INTO public.cag_audits ')) {
    const v = parseValues(line);
    if (!v) continue;
    audits.push({
      id: v[0],
      schemeId: v[1],
      reportYear: v[2],
      reportNumber: v[3],
      finding: v[4],
      severity: v[5],
      parameter: v[6],
      claimed: v[7],
      actual: v[8],
      unit: v[9],
      gapPercent: v[10],
      sourceUrl: v[11],
      reportExcerpt: v[12] ?? null,
    });
  } else if (line.startsWith('INSERT INTO public.pib_entries ')) {
    const v = parseValues(line);
    if (!v) continue;
    pibEntries.push({
      id: v[0],
      schemeId: v[1],
      date: v[2],
      headline: v[3],
      summary: v[4],
      claimType: v[5],
      figure: v[6],
      figureUnit: v[7],
      sourceUrl: v[8],
    });
  }
}

const pibByScheme = new Map();
for (const e of pibEntries) {
  pibByScheme.set(e.schemeId, (pibByScheme.get(e.schemeId) ?? 0) + 1);
}

const catById = new Map(categories.map((c) => [c.id, c]));
const schemeById = new Map(schemes.map((s) => [s.id, s]));

const cagByScheme = new Map();
for (const a of audits) {
  const list = cagByScheme.get(a.schemeId) ?? [];
  list.push(a);
  cagByScheme.set(a.schemeId, list);
}

function worstSeverity(list) {
  if (!list?.length) return null;
  if (list.some((a) => a.severity === 'critical')) return 'critical';
  if (list.some((a) => a.severity === 'major')) return 'major';
  if (list.some((a) => a.severity === 'minor')) return 'minor';
  return null;
}

const schemeSummaries = schemes
  .map((s) => {
    const cat = catById.get(s.categoryId);
    const cag = cagByScheme.get(s.id) ?? [];
    return {
      id: s.id,
      name: s.name,
      slug: s.slug,
      ministry: s.ministry,
      launchedYear: s.launchedYear,
      renamedFrom: s.renamedFrom,
      categoryId: s.categoryId,
      categoryName: cat?.name ?? '',
      categoryIcon: cat?.icon,
      description: s.description,
      pibCount: pibByScheme.get(s.id) ?? 0,
      cagCount: cag.length,
      worstSeverity: worstSeverity(cag),
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

const liveCag = audits
  .filter((a) => a.reportYear >= 2025)
  .map((a) => {
    const s = schemeById.get(a.schemeId);
    return {
      id: a.id,
      schemeName: s?.name ?? '',
      schemeSlug: s?.slug ?? '',
      ministry: s?.ministry ?? '',
      reportYear: a.reportYear,
      reportNumber: a.reportNumber,
      finding: a.finding,
      severity: a.severity,
      parameter: a.parameter,
      claimed: a.claimed,
      actual: a.actual,
      sourceUrl: a.sourceUrl,
    };
  });

function computeScore(critical, major) {
  return Math.max(0, 100 - critical * 30 - major * 15);
}

function makeVerdict(scheme, list) {
  const critical = list.filter((a) => a.severity === 'critical').length;
  const major = list.filter((a) => a.severity === 'major').length;
  const minor = list.filter((a) => a.severity === 'minor').length;
  const total = list.length;
  const score = computeScore(critical, major);
  let verdict = 'on_track';
  let summary = 'Only minor issues found. The scheme is broadly meeting its stated objectives per available CAG audits.';
  if (total === 0) {
    verdict = 'unaudited';
    summary = 'No CAG audit findings are available for this scheme yet.';
  } else if (critical >= 2) {
    verdict = 'critical';
    summary = `Severe accountability failure: ${critical} critical finding${critical > 1 ? 's' : ''} by CAG. Significant gap between stated goals and ground reality.`;
  } else if (critical >= 1 || major >= 3) {
    verdict = 'off_track';
    summary = `Accountability concerns: ${critical} critical and ${major} major finding${major !== 1 ? 's' : ''} indicate the scheme is not meeting its stated objectives.`;
  } else if (major >= 1) {
    verdict = 'off_track';
    summary = `${major} major CAG finding${major !== 1 ? 's' : ''} indicate gaps between PIB claims and actual implementation.`;
  }
  return {
    schemeId: scheme.id,
    slug: scheme.slug,
    name: scheme.name,
    verdict,
    score,
    totalAudits: total,
    criticalCount: critical,
    majorCount: major,
    minorCount: minor,
    summary,
  };
}

const detailsBySlug = {};
for (const s of schemes) {
  const cat = catById.get(s.categoryId);
  const cag = (cagByScheme.get(s.id) ?? []).map((a) => ({
    id: a.id,
    schemeId: a.schemeId,
    reportYear: a.reportYear,
    reportNumber: a.reportNumber,
    finding: a.finding,
    severity: a.severity,
    parameter: a.parameter,
    claimed: a.claimed,
    actual: a.actual,
    unit: a.unit,
    sourceUrl: a.sourceUrl,
    reportExcerpt: a.reportExcerpt,
    gapPercent: a.gapPercent,
  }));
  const pib = pibEntries
    .filter((e) => e.schemeId === s.id)
    .sort((a, b) => String(a.date).localeCompare(String(b.date)));
  detailsBySlug[s.slug] = {
    scheme: {
      id: s.id,
      name: s.name,
      slug: s.slug,
      ministry: s.ministry,
      launchedYear: s.launchedYear,
      renamedFrom: s.renamedFrom,
      categoryId: s.categoryId,
      categoryName: cat?.name ?? '',
      categoryIcon: cat?.icon,
      description: s.description,
      goals: s.goals,
      targetBeneficiaries: s.targetBeneficiaries,
      targetYear: s.targetYear,
      budgetCrore: s.budgetCrore,
    },
    pib,
    cag,
    verdict: makeVerdict(s, cag),
  };
}

const outDir = path.join(root, 'artifacts/govlens/src/data');
fs.writeFileSync(path.join(outDir, 'categories-static.json'), JSON.stringify(categories, null, 2));
fs.writeFileSync(path.join(outDir, 'schemes-static.json'), JSON.stringify(schemeSummaries, null, 2));
fs.writeFileSync(path.join(outDir, 'cag-audits-2025-static.json'), JSON.stringify(liveCag, null, 2));
fs.writeFileSync(path.join(outDir, 'scheme-details-static.json'), JSON.stringify(detailsBySlug));

console.log({
  categories: categories.length,
  schemes: schemeSummaries.length,
  cag2025: liveCag.length,
  pib: pibEntries.length,
  details: Object.keys(detailsBySlug).length,
});

