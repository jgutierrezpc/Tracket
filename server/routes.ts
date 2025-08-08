import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertActivitySchema, updateActivitySchema, rackets } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all activities
  app.get("/api/activities", async (req, res) => {
    try {
      const { sport, startDate, endDate } = req.query;
      
      let activities;
      if (sport && typeof sport === 'string') {
        activities = await storage.getActivitiesBySport(sport);
      } else if (startDate && endDate && typeof startDate === 'string' && typeof endDate === 'string') {
        activities = await storage.getActivitiesByDateRange(startDate, endDate);
      } else {
        activities = await storage.getActivities();
      }
      
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  // Equipment: Rackets CRUD (in-memory via storage adapter conventions)
  app.get("/api/equipment/rackets", async (req, res) => {
    try {
      const all = await storage.getRackets?.();
      res.json(all || []);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch rackets" });
    }
  });

  app.post("/api/equipment/rackets", async (req, res) => {
    try {
      const { brand, model } = req.body || {};
      if (!brand || !model) return res.status(400).json({ message: "brand and model are required" });
      const created = await storage.createRacket?.({ brand, model });
      res.status(201).json(created);
    } catch (error) {
      res.status(500).json({ message: "Failed to create racket" });
    }
  });

  app.patch("/api/equipment/rackets/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateRacket?.(id, req.body || {});
      if (!updated) return res.status(404).json({ message: "Racket not found" });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to update racket" });
    }
  });

  // Get single activity
  app.get("/api/activities/:id", async (req, res) => {
    try {
      const activity = await storage.getActivity(req.params.id);
      if (!activity) {
        return res.status(404).json({ message: "Activity not found" });
      }
      res.json(activity);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activity" });
    }
  });

  // Create new activity
  app.post("/api/activities", async (req, res) => {
    try {
      const validatedData = insertActivitySchema.parse(req.body);
      const activity = await storage.createActivity(validatedData);
      
      // Note: Courts data is automatically updated since it's calculated from activities
      // For database implementations, add cache invalidation here
      
      res.status(201).json(activity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid activity data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create activity" });
    }
  });

  // Update activity
  app.patch("/api/activities/:id", async (req, res) => {
    try {
      const validatedData = updateActivitySchema.parse(req.body);
      const activity = await storage.updateActivity(req.params.id, validatedData);
      if (!activity) {
        return res.status(404).json({ message: "Activity not found" });
      }
      
      // Note: Courts data is automatically updated since it's calculated from activities
      // For database implementations, add cache invalidation here
      
      res.json(activity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid activity data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update activity" });
    }
  });

  // Delete activity
  app.delete("/api/activities/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteActivity(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Activity not found" });
      }
      
      // Note: Courts data is automatically updated since it's calculated from activities
      // For database implementations, add cache invalidation here
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete activity" });
    }
  });

  // Get activity statistics
  app.get("/api/activities/stats/overview", async (req, res) => {
    try {
      const activities = await storage.getActivities();
      
      const totalActivities = activities.length;
      const totalMinutes = activities.reduce((sum, activity) => sum + activity.duration, 0);
      const totalHours = Math.round(totalMinutes / 60);
      
      const averageDuration = totalActivities > 0 
        ? Math.round(totalMinutes / totalActivities)
        : 0;

      // Calculate training:tournament ratio
      const trainingAndFriendlyCount = activities.filter(a => 
        a.activityType === 'training' || a.activityType === 'friendly' || !a.activityType
      ).length;
      const tournamentCount = activities.filter(a => a.activityType === 'tournament').length;
      const trainingTournamentRatio = tournamentCount > 0 
        ? Number((trainingAndFriendlyCount / tournamentCount).toFixed(0))
        : trainingAndFriendlyCount;

      const sportStats = activities.reduce((acc, activity) => {
        acc[activity.sport] = (acc[activity.sport] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      res.json({
        totalActivities,
        totalHours,
        averageDuration,
        trainingTournamentRatio,
        sportStats
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Load CSV data (for initial data seeding)
  app.post("/api/activities/import-csv", async (req, res) => {
    try {
      const { csvData } = req.body;
      if (!csvData || !Array.isArray(csvData)) {
        return res.status(400).json({ message: "Invalid CSV data format" });
      }

      const importedActivities = [];
      for (const row of csvData) {
        try {
          const activity = await storage.createActivity(row);
          importedActivities.push(activity);
        } catch (error) {
          console.warn("Failed to import activity:", row, error);
        }
      }

      // Note: Courts data is automatically updated since it's calculated from activities
      // For database implementations, add cache invalidation here

      res.json({ 
        message: `Imported ${importedActivities.length} activities`,
        imported: importedActivities.length,
        total: csvData.length
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to import CSV data" });
    }
  });

  // Get courts data
  app.get("/api/courts", async (req, res) => {
    try {
      const { 
        startDate, 
        endDate, 
        sport, 
        activityType, 
        player 
      } = req.query;

      const courtsData = await storage.getCourtsData({
        startDate: startDate as string,
        endDate: endDate as string,
        sport: sport as string,
        activityType: activityType as string,
        player: player as string
      });
      
      res.json(courtsData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch courts data" });
    }
  });

  // Get favorites
  app.get("/api/courts/favorites", async (req, res) => {
    try {
      const favorites = await storage.getFavorites();
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  // Add favorite
  app.post("/api/courts/favorites", async (req, res) => {
    try {
      const { clubName, clubLocation } = req.body;
      if (!clubName) {
        return res.status(400).json({ message: "Club name is required" });
      }
      
      await storage.addFavorite(clubName, clubLocation || "");
      res.status(201).json({ message: "Favorite added successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to add favorite" });
    }
  });

  // Remove favorite
  app.delete("/api/courts/favorites", async (req, res) => {
    try {
      const { clubName, clubLocation } = req.body;
      if (!clubName) {
        return res.status(400).json({ message: "Club name is required" });
      }
      
      await storage.removeFavorite(clubName, clubLocation || "");
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to remove favorite" });
    }
  });

  // Check if favorite
  app.get("/api/courts/favorites/check", async (req, res) => {
    try {
      const { clubName, clubLocation } = req.query;
      if (!clubName || typeof clubName !== 'string') {
        return res.status(400).json({ message: "Club name is required" });
      }
      
      const isFavorite = await storage.isFavorite(clubName, (clubLocation as string) || "");
      res.json({ isFavorite });
    } catch (error) {
      res.status(500).json({ message: "Failed to check favorite status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
