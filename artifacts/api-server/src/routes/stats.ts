import { Router } from "express";
import { db, schemesTable, pibEntriesTable, cagAuditsTable } from "@workspace/db";
import { eq, sql, count } from "drizzle-orm";
import { GetStatsOverviewResponse } from "@workspace/api-zod";

const router = Router();

router.get("/stats/overview", async (req, res): Promise<void> => {
  const [schemeStat] = await db
    .select({ total: count() })
    .from(schemesTable);

  const [pibStat] = await db
    .select({ total: count() })
    .from(pibEntriesTable);

  const [cagStat] = await db
    .select({ total: count() })
    .from(cagAuditsTable);

  // Schemes with critical CAG findings
  const criticalSchemes = await db
    .selectDistinct({ schemeId: cagAuditsTable.schemeId })
    .from(cagAuditsTable)
    .where(eq(cagAuditsTable.severity, "critical"));

  // Schemes with major CAG findings
  const majorSchemes = await db
    .selectDistinct({ schemeId: cagAuditsTable.schemeId })
    .from(cagAuditsTable)
    .where(eq(cagAuditsTable.severity, "major"));

  // Top ministries by scheme count
  const topMinistries = await db
    .select({
      ministry: schemesTable.ministry,
      schemeCount: sql<number>`count(*)`.mapWith(Number),
    })
    .from(schemesTable)
    .groupBy(schemesTable.ministry)
    .orderBy(sql`count(*) desc`)
    .limit(5);

  // Compute avg accountability score (100 - penalties for critical/major findings)
  const allSchemes = await db.select({ id: schemesTable.id }).from(schemesTable);
  let totalScore = 0;
  for (const scheme of allSchemes) {
    const audits = await db
      .select({ severity: cagAuditsTable.severity })
      .from(cagAuditsTable)
      .where(eq(cagAuditsTable.schemeId, scheme.id));
    const critical = audits.filter((a) => a.severity === "critical").length;
    const major = audits.filter((a) => a.severity === "major").length;
    const score = Math.max(0, 100 - critical * 30 - major * 15);
    totalScore += score;
  }
  const avgScore = allSchemes.length > 0 ? totalScore / allSchemes.length : 100;

  res.json(
    GetStatsOverviewResponse.parse({
      totalSchemes: schemeStat.total,
      totalPibEntries: pibStat.total,
      totalCagAudits: cagStat.total,
      schemesWithCritical: criticalSchemes.length,
      schemesWithMajor: majorSchemes.length,
      avgAccountabilityScore: Math.round(avgScore),
      topMinistries,
    })
  );
});

export default router;
