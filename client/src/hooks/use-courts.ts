import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CourtFilters } from '@/components/courts/courts-filters';
import { useFavorites } from './use-favorites';

interface CourtData {
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
}

interface UseCourtsOptions {
  initialFilters?: CourtFilters;
  enableFavorites?: boolean;
  enableRealTimeUpdates?: boolean;
  realTimeInterval?: number; // Polling interval in milliseconds
  enableOptimisticUpdates?: boolean; // Enable optimistic updates for better UX
}

interface UseCourtsReturn {
  // Data
  courts: CourtData[];
  filteredCourts: CourtData[];
  favorites: string[];
  
  // Loading and error states
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  
  // Filtering
  filters: CourtFilters;
  setFilters: (filters: CourtFilters) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  availableSports: string[];
  availableActivityTypes: string[];
  availablePlayers: string[];
  
  // Favorites
  toggleFavorite: (clubName: string, clubLocation: string) => void;
  isFavorite: (clubName: string, clubLocation: string) => boolean;
  showOnlyFavorites: boolean;
  setShowOnlyFavorites: (show: boolean) => void;
  
  // View management
  currentView: 'list' | 'map';
  setCurrentView: (view: 'list' | 'map') => void;
  
  // Statistics
  totalCourts: number;
  totalFavorites: number;
  courtsWithCoordinates: number;
  
  // Real-time updates
  isRefreshing: boolean;
  lastUpdated: Date | null;
  
  // Mutations
  refreshData: () => void;
  forceRefresh: () => void;
}

// API functions
const fetchCourtsData = async (filters?: CourtFilters): Promise<CourtData[]> => {
  const params = new URLSearchParams();
  
  if (filters) {
    if (filters.dateRange) params.append('dateRange', filters.dateRange);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.sport) params.append('sport', filters.sport);
    if (filters.activityType) params.append('activityType', filters.activityType);
    if (filters.player) params.append('player', filters.player);
  }
  
  const response = await fetch(`/api/courts?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch courts data: ${response.statusText}`);
  }
  
  return response.json();
};

const addFavorite = async (clubName: string, clubLocation: string): Promise<void> => {
  const response = await fetch('/api/courts/favorites', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ clubName, clubLocation }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to add favorite');
  }
};

const removeFavorite = async (clubName: string, clubLocation: string): Promise<void> => {
  const response = await fetch('/api/courts/favorites', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ clubName, clubLocation }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to remove favorite');
  }
};

export function useCourts(options: UseCourtsOptions = {}): UseCourtsReturn {
  const {
    initialFilters = {},
    enableFavorites = true,
    enableRealTimeUpdates = true,
    realTimeInterval = 30 * 1000, // Default 30 seconds
    enableOptimisticUpdates = true,
  } = options;

  // State management
  const [filters, setFilters] = useState<CourtFilters>(initialFilters);
  const [currentView, setCurrentView] = useState<'list' | 'map'>('list');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Query client for cache management
  const queryClient = useQueryClient();

  // Favorites hook
  const {
    favorites,
    addFavorite: addLocalFavorite,
    removeFavorite: removeLocalFavorite,
    toggleFavorite: toggleLocalFavorite,
    isFavorite: isLocalFavorite,
    syncWithBackend,
  } = useFavorites();

  // Fetch courts data
  const {
    data: courts = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['courts', filters],
    queryFn: async () => {
      const data = await fetchCourtsData(filters);
      setLastUpdated(new Date());
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Favorites mutations
  const addFavoriteMutation = useMutation({
    mutationFn: addFavorite,
    onSuccess: (_, variables) => {
      addLocalFavorite(variables.clubName, variables.clubLocation);
      queryClient.invalidateQueries({ queryKey: ['courts'] });
    },
    onError: (error) => {
      console.error('Failed to add favorite:', error);
    },
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: removeFavorite,
    onSuccess: (_, variables) => {
      removeLocalFavorite(variables.clubName, variables.clubLocation);
      queryClient.invalidateQueries({ queryKey: ['courts'] });
    },
    onError: (error) => {
      console.error('Failed to remove favorite:', error);
    },
  });

  // Sync favorites with backend on mount
  useEffect(() => {
    if (enableFavorites) {
      syncWithBackend();
    }
  }, [enableFavorites]); // Remove syncWithBackend dependency to prevent infinite calls

  // Filter courts based on current state
  const filteredCourts = useMemo(() => {
    let filtered = [...courts];

    // Apply client-side filters
    if (filters.sport) {
      filtered = filtered.filter(court => 
        court.sports.includes(filters.sport!)
      );
    }

    if (filters.activityType) {
      filtered = filtered.filter(court => 
        court.activityTypes.includes(filters.activityType!)
      );
    }

    if (filters.player) {
      filtered = filtered.filter(court => 
        court.players.some(player => 
          player.toLowerCase().includes(filters.player!.toLowerCase())
        )
      );
    }

    // Apply date range filters
    if (filters.startDate || filters.endDate) {
      filtered = filtered.filter(court => {
        const lastPlayedDate = new Date(court.lastPlayed);
        const startDate = filters.startDate ? new Date(filters.startDate) : null;
        const endDate = filters.endDate ? new Date(filters.endDate) : null;
        
        if (startDate && lastPlayedDate < startDate) return false;
        if (endDate && lastPlayedDate > endDate) return false;
        return true;
      });
    }

    // Apply favorites filter
    if (showOnlyFavorites && enableFavorites) {
      filtered = filtered.filter(court => 
        isLocalFavorite(court.clubName, court.clubLocation)
      );
    }

    return filtered;
  }, [courts, filters, showOnlyFavorites, enableFavorites, isLocalFavorite]);

  // Compute statistics and available options
  const totalCourts = courts.length;
  const totalFavorites = favorites.length;
  const courtsWithCoordinates = courts.filter(court => court.coordinates).length;
  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== '' && value !== null
  );

  // Compute available options for filters
  const availableSports = useMemo(() => 
    Array.from(new Set(courts.flatMap(court => court.sports))).sort(),
    [courts]
  );

  const availableActivityTypes = useMemo(() => 
    Array.from(new Set(courts.flatMap(court => court.activityTypes))).sort(),
    [courts]
  );

  const availablePlayers = useMemo(() => 
    Array.from(new Set(courts.flatMap(court => court.players))).sort(),
    [courts]
  );

  // Handlers
  const handleSetFilters = useCallback((newFilters: CourtFilters) => {
    setFilters(newFilters);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const handleToggleFavorite = useCallback(async (clubName: string, clubLocation: string) => {
    if (!enableFavorites) return;

    const isFav = isLocalFavorite(clubName, clubLocation);
    
    try {
      if (isFav) {
        await removeFavoriteMutation.mutateAsync({ clubName, clubLocation });
      } else {
        await addFavoriteMutation.mutateAsync({ clubName, clubLocation });
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  }, [enableFavorites, isLocalFavorite, removeFavoriteMutation, addFavoriteMutation]);

  const refreshData = useCallback(() => {
    refetch();
  }, [refetch]);

  const forceRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  // Real-time updates (polling) - disabled for now to prevent excessive requests
  useEffect(() => {
    if (!enableRealTimeUpdates) return;

    // Disabled polling to prevent excessive requests
    // const interval = setInterval(() => {
    //   setIsRefreshing(true);
    //   queryClient.invalidateQueries({ queryKey: ['courts'] });
    //   setTimeout(() => setIsRefreshing(false), 1000); // Show refreshing state for 1 second
    // }, realTimeInterval);

    // return () => clearInterval(interval);
  }, [enableRealTimeUpdates, queryClient, realTimeInterval]);

  // Listen for activity changes and invalidate courts cache
  useEffect(() => {
    if (!enableRealTimeUpdates) return;

    // Set up event listeners for activity changes
    const handleActivityChange = () => {
      queryClient.invalidateQueries({ queryKey: ['courts'] });
    };

    // Listen for storage events (for cross-tab synchronization)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'activities' || e.key?.startsWith('activity_')) {
        handleActivityChange();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Listen for custom events (for same-tab updates)
    window.addEventListener('activity-changed', handleActivityChange);
    window.addEventListener('activity-added', handleActivityChange);
    window.addEventListener('activity-updated', handleActivityChange);
    window.addEventListener('activity-deleted', handleActivityChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('activity-changed', handleActivityChange);
      window.removeEventListener('activity-added', handleActivityChange);
      window.removeEventListener('activity-updated', handleActivityChange);
      window.removeEventListener('activity-deleted', handleActivityChange);
    };
  }, [enableRealTimeUpdates, queryClient]);

  return {
    // Data
    courts,
    filteredCourts,
    favorites,
    
    // Loading and error states
    isLoading,
    isError,
    error: error?.message || null,
    
    // Filtering
    filters,
    setFilters: handleSetFilters,
    clearFilters,
    hasActiveFilters,
    
    // Available options for filters
    availableSports,
    availableActivityTypes,
    availablePlayers,
    
    // Favorites
    toggleFavorite: handleToggleFavorite,
    isFavorite: isLocalFavorite,
    showOnlyFavorites,
    setShowOnlyFavorites,
    
    // View management
    currentView,
    setCurrentView,
    
    // Statistics
    totalCourts,
    totalFavorites,
    courtsWithCoordinates,
    
    // Real-time updates
    isRefreshing,
    lastUpdated,
    
    // Mutations
    refreshData,
    forceRefresh,
  };
} 