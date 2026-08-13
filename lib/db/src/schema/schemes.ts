import { pgTable, serial, text, integer, numeric, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { categoriesTable } from "./categories";

export const schemesTable = pgTable("schemes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  ministry: text("ministry").notNull(),
  launchedYear: integer("launched_year").notNull(),
  renamedFrom: text("renamed_from"),
  categoryId: integer("category_id").notNull().references(() => categoriesTable.id),
  description: text("description").notNull(),
  goals: text("goals").notNull(),
  targetBeneficiaries: text("target_beneficiaries"),
  targetYear: integer("target_year"),
  budgetCrore: numeric("budget_crore", { precision: 14, scale: 2 }),
});

export const insertSchemeSchema = createInsertSchema(schemesTable).omit({ id: true });
export type InsertScheme = z.infer<typeof insertSchemeSchema>;
export type Scheme = typeof schemesTable.$inferSelect;
