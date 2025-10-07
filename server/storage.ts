import {
  users,
  sessions,
  menuItems, // ✅ Make sure this table exists in your shared/schema
  type User,
  type InsertUser,
  type Session,
  type InsertSession,
  type MenuItem,
  type InsertMenuItem,
} from "../shared/schema";

import { db } from "./db";
import { eq, and, gt, lt } from "drizzle-orm";

export interface IStorage {
  // 👤 User & Session functions
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  createSession(insertSession: InsertSession): Promise<Session>;
  getSessionByToken(token: string): Promise<Session & { user: User } | undefined>;
  deleteSession(token: string): Promise<void>;
  deleteExpiredSessions(): Promise<void>;

  // 🍱 Menu-related functions
  createMenuItem(data: InsertMenuItem): Promise<MenuItem>;
  getMenuItemsByMerchantId(merchantId: number): Promise<MenuItem[]>;
  getMenuItemById(id: number): Promise<MenuItem | undefined>;
  updateMenuItem(id: number, data: Partial<MenuItem>): Promise<MenuItem | undefined>;
  deleteMenuItem(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // 👤 User-related
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // 🔐 Session-related
  async createSession(insertSession: InsertSession): Promise<Session> {
    const [session] = await db.insert(sessions).values(insertSession).returning();
    return session;
  }

  async getSessionByToken(token: string): Promise<Session & { user: User } | undefined> {
    const result = await db
      .select()
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(and(eq(sessions.token, token), gt(sessions.expiresAt, new Date())))
      .limit(1);

    if (result.length === 0) return undefined;

    const { sessions: session, users: user } = result[0];
    return { ...session, user };
  }

  async deleteSession(token: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.token, token));
  }

  async deleteExpiredSessions(): Promise<void> {
    await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
  }

  // 🍱 Menu-related
  async createMenuItem(data: InsertMenuItem): Promise<MenuItem> {
    const [item] = await db.insert(menuItems).values(data).returning();
    return item;
  }

  async getMenuItemsByMerchantId(merchantId: number): Promise<MenuItem[]> {
    return await db.select().from(menuItems).where(eq(menuItems.merchantId, merchantId));
  }

  async getMenuItemById(id: number): Promise<MenuItem | undefined> {
    const [item] = await db.select().from(menuItems).where(eq(menuItems.id, id));
    return item || undefined;
  }

  async updateMenuItem(id: number, data: Partial<MenuItem>): Promise<MenuItem | undefined> {
    const [updated] = await db.update(menuItems).set(data).where(eq(menuItems.id, id)).returning();
    return updated || undefined;
  }

  async deleteMenuItem(id: number): Promise<void> {
    await db.delete(menuItems).where(eq(menuItems.id, id));
  }
}

export const storage = new DatabaseStorage();
