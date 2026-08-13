/**
 * fill-zero-coverage-audits.mjs  v2
 * Richer per-scheme search with alternate report names and broader context.
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
  const arrMatch = text.match(/\[[\s\S]*\]/);
  if (arrMatch) { try { return JSON.parse(arrMatch[0]); } catch {} }
  const objMatch = text.match(/\{[\s\S]*\}/);
  if (objMatch) { try { return JSON.parse(objMatch[0]); } catch {} }
  return null;
}

function isValidCagUrl(url) {
  if (typeof url !== "string" || !url.startsWith("http")) return false;
  try {
    const u = new URL(url);
    return u.hostname === "cag.gov.in" || u.hostname.endsWith(".cag.gov.in");
  } catch { return false; }
}

// Per-scheme search hints to guide the AI toward real reports
const ZERO_SCHEMES = [
  {
    id: 38, slug: "atal-bhujal", name: "Atal Bhujal Yojana",
    hints: "Search for 'Atal Bhujal Yojana CAG audit' and 'groundwater management audit India CAG site:cag.gov.in'. Also try 'Jal Jeevan Mission groundwater CAG'. The scheme started in 2019 so look for reports from 2022 onwards. It is managed by Ministry of Jal Shakti."
  },
  {
    id: 20, slug: "apy", name: "Atal Pension Yojana",
    hints: "Search for 'Atal Pension Yojana CAG audit site:cag.gov.in' and 'PFRDA pension audit CAG India'. APY is managed by PFRDA under Finance Ministry. Also look for CAG reports on 'social security pension schemes India' 2022 2023 2024."
  },
  {
    id: 55, slug: "abdm", name: "Ayushman Bharat Digital Mission (ABDM)",
    hints: "Search for 'Ayushman Bharat Digital Mission CAG audit' and 'ABDM health stack audit site:cag.gov.in'. Also search 'National Digital Health Mission audit CAG 2023 2024'. The scheme is managed by NHA (National Health Authority) and MoHFW."
  },
  {
    id: 40, slug: "naps", name: "National Apprenticeship Promotion Scheme",
    hints: "Search 'National Apprenticeship Promotion Scheme NAPS CAG audit site:cag.gov.in' and 'apprenticeship training skill development audit CAG India'. Also try 'Ministry of Skill Development audit CAG'. Look for reports mentioning MSDE or DGT (Directorate General of Training)."
  },
  {
    id: 43, slug: "pm-daksh", name: "PM DAKSH Yojana",
    hints: "Search 'PM DAKSH Yojana CAG audit' and 'skill development backward classes OBC SC audit India CAG site:cag.gov.in'. PM DAKSH is managed by Ministry of Social Justice and Empowerment. Also search 'social justice ministry audit CAG 2023 2024'."
  },
  {
    id: 35, slug: "pm-svanidhi", name: "PM SVANidhi",
    hints: "Search 'PM SVANidhi CAG audit site:cag.gov.in' and 'street vendor micro credit scheme audit India'. Also try 'PM Street Vendor AtmaNirbhar Nidhi CAG' and 'urban microfinance audit CAG India 2022 2023'. Ministry of Housing and Urban Affairs manages this."
  },
  {
    id: 27, slug: "pm-aasha", name: "PM-AASHA",
    hints: "Search 'PM-AASHA CAG audit' and 'Pradhan Mantri Annadata Aay Sanrakshan Abhiyan price support farmers audit India site:cag.gov.in'. Also search 'agricultural price support procurement audit CAG 2022 2023 2024'. Ministry of Agriculture manages this."
  },
  {
    id: 50, slug: "pmjap", name: "Pradhan Mantri Jan Aushadhi Pariyojana",
    hints: "Search 'Jan Aushadhi Pariyojana CAG audit' and 'PMJAP generic medicines audit CAG site:cag.gov.in'. Also try 'Pradhan Mantri Bhartiya Janaushadhi Pariyojana PMBJP audit CAG'. Ministry of Chemicals and Fertilizers manages this. Try 'affordable medicines CAG India 2022 2023'."
  },
  {
    id: 6, slug: "pmmy", name: "Pradhan Mantri Mudra Yojana (PMMY)",
    hints: "Search 'Pradhan Mantri Mudra Yojana CAG audit site:cag.gov.in' and 'MUDRA bank PMMY audit CAG India'. Also try 'micro enterprise credit guarantee audit CAG India 2022 2023 2024'. MUDRA is regulated by RBI and managed via MUDRA Ltd under Finance Ministry."
  },
  {
    id: 45, slug: "pmvvy", name: "Pradhan Mantri Vaya Vandana Yojana (PMVVY)",
    hints: "Search 'Pradhan Mantri Vaya Vandana Yojana CAG audit' and 'LIC senior citizen pension scheme audit CAG site:cag.gov.in'. PMVVY is managed by LIC under Finance Ministry. Also search 'LIC social security scheme audit CAG 2022 2023'."
  },
  {
    id: 34, slug: "pli-scheme", name: "Production Linked Incentive (PLI) Scheme",
    hints: "Search 'Production Linked Incentive PLI CAG audit site:cag.gov.in' and 'PLI scheme manufacturing audit CAG India 2023 2024'. Also try 'DPIIT manufacturing incentive audit CAG'. PLI covers 14 sectors — look for sector-specific audits: mobile phones, pharma, textiles, food processing, semiconductors."
  },
  {
    id: 23, slug: "stand-up-india", name: "Stand Up India",
    hints: "Search 'Stand Up India scheme CAG audit site:cag.gov.in' and 'SIDBI SC ST women entrepreneur credit audit CAG India'. Also try 'financial inclusion SC ST entrepreneur loan audit CAG 2022 2023'. Ministry of Finance / SIDBI manages this."
  },
  {
    id: 14, slug: "startup-india", name: "Startup India",
    hints: "Search 'Startup India CAG audit site:cag.gov.in' and 'DIPP DPIIT startup scheme audit CAG India 2022 2023 2024'. Also search 'Fund of Funds for Startups FFS audit CAG' and 'Startup India action plan audit'. Look for Reports from around 2021-2024."
  },
  {
    id: 42, slug: "swamitva", name: "Swamitva Scheme",
    hints: "Search 'Swamitva scheme CAG audit site:cag.gov.in' and 'rural property rights drone mapping audit CAG India'. Also try 'SVAMITVA Survey of Villages and Mapping audit'. Ministry of Panchayati Raj runs this. Look for reports from 2022-2024."
  },
];

async function findAuditsForScheme(scheme) {
  const prompt = `You are a CAG (Comptroller and Auditor General of India) audit research specialist.

Your task: find REAL, PUBLISHED CAG audit reports on cag.gov.in that cover the scheme "${scheme.name}".

Search hints: ${scheme.hints}

IMPORTANT RULES:
1. Do web searches on cag.gov.in and also Google searches like: site:cag.gov.in "${scheme.name}"
2. The scheme may appear as a component within a larger multi-scheme CAG report — that counts.
3. Each finding must be from a real, verifiable CAG report.
4. source_url: must be a direct cag.gov.in URL (PDF download or /en/audit-report/details/NNN page). Never fabricate URLs. If uncertain, use the report detail page URL.
5. severity: "critical" = major fraud, funds misused, targets catastrophically missed; "major" = significant financial irregularity or major target shortfall; "minor" = procedural gap, documentation failure.
6. Return 2–4 findings. Each must be a distinct observation from the CAG report.
7. If after thorough searching NO real CAG report mentioning this scheme exists on cag.gov.in, return [].
8. claimed/actual: numeric text where possible (e.g. "10 crore" "3.2 crore").
9. parameter: the specific audit criterion (concise, clear).
10. report_excerpt: a verbatim sentence from the report, or null.

Return ONLY a JSON array (no other text, no markdown):
[
  {
    "report_number": "Report No. X of YYYY",
    "report_year": YYYY,
    "severity": "critical|major|minor",
    "parameter": "...",
    "finding": "One clear sentence stating the CAG audit finding with specific numbers.",
    "claimed": "what was targeted/claimed (text) or null",
    "actual": "what audit found (text) or null",
    "unit": "unit or null",
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
  return findings.filter(f => isValidCagUrl(f.source_url));
}

async function main() {
  let totalInserted = 0;
  let totalSkipped = 0;

  // Only process schemes still at zero
  const { rows: stillZero } = await pool.query(`
    SELECT s.id FROM schemes s
    LEFT JOIN cag_audits ca ON ca.scheme_id = s.id
    GROUP BY s.id HAVING COUNT(ca.id) = 0
  `);
  const zeroIds = new Set(stillZero.map(r => r.id));
  const schemes = ZERO_SCHEMES.filter(s => zeroIds.has(s.id));
  console.log(`Processing ${schemes.length} zero-coverage schemes...\n`);

  for (const scheme of schemes) {
    process.stdout.write(`\n[${scheme.slug}] "${scheme.name}"...\n`);

    let findings;
    try {
      findings = await findAuditsForScheme(scheme);
    } catch (err) {
      console.log(`  ! Error: ${err.message?.slice(0, 100)}`);
      totalSkipped++;
      continue;
    }

    if (!findings.length) {
      console.log(`  ○ No verifiable CAG reports found`);
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
          [scheme.id, f.report_year, f.report_number, f.finding, f.severity,
           f.parameter, f.claimed??null, f.actual??null, f.unit??null,
           f.gap_percent??null, f.source_url, f.report_excerpt??null]
        );
        totalInserted++;
        console.log(`  ✓ ${f.severity.toUpperCase()} — ${f.report_number} — ${f.source_url.slice(0,70)}`);
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
