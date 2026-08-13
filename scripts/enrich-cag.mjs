/**
 * One-time enrichment script for CAG entries missing source_url.
 * For each unsourced entry: searches cag.gov.in for the report, extracts
 * a verified URL + verbatim excerpt. Entries that can't be verified are deleted.
 *
 * Run: node scripts/enrich-cag.mjs
 */

import pg from "pg";
import OpenAI from "openai";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

function isValidCagUrl(url) {
  if (typeof url !== "string" || !url.startsWith("http")) return false;
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    return host === "cag.gov.in" || host.endsWith(".cag.gov.in");
  } catch {
    return false;
  }
}

function extractJson(text) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

async function main() {
  // Fetch all unsourced CAG entries with their scheme name
  const { rows: entries } = await pool.query(`
    SELECT ca.id, ca.report_number, ca.report_year, ca.finding, ca.parameter,
           s.name as scheme_name
    FROM cag_audits ca
    JOIN schemes s ON s.id = ca.scheme_id
    WHERE ca.source_url IS NULL
    ORDER BY ca.id
  `);

  console.log(`Found ${entries.length} unsourced CAG entries. Starting enrichment...\n`);

  let updated = 0;
  let deleted = 0;
  let errors = 0;

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    process.stdout.write(
      `[${String(i + 1).padStart(3)}/${entries.length}] ID ${entry.id} — ${entry.scheme_name} / ${entry.report_number} ... `
    );

    try {
      const resp = await openai.responses.create({
        model: "gpt-5.6-luna",
        tools: [{ type: "web_search_preview" }],
        input: `Search cag.gov.in for the CAG (Comptroller and Auditor General of India) audit report "${entry.report_number}" (${entry.report_year}) about "${entry.scheme_name}".

Finding to verify: "${entry.finding}"

STRICT RULES:
- Find the real, published report on cag.gov.in via web search.
- The sourceUrl must be a direct URL on cag.gov.in — PDF or landing page. No Google, no Wikipedia, no other sites.
- The reportExcerpt must be a verbatim sentence or two copied directly from the CAG report that supports or states this finding. Do not paraphrase.
- If you cannot find this specific report on cag.gov.in with a working URL, return null for both fields.

Return ONLY this JSON object (no other text):
{
  "sourceUrl": "https://cag.gov.in/... or null",
  "reportExcerpt": "exact quote from report or null"
}`,
      });

      const text = String(resp.output_text ?? "");
      const result = extractJson(text);

      if (!result || !isValidCagUrl(result.sourceUrl)) {
        // Can't verify — delete
        await pool.query("DELETE FROM cag_audits WHERE id = $1", [entry.id]);
        deleted++;
        console.log("✗ deleted (unverifiable)");
      } else {
        // Update with URL + excerpt
        await pool.query(
          "UPDATE cag_audits SET source_url = $1, report_excerpt = $2 WHERE id = $3",
          [
            result.sourceUrl,
            result.reportExcerpt || null,
            entry.id,
          ]
        );
        updated++;
        console.log(`✓ updated — ${result.sourceUrl.slice(0, 70)}...`);
      }
    } catch (err) {
      errors++;
      console.log(`! error: ${err.message?.slice(0, 80)}`);
    }
  }

  console.log(`\n━━━ Done ━━━`);
  console.log(`  Updated : ${updated}`);
  console.log(`  Deleted : ${deleted}`);
  console.log(`  Errors  : ${errors}`);

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
