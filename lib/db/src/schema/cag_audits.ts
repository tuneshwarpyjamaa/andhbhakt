import { pgTable, serial, text, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { schemesTable } from "./schemes";

export const cagAuditsTable = pgTable("cag_audits", {
  id: serial("id").primaryKey(),
  schemeId: integer("scheme_id").notNull().references(() => schemesTable.id, { onDelete: "cascade" }),
  reportYear: integer("report_year").notNull(),
  reportNumber: text("report_number").notNull(),
  finding: text("finding").notNull(),
  severity: text("severity").notNull().default("major"), // critical | major | minor
  parameter: text("parameter").notNull(),
  claimed: text("claimed"),
  actual: text("actual"),
  unit: text("unit"),
  gapPercent: numeric("gap_percent", { precision: 8, scale: 2 }),
  sourceUrl: text("source_url"),
  reportExcerpt: text("report_excerpt"),
});

export const insertCagAuditSchema = createInsertSchema(cagAuditsTable).omit({ id: true });
export type InsertCagAudit = z.infer<typeof insertCagAuditSchema>;
export type CagAudit = typeof cagAuditsTable.$inferSelect;
