import { pgTable, serial, text, integer, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { schemesTable } from "./schemes";

export const pibEntriesTable = pgTable("pib_entries", {
  id: serial("id").primaryKey(),
  schemeId: integer("scheme_id").notNull().references(() => schemesTable.id, { onDelete: "cascade" }),
  date: date("date", { mode: "string" }).notNull(),
  headline: text("headline").notNull(),
  summary: text("summary").notNull(),
  claimType: text("claim_type").notNull().default("achievement"), // achievement | target | launch | update
  figure: text("figure"),
  figureUnit: text("figure_unit"),
  sourceUrl: text("source_url"),
});

export const insertPibEntrySchema = createInsertSchema(pibEntriesTable).omit({ id: true });
export type InsertPibEntry = z.infer<typeof insertPibEntrySchema>;
export type PibEntry = typeof pibEntriesTable.$inferSelect;
