import { Express, Request, Response } from "express";
import { createServer, Server } from "http";
import { storage } from "./storage";
import { insertHabitSchema, insertCompletionSchema } from "@shared/schema";
import { z } from "zod";

export function registerRoutes(app: Express): Server {
  // Habits CRUD
  app.get("/api/habits", async (req: Request, res: Response) => {
    const userId = 1; // Hardcoded for demo
    const habits = await storage.getHabits(userId);
    res.json(habits);
  });

  app.post("/api/habits", async (req: Request, res: Response) => {
    const userId = 1; // Hardcoded for demo
    const data = insertHabitSchema.parse(req.body);
    const habit = await storage.createHabit({ ...data, userId });
    res.json(habit);
  });

  app.patch("/api/habits/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const data = req.body;
    const habit = await storage.updateHabit(id, data);
    res.json(habit);
  });

  app.delete("/api/habits/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    await storage.deleteHabit(id);
    res.status(204).end();
  });

  // Completions
  app.get("/api/completions", async (req: Request, res: Response) => {
    const userId = 1; // Hardcoded for demo
    const habitId = req.query.habitId ? parseInt(req.query.habitId as string) : undefined;
    const completions = await storage.getCompletions(userId, habitId);
    res.json(completions);
  });

  app.post("/api/completions", async (req: Request, res: Response) => {
    const userId = 1; // Hardcoded for demo
    const data = insertCompletionSchema.parse(req.body);

    // Calculate coins and XP
    const habit = await storage.getHabit(data.habitId);
    if (!habit) throw new Error("Habit not found");

    const wasCompletedToday = habit.lastCompleted 
      ? new Date(habit.lastCompleted).toDateString() === new Date().toDateString()
      : false;

    if (!wasCompletedToday) {
      const streakBonus = Math.floor(habit.streak / 7) * 5; // +5 coins per week of streak
      const coinsEarned = 10 + streakBonus; // Base 10 coins + streak bonus
      const xpEarned = 10; // Base 10 XP

      const completion = await storage.createCompletion({ 
        ...data, 
        userId,
        coinsEarned,
        xpEarned
      });

      // Update habit progress and streak
      const newStreak = habit.streak + 1;
      await storage.updateHabit(habit.id, { 
        current: habit.current + 1,
        streak: newStreak,
        lastCompleted: new Date()
      });

      // Award coins and XP
      await storage.updateUserCoins(userId, coinsEarned);
      await storage.updateUserXP(userId, xpEarned);

      res.json(completion);
    } else {
      res.status(400).json({ message: "Habit already completed today" });
    }
  });

  // Shop
  app.get("/api/shop", async (req: Request, res: Response) => {
    const items = await storage.getShopItems();
    res.json(items);
  });

  app.post("/api/shop/purchase", async (req: Request, res: Response) => {
    const userId = 1; // Hardcoded for demo
    const schema = z.object({
      itemId: z.number()
    });
    const { itemId } = schema.parse(req.body);
    const result = await storage.purchaseItem(userId, itemId);
    res.json(result);
  });

  app.post("/api/shop/use", async (req: Request, res: Response) => {
    const userId = 1; // Hardcoded for demo
    const schema = z.object({
      itemId: z.number()
    });
    const { itemId } = schema.parse(req.body);
    const result = await storage.useItem(userId, itemId);
    res.json(result);
  });

  // User Profile & Progress
  app.get("/api/profile", async (req: Request, res: Response) => {
    const userId = 1; // Hardcoded for demo
    const user = await storage.getUser(userId);
    res.json(user);
  });

  const httpServer = createServer(app);
  return httpServer;
}