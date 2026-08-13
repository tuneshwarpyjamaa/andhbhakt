import { pgTable, serial, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const cagStateReportsTable = pgTable("cag_state_reports", {
  id: serial("id").primaryKey(),
  reportId: text("report_id").notNull().unique(),       // matches CagReport.id e.g. "ka-jjm-2025-12"
  reportNo: text("report_no").notNull(),                // "Report No. 12 of 2025"
  year: integer("year").notNull(),
  title: text("title").notNull(),
  state: text("state").notNull(),
  stateCode: text("state_code").notNull(),
  ministry: text("ministry").notNull(),
  category: text("category").notNull(),                 // "Performance Audit"
  severity: text("severity").notNull().default("high"),
  auditPeriod: text("audit_period").notNull(),
  datePresented: text("date_presented").notNull(),
  url: text("url").notNull(),
  fileName: text("file_name").notNull(),
  // CAG API metadata
  cagJsonId: integer("cag_json_id"),                   // id field from CAG API response
  cagState: integer("cag_state"),                      // state id from CAG API
  // Audit tracking
  auditScore: integer("audit_score").notNull().default(100),
  citationsFailed: integer("citations_failed").notNull().default(0),
  citationsVerified: integer("citations_verified").notNull().default(0),
  // Timestamps
  compiledAt: timestamp("compiled_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCagStateReportSchema = createInsertSchema(cagStateReportsTable).omit({ id: true });
export type InsertCagStateReport = z.infer<typeof insertCagStateReportSchema>;
export type CagStateReport = typeof cagStateReportsTable.$inferSelect;
