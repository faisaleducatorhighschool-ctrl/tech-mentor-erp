import { pgTable, integer, varchar, timestamp, serial, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const businessConfigTable = pgTable("business_config", {
  id: serial("id").primaryKey(),
  activeBusinessTypes: json("active_business_types").$type<string[]>().notNull().default([]),
  primaryBusinessType: varchar("primary_business_type", { length: 50 }),
  enabledModules: json("enabled_modules").$type<Record<string, boolean>>().notNull().default({}),
  appliedPacks: json("applied_packs").$type<string[]>().notNull().default([]),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const unitsTable = pgTable("units", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 191 }).notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUnitSchema = createInsertSchema(unitsTable).omit({ id: true, createdAt: true });
export type InsertUnit = z.infer<typeof insertUnitSchema>;
export type Unit = typeof unitsTable.$inferSelect;
export type BusinessConfig = typeof businessConfigTable.$inferSelect;
