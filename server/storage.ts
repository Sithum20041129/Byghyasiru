import { users, sessions, type User, type InsertUser, type Session, type InsertSession } from "../shared/schema";
import { db } from "./db";
import { eq, and, gt } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  createSession(insertSession: InsertSession): Promise<Session>;
  getSessionByToken(token: string): Promise<Session & { user: User } | undefined>;
  deleteSession(token: string): Promise<void>;
  deleteExpiredSessions(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
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
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const [session] = await db
      .insert(sessions)
      .values(insertSession)
      .returning();
    return session;
  }

  async getSessionByToken(token: string): Promise<Session & { user: User } | undefined> {
    const result = await db
      .select()
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(and(
        eq(sessions.token, token),
        gt(sessions.expiresAt, new Date())
      ))
      .limit(1);

    if (result.length === 0) {
      return undefined;
    }

    const { sessions: session, users: user } = result[0];
    return { ...session, user };
  }

  async deleteSession(token: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.token, token));
  }

  async deleteExpiredSessions(): Promise<void> {
    await db.delete(sessions).where(gt(sessions.expiresAt, new Date()));
  }
}

export const storage = new DatabaseStorage();