import { 
  users, type User, type InsertUser,
  habits, type Habit, type InsertHabit,
  completions, type Completion, type InsertCompletion 
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserXP(id: number, xp: number): Promise<User>;
  unlockItem(id: number, type: 'sounds' | 'backgrounds' | 'characters', item: string): Promise<User>;

  // Habit methods
  getHabits(userId: number): Promise<Habit[]>;
  getHabit(id: number): Promise<Habit | undefined>;
  createHabit(habit: InsertHabit & { userId: number }): Promise<Habit>;
  updateHabit(id: number, data: Partial<Habit>): Promise<Habit>;
  deleteHabit(id: number): Promise<void>;

  // Completion methods
  getCompletions(userId: number, habitId?: number): Promise<Completion[]>;
  createCompletion(completion: InsertCompletion & { userId: number }): Promise<Completion>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        xp: 0,
        level: 1,
        unlockedSounds: [],
        unlockedBackgrounds: [],
        unlockedCharacters: []
      })
      .returning();
    return user;
  }

  async updateUserXP(id: number, xp: number): Promise<User> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    if (!user) throw new Error("User not found");

    const newXP = user.xp + xp;
    const newLevel = Math.floor(Math.sqrt(newXP / 100)) + 1;

    const [updatedUser] = await db
      .update(users)
      .set({ xp: newXP, level: newLevel })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async unlockItem(id: number, type: 'sounds' | 'backgrounds' | 'characters', item: string): Promise<User> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    if (!user) throw new Error("User not found");

    const field = `unlocked${type.charAt(0).toUpperCase() + type.slice(1)}` as keyof User;
    const currentItems = user[field] as string[];

    if (!currentItems.includes(item)) {
      const [updatedUser] = await db
        .update(users)
        .set({ [field]: [...currentItems, item] })
        .where(eq(users.id, id))
        .returning();
      return updatedUser;
    }
    return user;
  }

  async getHabits(userId: number): Promise<Habit[]> {
    return db.select().from(habits).where(eq(habits.userId, userId));
  }

  async getHabit(id: number): Promise<Habit | undefined> {
    const [habit] = await db.select().from(habits).where(eq(habits.id, id));
    return habit;
  }

  async createHabit(habit: InsertHabit & { userId: number }): Promise<Habit> {
    const [newHabit] = await db
      .insert(habits)
      .values({
        ...habit,
        current: 0,
        createdAt: new Date()
      })
      .returning();
    return newHabit;
  }

  async updateHabit(id: number, data: Partial<Habit>): Promise<Habit> {
    const [updatedHabit] = await db
      .update(habits)
      .set(data)
      .where(eq(habits.id, id))
      .returning();
    if (!updatedHabit) throw new Error("Habit not found");
    return updatedHabit;
  }

  async deleteHabit(id: number): Promise<void> {
    await db.delete(habits).where(eq(habits.id, id));
  }

  async getCompletions(userId: number, habitId?: number): Promise<Completion[]> {
    let query = db.select().from(completions).where(eq(completions.userId, userId));
    if (habitId) {
      query = query.where(eq(completions.habitId, habitId));
    }
    return query;
  }

  async createCompletion(completion: InsertCompletion & { userId: number }): Promise<Completion> {
    const [newCompletion] = await db
      .insert(completions)
      .values({
        ...completion,
        completedAt: new Date()
      })
      .returning();
    return newCompletion;
  }
}

export const storage = new DatabaseStorage();