import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const ISSUE_TYPES = [
  "data_error",
  "broken_link",
  "missing_data",
  "ui_bug",
  "inappropriate",
  "other",
] as const;
export type IssueType = (typeof ISSUE_TYPES)[number];

export const ISSUE_STATUSES = ["open", "reviewing", "resolved", "dismissed"] as const;
export type IssueStatus = (typeof ISSUE_STATUSES)[number];

export const issueReportsTable = pgTable("issue_reports", {
  id:            serial("id").primaryKey(),
  issueType:     text("issue_type").notNull(),
  pageAffected:  text("page_affected"),
  description:   text("description").notNull(),
  email:         text("email"),
  ipAddress:     text("ip_address"),
  userAgent:     text("user_agent"),
  status:        text("status").notNull().default("open"),
  createdAt:     timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type InsertIssueReport = typeof issueReportsTable.$inferInsert;
export type IssueReport      = typeof issueReportsTable.$inferSelect;
