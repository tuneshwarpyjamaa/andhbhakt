import { pgTable, text, jsonb, timestamp, integer } from "drizzle-orm/pg-core";

export const contentDocumentsTable = pgTable("content_documents", {
  key: text("key").primaryKey(),
  kind: text("kind").notNull(),
  payload: jsonb("payload").notNull(),
  sourcePath: text("source_path"),
  byteSize: integer("byte_size").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type ContentDocument = typeof contentDocumentsTable.$inferSelect;
export type InsertContentDocument = typeof contentDocumentsTable.$inferInsert;
