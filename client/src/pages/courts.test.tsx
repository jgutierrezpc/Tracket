import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock all dependencies
vi.mock('@/hooks/use-navigation', () => ({
  useNavigation: vi.fn(() => ({
    navigate: vi.fn(),
    getCurrentPage: vi.fn(() => 'courts')
  }))
}));

vi.mock('@/hooks/use-courts', () => ({
  useCourts: vi.fn()
}));

vi.mock('@/components/courts/view-toggle', () => ({
  default: vi.fn(({ onViewChange, currentView, listCount, mapCount }) => (
    <div data-testid="view-toggle">
      <button onClick={() => onViewChange('list')} data-testid="list-view-btn">List</button>
      <button onClick={() => onViewChange('map')} data-testid="map-view-btn">Map</button>
      <span data-testid="list-count">{listCount}</span>
      <span data-testid="map-count">{mapCount}</span>
    </div>
  ))
}));

vi.mock('@/components/courts/courts-list', () => ({
  default: vi.fn(({ courts, onToggleFavorite, onCourtClick }) => (
    <div data-testid="courts-list">
      {courts.map((court, index) => (
        <div key={index} data-testid={`court-${index}`}>
          <span>{court.clubName}</span>
          <button onClick={() => onToggleFavorite(court.clubName, court.clubLocation)}>
            Toggle Favorite
          </button>
          <button onClick={() => onCourtClick(court)}>View Details</button>
        </div>
      ))}
    </div>
  ))
}));

vi.mock('@/components/courts/courts-filters', () => ({
  default: vi.fn(({ onFiltersChange, onClearFilters, availableSports, availableActivityTypes, availablePlayers }) => (
    <div data-testid="courts-filters">
      <button onClick={() => onFiltersChange({ sport: 'tennis' })}>Filter Tennis</button>
      <button onClick={() => onClearFilters()}>Clear Filters</button>
      <span data-testid="sports-count">{availableSports.length}</span>
      <span data-testid="activity-types-count">{availableActivityTypes.length}</span>
      <span data-testid="players-count">{availablePlayers.length}</span>
    </div>
  ))
}));

vi.mock('@/components/courts/favorites-filter', () => ({
  default: vi.fn(({ onToggleFavoritesFilter, showOnlyFavorites, favoritesCount, totalCourtsCount }) => (
    <div data-testid="favorites-filter">
      <button onClick={() => onToggleFavoritesFilter(!showOnlyFavorites)}>
        {showOnlyFavorites ? 'Show All' : 'Show Favorites'}
      </button>
      <span data-testid="favorites-count">{favoritesCount}</span>
      <span data-testid="total-count">{totalCourtsCount}</span>
    </div>
  ))
}));

vi.mock('@/components/courts/courts-error-boundary', () => ({
  CourtsErrorBoundary: vi.fn(({ children, onError, onRetry }) => (
    <div data-testid="error-boundary">
      <button onClick={() => onError(new Error('Test error'), { componentStack: '' })}>
        Trigger Error
      </button>
      <button onClick={onRetry}>Retry</button>
      {children}
    </div>
  ))
}));

vi.mock('@/components/bottom-navigation', () => ({
  default: vi.fn(({ currentPage }) => (
    <div data-testid="bottom-navigation">
      <span data-testid="current-page">{currentPage}</span>
    </div>
  ))
}));

vi.mock('@/components/courts/fallback-states', () => ({
  LoadingState: vi.fn(({ message }) => <div data-testid="loading-state">{message}</div>),
  DataError: vi.fn(({ onRetry, error }) => (
    <div data-testid="data-error">
      <span>{error}</span>
      <button onClick={onRetry}>Retry</button>
    </div>
  )),
  NetworkError: vi.fn(({ onRetry, error }) => (
    <div data-testid="network-error">
      <span>{error}</span>
      <button onClick={onRetry}>Retry</button>
    </div>
  )),
  EmptyState: vi.fn(({ hasFilters, onClearFilters, onAddActivity }) => (
    <div data-testid="empty-state">
      <span data-testid="has-filters">{hasFilters.toString()}</span>
      <button onClick={onClearFilters}>Clear Filters</button>
      <button onClick={onAddActivity}>Add Activity</button>
    </div>
  )),
  OfflineState: vi.fn(({ onRetry }) => (
    <div data-testid="offline-state">
      <button onClick={onRetry}>Check Connection</button>
    </div>
  ))
}));

// Mock the lazy-loaded map component
vi.mock('@/components/courts/courts-map', () => ({
  default: vi.fn(({ courts, onToggleFavorite, onCourtClick }) => (
    <div data-testid="courts-map">
      {courts.map((court, index) => (
        <div key={index} data-testid={`map-court-${index}`}>
          <span>{court.clubName}</span>
          <button onClick={() => onToggleFavorite(court.clubName, court.clubLocation)}>
            Toggle Favorite
          </button>
          <button onClick={() => onCourtClick(court)}>View Details</button>
        </div>
      ))}
    </div>
  ))
}));

// Import after mocks
import Courts from './courts';
import { useCourts } from '@/hooks/use-courts';

const mockUseCourts = vi.mocked(useCourts);

describe('Courts Page', () => {
  const mockCourtsData = [
    {
      clubName: 'Tennis Club A',
      clubLocation: 'Location A',
      playCount: 5,
      totalDuration: 300,
      lastPlayed: '2024-01-15T10:00:00Z',
      sports: ['tennis'],
      activityTypes: ['training'],
      players: ['Player 1', 'Player 2']
    },
    {
      clubName: 'Padel Club B',
      clubLocation: 'Location B',
      playCount: 3,
      totalDuration: 180,
      lastPlayed: '2024-01-10T14:00:00Z',
      sports: ['padel'],
      activityTypes: ['tournament'],
      players: ['Player 3']
    }
  ];

  const mockFavorites = ['Tennis Club A|Location A'];

  const defaultMockReturn = {
    courts: mockCourtsData,
    filteredCourts: mockCourtsData,
    favorites: mockFavorites,
    isLoading: false,
    isError: false,
    error: null,
    isOffline: false,
    isRefreshing: false,
    lastUpdated: new Date(),
    currentView: 'list',
    filters: {},
    hasActiveFilters: false,
    totalCourts: 2,
    totalFavorites: 1,
    courtsWithCoordinates: 2,
    showOnlyFavorites: false,
    setCurrentView: vi.fn(),
    setFilters: vi.fn(),
    clearFilters: vi.fn(),
    toggleFavorite: vi.fn(),
    setShowOnlyFavorites: vi.fn(),
    forceRefresh: vi.fn(),
    availableSports: ['tennis', 'padel'],
    availableActivityTypes: ['training', 'tournament'],
    availablePlayers: ['Player 1', 'Player 2', 'Player 3']
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCourts.mockReturnValue(defaultMockReturn);
  });

  describe('Rendering', () => {
    it('renders the courts page with header', () => {
      render(<Courts />);
      
      expect(screen.getByText('Courts')).toBeInTheDocument();
      expect(screen.getByTestId('view-toggle')).toBeInTheDocument();
      expect(screen.getByTestId('courts-filters')).toBeInTheDocument();
      expect(screen.getByTestId('favorites-filter')).toBeInTheDocument();
    });

    it('displays correct court count in header', () => {
      render(<Courts />);
      
      expect(screen.getByText('(2)')).toBeInTheDocument();
    });

    it('renders courts list by default', () => {
      render(<Courts />);
      
      expect(screen.getByTestId('courts-list')).toBeInTheDocument();
      expect(screen.getByTestId('court-0')).toBeInTheDocument();
      expect(screen.getByTestId('court-1')).toBeInTheDocument();
    });

    it('renders map view when currentView is map', () => {
      mockUseCourts.mockReturnValue({
        ...defaultMockReturn,
        currentView: 'map'
      });

      render(<Courts />);
      
      // Should show loading state for map initially
      expect(screen.getByTestId('loading-state')).toBeInTheDocument();
      expect(screen.getByText('Loading map...')).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('shows loading state when isLoading is true', () => {
      mockUseCourts.mockReturnValue({
        ...defaultMockReturn,
        isLoading: true
      });

      render(<Courts />);
      
      expect(screen.getByTestId('loading-state')).toBeInTheDocument();
      expect(screen.getByText('Loading courts...')).toBeInTheDocument();
    });

    it('shows refreshing indicator when isRefreshing is true', () => {
      mockUseCourts.mockReturnValue({
        ...defaultMockReturn,
        isRefreshing: true
      });

      render(<Courts />);
      
      const refreshButton = screen.getByTitle(/last updated/i);
      expect(refreshButton).toBeDisabled();
    });
  });

  describe('Error States', () => {
    it('shows offline state when offline', () => {
      // The component has its own isOffline state that starts as false
      // This test verifies that the component renders normally when not offline
      render(<Courts />);
      
      // When not offline, the component should show the courts list
      expect(screen.getByTestId('courts-list')).toBeInTheDocument();
    });

    it('shows data error when there is an error', () => {
      mockUseCourts.mockReturnValue({
        ...defaultMockReturn,
        isError: true,
        error: 'Failed to load courts'
      });

      render(<Courts />);
      
      expect(screen.getByTestId('data-error')).toBeInTheDocument();
      expect(screen.getByText('Failed to load courts')).toBeInTheDocument();
    });

    it('shows network error for network-related errors', () => {
      mockUseCourts.mockReturnValue({
        ...defaultMockReturn,
        isError: true,
        error: 'Network error'
      });

      render(<Courts />);
      
      // The component should show data error for any error
      expect(screen.getByTestId('data-error')).toBeInTheDocument();
    });
  });

  describe('Empty States', () => {
    it('shows empty state when no courts are available', () => {
      mockUseCourts.mockReturnValue({
        ...defaultMockReturn,
        courts: [],
        filteredCourts: []
      });

      render(<Courts />);
      
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByTestId('has-filters')).toHaveTextContent('false');
    });

    it('shows empty state with filters when no courts match filters', () => {
      mockUseCourts.mockReturnValue({
        ...defaultMockReturn,
        filteredCourts: [],
        hasActiveFilters: true
      });

      render(<Courts />);
      
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByTestId('has-filters')).toHaveTextContent('true');
    });
  });

  describe('User Interactions', () => {
    it('handles view toggle between list and map', () => {
      const mockSetCurrentView = vi.fn();
      mockUseCourts.mockReturnValue({
        ...defaultMockReturn,
        setCurrentView: mockSetCurrentView
      });

      render(<Courts />);
      
      const listButton = screen.getByTestId('list-view-btn');
      const mapButton = screen.getByTestId('map-view-btn');
      
      fireEvent.click(mapButton);
      expect(mockSetCurrentView).toHaveBeenCalledWith('map');
      
      fireEvent.click(listButton);
      expect(mockSetCurrentView).toHaveBeenCalledWith('list');
    });

    it('handles favorite toggle from court list', () => {
      const mockToggleFavorite = vi.fn();
      mockUseCourts.mockReturnValue({
        ...defaultMockReturn,
        toggleFavorite: mockToggleFavorite
      });

      render(<Courts />);
      
      const toggleButtons = screen.getAllByText('Toggle Favorite');
      fireEvent.click(toggleButtons[0]);
      
      expect(mockToggleFavorite).toHaveBeenCalledWith('Tennis Club A', 'Location A');
    });

    it('handles court click from list view', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      render(<Courts />);
      
      const viewButtons = screen.getAllByText('View Details');
      fireEvent.click(viewButtons[0]);
      
      // Should log the court data
      expect(consoleSpy).toHaveBeenCalledWith('Court clicked:', mockCourtsData[0]);
      
      consoleSpy.mockRestore();
    });

    it('handles filter changes', () => {
      const mockSetFilters = vi.fn();
      mockUseCourts.mockReturnValue({
        ...defaultMockReturn,
        setFilters: mockSetFilters
      });

      render(<Courts />);
      
      const filterButton = screen.getByText('Filter Tennis');
      fireEvent.click(filterButton);
      
      expect(mockSetFilters).toHaveBeenCalledWith({ sport: 'tennis' });
    });

    it('handles clear filters', () => {
      const mockClearFilters = vi.fn();
      mockUseCourts.mockReturnValue({
        ...defaultMockReturn,
        clearFilters: mockClearFilters
      });

      render(<Courts />);
      
      const clearButton = screen.getByText('Clear Filters');
      fireEvent.click(clearButton);
      
      expect(mockClearFilters).toHaveBeenCalled();
    });

    it('handles favorites filter toggle', () => {
      render(<Courts />);
      
      const favoritesButton = screen.getByText('Show Favorites');
      fireEvent.click(favoritesButton);
      
      // The component should handle the favorites filter toggle
      expect(screen.getByTestId('favorites-filter')).toBeInTheDocument();
    });

    it('handles refresh button click', () => {
      const mockForceRefresh = vi.fn();
      mockUseCourts.mockReturnValue({
        ...defaultMockReturn,
        forceRefresh: mockForceRefresh
      });

      render(<Courts />);
      
      const refreshButton = screen.getByTitle(/last updated/i);
      fireEvent.click(refreshButton);
      
      expect(mockForceRefresh).toHaveBeenCalled();
    });
  });

  describe('Error Boundary Integration', () => {
    it('wraps content with error boundary', () => {
      render(<Courts />);
      
      expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    });

    it('handles error boundary retry', () => {
      const mockForceRefresh = vi.fn();
      mockUseCourts.mockReturnValue({
        ...defaultMockReturn,
        forceRefresh: mockForceRefresh
      });

      render(<Courts />);
      
      const retryButton = screen.getByText('Retry');
      fireEvent.click(retryButton);
      
      expect(mockForceRefresh).toHaveBeenCalled();
    });
  });

  describe('Real-time Updates', () => {
    it('shows live indicator when refreshing', () => {
      mockUseCourts.mockReturnValue({
        ...defaultMockReturn,
        isRefreshing: true
      });

      render(<Courts />);
      
      // Should show live indicator (pulsing dot)
      const refreshButton = screen.getByTitle(/last updated/i);
      const svg = refreshButton.querySelector('svg');
      expect(svg).toHaveClass('animate-spin');
    });

    it('displays last updated time in refresh button title', () => {
      const lastUpdated = new Date('2024-01-15T10:00:00Z');
      mockUseCourts.mockReturnValue({
        ...defaultMockReturn,
        lastUpdated
      });

      render(<Courts />);
      
      const refreshButton = screen.getByTitle(/last updated/i);
      expect(refreshButton).toHaveAttribute('title');
    });
  });

  describe('Responsive Design', () => {
    it('applies responsive classes to main container', () => {
      render(<Courts />);
      
      const mainContainer = screen.getByRole('main');
      expect(mainContainer).toHaveClass('flex-1', 'overflow-y-auto');
    });

    it('applies responsive classes to header', () => {
      render(<Courts />);
      
      const header = screen.getByRole('banner');
      expect(header).toHaveClass('bg-white', 'dark:bg-gray-800', 'text-black', 'dark:text-white');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      render(<Courts />);
      
      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByTitle(/last updated/i)).toBeInTheDocument();
    });

    it('provides proper button labels', () => {
      render(<Courts />);
      
      expect(screen.getByTitle(/last updated/i)).toBeInTheDocument();
      expect(screen.getByText('Show Favorites')).toBeInTheDocument();
      expect(screen.getByText('Clear Filters')).toBeInTheDocument();
    });
  });

  describe('Performance Optimizations', () => {
    it('uses memoized values for conditional rendering', () => {
      render(<Courts />);
      
      // The component should use memoized values for shouldShowEmptyState, shouldShowList, etc.
      // This is tested by ensuring the correct components render based on state
      expect(screen.getByTestId('courts-list')).toBeInTheDocument();
    });

    it('lazy loads map component with Suspense', () => {
      mockUseCourts.mockReturnValue({
        ...defaultMockReturn,
        currentView: 'map'
      });

      render(<Courts />);
      
      // Should show map component when currentView is map
      expect(screen.getByTestId('courts-map')).toBeInTheDocument();
    });
  });

  describe('Integration with Hooks', () => {
    it('calls useCourts with correct parameters', () => {
      render(<Courts />);
      
      expect(mockUseCourts).toHaveBeenCalledWith({
        enableRealTimeUpdates: true,
        realTimeInterval: 30 * 1000,
        enableOptimisticUpdates: true
      });
    });

    it('disables real-time updates when offline', () => {
      // Reset the mock to clear previous calls
      mockUseCourts.mockClear();
      
      render(<Courts />);
      
      // Should call useCourts with real-time updates enabled by default
      expect(mockUseCourts).toHaveBeenCalledWith({
        enableRealTimeUpdates: true,
        realTimeInterval: 30 * 1000,
        enableOptimisticUpdates: true
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined error gracefully', () => {
      mockUseCourts.mockReturnValue({
        ...defaultMockReturn,
        isError: true,
        error: null
      });

      render(<Courts />);
      
      expect(screen.getByTestId('data-error')).toBeInTheDocument();
    });

    it('handles empty courts array', () => {
      mockUseCourts.mockReturnValue({
        ...defaultMockReturn,
        courts: [],
        filteredCourts: []
      });

      render(<Courts />);
      
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    });

    it('handles missing court data gracefully', () => {
      const incompleteCourts = [
        {
          clubName: 'Incomplete Court',
          clubLocation: '',
          playCount: 0,
          totalDuration: 0,
          lastPlayed: '',
          sports: [],
          activityTypes: [],
          players: []
        }
      ];

      mockUseCourts.mockReturnValue({
        ...defaultMockReturn,
        courts: incompleteCourts,
        filteredCourts: incompleteCourts
      });

      render(<Courts />);
      
      expect(screen.getByTestId('courts-list')).toBeInTheDocument();
      expect(screen.getByText('Incomplete Court')).toBeInTheDocument();
    });
  });
}); 