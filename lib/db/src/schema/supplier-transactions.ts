import { mysqlTable, text, int, varchar, timestamp, decimal, index } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const supplierTransactionsTable = mysqlTable("supplier_transactions", {
  id: int("id").autoincrement().primaryKey(),
  supplierId: int("supplier_id").notNull(),
  account: varchar("account", { length: 20 }).notNull(),
  txnType: varchar("txn_type", { length: 30 }).notNull(),
  direction: varchar("direction", { length: 10 }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }).notNull().default("cash"),
  referenceNo: varchar("reference_no", { length: 50 }).notNull(),
  bankRef: varchar("bank_ref", { length: 191 }),
  note: text("note"),
  txnDate: timestamp("txn_date").notNull().defaultNow(),
  createdById: int("created_by_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("supplier_txn_supplier_idx").on(t.supplierId),
  index("supplier_txn_date_idx").on(t.txnDate),
]);

export const insertSupplierTransactionSchema = createInsertSchema(supplierTransactionsTable).omit({ id: true, createdAt: true });
export type InsertSupplierTransaction = z.infer<typeof insertSupplierTransactionSchema>;
export type SupplierTransaction = typeof supplierTransactionsTable.$inferSelect;
