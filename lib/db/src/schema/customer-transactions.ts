import { mysqlTable, text, int, varchar, timestamp, decimal, index } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const customerTransactionsTable = mysqlTable("customer_transactions", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customer_id").notNull(),
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
  index("customer_txn_customer_idx").on(t.customerId),
  index("customer_txn_date_idx").on(t.txnDate),
]);

export const insertCustomerTransactionSchema = createInsertSchema(customerTransactionsTable).omit({ id: true, createdAt: true });
export type InsertCustomerTransaction = z.infer<typeof insertCustomerTransactionSchema>;
export type CustomerTransaction = typeof customerTransactionsTable.$inferSelect;
