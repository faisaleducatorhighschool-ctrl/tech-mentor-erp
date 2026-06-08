import { pgTable, text, integer, varchar, timestamp, numeric, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const cashCollectionsTable = pgTable("cash_collections", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull(),
  orderId: integer("order_id"),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  type: varchar("type", { length: 50 }).notNull().default("collected"),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertCashCollectionSchema = createInsertSchema(cashCollectionsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCashCollection = z.infer<typeof insertCashCollectionSchema>;
export type CashCollection = typeof cashCollectionsTable.$inferSelect;
