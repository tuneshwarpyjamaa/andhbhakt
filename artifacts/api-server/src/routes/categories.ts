import { Router } from "express";
import { db, categoriesTable, schemesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import {
  CreateCategoryBody,
  CreateCategoryResponse,
  ListCategoriesResponse,
} from "@workspace/api-zod";

const router = Router();

router.get("/categories", async (req, res): Promise<void> => {
  const categories = await db
    .select({
      id: categoriesTable.id,
      name: categoriesTable.name,
      slug: categoriesTable.slug,
      icon: categoriesTable.icon,
      schemeCount: sql<number>`count(${schemesTable.id})`.mapWith(Number),
    })
    .from(categoriesTable)
    .leftJoin(schemesTable, eq(schemesTable.categoryId, categoriesTable.id))
    .groupBy(categoriesTable.id);

  res.json(ListCategoriesResponse.parse(categories));
});

router.post("/categories", async (req, res): Promise<void> => {
  const parsed = CreateCategoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [created] = await db
    .insert(categoriesTable)
    .values(parsed.data)
    .returning();

  res.status(201).json(CreateCategoryResponse.parse({ ...created, schemeCount: 0 }));
});

export default router;
