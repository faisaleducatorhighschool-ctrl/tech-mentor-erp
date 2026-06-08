import { pgTable, text, integer, varchar, timestamp, boolean, serial, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const notificationsTable = pgTable("notifications", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 50 }).notNull().default("info"),
  isRead: boolean("is_read").notNull().default(false),
  referenceId: integer("reference_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const whatsappTemplatesTable = pgTable("whatsapp_templates", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  trigger: varchar("trigger", { length: 100 }).notNull(),
  message: text("message").notNull(),
  language: varchar("language", { length: 5 }).notNull().default("en"),
  businessType: varchar("business_type", { length: 50 }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const whatsappLogsTable = pgTable("whatsapp_logs", {
  id: serial("id").primaryKey(),
  entityType: varchar("entity_type", { length: 20 }).notNull().default("manual"),
  entityId: integer("entity_id"),
  recipientName: varchar("recipient_name", { length: 255 }),
  phone: varchar("phone", { length: 50 }).notNull(),
  trigger: varchar("trigger", { length: 100 }),
  templateName: varchar("template_name", { length: 255 }),
  message: text("message").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("sent"),
  error: text("error"),
  provider: varchar("provider", { length: 50 }),
  createdById: integer("created_by_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("whatsapp_log_created_idx").on(t.createdAt),
  index("whatsapp_log_entity_idx").on(t.entityType, t.entityId),
]);

export const settingsTable = pgTable("settings", {
  id: serial("id").primaryKey(),
  storeName: varchar("store_name", { length: 255 }).notNull().default("My Store"),
  storePhone: varchar("store_phone", { length: 50 }),
  storeEmail: varchar("store_email", { length: 255 }),
  storeAddress: text("store_address"),
  currency: varchar("currency", { length: 10 }).notNull().default("PKR"),
  taxRate: varchar("tax_rate", { length: 50 }).notNull().default("0"),
  invoicePrefix: varchar("invoice_prefix", { length: 50 }).notNull().default("INV"),
  logoUrl: text("logo_url"),
  faviconUrl: text("favicon_url"),
  darkMode: boolean("dark_mode").notNull().default(false),
  companyName: varchar("company_name", { length: 255 }),
  ownerName: varchar("owner_name", { length: 255 }),
  branchName: varchar("branch_name", { length: 255 }),
  whatsappNumber: varchar("whatsapp_number", { length: 50 }),
  stampUrl: text("stamp_url"),
  signatureUrl: text("signature_url"),
  bankName: varchar("bank_name", { length: 255 }),
  bankAccountTitle: varchar("bank_account_title", { length: 255 }),
  bankAccount: varchar("bank_account", { length: 100 }),
  bankIban: varchar("bank_iban", { length: 100 }),
  bankBranchCode: varchar("bank_branch_code", { length: 50 }),
  jazzcashNumber: varchar("jazzcash_number", { length: 50 }),
  easypaisaNumber: varchar("easypaisa_number", { length: 50 }),
  qrCodeUrl: text("qr_code_url"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const whatsappConfigTable = pgTable("whatsapp_config", {
  id: serial("id").primaryKey(),
  automationEnabled: boolean("automation_enabled").notNull().default(false),
  provider: varchar("provider", { length: 50 }).notNull().default("wasms"),
  defaultLanguage: varchar("default_language", { length: 5 }).notNull().default("en"),
  metaAccessToken: text("meta_access_token"),
  metaPhoneNumberId: varchar("meta_phone_number_id", { length: 100 }),
  metaApiVersion: varchar("meta_api_version", { length: 20 }).notNull().default("v22.0"),
  wasmsApiKey: varchar("wasms_api_key", { length: 255 }),
  wasmsWhatsappId: varchar("wasms_whatsapp_id", { length: 100 }),
  customApiUrl: text("custom_api_url"),
  customApiMethod: varchar("custom_api_method", { length: 10 }).notNull().default("POST"),
  customAuthHeader: text("custom_auth_header"),
  customContentType: varchar("custom_content_type", { length: 100 }).notNull().default("application/json"),
  customBodyTemplate: text("custom_body_template").notNull().default("{}"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notificationsTable).omit({ id: true, createdAt: true });
export const insertWhatsappTemplateSchema = createInsertSchema(whatsappTemplatesTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertWhatsappLogSchema = createInsertSchema(whatsappLogsTable).omit({ id: true, createdAt: true });
export const insertSettingsSchema = createInsertSchema(settingsTable).omit({ id: true, updatedAt: true });
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type InsertWhatsappTemplate = z.infer<typeof insertWhatsappTemplateSchema>;
export type InsertWhatsappLog = z.infer<typeof insertWhatsappLogSchema>;
export type Notification = typeof notificationsTable.$inferSelect;
export type WhatsappTemplate = typeof whatsappTemplatesTable.$inferSelect;
export type WhatsappLog = typeof whatsappLogsTable.$inferSelect;
export type Settings = typeof settingsTable.$inferSelect;
export type WhatsappConfig = typeof whatsappConfigTable.$inferSelect;
