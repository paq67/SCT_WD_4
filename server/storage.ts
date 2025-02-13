import { 
  users, type User, type InsertUser,
  habits, type Habit, type InsertHabit,
  completions, type Completion, type InsertCompletion,
  items, type Item,
  userItems, type UserItem,
  pets, type Pet
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
  updateUserCoins(id: number, coins: number): Promise<User>;
  setActivePet(userId: number, petId: number): Promise<User>;

  // Habit methods
  getHabits(userId: number): Promise<Habit[]>;
  getHabit(id: number): Promise<Habit | undefined>;
  createHabit(habit: InsertHabit & { userId: number }): Promise<Habit>;
  updateHabit(id: number, data: Partial<Habit>): Promise<Habit>;
  deleteHabit(id: number): Promise<void>;

  // Completion methods
  getCompletions(userId: number, habitId?: number): Promise<Completion[]>;
  createCompletion(completion: InsertCompletion & { userId: number }): Promise<Completion>;

  // Shop methods
  getShopItems(): Promise<Item[]>;
  purchaseItem(userId: number, itemId: number): Promise<UserItem>;

  // Pet methods
  getUserPets(userId: number): Promise<Pet[]>;
  createPet(userId: number, itemId: number, name: string): Promise<Pet>;
  feedPet(userId: number, petId: number): Promise<Pet>;
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
        unlockedCharacters: [],
        coins: 100, // Added initial coins
        activePetId: null
      })
      .returning();
    return user;
  }

  async updateUserXP(id: number, xp: number): Promise<User> {
    let [user] = await db.select().from(users).where(eq(users.id, id));
    if (!user) {
      [user] = await db.insert(users).values({
        id,
        username: `user${id}`,
        password: 'default',
        xp: 0,
        level: 1,
        unlockedSounds: [],
        unlockedBackgrounds: [],
        unlockedCharacters: [],
        coins: 100, // Added initial coins
        activePetId: null
      }).returning();
    }

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

  async getShopItems(): Promise<Item[]> {
    const items = await db.select().from(items);
    return items;
  }

  async purchaseItem(userId: number, itemId: number): Promise<UserItem> {
    // First check if user has enough coins
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    const [item] = await db.select().from(items).where(eq(items.id, itemId));

    if (!user || !item) {
      throw new Error("User or item not found");
    }

    if (user.coins < item.price) {
      throw new Error("Not enough coins");
    }

    // Deduct coins and add item to user's inventory
    await db
      .update(users)
      .set({ coins: user.coins - item.price })
      .where(eq(users.id, userId));

    const [userItem] = await db
      .insert(userItems)
      .values({
        userId,
        itemId,
        equipped: false,
        acquiredAt: new Date()
      })
      .returning();

    return userItem;
  }

  async updateUserCoins(id: number, coins: number): Promise<User> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    if (!user) throw new Error("User not found");

    const newCoins = user.coins + coins;
    const [updatedUser] = await db
      .update(users)
      .set({ coins: newCoins })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async getUserPets(userId: number): Promise<Pet[]> {
    return db.select().from(pets).where(eq(pets.userId, userId));
  }

  async createPet(userId: number, itemId: number, name: string): Promise<Pet> {
    const [pet] = await db
      .insert(pets)
      .values({
        userId,
        itemId,
        name,
        happiness: 100,
        lastFed: new Date(),
        createdAt: new Date()
      })
      .returning();
    return pet;
  }

  async feedPet(userId: number, petId: number): Promise<Pet> {
    const [pet] = await db
      .update(pets)
      .set({
        happiness: 100,
        lastFed: new Date()
      })
      .where(eq(pets.id, petId))
      .where(eq(pets.userId, userId))
      .returning();

    if (!pet) throw new Error("Pet not found");
    return pet;
  }

  async setActivePet(userId: number, petId: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ activePetId: petId })
      .where(eq(users.id, userId))
      .returning();

    if (!user) throw new Error("User not found");
    return user;
  }
}

export const storage = new DatabaseStorage();