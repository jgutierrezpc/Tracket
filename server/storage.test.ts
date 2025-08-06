import { describe, it, expect, beforeEach } from 'vitest';
import { MemStorage } from './storage';
import { InsertActivity } from '@shared/schema';

describe('MemStorage - Courts and Favorites', () => {
  let storage: MemStorage;

  beforeEach(() => {
    storage = new MemStorage();
  });

  describe('getCourtsData', () => {
    it('should return empty array when no activities exist', async () => {
      const courtsData = await storage.getCourtsData();
      expect(courtsData).toEqual([]);
    });

    it('should aggregate courts data from activities', async () => {
      // Create test activities
      const activity1: InsertActivity = {
        date: '2024-01-01',
        sport: 'padel',
        duration: 90,
        activityType: 'friendly',
        clubName: 'Club A',
        clubLocation: 'Location A',
        partner: 'John',
        opponents: 'Jane, Bob'
      };

      const activity2: InsertActivity = {
        date: '2024-01-02',
        sport: 'padel',
        duration: 120,
        activityType: 'tournament',
        clubName: 'Club A',
        clubLocation: 'Location A',
        partner: 'Mike',
        opponents: 'Sarah, Tom'
      };

      const activity3: InsertActivity = {
        date: '2024-01-03',
        sport: 'tennis',
        duration: 60,
        activityType: 'training',
        clubName: 'Club B',
        clubLocation: 'Location B',
        partner: 'Alice',
        opponents: 'Bob'
      };

      await storage.createActivity(activity1);
      await storage.createActivity(activity2);
      await storage.createActivity(activity3);

      const courtsData = await storage.getCourtsData();

      expect(courtsData).toHaveLength(2);
      
      // Club A should be first (most frequent)
      expect(courtsData[0].clubName).toBe('Club A');
      expect(courtsData[0].clubLocation).toBe('Location A');
      expect(courtsData[0].playCount).toBe(2);
      expect(courtsData[0].totalDuration).toBe(210);
      expect(courtsData[0].lastPlayed).toBe('2024-01-02');
      expect(courtsData[0].sports).toEqual(['padel']);
      expect(courtsData[0].activityTypes).toHaveLength(2);
      expect(courtsData[0].activityTypes).toContain('friendly');
      expect(courtsData[0].activityTypes).toContain('tournament');
      expect(courtsData[0].players).toHaveLength(6);
      expect(courtsData[0].players).toContain('John');
      expect(courtsData[0].players).toContain('Jane');
      expect(courtsData[0].players).toContain('Bob');
      expect(courtsData[0].players).toContain('Mike');
      expect(courtsData[0].players).toContain('Sarah');
      expect(courtsData[0].players).toContain('Tom');

      // Club B should be second
      expect(courtsData[1].clubName).toBe('Club B');
      expect(courtsData[1].clubLocation).toBe('Location B');
      expect(courtsData[1].playCount).toBe(1);
      expect(courtsData[1].totalDuration).toBe(60);
      expect(courtsData[1].lastPlayed).toBe('2024-01-03');
      expect(courtsData[1].sports).toEqual(['tennis']);
      expect(courtsData[1].activityTypes).toEqual(['training']);
      expect(courtsData[1].players).toHaveLength(2);
      expect(courtsData[1].players).toContain('Alice');
      expect(courtsData[1].players).toContain('Bob');
    });

    it('should filter by sport', async () => {
      const activity1: InsertActivity = {
        date: '2024-01-01',
        sport: 'padel',
        duration: 90,
        clubName: 'Club A',
        clubLocation: 'Location A'
      };

      const activity2: InsertActivity = {
        date: '2024-01-02',
        sport: 'tennis',
        duration: 60,
        clubName: 'Club B',
        clubLocation: 'Location B'
      };

      await storage.createActivity(activity1);
      await storage.createActivity(activity2);

      const courtsData = await storage.getCourtsData({ sport: 'padel' });

      expect(courtsData).toHaveLength(1);
      expect(courtsData[0].clubName).toBe('Club A');
    });

    it('should filter by activity type', async () => {
      const activity1: InsertActivity = {
        date: '2024-01-01',
        sport: 'padel',
        duration: 90,
        activityType: 'friendly',
        clubName: 'Club A',
        clubLocation: 'Location A'
      };

      const activity2: InsertActivity = {
        date: '2024-01-02',
        sport: 'padel',
        duration: 60,
        activityType: 'tournament',
        clubName: 'Club B',
        clubLocation: 'Location B'
      };

      await storage.createActivity(activity1);
      await storage.createActivity(activity2);

      const courtsData = await storage.getCourtsData({ activityType: 'tournament' });

      expect(courtsData).toHaveLength(1);
      expect(courtsData[0].clubName).toBe('Club B');
    });

    it('should filter by player', async () => {
      const activity1: InsertActivity = {
        date: '2024-01-01',
        sport: 'padel',
        duration: 90,
        clubName: 'Club A',
        clubLocation: 'Location A',
        partner: 'John',
        opponents: 'Jane'
      };

      const activity2: InsertActivity = {
        date: '2024-01-02',
        sport: 'padel',
        duration: 60,
        clubName: 'Club B',
        clubLocation: 'Location B',
        partner: 'Mike',
        opponents: 'Sarah'
      };

      await storage.createActivity(activity1);
      await storage.createActivity(activity2);

      const courtsData = await storage.getCourtsData({ player: 'John' });

      expect(courtsData).toHaveLength(1);
      expect(courtsData[0].clubName).toBe('Club A');
    });

    it('should filter by date range', async () => {
      const activity1: InsertActivity = {
        date: '2024-01-01',
        sport: 'padel',
        duration: 90,
        clubName: 'Club A',
        clubLocation: 'Location A'
      };

      const activity2: InsertActivity = {
        date: '2024-02-01',
        sport: 'padel',
        duration: 60,
        clubName: 'Club B',
        clubLocation: 'Location B'
      };

      await storage.createActivity(activity1);
      await storage.createActivity(activity2);

      const courtsData = await storage.getCourtsData({ 
        startDate: '2024-01-01', 
        endDate: '2024-01-31' 
      });

      expect(courtsData).toHaveLength(1);
      expect(courtsData[0].clubName).toBe('Club A');
    });

    it('should skip activities without club name', async () => {
      const activity1: InsertActivity = {
        date: '2024-01-01',
        sport: 'padel',
        duration: 90,
        clubName: 'Club A',
        clubLocation: 'Location A'
      };

      const activity2: InsertActivity = {
        date: '2024-01-02',
        sport: 'padel',
        duration: 60,
        // No club name
      };

      await storage.createActivity(activity1);
      await storage.createActivity(activity2);

      const courtsData = await storage.getCourtsData();

      expect(courtsData).toHaveLength(1);
      expect(courtsData[0].clubName).toBe('Club A');
    });
  });

  describe('Favorites', () => {
    it('should start with empty favorites', async () => {
      const favorites = await storage.getFavorites();
      expect(favorites).toEqual([]);
    });

    it('should add favorite', async () => {
      await storage.addFavorite('Club A', 'Location A');
      
      const favorites = await storage.getFavorites();
      expect(favorites).toContain('Club A|Location A');
    });

    it('should remove favorite', async () => {
      await storage.addFavorite('Club A', 'Location A');
      await storage.removeFavorite('Club A', 'Location A');
      
      const favorites = await storage.getFavorites();
      expect(favorites).not.toContain('Club A|Location A');
    });

    it('should check if favorite exists', async () => {
      await storage.addFavorite('Club A', 'Location A');
      
      const isFavorite = await storage.isFavorite('Club A', 'Location A');
      expect(isFavorite).toBe(true);
      
      const isNotFavorite = await storage.isFavorite('Club B', 'Location B');
      expect(isNotFavorite).toBe(false);
    });

    it('should handle empty club location', async () => {
      await storage.addFavorite('Club A', '');
      
      const favorites = await storage.getFavorites();
      expect(favorites).toContain('Club A|');
      
      const isFavorite = await storage.isFavorite('Club A', '');
      expect(isFavorite).toBe(true);
    });
  });
}); 