const STOP = new Set([
  'this', 'that', 'with', 'from', 'they', 'have', 'been', 'were', 'their', 'which',
  'after', 'under', 'during', 'more', 'than', 'also', 'only', 'into', 'over',
  'about', 'into', 'such', 'through', 'between', 'against', 'because', 'while',
  'where', 'when', 'what', 'your', 'will', 'would', 'could', 'should', 'there',
  'these', 'those', 'them', 'then', 'than', 'into', 'government', 'scheme',
  'mission', 'india', 'indian', 'crore', 'lakh', 'percent', 'percentage',
  'number', 'total', 'under', 'being', 'other', 'same', 'each', 'year',
  'years', 'report', 'found', 'audit', 'said', 'announced', 'including',
]);

const GROUPS: string[][] = [
  ['toilet', 'toilets', 'latrine', 'latrines', 'ihhl', 'odf'],
  ['waste', 'garbage', 'landfill', 'dumping', 'swm', 'segregation', 'disposal'],
  ['house', 'houses', 'housing', 'dwelling', 'pmay', 'home', 'homes'],
  ['farmer', 'farmers', 'kisan', 'agriculture', 'agricultural'],
  ['beneficiary', 'beneficiaries', 'household', 'households'],
  ['fund', 'funds', 'utilisation', 'utilization', 'release', 'released', 'expenditure', 'budget', 'disbursed', 'disbursement'],
  ['road', 'roads', 'highway', 'highways', 'km', 'kilometre', 'kilometer'],
  ['school', 'schools', 'enrolment', 'enrollment', 'education', 'student', 'students'],
  ['hospital', 'hospitals', 'ayushman', 'phc', 'chc'],
  ['water', 'tap', 'jal', 'piped', 'drinking'],
  ['electricity', 'power', 'saubhagya', 'electrification', 'household'],
  ['job', 'jobs', 'employment', 'mgnrega', 'nrega', 'wage', 'wages'],
  ['pension', 'pensions', 'widow', 'elderly'],
  ['gas', 'lpg', 'ujjwala', 'cylinder'],
];

export interface ClaimLike {
  id: number;
  title: string;
  body: string;
  figure?: string | null;
  figureUnit?: string | null;
}

export interface FindingLike {
  id: number;
  title: string;
  body: string;
  claimed?: string | null;
  actual?: string | null;
}

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9%]+/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 3 && !STOP.has(w)),
  );
}

function groupHits(tokens: Set<string>): Set<number> {
  const hits = new Set<number>();
  GROUPS.forEach((group, i) => {
    if (group.some((word) => tokens.has(word))) hits.add(i);
  });
  return hits;
}

function scorePair(claim: ClaimLike, finding: FindingLike, noise: Set<string>): number {
  const claimTokens = tokenize(
    `${claim.title} ${claim.body} ${claim.figure ?? ''} ${claim.figureUnit ?? ''}`,
  );
  const findingTokens = tokenize(
    `${finding.title} ${finding.body} ${finding.claimed ?? ''} ${finding.actual ?? ''}`,
  );

  let overlap = 0;
  claimTokens.forEach((token) => {
    if (findingTokens.has(token) && !noise.has(token)) overlap += 1;
  });

  const claimGroups = groupHits(claimTokens);
  const findingGroups = groupHits(findingTokens);
  let sharedGroups = 0;
  claimGroups.forEach((g) => {
    if (!findingGroups.has(g)) return;
    const distinctive = GROUPS[g].some(
      (word) => (claimTokens.has(word) || findingTokens.has(word)) && !noise.has(word),
    );
    if (distinctive) sharedGroups += 1;
  });

  let figureBonus = 0;
  const figure = (claim.figure ?? '').toLowerCase().trim();
  if (figure && figure.length >= 2) {
    const hay = `${finding.title} ${finding.body} ${finding.claimed ?? ''}`.toLowerCase();
    if (hay.includes(figure)) figureBonus = 4;
  }

  return overlap + sharedGroups * 3 + figureBonus;
}

function corpusNoise(claims: ClaimLike[], findings: FindingLike[]): Set<string> {
  const docs = [
    ...claims.map((c) => tokenize(`${c.title} ${c.body}`)),
    ...findings.map((f) => tokenize(`${f.title} ${f.body}`)),
  ];
  if (docs.length === 0) return new Set();
  const freq = new Map<string, number>();
  docs.forEach((tokens) => {
    tokens.forEach((token) => freq.set(token, (freq.get(token) ?? 0) + 1));
  });
  const noise = new Set<string>();
  freq.forEach((count, token) => {
    if (count / docs.length >= 0.45) noise.add(token);
  });
  return noise;
}

export interface CrossLinks {
  claimToFindings: Map<number, number[]>;
  findingToClaims: Map<number, number[]>;
}

const MIN_SCORE = 3;

export function linkClaimsToFindings(claims: ClaimLike[], findings: FindingLike[]): CrossLinks {
  const claimToFindings = new Map<number, number[]>();
  const findingToClaims = new Map<number, number[]>();
  const noise = corpusNoise(claims, findings);

  claims.forEach((claim) => {
    const ranked = findings
      .map((finding) => ({ finding, score: scorePair(claim, finding, noise) }))
      .filter((row) => row.score >= MIN_SCORE)
      .sort((a, b) => b.score - a.score)
      .slice(0, 2);

    if (ranked.length === 0) return;
    claimToFindings.set(
      claim.id,
      ranked.map((row) => row.finding.id),
    );
    ranked.forEach((row) => {
      const existing = findingToClaims.get(row.finding.id) ?? [];
      if (!existing.includes(claim.id) && existing.length < 2) existing.push(claim.id);
      findingToClaims.set(row.finding.id, existing);
    });
  });

  return { claimToFindings, findingToClaims };
}
