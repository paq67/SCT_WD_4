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
    
    const completion = await storage.createCompletion({ ...data, userId });
    
    // Update habit progress
    const habit = await storage.getHabit(data.habitId);
    if (habit) {
      await storage.updateHabit(habit.id, { current: habit.current + 1 });
    }
    
    // Award XP
    await storage.updateUserXP(userId, 10);
    
    res.json(completion);
  });

  // User Profile & Progress
  app.get("/api/profile", async (req: Request, res: Response) => {
    const userId = 1; // Hardcoded for demo
    const user = await storage.getUser(userId);
    res.json(user);
  });

  app.post("/api/unlock", async (req: Request, res: Response) => {
    const userId = 1; // Hardcoded for demo
    const schema = z.object({
      type: z.enum(['sounds', 'backgrounds', 'characters']),
      item: z.string()
    });
    const { type, item } = schema.parse(req.body);
    const user = await storage.unlockItem(userId, type, item);
    res.json(user);
  });

  const httpServer = createServer(app);
  return httpServer;
}
