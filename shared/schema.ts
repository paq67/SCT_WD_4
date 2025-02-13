import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  xp: integer("xp").notNull().default(0),
  level: integer("level").notNull().default(1),
  unlockedSounds: text("unlocked_sounds").array().notNull().default([]),
  unlockedBackgrounds: text("unlocked_backgrounds").array().notNull().default([]),
  unlockedCharacters: text("unlocked_characters").array().notNull().default([]),
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

export type User = typeof users.$inferSelect;
export type Habit = typeof habits.$inferSelect;
export type Completion = typeof completions.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertHabit = z.infer<typeof insertHabitSchema>;
export type InsertCompletion = z.infer<typeof insertCompletionSchema>;
