import { useState, useEffect, useCallback } from 'react';

interface FavoriteClub {
  clubName: string;
  clubLocation: string;
}

const FAVORITES_STORAGE_KEY = 'tracket-favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (storedFavorites) {
        const parsedFavorites = JSON.parse(storedFavorites);
        setFavorites(Array.isArray(parsedFavorites) ? parsedFavorites : []);
      }
    } catch (err) {
      setError('Failed to load favorites from storage');
      console.error('Error loading favorites:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
      } catch (err) {
        setError('Failed to save favorites to storage');
        console.error('Error saving favorites:', err);
      }
    }
  }, [favorites, isLoading]);

  // Add a club to favorites
  const addFavorite = useCallback((clubName: string, clubLocation: string) => {
    const favoriteKey = `${clubName}|${clubLocation}`;
    setFavorites(prev => {
      if (prev.includes(favoriteKey)) {
        return prev; // Already favorited
      }
      return [...prev, favoriteKey];
    });
    setError(null);
  }, []);

  // Remove a club from favorites
  const removeFavorite = useCallback((clubName: string, clubLocation: string) => {
    const favoriteKey = `${clubName}|${clubLocation}`;
    setFavorites(prev => prev.filter(fav => fav !== favoriteKey));
    setError(null);
  }, []);

  // Toggle favorite status
  const toggleFavorite = useCallback((clubName: string, clubLocation: string) => {
    const favoriteKey = `${clubName}|${clubLocation}`;
    setFavorites(prev => {
      if (prev.includes(favoriteKey)) {
        return prev.filter(fav => fav !== favoriteKey);
      } else {
        return [...prev, favoriteKey];
      }
    });
    setError(null);
  }, []);

  // Check if a club is favorited
  const isFavorite = useCallback((clubName: string, clubLocation: string) => {
    const favoriteKey = `${clubName}|${clubLocation}`;
    return favorites.includes(favoriteKey);
  }, [favorites]);

  // Get all favorite clubs as objects
  const getFavoriteClubs = useCallback((): FavoriteClub[] => {
    return favorites.map(favoriteKey => {
      const [clubName, clubLocation] = favoriteKey.split('|');
      return { clubName, clubLocation };
    });
  }, [favorites]);

  // Clear all favorites
  const clearFavorites = useCallback(() => {
    setFavorites([]);
    setError(null);
  }, []);

  // Get favorites count
  const getFavoritesCount = useCallback(() => {
    return favorites.length;
  }, [favorites]);

  // Sync with backend
  const syncWithBackend = useCallback(async () => {
    try {
      // Fetch favorites from server
      const response = await fetch('/api/courts/favorites');
      if (!response.ok) {
        throw new Error('Failed to fetch favorites from server');
      }
      
      const serverFavorites = await response.json();
      
      // Merge server favorites with local favorites
      // Server favorites take precedence for conflicts
      const mergedFavorites = [...new Set([...favorites, ...serverFavorites])];
      
      setFavorites(mergedFavorites);
      setError(null);
    } catch (err) {
      setError('Failed to sync favorites with server');
      console.error('Error syncing favorites:', err);
    }
  }, [favorites]);

  return {
    favorites,
    isLoading,
    error,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    getFavoriteClubs,
    clearFavorites,
    getFavoritesCount,
    syncWithBackend
  };
} 