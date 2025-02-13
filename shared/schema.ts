import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  xp: integer("xp").notNull().default(0),
  coins: integer("coins").notNull().default(0),
  level: integer("level").notNull().default(1),
  unlockedSounds: text("unlocked_sounds").array().notNull().default([]),
  unlockedBackgrounds: text("unlocked_backgrounds").array().notNull().default([]),
  unlockedCharacters: text("unlocked_characters").array().notNull().default([]),
  activePetId: integer("active_pet_id"),
});

export const habits = pgTable("habits", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  target: integer("target").notNull().default(1),
  current: integer("current").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const completions = pgTable("completions", {
  id: serial("id").primaryKey(),
  habitId: integer("habit_id").notNull(),
  userId: integer("user_id").notNull(),
  completedAt: timestamp("completed_at").notNull().defaultNow(),
});

export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(), // 'cosmetic', 'boost', 'powerup', 'pet'
  price: integer("price").notNull(),
  imageUrl: text("image_url"),
  seasonal: boolean("seasonal").default(false),
  seasonStart: timestamp("season_start"),
  seasonEnd: timestamp("season_end"),
});

export const userItems = pgTable("user_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  itemId: integer("item_id").notNull(),
  equipped: boolean("equipped").default(false),
  acquiredAt: timestamp("acquired_at").notNull().defaultNow(),
});

export const pets = pgTable("pets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  itemId: integer("item_id").notNull(), // References the pet item
  name: text("name").notNull(),
  happiness: integer("happiness").notNull().default(100),
  lastFed: timestamp("last_fed").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Schemas for inserting data
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertHabitSchema = createInsertSchema(habits).pick({
  name: true,
  description: true,
  target: true,
});

export const insertCompletionSchema = createInsertSchema(completions).pick({
  habitId: true,
});

export const insertItemSchema = createInsertSchema(items).pick({
  name: true,
  description: true,
  type: true,
  price: true,
  imageUrl: true,
  seasonal: true,
  seasonStart: true,
  seasonEnd: true,
});

export const insertPetSchema = createInsertSchema(pets).pick({
  itemId: true,
  name: true,
});

// Types for TypeScript
export type User = typeof users.$inferSelect;
export type Habit = typeof habits.$inferSelect;
export type Completion = typeof completions.$inferSelect;
export type Item = typeof items.$inferSelect;
export type UserItem = typeof userItems.$inferSelect;
export type Pet = typeof pets.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertHabit = z.infer<typeof insertHabitSchema>;
export type InsertCompletion = z.infer<typeof insertCompletionSchema>;
export type InsertItem = z.infer<typeof insertItemSchema>;
export type InsertPet = z.infer<typeof insertPetSchema>;