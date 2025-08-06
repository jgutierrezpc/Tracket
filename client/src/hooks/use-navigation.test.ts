import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocation } from 'wouter';

// Mock wouter
vi.mock('wouter', () => ({
  useLocation: vi.fn()
}));

const mockUseLocation = vi.mocked(useLocation);

// Import after mocks
import { useNavigation } from './use-navigation';

describe('useNavigation', () => {
  const mockSetLocation = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLocation.mockReturnValue(['/', mockSetLocation]);
  });

  describe('getCurrentPage', () => {
    it('returns home for root path', () => {
      mockUseLocation.mockReturnValue(['/', mockSetLocation]);
      
      const { result } = renderHook(() => useNavigation());
      
      expect(result.current.getCurrentPage()).toBe('home');
    });

    it('returns courts for /courts path', () => {
      mockUseLocation.mockReturnValue(['/courts', mockSetLocation]);
      
      const { result } = renderHook(() => useNavigation());
      
      expect(result.current.getCurrentPage()).toBe('courts');
    });

    it('returns friends for /friends path', () => {
      mockUseLocation.mockReturnValue(['/friends', mockSetLocation]);
      
      const { result } = renderHook(() => useNavigation());
      
      expect(result.current.getCurrentPage()).toBe('friends');
    });

    it('returns profile for /profile path', () => {
      mockUseLocation.mockReturnValue(['/profile', mockSetLocation]);
      
      const { result } = renderHook(() => useNavigation());
      
      expect(result.current.getCurrentPage()).toBe('profile');
    });

    it('returns home for unknown path', () => {
      mockUseLocation.mockReturnValue(['/unknown', mockSetLocation]);
      
      const { result } = renderHook(() => useNavigation());
      
      expect(result.current.getCurrentPage()).toBe('home');
    });
  });

  describe('navigate', () => {
    it('navigates to home', () => {
      const { result } = renderHook(() => useNavigation());
      
      act(() => {
        result.current.navigate('home');
      });
      
      expect(mockSetLocation).toHaveBeenCalledWith('/');
    });

    it('navigates to courts', () => {
      const { result } = renderHook(() => useNavigation());
      
      act(() => {
        result.current.navigate('courts');
      });
      
      expect(mockSetLocation).toHaveBeenCalledWith('/courts');
    });

    it('navigates to friends', () => {
      const { result } = renderHook(() => useNavigation());
      
      act(() => {
        result.current.navigate('friends');
      });
      
      expect(mockSetLocation).toHaveBeenCalledWith('/friends');
    });

    it('navigates to profile', () => {
      const { result } = renderHook(() => useNavigation());
      
      act(() => {
        result.current.navigate('profile');
      });
      
      expect(mockSetLocation).toHaveBeenCalledWith('/profile');
    });

    it('navigates to home for unknown page', () => {
      const { result } = renderHook(() => useNavigation());
      
      act(() => {
        result.current.navigate('unknown');
      });
      
      expect(mockSetLocation).toHaveBeenCalledWith('/');
    });
  });

  describe('integration', () => {
    it('provides both navigate and getCurrentPage functions', () => {
      const { result } = renderHook(() => useNavigation());
      
      expect(result.current.navigate).toBeDefined();
      expect(result.current.getCurrentPage).toBeDefined();
      expect(typeof result.current.navigate).toBe('function');
      expect(typeof result.current.getCurrentPage).toBe('function');
    });

    it('maintains consistent state between navigation calls', () => {
      mockUseLocation.mockReturnValue(['/courts', mockSetLocation]);
      
      const { result } = renderHook(() => useNavigation());
      
      expect(result.current.getCurrentPage()).toBe('courts');
      
      act(() => {
        result.current.navigate('profile');
      });
      
      expect(mockSetLocation).toHaveBeenCalledWith('/profile');
    });
  });
}); 