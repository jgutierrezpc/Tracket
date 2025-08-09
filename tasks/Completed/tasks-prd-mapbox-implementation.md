## Relevant Files

- `client/src/components/courts/courts-map.tsx` - Main map component that needs to be replaced with Mapbox implementation
- `client/src/components/courts/courts-map.test.tsx` - Unit tests for the map component
- `client/src/pages/courts.tsx` - Courts page that uses the map component
- `client/src/pages/courts.test.tsx` - Unit tests for the courts page
- `client/src/hooks/use-courts.ts` - Hook for managing courts data and filtering
- `client/src/hooks/use-courts.test.ts` - Unit tests for the courts hook
- `client/src/components/courts/courts-filters.tsx` - Filter component that integrates with map
- `client/src/components/courts/courts-filters.test.tsx` - Unit tests for the filters component
- `client/package.json` - Dependencies file to add Mapbox packages
- `client/.env` - Environment variables for Mapbox access token
- `client/src/components/ui/button.tsx` - UI components used by map controls
- `client/src/components/ui/card.tsx` - UI components for court details display
- `client/src/components/ui/sheet.tsx` - UI components for mobile court details

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `CourtsMap.tsx` and `CourtsMap.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Tasks

- [x] 1.0 Install and Configure Mapbox Dependencies
  - [x] 1.1 Install Mapbox GL JS and React-Map-GL packages
  - [x] 1.2 Add Mapbox access token to environment variables
  - [x] 1.3 Configure TypeScript types for Mapbox
  - [x] 1.4 Set up Mapbox CSS imports
  - [x] 1.5 Verify Google Maps API is still available for geocoding

- [x] 2.0 Create New Mapbox Map Component
  - [x] 2.1 Create new CourtsMapMapbox component with basic map rendering
  - [x] 2.2 Implement light map theme for better marker visibility
  - [x] 2.3 Add proper loading states and error handling
  - [x] 2.4 Center map on most recent venue with city-level zoom
  - [x] 2.5 Ensure responsive design for mobile and desktop
  - [x] 2.6 Add proper cleanup and memory management

- [x] 3.0 Implement Court Markers and Interactions
  - [x] 3.1 Create custom marker component using map-pin Lucide icon
  - [x] 3.2 Implement marker positioning at correct GPS coordinates
  - [x] 3.3 Add click handlers for court details popup/sidebar
  - [x] 3.4 Handle courts without coordinates gracefully
  - [x] 3.5 Implement marker updates when filters change
  - [x] 3.6 Add hover effects and visual feedback

- [x] 4.0 Add Map Controls and Navigation
  - [x] 4.1 Implement zoom in/out controls
  - [x] 4.2 Add pan controls for map navigation
  - [x] 4.3 Create reset view button functionality
  - [x] 4.4 Ensure controls work properly on mobile devices
  - [x] 4.5 Add keyboard navigation support
  - [x] 4.6 Style controls to match existing UI patterns

- [x] 5.0 Integrate with Existing Courts Page and Filters
  - [x] 5.1 Replace Google Maps component with Mapbox component in courts page
  - [x] 5.2 Maintain existing props interface for seamless integration
  - [x] 5.3 Connect map markers to existing filter system
  - [x] 5.4 Preserve toggle between list and map views
  - [x] 5.5 Update tests to work with new Mapbox implementation
  - [x] 5.6 Verify all existing functionality works correctly
