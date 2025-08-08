import { type User, type InsertUser, type Activity, type InsertActivity, type Racket } from "@shared/schema";
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

  // Equipment methods
  getRackets(): Promise<Racket[]>;
  createRacket(racket: { brand: string; model: string }): Promise<Racket>;
  updateRacket(id: string, update: Partial<Racket>): Promise<Racket | undefined>;
  
  // Courts methods
  getCourtsData(filters?: {
    startDate?: string;
    endDate?: string;
    sport?: string;
    activityType?: string;
    player?: string;
  }): Promise<Array<{
    clubName: string;
    clubLocation: string;
    playCount: number;
    totalDuration: number;
    lastPlayed: string;
    sports: string[];
    activityTypes: string[];
    players: string[];
    coordinates?: {
      lat: number;
      lng: number;
    };
  }>>;
  
  // Favorites methods
  getFavorites(): Promise<string[]>;
  addFavorite(clubName: string, clubLocation: string): Promise<void>;
  removeFavorite(clubName: string, clubLocation: string): Promise<void>;
  isFavorite(clubName: string, clubLocation: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private activities: Map<string, Activity>;
  private favorites: Set<string>;
  private rackets: Map<string, Racket>;

  constructor() {
    this.users = new Map();
    this.activities = new Map();
    this.favorites = new Set();
    this.rackets = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  // Equipment methods
  async getRackets(): Promise<Racket[]> {
    return Array.from(this.rackets.values()).sort((a, b) => {
      if (a.isActive !== b.isActive) return a.isActive ? -1 : 1; // active first
      return (a.brand + a.model).localeCompare(b.brand + b.model);
    });
  }

  async createRacket({ brand, model }: { brand: string; model: string }): Promise<Racket> {
    const id = randomUUID();
    const racket: Racket = {
      id,
      brand,
      model,
      isActive: true,
      isBroken: false,
      notes: null as unknown as string, // align with nullable in DB shape
      imageUrl: null as unknown as string,
      createdAt: new Date(),
    };
    this.rackets.set(id, racket);
    return racket;
  }

  async updateRacket(id: string, update: Partial<Racket>): Promise<Racket | undefined> {
    const existing = this.rackets.get(id);
    if (!existing) return undefined;
    const updated: Racket = { ...existing, ...update };
    this.rackets.set(id, updated);
    return updated;
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
      clubLatitude: insertActivity.clubLatitude || null,
      clubLongitude: insertActivity.clubLongitude || null,
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

  async getCourtsData(filters?: {
    startDate?: string;
    endDate?: string;
    sport?: string;
    activityType?: string;
    player?: string;
  }): Promise<Array<{
    clubName: string;
    clubLocation: string;
    playCount: number;
    totalDuration: number;
    lastPlayed: string;
    sports: string[];
    activityTypes: string[];
    players: string[];
  }>> {
    let activities = Array.from(this.activities.values());

    // Apply filters
    if (filters) {
      // Date range filter
      if (filters.startDate && filters.endDate) {
        const start = new Date(filters.startDate);
        const end = new Date(filters.endDate);
        activities = activities.filter(activity => {
          const activityDate = new Date(activity.date);
          return activityDate >= start && activityDate <= end;
        });
      }

      // Sport filter
      if (filters.sport) {
        activities = activities.filter(activity => 
          activity.sport.toLowerCase() === filters.sport!.toLowerCase()
        );
      }

      // Activity type filter
      if (filters.activityType) {
        activities = activities.filter(activity => 
          activity.activityType === filters.activityType
        );
      }

      // Player filter
      if (filters.player) {
        activities = activities.filter(activity => {
          const playerLower = filters.player!.toLowerCase();
          return (
            (activity.partner && activity.partner.toLowerCase().includes(playerLower)) ||
            (activity.opponents && activity.opponents.toLowerCase().includes(playerLower))
          );
        });
      }
    }
    
    // Group activities by club
    const courtsMap = new Map<string, {
      clubName: string;
      clubLocation: string;
      activities: Activity[];
      coordinates?: {
        lat: number;
        lng: number;
      };
    }>();

    activities.forEach(activity => {
      if (!activity.clubName) return; // Skip activities without club info
      
      const key = `${activity.clubName}|${activity.clubLocation || ''}`;
      
      if (!courtsMap.has(key)) {
        courtsMap.set(key, {
          clubName: activity.clubName,
          clubLocation: activity.clubLocation || '',
          activities: [],
          coordinates: activity.clubLatitude && activity.clubLongitude ? {
            lat: parseFloat(activity.clubLatitude),
            lng: parseFloat(activity.clubLongitude)
          } : undefined
        });
      }
      
      courtsMap.get(key)!.activities.push(activity);
    });

    // Convert to array and calculate aggregated data
    return Array.from(courtsMap.values()).map(court => {
      const sortedActivities = court.activities.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      const playCount = court.activities.length;
      const totalDuration = court.activities.reduce((sum, activity) => sum + activity.duration, 0);
      const lastPlayed = sortedActivities[0].date;
      
      // Collect unique sports
      const sports = [...new Set(court.activities.map(a => a.sport))];
      
      // Collect unique activity types
      const activityTypes = [...new Set(
        court.activities
          .map(a => a.activityType)
          .filter(type => type !== null)
      )];
      
      // Collect unique players (partner and opponents)
      const players = new Set<string>();
      court.activities.forEach(activity => {
        if (activity.partner) players.add(activity.partner);
        if (activity.opponents) {
          activity.opponents.split(',').forEach(player => {
            const trimmed = player.trim();
            if (trimmed) players.add(trimmed);
          });
        }
      });

      return {
        clubName: court.clubName,
        clubLocation: court.clubLocation,
        playCount,
        totalDuration,
        lastPlayed,
        sports,
        activityTypes,
        players: Array.from(players),
        coordinates: court.coordinates
      };
    }).sort((a, b) => b.playCount - a.playCount); // Sort by play frequency (most to least)
  }

  // Favorites methods
  async getFavorites(): Promise<string[]> {
    return Array.from(this.favorites);
  }

  async addFavorite(clubName: string, clubLocation: string): Promise<void> {
    const key = `${clubName}|${clubLocation}`;
    this.favorites.add(key);
  }

  async removeFavorite(clubName: string, clubLocation: string): Promise<void> {
    const key = `${clubName}|${clubLocation}`;
    this.favorites.delete(key);
  }

  async isFavorite(clubName: string, clubLocation: string): Promise<boolean> {
    const key = `${clubName}|${clubLocation}`;
    return this.favorites.has(key);
  }
}

export const storage = new MemStorage();
