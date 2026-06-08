import { pgTable, text, integer, varchar, timestamp, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const deliveryRoutesTable = pgTable("delivery_routes", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  area: varchar("area", { length: 255 }).notNull(),
  vehicle: varchar("vehicle", { length: 255 }),
  employeeId: integer("employee_id"),
  deliveryDate: varchar("delivery_date", { length: 50 }),
  status: varchar("status", { length: 50 }).notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const deliveryAssignmentsTable = pgTable("delivery_assignments", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  employeeId: integer("employee_id").notNull(),
  routeId: integer("route_id"),
  status: varchar("status", { length: 50 }).notNull().default("assigned"),
  deliveredAt: timestamp("delivered_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertDeliveryRouteSchema = createInsertSchema(deliveryRoutesTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDeliveryAssignmentSchema = createInsertSchema(deliveryAssignmentsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertDeliveryRoute = z.infer<typeof insertDeliveryRouteSchema>;
export type InsertDeliveryAssignment = z.infer<typeof insertDeliveryAssignmentSchema>;
export type DeliveryRoute = typeof deliveryRoutesTable.$inferSelect;
export type DeliveryAssignment = typeof deliveryAssignmentsTable.$inferSelect;
