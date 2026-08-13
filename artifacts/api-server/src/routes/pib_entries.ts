import { Router } from "express";
import { db, pibEntriesTable, schemesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  CreatePibEntryBody,
  CreatePibEntryResponse,
  ListPibEntriesResponse,
} from "@workspace/api-zod";

const router = Router();

router.get("/schemes/:slug/pib", async (req, res): Promise<void> => {
  const rawSlug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;

  const [scheme] = await db
    .select({ id: schemesTable.id })
    .from(schemesTable)
    .where(eq(schemesTable.slug, rawSlug));

  if (!scheme) {
    res.status(404).json({ error: "Scheme not found" });
    return;
  }

  const entries = await db
    .select()
    .from(pibEntriesTable)
    .where(eq(pibEntriesTable.schemeId, scheme.id))
    .orderBy(pibEntriesTable.date);

  res.json(ListPibEntriesResponse.parse(entries.map((e) => ({ ...e, date: String(e.date) }))));
});

router.post("/schemes/:slug/pib", async (req, res): Promise<void> => {
  const rawSlug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;

  const [scheme] = await db
    .select({ id: schemesTable.id })
    .from(schemesTable)
    .where(eq(schemesTable.slug, rawSlug));

  if (!scheme) {
    res.status(404).json({ error: "Scheme not found" });
    return;
  }

  const parsed = CreatePibEntryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { figure, figureUnit, sourceUrl, ...rest } = parsed.data;
  const [created] = await db
    .insert(pibEntriesTable)
    .values({
      ...rest,
      schemeId: scheme.id,
      figure: figure ?? null,
      figureUnit: figureUnit ?? null,
      sourceUrl: sourceUrl ?? null,
    })
    .returning();

  res.status(201).json(CreatePibEntryResponse.parse({ ...created, date: String(created.date) }));
});

router.delete("/pib/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }
  await db.delete(pibEntriesTable).where(eq(pibEntriesTable.id, id));
  res.status(204).send();
});

export default router;
