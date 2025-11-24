import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  boolean,
  uuid,
  integer,
  numeric,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// 🧍 USERS TABLE
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  email: varchar("email", { length: 100 }).notNull().unique(),
  password: text("password").notNull(),
  role: varchar("role", { length: 20 }).notNull().default("customer"),
  approved: boolean("approved").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// 💾 SESSIONS TABLE
export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  token: uuid("token").notNull().unique().defaultRandom(),
  userId: integer("user_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
  rememberMe: boolean("remember_me").notNull().default(false),
});

// 🍽️ MENU ITEMS TABLE
export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }), // links to merchant in users table
  name: text("name").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(), // e.g., "main meal", "curry", "gravy"
  portion: text("portion").notNull(), // e.g., "Regular", "Large"
  createdAt: timestamp("created_at").defaultNow(),
});

// 🔗 RELATIONS
export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  menuItems: many(menuItems),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const menuItemsRelations = relations(menuItems, ({ one }) => ({
  merchant: one(users, {
    fields: [menuItems.merchantId],
    references: [users.id],
  }),
}));

// 🧩 TYPES
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;

export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuItem = typeof menuItems.$inferInsert;
