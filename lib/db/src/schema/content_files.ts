import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";

export const contentFilesTable = pgTable("content_files", {
  path: text("path").primaryKey(),
  content: text("content").notNull(),
  byteSize: integer("byte_size").notNull(),
  sha256: text("sha256").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type ContentFile = typeof contentFilesTable.$inferSelect;
export type InsertContentFile = typeof contentFilesTable.$inferInsert;
