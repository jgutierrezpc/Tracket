# Task List: Profile Tabs Feature

## Relevant Files

- `client/src/pages/profile.tsx` - Main profile page that needs to be refactored to support tabs
- `client/src/pages/profile.test.tsx` - Unit tests for the profile page
- `client/src/components/profile-tabs.tsx` - New component for tab navigation
- `client/src/components/profile-tabs.test.tsx` - Unit tests for profile tabs component
- `client/src/components/stats-tab.tsx` - New component for the Stats tab content
- `client/src/components/stats-tab.test.tsx` - Unit tests for stats tab component
- `client/src/components/activities-tab.tsx` - New component for the Activities tab content
- `client/src/components/activities-tab.test.tsx` - Unit tests for activities tab component
- `client/src/components/equipment-tab.tsx` - New component for the Equipment tab content
- `client/src/components/equipment-tab.test.tsx` - Unit tests for equipment tab component
- `client/src/components/weekly-summary.tsx` - New component for "This Week" summary
- `client/src/components/weekly-summary.test.tsx` - Unit tests for weekly summary component
- `client/src/components/weeks-chart.tsx` - New component for "Last Few Weeks" line chart
- `client/src/components/weeks-chart.test.tsx` - Unit tests for weeks chart component
- `client/src/components/racket-list.tsx` - New component for racket management
- `client/src/components/racket-list.test.tsx` - Unit tests for racket list component
- `client/src/components/add-racket-form.tsx` - New component for adding rackets
- `client/src/components/add-racket-form.test.tsx` - Unit tests for add racket form
- `client/src/components/broken-rackets.tsx` - New component for broken rackets section
- `client/src/components/broken-rackets.test.tsx` - Unit tests for broken rackets component
- `client/src/hooks/use-profile-tabs.ts` - Custom hook for tab state management
- `client/src/hooks/use-profile-tabs.test.ts` - Unit tests for profile tabs hook
- `client/src/hooks/use-equipment.ts` - Custom hook for equipment data management
- `client/src/hooks/use-equipment.test.ts` - Unit tests for equipment hook
- `client/src/utils/weekly-calculations.ts` - Utility functions for weekly statistics
- `client/src/utils/weekly-calculations.test.ts` - Unit tests for weekly calculations
- `client/src/utils/equipment-helpers.ts` - Utility functions for equipment management
- `client/src/utils/equipment-helpers.test.ts` - Unit tests for equipment helpers
- `server/routes/equipment.ts` - New API routes for equipment management
- `server/routes/equipment.test.ts` - Unit tests for equipment API routes
- `shared/schema.ts` - May need updates for equipment data structure

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Tasks

- [ ] 1.0 Create Tab Navigation System
  - [x] 1.1 Create ProfileTabs component with tab state management
  - [x] 1.2 Implement localStorage persistence for tab selection
  - [x] 1.3 Add settings icon to header with navigation placeholder
  - [x] 1.4 Create custom hook for tab state management
  - [x] 1.5 Add unit tests for tab navigation functionality

- [ ] 2.0 Implement Stats Tab
  - [x] 2.1 Adapt existing StatsOverview component for "This Week" summary data
  - [x] 2.2 Create WeeksChart component for 12-week line chart with clickable data points
  - [x] 2.3 Integrate existing ActivityHeatmap component
  - [x] 2.4 Reuse existing SportTabs component for sport toggle filter (multi-sport users only)
  - [x] 2.5 Create StatsTab wrapper component
  - [x] 2.6 Add unit tests for stats components

- [ ] 3.0 Implement Activities Tab
  - [x] 3.1 Adapt existing RecentActivities component with pagination support
  - [x] 3.2 Implement real-time search functionality
  - [x] 3.3 Add "Show More" button with 20-item pagination
  - [x] 3.4 Integrate existing ActivityDetail components
  - [x] 3.5 Add unit tests for activities tab functionality

- [ ] 4.0 Implement Equipment Tab
  - [x] 4.1 Create equipment data structure and API routes
  - [x] 4.2 Create RacketList component with active/inactive sorting
  - [x] 4.3 Create AddRacketForm component
  - [x] 4.4 Create BrokenRackets component with image upload
  - [x] 4.5 Implement racket usage hours calculation
  - [x] 4.6 Create EquipmentTab wrapper component
  - [x] 4.7 Add unit tests for equipment components

- [ ] 5.0 Refactor Profile Page and Integration
  - [x] 5.1 Refactor existing profile.tsx to use new tab system
  - [x] 5.2 Update AddActivityForm to use equipment data
  - [x] 5.3 Ensure mobile-first responsive design
  - [x] 5.4 Add comprehensive integration tests
  - [x] 5.5 Update existing components to work with new structure
