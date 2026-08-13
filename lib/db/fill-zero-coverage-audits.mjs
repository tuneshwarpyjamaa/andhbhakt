/**
 * fill-zero-coverage-audits.mjs
 * For each scheme with zero cag_audits entries, searches cag.gov.in for real
 * audit reports and inserts 2-4 verified findings into the DB.
 *
 * Run: node scripts/fill-zero-coverage-audits.mjs
 */

import pg from "pg";
import OpenAI from "openai";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

function extractJson(text) {
  // Try to find a JSON array or object
  const arrMatch = text.match(/\[[\s\S]*\]/);
  if (arrMatch) {
    try { return JSON.parse(arrMatch[0]); } catch {}
  }
  const objMatch = text.match(/\{[\s\S]*\}/);
  if (objMatch) {
    try { return JSON.parse(objMatch[0]); } catch {}
  }
  return null;
}

function isValidCagUrl(url) {
  if (typeof url !== "string" || !url.startsWith("http")) return false;
  try {
    const u = new URL(url);
    return u.hostname === "cag.gov.in" || u.hostname.endsWith(".cag.gov.in");
  } catch { return false; }
}

const ZERO_SCHEMES = [
  { id: 38, slug: "atal-bhujal",      name: "Atal Bhujal Yojana" },
  { id: 20, slug: "apy",              name: "Atal Pension Yojana" },
  { id: 55, slug: "abdm",             name: "Ayushman Bharat Digital Mission (ABDM)" },
  { id: 40, slug: "naps",             name: "National Apprenticeship Promotion Scheme" },
  { id: 43, slug: "pm-daksh",         name: "PM DAKSH Yojana" },
  { id: 35, slug: "pm-svanidhi",      name: "PM SVANidhi (PM Street Vendor AtmaNirbhar Nidhi)" },
  { id: 26, slug: "poshan-abhiyaan",  name: "POSHAN Abhiyaan (National Nutrition Mission)" },
  { id: 27, slug: "pm-aasha",         name: "PM-AASHA (Pradhan Mantri Annadata Aay SanraksHan Abhiyan)" },
  { id: 50, slug: "pmjap",            name: "Pradhan Mantri Jan Aushadhi Pariyojana (PMJAP)" },
  { id:  6, slug: "pmmy",             name: "Pradhan Mantri Mudra Yojana (PMMY)" },
  { id: 45, slug: "pmvvy",            name: "Pradhan Mantri Vaya Vandana Yojana (PMVVY)" },
  { id: 34, slug: "pli-scheme",       name: "Production Linked Incentive (PLI) Scheme" },
  { id: 23, slug: "stand-up-india",   name: "Stand Up India" },
  { id: 14, slug: "startup-india",    name: "Startup India" },
  { id: 42, slug: "swamitva",         name: "Swamitva Scheme" },
];

async function findAuditsForScheme(scheme) {
  const prompt = `You are a research assistant specialising in CAG (Comptroller and Auditor General) of India audit reports.

Search cag.gov.in for REAL published CAG audit reports that cover the scheme: "${scheme.name}".

STRICT RULES:
1. Use web search to find actual CAG reports on cag.gov.in that mention this scheme.
2. Each finding must correspond to a real, verifiable CAG report.
3. sourceUrl must be a direct cag.gov.in URL (PDF or detail page). Never fabricate URLs.
4. Each finding should be a distinct audit observation (not paraphrases of the same point).
5. severity: "critical" = fraud/major funds misused; "major" = significant target miss or financial irregularity; "minor" = process gap.
6. Return 2–4 findings. If fewer than 2 real reports exist, return as many as genuinely exist.
7. If NO real CAG report covering this scheme can be found on cag.gov.in, return an empty array [].
8. claimed and actual should be numeric strings when possible (e.g. "10 crore" not "₹10 crore").
9. parameter = the specific audit criterion being tested (short, precise).
10. report_excerpt must be a verbatim sentence copied from the CAG report, or null.

Return ONLY a JSON array — no other text:
[
  {
    "report_number": "Report No. X of YYYY",
    "report_year": YYYY,
    "severity": "critical|major|minor",
    "parameter": "...",
    "finding": "One clear sentence stating the CAG audit finding.",
    "claimed": "target/what govt said (text or null)",
    "actual": "what audit found (text or null)",
    "unit": "unit of measurement or null",
    "gap_percent": null_or_number,
    "source_url": "https://cag.gov.in/...",
    "report_excerpt": "verbatim quote or null"
  }
]`;

  const resp = await openai.responses.create({
    model: "gpt-4.1",
    tools: [{ type: "web_search_preview" }],
    input: prompt,
  });

  const text = String(resp.output_text ?? "");
  const findings = extractJson(text);
  if (!Array.isArray(findings)) return [];
  // Filter to valid cag URLs only
  return findings.filter(f => isValidCagUrl(f.source_url));
}

async function main() {
  let totalInserted = 0;
  let totalSkipped = 0;

  for (const scheme of ZERO_SCHEMES) {
    process.stdout.write(`\n[${scheme.slug}] Searching CAG for "${scheme.name}"...\n`);

    let findings;
    try {
      findings = await findAuditsForScheme(scheme);
    } catch (err) {
      console.log(`  ! Error searching: ${err.message?.slice(0, 100)}`);
      totalSkipped++;
      continue;
    }

    if (!findings.length) {
      console.log(`  ○ No verifiable CAG reports found — skipping`);
      totalSkipped++;
      continue;
    }

    console.log(`  Found ${findings.length} finding(s). Inserting...`);

    for (const f of findings) {
      try {
        await pool.query(
          `INSERT INTO cag_audits
            (scheme_id, report_year, report_number, finding, severity, parameter,
             claimed, actual, unit, gap_percent, source_url, report_excerpt)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
          [
            scheme.id,
            f.report_year,
            f.report_number,
            f.finding,
            f.severity,
            f.parameter,
            f.claimed   ?? null,
            f.actual    ?? null,
            f.unit      ?? null,
            f.gap_percent ?? null,
            f.source_url,
            f.report_excerpt ?? null,
          ]
        );
        totalInserted++;
        console.log(`  ✓ ${f.severity.toUpperCase()} — ${f.report_number} — ${f.source_url.slice(0, 70)}`);
      } catch (err) {
        console.log(`  ✗ Insert failed: ${err.message?.slice(0, 100)}`);
      }
    }
  }

  console.log(`\n━━━ Done ━━━`);
  console.log(`  Inserted : ${totalInserted}`);
  console.log(`  Skipped  : ${totalSkipped}`);

  await pool.end();
}

main().catch(err => { console.error(err); process.exit(1); });
