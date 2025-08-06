import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCourts } from './use-courts';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock useFavorites hook
vi.mock('./use-favorites', () => ({
  useFavorites: vi.fn(() => ({
    favorites: ['Club A|Location A'],
    addFavorite: vi.fn(),
    removeFavorite: vi.fn(),
    toggleFavorite: vi.fn(),
    isFavorite: vi.fn((clubName: string, clubLocation: string) => 
      `${clubName}|${clubLocation}` === 'Club A|Location A'
    ),
    syncWithBackend: vi.fn(),
  })),
}));

// Test wrapper component
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useCourts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('fetches courts data successfully', async () => {
    const mockCourts = [
      {
        clubName: 'Tennis Club A',
        clubLocation: '123 Main St',
        playCount: 5,
        totalDuration: 300,
        lastPlayed: '2024-01-15',
        sports: ['tennis'],
        activityTypes: ['friendly'],
        players: ['John', 'Jane'],
        coordinates: { lat: 40.7128, lng: -74.0060 }
      }
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCourts,
    });

    const { result } = renderHook(() => useCourts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.courts).toEqual(mockCourts);
    expect(result.current.isError).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('handles fetch error gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useCourts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBe('Network error');
    expect(result.current.courts).toEqual([]);
  });

  it('applies filters to API request', async () => {
    const mockCourts = [
      {
        clubName: 'Tennis Club A',
        clubLocation: '123 Main St',
        playCount: 5,
        totalDuration: 300,
        lastPlayed: '2024-01-15',
        sports: ['tennis'],
        activityTypes: ['friendly'],
        players: ['John', 'Jane'],
        coordinates: { lat: 40.7128, lng: -74.0060 }
      }
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCourts,
    });

    const { result } = renderHook(() => useCourts({
      initialFilters: {
        sport: 'tennis',
        activityType: 'friendly'
      }
    }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/courts?sport=tennis&activityType=friendly')
    );
  });

  it('filters courts by favorites when showOnlyFavorites is true', async () => {
    const mockCourts = [
      {
        clubName: 'Club A',
        clubLocation: 'Location A',
        playCount: 5,
        totalDuration: 300,
        lastPlayed: '2024-01-15',
        sports: ['tennis'],
        activityTypes: ['friendly'],
        players: ['John'],
        coordinates: { lat: 40.7128, lng: -74.0060 }
      },
      {
        clubName: 'Club B',
        clubLocation: 'Location B',
        playCount: 3,
        totalDuration: 180,
        lastPlayed: '2024-01-10',
        sports: ['padel'],
        activityTypes: ['tournament'],
        players: ['Jane'],
        coordinates: { lat: 40.7129, lng: -74.0061 }
      }
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCourts,
    });

    const { result } = renderHook(() => useCourts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Initially show all courts
    expect(result.current.filteredCourts).toHaveLength(2);

    // Enable favorites filter
    result.current.setShowOnlyFavorites(true);

    await waitFor(() => {
      expect(result.current.filteredCourts).toHaveLength(1);
      expect(result.current.filteredCourts[0].clubName).toBe('Club A');
    });
  });

  it('toggles favorite status correctly', async () => {
    const mockCourts = [
      {
        clubName: 'Club A',
        clubLocation: 'Location A',
        playCount: 5,
        totalDuration: 300,
        lastPlayed: '2024-01-15',
        sports: ['tennis'],
        activityTypes: ['friendly'],
        players: ['John'],
        coordinates: { lat: 40.7128, lng: -74.0060 }
      }
    ];

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockCourts,
    });

    const { result } = renderHook(() => useCourts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Mock successful API call
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    await result.current.toggleFavorite('Club A', 'Location A');

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/courts/favorites',
      expect.objectContaining({
        method: 'DELETE',
        body: JSON.stringify({ clubName: 'Club A', clubLocation: 'Location A' }),
      })
    );
  });

  it('computes statistics correctly', async () => {
    const mockCourts = [
      {
        clubName: 'Club A',
        clubLocation: 'Location A',
        playCount: 5,
        totalDuration: 300,
        lastPlayed: '2024-01-15',
        sports: ['tennis'],
        activityTypes: ['friendly'],
        players: ['John'],
        coordinates: { lat: 40.7128, lng: -74.0060 }
      },
      {
        clubName: 'Club B',
        clubLocation: 'Location B',
        playCount: 3,
        totalDuration: 180,
        lastPlayed: '2024-01-10',
        sports: ['padel'],
        activityTypes: ['tournament'],
        players: ['Jane'],
        coordinates: undefined
      }
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCourts,
    });

    const { result } = renderHook(() => useCourts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.totalCourts).toBe(2);
    expect(result.current.totalFavorites).toBe(1);
    expect(result.current.courtsWithCoordinates).toBe(1);
  });

  it('manages view state correctly', async () => {
    const mockCourts = [
      {
        clubName: 'Club A',
        clubLocation: 'Location A',
        playCount: 5,
        totalDuration: 300,
        lastPlayed: '2024-01-15',
        sports: ['tennis'],
        activityTypes: ['friendly'],
        players: ['John'],
        coordinates: { lat: 40.7128, lng: -74.0060 }
      }
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCourts,
    });

    const { result } = renderHook(() => useCourts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Default view is list
    expect(result.current.currentView).toBe('list');

    // Change to map view
    result.current.setCurrentView('map');
    expect(result.current.currentView).toBe('map');

    // Change back to list view
    result.current.setCurrentView('list');
    expect(result.current.currentView).toBe('list');
  });

  it('manages filters correctly', async () => {
    const mockCourts = [
      {
        clubName: 'Club A',
        clubLocation: 'Location A',
        playCount: 5,
        totalDuration: 300,
        lastPlayed: '2024-01-15',
        sports: ['tennis'],
        activityTypes: ['friendly'],
        players: ['John'],
        coordinates: { lat: 40.7128, lng: -74.0060 }
      }
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCourts,
    });

    const { result } = renderHook(() => useCourts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Initially no active filters
    expect(result.current.hasActiveFilters).toBe(false);

    // Set filters
    result.current.setFilters({
      sport: 'tennis',
      activityType: 'friendly'
    });

    expect(result.current.hasActiveFilters).toBe(true);
    expect(result.current.filters.sport).toBe('tennis');
    expect(result.current.filters.activityType).toBe('friendly');

    // Clear filters
    result.current.clearFilters();
    expect(result.current.hasActiveFilters).toBe(false);
    expect(result.current.filters).toEqual({});
  });

  it('handles disabled favorites correctly', async () => {
    const mockCourts = [
      {
        clubName: 'Club A',
        clubLocation: 'Location A',
        playCount: 5,
        totalDuration: 300,
        lastPlayed: '2024-01-15',
        sports: ['tennis'],
        activityTypes: ['friendly'],
        players: ['John'],
        coordinates: { lat: 40.7128, lng: -74.0060 }
      }
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCourts,
    });

    const { result } = renderHook(() => useCourts({ enableFavorites: false }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Favorites should be disabled
    result.current.setShowOnlyFavorites(true);
    expect(result.current.filteredCourts).toHaveLength(1); // Still shows all courts

    // Toggle favorite should not work
    await result.current.toggleFavorite('Club A', 'Location A');
    expect(mockFetch).not.toHaveBeenCalledWith(
      expect.stringContaining('/api/courts/favorites')
    );
  });

  it('handles disabled real-time updates correctly', async () => {
    const mockCourts = [
      {
        clubName: 'Club A',
        clubLocation: 'Location A',
        playCount: 5,
        totalDuration: 300,
        lastPlayed: '2024-01-15',
        sports: ['tennis'],
        activityTypes: ['friendly'],
        players: ['John'],
        coordinates: { lat: 40.7128, lng: -74.0060 }
      }
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCourts,
    });

    const { result } = renderHook(() => useCourts({ enableRealTimeUpdates: false }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should not set up polling interval
    expect(result.current.courts).toEqual(mockCourts);
  });

  it('refreshes data correctly', async () => {
    const mockCourts = [
      {
        clubName: 'Club A',
        clubLocation: 'Location A',
        playCount: 5,
        totalDuration: 300,
        lastPlayed: '2024-01-15',
        sports: ['tennis'],
        activityTypes: ['friendly'],
        players: ['John'],
        coordinates: { lat: 40.7128, lng: -74.0060 }
      }
    ];

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockCourts,
    });

    const { result } = renderHook(() => useCourts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Refresh data
    result.current.refreshData();

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2); // Initial + refresh
    });
  });

  it('handles API errors for favorites correctly', async () => {
    const mockCourts = [
      {
        clubName: 'Club A',
        clubLocation: 'Location A',
        playCount: 5,
        totalDuration: 300,
        lastPlayed: '2024-01-15',
        sports: ['tennis'],
        activityTypes: ['friendly'],
        players: ['John'],
        coordinates: { lat: 40.7128, lng: -74.0060 }
      }
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCourts,
    });

    const { result } = renderHook(() => useCourts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Mock API error for favorites
    mockFetch.mockRejectedValueOnce(new Error('Failed to add favorite'));

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await result.current.toggleFavorite('Club A', 'Location A');

    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to toggle favorite:',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });
}); 