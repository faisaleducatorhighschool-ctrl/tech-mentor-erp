import { pgTable, text, integer, varchar, timestamp, numeric, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  sku: varchar("sku", { length: 191 }).notNull().unique(),
  barcode: varchar("barcode", { length: 100 }),
  isbn: varchar("isbn", { length: 50 }),
  categoryId: integer("category_id"),
  subCategoryId: integer("sub_category_id"),
  branchId: integer("branch_id"),
  callNumber: varchar("call_number", { length: 100 }),
  brandId: integer("brand_id"),
  seriesId: integer("series_id"),
  classId: integer("class_id"),
  subjectId: integer("subject_id"),
  author: varchar("author", { length: 255 }),
  edition: varchar("edition", { length: 100 }),
  costPrice: numeric("cost_price", { precision: 12, scale: 2 }).notNull().default("0"),
  salePrice: numeric("sale_price", { precision: 12, scale: 2 }).notNull().default("0"),
  discountPrice: numeric("discount_price", { precision: 12, scale: 2 }),
  stock: integer("stock").notNull().default(0),
  lowStockLimit: integer("low_stock_limit").notNull().default(10),
  description: text("description"),
  imageUrl: text("image_url"),
  status: varchar("status", { length: 50 }).notNull().default("active"),
  unit: varchar("unit", { length: 50 }).notNull().default("PCS"),
  businessType: varchar("business_type", { length: 50 }),
  batchNumber: varchar("batch_number", { length: 100 }),
  mfgDate: varchar("mfg_date", { length: 50 }),
  expiryDate: varchar("expiry_date", { length: 50 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;
