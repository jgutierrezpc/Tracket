import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertActivitySchema, updateActivitySchema } from "@shared/schema";
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
      
      const ratedActivities = activities.filter(a => a.sessionRating && a.sessionRating > 0);
      const averageRating = ratedActivities.length > 0 
        ? Number((ratedActivities.reduce((sum, a) => sum + (a.sessionRating || 0), 0) / ratedActivities.length).toFixed(1))
        : 0;

      const sportStats = activities.reduce((acc, activity) => {
        acc[activity.sport] = (acc[activity.sport] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      res.json({
        totalActivities,
        totalHours,
        averageRating,
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

      res.json({ 
        message: `Imported ${importedActivities.length} activities`,
        imported: importedActivities.length,
        total: csvData.length
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to import CSV data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
