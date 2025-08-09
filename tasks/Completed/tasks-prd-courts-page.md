# Task List: Courts Page Implementation

## Relevant Files

- `client/src/pages/courts.tsx` - Main Courts page component (existing, needs complete rewrite)
- `client/src/pages/courts.test.tsx` - Unit tests for Courts page component
- `client/src/components/courts/courts-list.tsx` - Component for displaying clubs in list view
- `client/src/components/courts/courts-list.test.tsx` - Unit tests for courts list component
- `client/src/components/courts/courts-map.tsx` - Component for displaying clubs on Google Map
- `client/src/components/courts/courts-map.test.tsx` - Unit tests for courts map component
- `client/src/components/courts/courts-filters.tsx` - Component for filtering clubs by various criteria
- `client/src/components/courts/courts-filters.test.tsx` - Unit tests for courts filters component
- `client/src/components/courts/court-card.tsx` - Individual club card component
- `client/src/components/courts/court-card.test.tsx` - Unit tests for court card component
- `client/src/components/courts/view-toggle.tsx` - Component for toggling between list and map views
- `client/src/components/courts/view-toggle.test.tsx` - Unit tests for view toggle component
- `client/src/hooks/use-courts.ts` - Custom hook for courts data management and filtering
- `client/src/hooks/use-courts.test.ts` - Unit tests for use-courts hook
- `client/src/hooks/use-favorites.ts` - Custom hook for managing favorite clubs
- `client/src/hooks/use-favorites.test.ts` - Unit tests for use-favorites hook
- `server/routes.ts` - API routes (existing, needs new endpoints for courts data)
- `server/storage.ts` - Data storage layer (existing, needs new methods for courts aggregation)
- `server/storage.test.ts` - Unit tests for storage methods and courts functionality
- `shared/schema.ts` - Database schema (existing, may need additions for favorites)

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Tasks

- [x] 1.0 Backend Infrastructure for Courts Data
  - [x] 1.1 Add new API endpoint `/api/courts` to get aggregated courts data from activities
  - [x] 1.2 Implement `getCourtsData()` method in storage layer to aggregate clubs from activities
  - [x] 1.3 Add courts data aggregation logic to calculate play frequency per club
  - [x] 1.4 Add API endpoint `/api/courts/favorites` for managing favorite clubs
  - [x] 1.5 Implement favorites storage in memory (extend to database later)
  - [x] 1.6 Add filtering support to courts API endpoint (by date, sport, activity type, players)
  - [x] 1.7 Update existing activities API to invalidate courts cache when activities change
  - [x] 1.8 Add unit tests for new storage methods and API endpoints

- [x] 2.0 Core Courts List Component
  - [x] 2.1 Create `CourtCard` component to display individual club information
  - [x] 2.2 Implement club name, address, and play frequency display
  - [x] 2.3 Add favorite star icon with toggle functionality
  - [x] 2.4 Create `CourtsList` component to render list of court cards
  - [x] 2.5 Implement responsive grid layout for mobile-first design
  - [x] 2.6 Add loading states and empty state handling
  - [x] 2.7 Add sorting by play frequency (most to least frequent)
  - [x] 2.8 Implement smooth animations and transitions
  - [x] 2.9 Add unit tests for CourtCard and CourtsList components

- [x] 3.0 Favorites Management System
  - [x] 3.1 Create `useFavorites` custom hook for managing favorite clubs
  - [x] 3.2 Implement add/remove favorites functionality with local storage persistence
  - [x] 3.3 Add visual indicators for favorite status (star icon states)
  - [x] 3.4 Implement favorites filtering (show only favorites toggle)
  - [x] 3.5 Add favorites count display and management
  - [x] 3.6 Create favorites synchronization with backend
  - [x] 3.7 Add unit tests for useFavorites hook and favorites functionality

- [x] 4.0 Filtering and Search Functionality
  - [x] 4.1 Create `CourtsFilters` component with filter controls
  - [x] 4.2 Implement date range filtering (this year, last year)
  - [x] 4.3 Add sport type filtering (tennis, padel, pickleball)
  - [x] 4.4 Implement activity type filtering (tournaments, training, friendly)
  - [x] 4.5 Add player name filtering (people user played with)
  - [x] 4.6 Create filter combination logic and state management
  - [x] 4.7 Add clear all filters functionality
  - [x] 4.8 Implement active filter indicators and badges
  - [x] 4.9 Add unit tests for filtering logic and components

- [x] 5.0 Map View Integration
  - [x] 5.1 Create `CourtsMap` component with Google Maps integration
  - [x] 5.2 Implement map pin display for clubs with GPS coordinates
  - [x] 5.3 Add clickable map pins with club details modal
  - [x] 5.4 Implement map view toggle functionality
  - [x] 5.5 Add mobile-optimized map controls and interactions
  - [x] 5.6 Handle clubs without GPS coordinates gracefully
  - [x] 5.7 Implement map zoom and pan controls
  - [x] 5.8 Add map loading states and error handling
  - [x] 5.9 Add unit tests for map component and interactions

- [ ] 6.0 Main Courts Page Integration
  - [x] 6.1 Create `useCourts` custom hook for data fetching and state management
  - [x] 6.2 Implement view toggle between list and map views
  - [x] 6.3 Integrate all components (list, map, filters) into main Courts page
  - [x] 6.4 Add responsive layout and mobile-first design
  - [x] 6.5 Implement real-time updates when activities are added
  - [x] 6.6 Add error boundaries and fallback states
  - [x] 6.7 Implement performance optimizations (memoization, lazy loading)
  - [x] 6.8 Add comprehensive unit tests for the complete Courts page
  - [x] 6.9 Update navigation and routing to ensure proper integration 