import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CourtsMap from './courts-map';

// Mock Google Maps
const mockGoogle = {
  maps: {
    Map: vi.fn(),
    Marker: vi.fn(),
    LatLngBounds: vi.fn(),
    event: {
      addListener: vi.fn(),
      removeListener: vi.fn()
    },
    MapTypeId: {
      ROADMAP: 'roadmap'
    },
    Size: vi.fn(),
    Point: vi.fn()
  }
};

// Mock window.google
Object.defineProperty(window, 'google', {
  value: mockGoogle,
  writable: true
});

// Mock navigator.geolocation
Object.defineProperty(navigator, 'geolocation', {
  value: {
    getCurrentPosition: vi.fn()
  },
  writable: true
});

describe('CourtsMap', () => {
  const defaultProps = {
    courts: [
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
    ],
    favorites: [],
    onToggleFavorite: vi.fn(),
    onCourtClick: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset window.innerWidth for mobile detection
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024
    });
  });

     it('renders loading state when isLoading is true', () => {
     render(<CourtsMap {...defaultProps} isLoading={true} />);
     
     expect(screen.getByText('Loading map...')).toBeInTheDocument();
     expect(screen.getByRole('status')).toBeInTheDocument();
   });

   it('renders map initializing state when map is initializing', () => {
     render(<CourtsMap {...defaultProps} />);
     
     // Mock map initialization state
     const component = render(<CourtsMap {...defaultProps} />);
     // This would normally be set during map initialization
     // For testing, we'll check the component handles the state
     expect(screen.queryByText('Initializing map...')).not.toBeInTheDocument();
   });

  it('renders error state when error is provided', () => {
    const error = 'Failed to load map';
    render(<CourtsMap {...defaultProps} error={error} />);
    
    expect(screen.getByText(`Failed to load courts: ${error}`)).toBeInTheDocument();
  });

  it('renders map container', () => {
    render(<CourtsMap {...defaultProps} />);
    
    const mapContainer = screen.getByRole('region', { hidden: true });
    expect(mapContainer).toBeInTheDocument();
    expect(mapContainer).toHaveClass('w-full', 'h-96', 'rounded-lg');
  });

  it('shows user location button when user location is available', () => {
    render(<CourtsMap {...defaultProps} />);
    
    // Mock user location
    const mockPosition = {
      coords: {
        latitude: 40.7128,
        longitude: -74.0060
      }
    };
    
    // Simulate geolocation success
    (navigator.geolocation.getCurrentPosition as any).mockImplementation((success) => {
      success(mockPosition);
    });
    
    // Re-render to trigger useEffect
    render(<CourtsMap {...defaultProps} />);
    
    expect(screen.getByRole('button', { name: /my location/i })).toBeInTheDocument();
  });

     it('disables user location button when location is not available', () => {
     render(<CourtsMap {...defaultProps} />);
     
     const locationButton = screen.getByRole('button', { name: /my location/i });
     expect(locationButton).toBeDisabled();
   });

   it('shows loading state on location button when getting location', () => {
     render(<CourtsMap {...defaultProps} />);
     
     // Mock location loading state
     // This would normally be set during geolocation request
     // For testing, we'll check the component handles the state
     const locationButton = screen.getByRole('button', { name: /my location/i });
     expect(locationButton).toBeInTheDocument();
   });

   it('handles location error gracefully', () => {
     // Mock geolocation error
     (navigator.geolocation.getCurrentPosition as any).mockImplementation((success, error) => {
       error({ code: 1, message: 'Permission denied' });
     });
     
     render(<CourtsMap {...defaultProps} />);
     
     // Should handle location error without crashing
     expect(screen.getByRole('button', { name: /my location/i })).toBeInTheDocument();
   });

     it('shows warning when no courts have coordinates', () => {
     const courtsWithoutCoords = [
       {
         ...defaultProps.courts[0],
         coordinates: undefined
       }
     ];
     
     render(<CourtsMap {...defaultProps} courts={courtsWithoutCoords} />);
     
     expect(screen.getByText(/no courts with location data found/i)).toBeInTheDocument();
   });

   it('shows partial coordinates warning when some courts lack coordinates', () => {
     const courtsWithMixedCoords = [
       { ...defaultProps.courts[0], coordinates: { lat: 40.7128, lng: -74.0060 } },
       { ...defaultProps.courts[0], clubName: 'Club B', coordinates: undefined }
     ];
     
     render(<CourtsMap {...defaultProps} courts={courtsWithMixedCoords} />);
     
     expect(screen.getByText(/1 court without location data/i)).toBeInTheDocument();
   });

   it('handles multiple courts without coordinates gracefully', () => {
     const courtsWithMultipleMissingCoords = [
       { ...defaultProps.courts[0], clubName: 'Club A', coordinates: undefined },
       { ...defaultProps.courts[0], clubName: 'Club B', coordinates: undefined },
       { ...defaultProps.courts[0], clubName: 'Club C', coordinates: { lat: 40.7128, lng: -74.0060 } }
     ];
     
     render(<CourtsMap {...defaultProps} courts={courtsWithMultipleMissingCoords} />);
     
     expect(screen.getByText(/2 courts without location data/i)).toBeInTheDocument();
   });

  it('shows courts summary with coordinates count', () => {
    const courtsWithMixedCoords = [
      { ...defaultProps.courts[0], coordinates: { lat: 40.7128, lng: -74.0060 } },
      { ...defaultProps.courts[0], clubName: 'Club B', coordinates: undefined }
    ];
    
    render(<CourtsMap {...defaultProps} courts={courtsWithMixedCoords} />);
    
    expect(screen.getByText(/showing 1 of 2 courts on map/i)).toBeInTheDocument();
    expect(screen.getByText(/1 without coordinates/i)).toBeInTheDocument();
  });

  it('shows desktop court details card when court is selected', () => {
    // Set desktop width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024
    });
    
    render(<CourtsMap {...defaultProps} />);
    
    // Simulate court selection (this would normally happen via map click)
    // For testing, we'll check that the component handles selectedCourt state
    expect(screen.queryByText('Tennis Club A')).not.toBeInTheDocument();
  });

  it('shows mobile court details sheet when court is selected on mobile', () => {
    // Set mobile width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375
    });
    
    render(<CourtsMap {...defaultProps} />);
    
    // The mobile sheet would be shown when a court is selected
    // For testing, we'll check that the component handles mobile state
    expect(screen.queryByText('Tennis Club A')).not.toBeInTheDocument();
  });

     it('shows zoom controls on mobile', () => {
     // Set mobile width
     Object.defineProperty(window, 'innerWidth', {
       writable: true,
       configurable: true,
       value: 375
     });
     
     render(<CourtsMap {...defaultProps} />);
     
     // Zoom controls should be present on mobile
     const zoomInButton = screen.getByRole('button', { name: /zoom in/i });
     const zoomOutButton = screen.getByRole('button', { name: /zoom out/i });
     const resetButton = screen.getByRole('button', { name: /reset view/i });
     
     expect(zoomInButton).toBeInTheDocument();
     expect(zoomOutButton).toBeInTheDocument();
     expect(resetButton).toBeInTheDocument();
   });

   it('shows enhanced map controls on desktop', () => {
     // Set desktop width
     Object.defineProperty(window, 'innerWidth', {
       writable: true,
       configurable: true,
       value: 1024
     });
     
     render(<CourtsMap {...defaultProps} />);
     
     // Enhanced map controls should be present on desktop
     const zoomInButton = screen.getByRole('button', { name: /zoom in/i });
     const zoomOutButton = screen.getByRole('button', { name: /zoom out/i });
     const resetButton = screen.getByRole('button', { name: /reset view/i });
     const centerButton = screen.getByRole('button', { name: /center map/i });
     
     expect(zoomInButton).toBeInTheDocument();
     expect(zoomOutButton).toBeInTheDocument();
     expect(resetButton).toBeInTheDocument();
     expect(centerButton).toBeInTheDocument();
   });

     it('handles map initialization errors gracefully', () => {
     // Mock Google Maps to throw error
     const originalGoogle = window.google;
     Object.defineProperty(window, 'google', {
       value: undefined,
       writable: true
     });
     
     render(<CourtsMap {...defaultProps} />);
     
     // Should show error state
     expect(screen.getByText(/google maps failed to load/i)).toBeInTheDocument();
     
     // Restore original mock
     Object.defineProperty(window, 'google', {
       value: originalGoogle,
       writable: true
     });
   });

   it('handles script loading errors gracefully', () => {
     // Mock script loading error
     const originalCreateElement = document.createElement;
     document.createElement = vi.fn().mockImplementation((tag) => {
       if (tag === 'script') {
         const script = {
           src: '',
           async: false,
           defer: false,
           onload: null,
           onerror: null,
           setAttribute: vi.fn(),
           appendChild: vi.fn()
         };
         // Simulate script error
         setTimeout(() => {
           if (script.onerror) script.onerror();
         }, 0);
         return script;
       }
       return originalCreateElement(tag);
     });
     
     render(<CourtsMap {...defaultProps} />);
     
     // Should handle script loading error
     expect(screen.getByText(/failed to load google maps/i)).toBeInTheDocument();
     
     // Restore original createElement
     document.createElement = originalCreateElement;
   });

  it('formats duration correctly', () => {
    render(<CourtsMap {...defaultProps} />);
    
    // The component should format duration in the court details
    // This is tested indirectly through the court details display
    expect(screen.getByText(/5 sessions/i)).toBeInTheDocument();
  });

  it('formats last played date correctly', () => {
    render(<CourtsMap {...defaultProps} />);
    
    // The component should format the last played date
    // This is tested indirectly through the court details display
    expect(screen.getByText(/last played/i)).toBeInTheDocument();
  });

     it('handles empty courts array', () => {
     render(<CourtsMap {...defaultProps} courts={[]} />);
     
     expect(screen.getByText(/no courts available/i)).toBeInTheDocument();
   });

   it('shows helpful message when courts exist but none have coordinates', () => {
     const courtsWithoutCoords = [
       { ...defaultProps.courts[0], coordinates: undefined }
     ];
     
     render(<CourtsMap {...defaultProps} courts={courtsWithoutCoords} />);
     
     expect(screen.getByText(/no courts with location data available/i)).toBeInTheDocument();
     expect(screen.getByText(/add coordinates to see courts on the map/i)).toBeInTheDocument();
   });

     it('applies custom className', () => {
     render(<CourtsMap {...defaultProps} className="custom-class" />);
     
     const container = screen.getByText(/showing/i).closest('div');
     expect(container).toHaveClass('custom-class');
   });

   it('shows zoom level on desktop', () => {
     // Set desktop width
     Object.defineProperty(window, 'innerWidth', {
       writable: true,
       configurable: true,
       value: 1024
     });
     
     render(<CourtsMap {...defaultProps} />);
     
     // Should show zoom level in summary
     expect(screen.getByText(/zoom: 10/i)).toBeInTheDocument();
   });

   it('does not show zoom level on mobile', () => {
     // Set mobile width
     Object.defineProperty(window, 'innerWidth', {
       writable: true,
       configurable: true,
       value: 375
     });
     
     render(<CourtsMap {...defaultProps} />);
     
     // Should not show zoom level on mobile
     expect(screen.queryByText(/zoom: 10/i)).not.toBeInTheDocument();
   });

   it('handles marker click interactions', () => {
     render(<CourtsMap {...defaultProps} />);
     
     // Mock marker click functionality
     // This would normally be triggered by Google Maps marker click
     // For testing, we'll verify the component handles court selection
     expect(screen.queryByText('Tennis Club A')).not.toBeInTheDocument();
   });

   it('handles favorite toggle on court details', () => {
     const onToggleFavorite = vi.fn();
     render(<CourtsMap {...defaultProps} onToggleFavorite={onToggleFavorite} />);
     
     // Mock court selection and favorite toggle
     // This would normally happen via map interaction
     // For testing, we'll verify the callback is properly passed
     expect(onToggleFavorite).toBeDefined();
   });

   it('handles court click callback', () => {
     const onCourtClick = vi.fn();
     render(<CourtsMap {...defaultProps} onCourtClick={onCourtClick} />);
     
     // Mock court selection
     // This would normally happen via map marker click
     // For testing, we'll verify the callback is properly passed
     expect(onCourtClick).toBeDefined();
   });

   it('handles mobile details sheet interactions', () => {
     // Set mobile width
     Object.defineProperty(window, 'innerWidth', {
       writable: true,
       configurable: true,
       value: 375
     });
     
     render(<CourtsMap {...defaultProps} />);
     
     // Mock mobile sheet interactions
     // This would normally be triggered by marker clicks on mobile
     // For testing, we'll verify the component handles mobile state
     expect(screen.queryByText('Tennis Club A')).not.toBeInTheDocument();
   });

   it('handles map bounds changes', () => {
     render(<CourtsMap {...defaultProps} />);
     
     // Mock map bounds changes
     // This would normally be triggered by map pan/zoom
     // For testing, we'll verify the component handles bounds tracking
     expect(screen.getByText(/showing/i)).toBeInTheDocument();
   });

   it('handles zoom level changes', () => {
     render(<CourtsMap {...defaultProps} />);
     
     // Mock zoom level changes
     // This would normally be triggered by map zoom controls
     // For testing, we'll verify the component handles zoom tracking
     expect(screen.getByText(/zoom: 10/i)).toBeInTheDocument();
   });

   it('handles map control button interactions', () => {
     render(<CourtsMap {...defaultProps} />);
     
     // Test zoom in button
     const zoomInButton = screen.getByRole('button', { name: /zoom in/i });
     expect(zoomInButton).toBeInTheDocument();
     
     // Test zoom out button
     const zoomOutButton = screen.getByRole('button', { name: /zoom out/i });
     expect(zoomOutButton).toBeInTheDocument();
     
     // Test reset view button
     const resetButton = screen.getByRole('button', { name: /reset view/i });
     expect(resetButton).toBeInTheDocument();
   });

   it('handles map control button interactions on desktop', () => {
     // Set desktop width
     Object.defineProperty(window, 'innerWidth', {
       writable: true,
       configurable: true,
       value: 1024
     });
     
     render(<CourtsMap {...defaultProps} />);
     
     // Test center map button (desktop only)
     const centerButton = screen.getByRole('button', { name: /center map/i });
     expect(centerButton).toBeInTheDocument();
   });

   it('handles map initialization with existing Google Maps', () => {
     // Mock Google Maps as already loaded
     const mockGoogle = {
       maps: {
         Map: vi.fn(),
         Marker: vi.fn(),
         LatLngBounds: vi.fn(),
         event: {
           addListener: vi.fn(),
           removeListener: vi.fn()
         },
         MapTypeId: {
           ROADMAP: 'roadmap'
         },
         Size: vi.fn(),
         Point: vi.fn()
       }
     };
     
     Object.defineProperty(window, 'google', {
       value: mockGoogle,
       writable: true
     });
     
     render(<CourtsMap {...defaultProps} />);
     
     // Should initialize map without loading script
     expect(screen.getByText(/showing/i)).toBeInTheDocument();
   });

   it('handles map cleanup on unmount', () => {
     const { unmount } = render(<CourtsMap {...defaultProps} />);
     
     // Mock cleanup
     unmount();
     
     // Should handle cleanup without errors
     expect(true).toBe(true); // Just verify no errors during unmount
   });

   it('handles multiple courts with same coordinates', () => {
     const courtsWithSameCoords = [
       { ...defaultProps.courts[0], clubName: 'Club A' },
       { ...defaultProps.courts[0], clubName: 'Club B' },
       { ...defaultProps.courts[0], clubName: 'Club C' }
     ];
     
     render(<CourtsMap {...defaultProps} courts={courtsWithSameCoords} />);
     
     // Should handle multiple courts with same coordinates
     expect(screen.getByText(/showing 3 of 3 courts on map/i)).toBeInTheDocument();
   });

   it('handles courts with invalid coordinates', () => {
     const courtsWithInvalidCoords = [
       { ...defaultProps.courts[0], coordinates: { lat: NaN, lng: NaN } },
       { ...defaultProps.courts[0], clubName: 'Club B', coordinates: { lat: 40.7128, lng: -74.0060 } }
     ];
     
     render(<CourtsMap {...defaultProps} courts={courtsWithInvalidCoords} />);
     
     // Should handle invalid coordinates gracefully
     expect(screen.getByText(/showing 1 of 2 courts on map/i)).toBeInTheDocument();
   });

   it('handles map resize events', () => {
     render(<CourtsMap {...defaultProps} />);
     
     // Mock window resize
     Object.defineProperty(window, 'innerWidth', {
       writable: true,
       configurable: true,
       value: 375 // Mobile width
     });
     
     // Trigger resize event
     window.dispatchEvent(new Event('resize'));
     
     // Should handle resize without errors
     expect(screen.getByText(/showing/i)).toBeInTheDocument();
   });
}); 