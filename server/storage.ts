import { type User, type InsertUser, type Activity, type InsertActivity } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Activity methods
  getActivities(): Promise<Activity[]>;
  getActivity(id: string): Promise<Activity | undefined>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  updateActivity(id: string, activity: Partial<InsertActivity>): Promise<Activity | undefined>;
  deleteActivity(id: string): Promise<boolean>;
  getActivitiesBySport(sport: string): Promise<Activity[]>;
  getActivitiesByDateRange(startDate: string, endDate: string): Promise<Activity[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private activities: Map<string, Activity>;

  constructor() {
    this.users = new Map();
    this.activities = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getActivities(): Promise<Activity[]> {
    return Array.from(this.activities.values()).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async getActivity(id: string): Promise<Activity | undefined> {
    return this.activities.get(id);
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = randomUUID();
    const activity: Activity = {
      date: insertActivity.date,
      sport: insertActivity.sport,
      duration: insertActivity.duration,
      activityType: insertActivity.activityType || null,
      clubName: insertActivity.clubName || null,
      clubLocation: insertActivity.clubLocation || null,
      clubMapLink: insertActivity.clubMapLink || null,
      sessionRating: insertActivity.sessionRating || null,
      racket: insertActivity.racket || null,
      partner: insertActivity.partner || null,
      opponents: insertActivity.opponents || null,
      notes: insertActivity.notes || null,
      id,
      createdAt: new Date(),
    };
    this.activities.set(id, activity);
    return activity;
  }

  async updateActivity(id: string, updateData: Partial<InsertActivity>): Promise<Activity | undefined> {
    const existing = this.activities.get(id);
    if (!existing) return undefined;

    const updated: Activity = {
      ...existing,
      ...updateData,
    };
    this.activities.set(id, updated);
    return updated;
  }

  async deleteActivity(id: string): Promise<boolean> {
    return this.activities.delete(id);
  }

  async getActivitiesBySport(sport: string): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.sport.toLowerCase() === sport.toLowerCase())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getActivitiesByDateRange(startDate: string, endDate: string): Promise<Activity[]> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return Array.from(this.activities.values())
      .filter(activity => {
        const activityDate = new Date(activity.date);
        return activityDate >= start && activityDate <= end;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
}

export const storage = new MemStorage();
