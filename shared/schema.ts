import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const activities = pgTable("activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: text("date").notNull(),
  sport: text("sport").notNull(), // padel, tennis, pickleball
  activityType: text("activity_type"), // training, friendly, tournament
  duration: integer("duration").notNull(), // in minutes
  clubName: text("club_name"),
  clubLocation: text("club_location"),
  clubMapLink: text("club_map_link"),
  clubLatitude: text("club_latitude"), // Latitude coordinate
  clubLongitude: text("club_longitude"), // Longitude coordinate
  sessionRating: integer("session_rating"), // 1-5
  racket: text("racket"),
  partner: text("partner"),
  opponents: text("opponents"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

export const updateActivitySchema = insertActivitySchema.partial();

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type UpdateActivity = z.infer<typeof updateActivitySchema>;
