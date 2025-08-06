import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFavorites } from './use-favorites';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useFavorites', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with empty favorites', () => {
    const { result } = renderHook(() => useFavorites());

    expect(result.current.favorites).toEqual([]);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should load favorites from localStorage on mount', () => {
    const storedFavorites = ['Club A|Location A', 'Club B|Location B'];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(storedFavorites));

    const { result } = renderHook(() => useFavorites());

    // Wait for useEffect to complete
    act(() => {
      // Trigger useEffect by updating state
    });

    expect(result.current.favorites).toEqual(storedFavorites);
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle invalid localStorage data gracefully', () => {
    localStorageMock.getItem.mockReturnValue('invalid json');

    const { result } = renderHook(() => useFavorites());

    act(() => {
      // Trigger useEffect
    });

    expect(result.current.favorites).toEqual([]);
    expect(result.current.error).toBe('Failed to load favorites from storage');
  });

  it('should add favorite correctly', () => {
    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.addFavorite('Club A', 'Location A');
    });

    expect(result.current.favorites).toEqual(['Club A|Location A']);
    expect(result.current.isFavorite('Club A', 'Location A')).toBe(true);
  });

  it('should not add duplicate favorites', () => {
    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.addFavorite('Club A', 'Location A');
      result.current.addFavorite('Club A', 'Location A');
    });

    expect(result.current.favorites).toEqual(['Club A|Location A']);
  });

  it('should remove favorite correctly', () => {
    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.addFavorite('Club A', 'Location A');
      result.current.addFavorite('Club B', 'Location B');
      result.current.removeFavorite('Club A', 'Location A');
    });

    expect(result.current.favorites).toEqual(['Club B|Location B']);
    expect(result.current.isFavorite('Club A', 'Location A')).toBe(false);
    expect(result.current.isFavorite('Club B', 'Location B')).toBe(true);
  });

  it('should toggle favorite correctly', () => {
    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.toggleFavorite('Club A', 'Location A');
    });

    expect(result.current.favorites).toEqual(['Club A|Location A']);
    expect(result.current.isFavorite('Club A', 'Location A')).toBe(true);

    act(() => {
      result.current.toggleFavorite('Club A', 'Location A');
    });

    expect(result.current.favorites).toEqual([]);
    expect(result.current.isFavorite('Club A', 'Location A')).toBe(false);
  });

  it('should check favorite status correctly', () => {
    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.addFavorite('Club A', 'Location A');
    });

    expect(result.current.isFavorite('Club A', 'Location A')).toBe(true);
    expect(result.current.isFavorite('Club B', 'Location B')).toBe(false);
  });

  it('should get favorite clubs as objects', () => {
    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.addFavorite('Club A', 'Location A');
      result.current.addFavorite('Club B', 'Location B');
    });

    const favoriteClubs = result.current.getFavoriteClubs();
    expect(favoriteClubs).toEqual([
      { clubName: 'Club A', clubLocation: 'Location A' },
      { clubName: 'Club B', clubLocation: 'Location B' }
    ]);
  });

  it('should clear all favorites', () => {
    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.addFavorite('Club A', 'Location A');
      result.current.addFavorite('Club B', 'Location B');
      result.current.clearFavorites();
    });

    expect(result.current.favorites).toEqual([]);
    expect(result.current.getFavoritesCount()).toBe(0);
  });

  it('should get favorites count correctly', () => {
    const { result } = renderHook(() => useFavorites());

    expect(result.current.getFavoritesCount()).toBe(0);

    act(() => {
      result.current.addFavorite('Club A', 'Location A');
      result.current.addFavorite('Club B', 'Location B');
    });

    expect(result.current.getFavoritesCount()).toBe(2);
  });

  it('should save favorites to localStorage when they change', () => {
    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.addFavorite('Club A', 'Location A');
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'tracket-favorites',
      JSON.stringify(['Club A|Location A'])
    );
  });

  it('should handle empty club location', () => {
    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.addFavorite('Club A', '');
    });

    expect(result.current.favorites).toEqual(['Club A|']);
    expect(result.current.isFavorite('Club A', '')).toBe(true);
  });

  it('should handle syncWithBackend (placeholder)', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const { result } = renderHook(() => useFavorites());

    act(async () => {
      await result.current.syncWithBackend();
    });

    expect(consoleSpy).toHaveBeenCalledWith('Backend sync not yet implemented');
    consoleSpy.mockRestore();
  });
}); 