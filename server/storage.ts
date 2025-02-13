import { 
  users, type User, type InsertUser,
  habits, type Habit, type InsertHabit,
  completions, type Completion, type InsertCompletion 
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private habits: Map<number, Habit>;
  private completions: Map<number, Completion>;
  private currentIds: { users: number; habits: number; completions: number };

  constructor() {
    this.users = new Map();
    this.habits = new Map();
    this.completions = new Map();
    this.currentIds = { users: 1, habits: 1, completions: 1 };
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.users++;
    const user: User = {
      ...insertUser,
      id,
      xp: 0,
      level: 1,
      unlockedSounds: [],
      unlockedBackgrounds: [],
      unlockedCharacters: []
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserXP(id: number, xp: number): Promise<User> {
    const user = await this.getUser(id);
    if (!user) throw new Error("User not found");
    
    const newXP = user.xp + xp;
    const newLevel = Math.floor(Math.sqrt(newXP / 100)) + 1;
    
    const updatedUser = {
      ...user,
      xp: newXP,
      level: newLevel
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async unlockItem(id: number, type: 'sounds' | 'backgrounds' | 'characters', item: string): Promise<User> {
    const user = await this.getUser(id);
    if (!user) throw new Error("User not found");

    const field = `unlocked${type.charAt(0).toUpperCase() + type.slice(1)}` as keyof User;
    const currentItems = user[field] as string[];
    
    if (!currentItems.includes(item)) {
      const updatedUser = {
        ...user,
        [field]: [...currentItems, item]
      };
      this.users.set(id, updatedUser);
      return updatedUser;
    }
    return user;
  }

  // Habit methods
  async getHabits(userId: number): Promise<Habit[]> {
    return Array.from(this.habits.values()).filter(h => h.userId === userId);
  }

  async getHabit(id: number): Promise<Habit | undefined> {
    return this.habits.get(id);
  }

  async createHabit(habit: InsertHabit & { userId: number }): Promise<Habit> {
    const id = this.currentIds.habits++;
    const newHabit: Habit = {
      ...habit,
      id,
      current: 0,
      createdAt: new Date()
    };
    this.habits.set(id, newHabit);
    return newHabit;
  }

  async updateHabit(id: number, data: Partial<Habit>): Promise<Habit> {
    const habit = await this.getHabit(id);
    if (!habit) throw new Error("Habit not found");
    
    const updatedHabit = { ...habit, ...data };
    this.habits.set(id, updatedHabit);
    return updatedHabit;
  }

  async deleteHabit(id: number): Promise<void> {
    this.habits.delete(id);
  }

  // Completion methods
  async getCompletions(userId: number, habitId?: number): Promise<Completion[]> {
    return Array.from(this.completions.values())
      .filter(c => c.userId === userId && (!habitId || c.habitId === habitId));
  }

  async createCompletion(completion: InsertCompletion & { userId: number }): Promise<Completion> {
    const id = this.currentIds.completions++;
    const newCompletion: Completion = {
      ...completion,
      id,
      completedAt: new Date()
    };
    this.completions.set(id, newCompletion);
    return newCompletion;
  }
}

export const storage = new MemStorage();
