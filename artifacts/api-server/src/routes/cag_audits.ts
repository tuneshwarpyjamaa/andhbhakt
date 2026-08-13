import { Router } from "express";
import { db, cagAuditsTable, schemesTable } from "@workspace/db";
import { eq, gte, and } from "drizzle-orm";
import {
  CreateCagAuditBody,
  CreateCagAuditResponse,
  ListCagAuditsResponse,
} from "@workspace/api-zod";

const router = Router();

// GET /api/cag-audits?yearFrom=2025 — all audits across schemes, joined with scheme name/ministry
router.get("/cag-audits", async (req, res): Promise<void> => {
  const yearFromRaw = req.query.yearFrom as string | undefined;
  const yearFrom    = yearFromRaw ? parseInt(yearFromRaw, 10) : undefined;
  if (yearFrom !== undefined && (Number.isNaN(yearFrom) || yearFrom < 1900 || yearFrom > 2100)) {
    res.status(400).json({ error: "Invalid yearFrom parameter." });
    return;
  }

  const rows = await db
    .select({
      id: cagAuditsTable.id,
      schemeId: cagAuditsTable.schemeId,
      schemeName: schemesTable.name,
      schemeSlug: schemesTable.slug,
      ministry: schemesTable.ministry,
      reportYear: cagAuditsTable.reportYear,
      reportNumber: cagAuditsTable.reportNumber,
      finding: cagAuditsTable.finding,
      severity: cagAuditsTable.severity,
      parameter: cagAuditsTable.parameter,
      claimed: cagAuditsTable.claimed,
      actual: cagAuditsTable.actual,
      unit: cagAuditsTable.unit,
      gapPercent: cagAuditsTable.gapPercent,
      sourceUrl: cagAuditsTable.sourceUrl,
    })
    .from(cagAuditsTable)
    .innerJoin(schemesTable, eq(schemesTable.id, cagAuditsTable.schemeId))
    .where(yearFrom ? gte(cagAuditsTable.reportYear, yearFrom) : undefined)
    .orderBy(cagAuditsTable.reportYear, cagAuditsTable.severity);

  res.json(rows.map(r => ({
    ...r,
    gapPercent: r.gapPercent !== null ? Number(r.gapPercent) : null,
  })));
});

router.get("/schemes/:slug/cag", async (req, res): Promise<void> => {
  const rawSlug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;

  const [scheme] = await db
    .select({ id: schemesTable.id })
    .from(schemesTable)
    .where(eq(schemesTable.slug, rawSlug));

  if (!scheme) {
    res.status(404).json({ error: "Scheme not found" });
    return;
  }

  const audits = await db
    .select()
    .from(cagAuditsTable)
    .where(eq(cagAuditsTable.schemeId, scheme.id))
    .orderBy(cagAuditsTable.reportYear);

  res.json(
    ListCagAuditsResponse.parse(
      audits.map((a) => ({
        ...a,
        gapPercent: a.gapPercent !== null ? Number(a.gapPercent) : null,
      }))
    )
  );
});

router.post("/schemes/:slug/cag", async (req, res): Promise<void> => {
  const rawSlug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;

  const [scheme] = await db
    .select({ id: schemesTable.id })
    .from(schemesTable)
    .where(eq(schemesTable.slug, rawSlug));

  if (!scheme) {
    res.status(404).json({ error: "Scheme not found" });
    return;
  }

  const parsed = CreateCagAuditBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { claimed, actual, unit, gapPercent, ...rest } = parsed.data;
  const [created] = await db
    .insert(cagAuditsTable)
    .values({
      ...rest,
      schemeId: scheme.id,
      claimed: claimed ?? null,
      actual: actual ?? null,
      unit: unit ?? null,
      gapPercent: gapPercent !== undefined ? String(gapPercent) : null,
    })
    .returning();

  res.status(201).json(
    CreateCagAuditResponse.parse({
      ...created,
      gapPercent: created.gapPercent !== null ? Number(created.gapPercent) : null,
    })
  );
});

router.delete("/cag/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }
  await db.delete(cagAuditsTable).where(eq(cagAuditsTable.id, id));
  res.status(204).send();
});

export default router;
