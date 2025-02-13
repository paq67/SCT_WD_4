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

    // Award XP and coins
    await storage.updateUserXP(userId, 10);
    await storage.updateUserCoins(userId, 5); // Award 5 coins per completion

    res.json(completion);
  });

  // User Profile & Progress
  app.get("/api/profile", async (req: Request, res: Response) => {
    const userId = 1; // Hardcoded for demo
    const user = await storage.getUser(userId);
    res.json(user);
  });

  // Shop & Items
  app.get("/api/shop", async (req: Request, res: Response) => {
    const items = await storage.getShopItems();
    res.json(items);
  });

  app.post("/api/shop/buy", async (req: Request, res: Response) => {
    const userId = 1; // Hardcoded for demo
    const schema = z.object({
      itemId: z.number()
    });
    const { itemId } = schema.parse(req.body);
    const userItem = await storage.purchaseItem(userId, itemId);
    res.json(userItem);
  });

  // Pet Management
  app.get("/api/pets", async (req: Request, res: Response) => {
    const userId = 1; // Hardcoded for demo
    const pets = await storage.getUserPets(userId);
    res.json(pets);
  });

  app.post("/api/pets", async (req: Request, res: Response) => {
    const userId = 1; // Hardcoded for demo
    const schema = z.object({
      itemId: z.number(),
      name: z.string()
    });
    const data = schema.parse(req.body);
    const pet = await storage.createPet(userId, data.itemId, data.name);
    res.json(pet);
  });

  app.post("/api/pets/:id/feed", async (req: Request, res: Response) => {
    const userId = 1; // Hardcoded for demo
    const petId = parseInt(req.params.id);
    const pet = await storage.feedPet(userId, petId);
    res.json(pet);
  });

  app.post("/api/pets/:id/activate", async (req: Request, res: Response) => {
    const userId = 1; // Hardcoded for demo
    const petId = parseInt(req.params.id);
    const user = await storage.setActivePet(userId, petId);
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