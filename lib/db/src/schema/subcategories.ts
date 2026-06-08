import { pgTable, text, integer, varchar, timestamp, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const subcategoriesTable = pgTable("subcategories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  categoryId: integer("category_id").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertSubcategorySchema = createInsertSchema(subcategoriesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertSubcategory = z.infer<typeof insertSubcategorySchema>;
export type Subcategory = typeof subcategoriesTable.$inferSelect;
