import { Router } from "express";
import { db, schemesTable, categoriesTable, pibEntriesTable, cagAuditsTable } from "@workspace/db";
import { eq, ilike, sql, and, inArray, or } from "drizzle-orm";
import {
  ListSchemesQueryParams,
  CreateSchemeBody,
  UpdateSchemeBody,
  GetSchemeParams,
  UpdateSchemeParams,
  DeleteSchemeParams,
  GetWorstPerformersQueryParams,
  GetSchemeVerdictParams,
  CreateSchemeResponse,
  UpdateSchemeResponse,
  GetSchemeVerdictResponse,
} from "@workspace/api-zod";

const router = Router();

// Helper: get worst severity for a scheme
async function getWorstSeverity(schemeId: number): Promise<string | null> {
  const audits = await db
    .select({ severity: cagAuditsTable.severity })
    .from(cagAuditsTable)
    .where(eq(cagAuditsTable.schemeId, schemeId));
  if (audits.some((a) => a.severity === "critical")) return "critical";
  if (audits.some((a) => a.severity === "major")) return "major";
  if (audits.some((a) => a.severity === "minor")) return "minor";
  return null;
}

// Helper: compute accountability score
function computeScore(critical: number, major: number): number {
  return Math.max(0, 100 - critical * 30 - major * 15);
}

router.get("/ministries", async (req, res): Promise<void> => {
  const rows = await db
    .selectDistinct({ ministry: schemesTable.ministry })
    .from(schemesTable)
    .orderBy(schemesTable.ministry);
  res.json(rows.map((r) => r.ministry));
});

router.get("/schemes", async (req, res): Promise<void> => {
  const params = ListSchemesQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const { search, categoryId, ministry, severity } = params.data;

  const conditions = [];
  if (search) {
    conditions.push(
      or(
        ilike(schemesTable.name, `%${search}%`),
        ilike(schemesTable.description, `%${search}%`),
        ilike(schemesTable.slug, `%${search}%`),
        ilike(schemesTable.renamedFrom, `%${search}%`),
        ilike(schemesTable.ministry, `%${search}%`)
      )
    );
  }
  if (categoryId !== undefined && categoryId !== null) {
    conditions.push(eq(schemesTable.categoryId, categoryId));
  }
  if (ministry) {
    conditions.push(ilike(schemesTable.ministry, `%${ministry}%`));
  }

  const schemes = await db
    .select({
      id: schemesTable.id,
      name: schemesTable.name,
      slug: schemesTable.slug,
      ministry: schemesTable.ministry,
      launchedYear: schemesTable.launchedYear,
      renamedFrom: schemesTable.renamedFrom,
      categoryId: schemesTable.categoryId,
      categoryName: categoriesTable.name,
      categoryIcon: categoriesTable.icon,
      description: schemesTable.description,
      pibCount: sql<number>`(select count(*) from pib_entries where scheme_id = ${schemesTable.id})`.mapWith(Number),
      cagCount: sql<number>`(select count(*) from cag_audits where scheme_id = ${schemesTable.id})`.mapWith(Number),
    })
    .from(schemesTable)
    .leftJoin(categoriesTable, eq(categoriesTable.id, schemesTable.categoryId))
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  // Enrich with worstSeverity and optionally filter
  const enriched = await Promise.all(
    schemes.map(async (s) => ({
      ...s,
      worstSeverity: await getWorstSeverity(s.id),
    }))
  );

  const filtered =
    severity
      ? enriched.filter((s) => s.worstSeverity === severity)
      : enriched;

  res.json(filtered);
});

router.get("/schemes/worst-performers", async (req, res): Promise<void> => {
  const params = GetWorstPerformersQueryParams.safeParse(req.query);
  const limit = (params.success && params.data.limit) ? params.data.limit : 5;

  const schemes = await db
    .select({
      id: schemesTable.id,
      name: schemesTable.name,
      slug: schemesTable.slug,
      ministry: schemesTable.ministry,
      launchedYear: schemesTable.launchedYear,
      renamedFrom: schemesTable.renamedFrom,
      categoryId: schemesTable.categoryId,
      categoryName: categoriesTable.name,
      categoryIcon: categoriesTable.icon,
      description: schemesTable.description,
      pibCount: sql<number>`(select count(*) from pib_entries where scheme_id = ${schemesTable.id})`.mapWith(Number),
      cagCount: sql<number>`(select count(*) from cag_audits where scheme_id = ${schemesTable.id})`.mapWith(Number),
      criticalCount: sql<number>`(select count(*) from cag_audits where scheme_id = ${schemesTable.id} and severity = 'critical')`.mapWith(Number),
      majorCount: sql<number>`(select count(*) from cag_audits where scheme_id = ${schemesTable.id} and severity = 'major')`.mapWith(Number),
    })
    .from(schemesTable)
    .leftJoin(categoriesTable, eq(categoriesTable.id, schemesTable.categoryId));

  const scored = schemes
    .map((s) => ({
      ...s,
      worstSeverity: s.criticalCount > 0 ? "critical" : s.majorCount > 0 ? "major" : null,
      score: computeScore(s.criticalCount, s.majorCount),
    }))
    .filter((s) => s.cagCount > 0)
    .sort((a, b) => a.score - b.score)
    .slice(0, limit);

  res.json(scored);
});

router.get("/schemes/:slug", async (req, res): Promise<void> => {
  const rawSlug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;

  const [scheme] = await db
    .select({
      id: schemesTable.id,
      name: schemesTable.name,
      slug: schemesTable.slug,
      ministry: schemesTable.ministry,
      launchedYear: schemesTable.launchedYear,
      renamedFrom: schemesTable.renamedFrom,
      categoryId: schemesTable.categoryId,
      categoryName: categoriesTable.name,
      categoryIcon: categoriesTable.icon,
      description: schemesTable.description,
      goals: schemesTable.goals,
      targetBeneficiaries: schemesTable.targetBeneficiaries,
      targetYear: schemesTable.targetYear,
      budgetCrore: schemesTable.budgetCrore,
    })
    .from(schemesTable)
    .leftJoin(categoriesTable, eq(categoriesTable.id, schemesTable.categoryId))
    .where(eq(schemesTable.slug, rawSlug));

  if (!scheme) {
    res.status(404).json({ error: "Scheme not found" });
    return;
  }

  const pibEntries = await db
    .select()
    .from(pibEntriesTable)
    .where(eq(pibEntriesTable.schemeId, scheme.id))
    .orderBy(pibEntriesTable.date);

  const cagAudits = await db
    .select()
    .from(cagAuditsTable)
    .where(eq(cagAuditsTable.schemeId, scheme.id))
    .orderBy(cagAuditsTable.reportYear);

  res.json({
    ...scheme,
    budgetCrore: scheme.budgetCrore !== null ? Number(scheme.budgetCrore) : null,
    pibEntries: pibEntries.map((e) => ({
      ...e,
      date: String(e.date),
    })),
    cagAudits: cagAudits.map((a) => ({
      ...a,
      gapPercent: a.gapPercent !== null ? Number(a.gapPercent) : null,
    })),
  });
});

router.post("/schemes", async (req, res): Promise<void> => {
  const parsed = CreateSchemeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { renamedFrom, targetBeneficiaries, targetYear, budgetCrore, ...rest } = parsed.data;

  const [created] = await db
    .insert(schemesTable)
    .values({
      ...rest,
      renamedFrom: renamedFrom ?? null,
      targetBeneficiaries: targetBeneficiaries ?? null,
      targetYear: targetYear ?? null,
      budgetCrore: budgetCrore !== undefined ? String(budgetCrore) : null,
    })
    .returning();

  const [cat] = await db
    .select()
    .from(categoriesTable)
    .where(eq(categoriesTable.id, created.categoryId));

  res.status(201).json(
    CreateSchemeResponse.parse({
      ...created,
      categoryName: cat?.name ?? "",
      categoryIcon: cat?.icon ?? "",
      budgetCrore: created.budgetCrore !== null ? Number(created.budgetCrore) : null,
      pibEntries: [],
      cagAudits: [],
    })
  );
});

router.put("/schemes/:slug", async (req, res): Promise<void> => {
  const rawSlug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
  const parsed = UpdateSchemeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { budgetCrore, renamedFrom, targetBeneficiaries, targetYear, ...rest } = parsed.data;
  const updateData: Record<string, unknown> = { ...rest };
  if (renamedFrom !== undefined) updateData.renamedFrom = renamedFrom ?? null;
  if (targetBeneficiaries !== undefined) updateData.targetBeneficiaries = targetBeneficiaries ?? null;
  if (targetYear !== undefined) updateData.targetYear = targetYear ?? null;
  if (budgetCrore !== undefined) updateData.budgetCrore = budgetCrore != null ? String(budgetCrore) : null;

  const [updated] = await db
    .update(schemesTable)
    .set(updateData)
    .where(eq(schemesTable.slug, rawSlug))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Scheme not found" });
    return;
  }

  const [cat] = await db
    .select()
    .from(categoriesTable)
    .where(eq(categoriesTable.id, updated.categoryId));

  const pibEntries = await db
    .select()
    .from(pibEntriesTable)
    .where(eq(pibEntriesTable.schemeId, updated.id));
  const cagAudits = await db
    .select()
    .from(cagAuditsTable)
    .where(eq(cagAuditsTable.schemeId, updated.id));

  res.json(
    UpdateSchemeResponse.parse({
      ...updated,
      categoryName: cat?.name ?? "",
      categoryIcon: cat?.icon ?? "",
      budgetCrore: updated.budgetCrore !== null ? Number(updated.budgetCrore) : null,
      pibEntries: pibEntries.map((e) => ({ ...e, date: String(e.date) })),
      cagAudits: cagAudits.map((a) => ({ ...a, gapPercent: a.gapPercent !== null ? Number(a.gapPercent) : null })),
    })
  );
});

router.delete("/schemes/:slug", async (req, res): Promise<void> => {
  const rawSlug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
  await db.delete(schemesTable).where(eq(schemesTable.slug, rawSlug));
  res.status(204).send();
});

router.get("/schemes/:slug/verdict", async (req, res): Promise<void> => {
  const rawSlug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;

  const [scheme] = await db
    .select({ id: schemesTable.id, name: schemesTable.name, slug: schemesTable.slug })
    .from(schemesTable)
    .where(eq(schemesTable.slug, rawSlug));

  if (!scheme) {
    res.status(404).json({ error: "Scheme not found" });
    return;
  }

  const audits = await db
    .select({ severity: cagAuditsTable.severity })
    .from(cagAuditsTable)
    .where(eq(cagAuditsTable.schemeId, scheme.id));

  const critical = audits.filter((a) => a.severity === "critical").length;
  const major = audits.filter((a) => a.severity === "major").length;
  const minor = audits.filter((a) => a.severity === "minor").length;
  const total = audits.length;

  const score = computeScore(critical, major);

  let verdict: string;
  let summary: string;

  if (total === 0) {
    verdict = "unaudited";
    summary = "No CAG audit findings are available for this scheme yet.";
  } else if (critical >= 2) {
    verdict = "critical";
    summary = `Severe accountability failure: ${critical} critical finding${critical > 1 ? "s" : ""} by CAG. Significant gap between stated goals and ground reality.`;
  } else if (critical >= 1 || major >= 3) {
    verdict = "off_track";
    summary = `Accountability concerns: ${critical} critical and ${major} major finding${major !== 1 ? "s" : ""} indicate the scheme is not meeting its stated objectives.`;
  } else if (major >= 1) {
    verdict = "off_track";
    summary = `${major} major CAG finding${major !== 1 ? "s" : ""} indicate gaps between PIB claims and actual implementation.`;
  } else {
    verdict = "on_track";
    summary = `Only minor issues found. The scheme is broadly meeting its stated objectives per available CAG audits.`;
  }

  res.json(
    GetSchemeVerdictResponse.parse({
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
    })
  );
});

export default router;
