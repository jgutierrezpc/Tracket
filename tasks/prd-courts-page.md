# Product Requirements Document: Courts Page

## Introduction/Overview

The Courts page is a comprehensive feature that allows users to track and manage the clubs/venues where they play racket sports. This feature addresses the need for players to keep track of their playing locations and identify their preferred clubs. The page displays all clubs where users have participated in activities, sorted by frequency of play, with filtering capabilities and an interactive map view.

**Problem Solved:** Users currently lack a centralized way to view and manage their playing locations, making it difficult to track where they play most and identify their favorite venues.

**Goal:** Provide users with an intuitive interface to view, filter, and manage their playing locations with both list and map views.

## Goals

1. **Display Playing Locations:** Show all clubs where users have participated in activities, sorted by frequency of play (most to least frequent)
2. **Enable Favorites Management:** Allow users to mark/unmark clubs as favorites for quick access
3. **Provide Advanced Filtering:** Support filtering by date ranges, sport types, activity types, and player names
4. **Offer Map Visualization:** Display clubs on an embedded Google Map with interactive pins
5. **Ensure Real-time Updates:** Automatically update the courts list when new activities are added
6. **Mobile-First Design:** Optimize the interface for mobile devices while maintaining desktop functionality

## User Stories

1. **Primary User Story:** "As a racket sport player, I want to see my most frequent clubs so that I can quickly find where I play most"

2. **Favorites Management:** "As a player, I want to mark clubs as favorites so that I can easily access my preferred venues"

3. **Filtering by Sport:** "As a player, I want to filter clubs by sport type so that I can find venues specific to my sport"

4. **Date-based Filtering:** "As a player, I want to filter clubs by date range so that I can see where I played during specific time periods"

5. **Map Visualization:** "As a player, I want to view my clubs on a map so that I can see their locations geographically"

6. **Activity Type Filtering:** "As a player, I want to filter by activity type (tournaments, training) so that I can find venues for specific activities"

## Functional Requirements

### Core Display Requirements
1. The system must display all clubs where the user has participated in activities
2. The system must sort clubs by frequency of play (most to least frequent) by default
3. The system must show club name and address for each entry
4. The system must display clubs in a responsive, mobile-first layout

### Favorites Management
5. The system must allow users to mark clubs as favorites
6. The system must allow users to remove clubs from favorites
7. The system must persist favorite status across sessions
8. The system must provide visual indication of favorite status (e.g., star icon)

### Filtering Capabilities
9. The system must support filtering by date ranges:
   - "This year" (current calendar year)
   - "Last year" (previous calendar year)
10. The system must support filtering by sport type (tennis, padel, etc.)
11. The system must support filtering by activity type (tournaments, training, etc.)
12. The system must support filtering by player names (people the user played with)
13. The system must allow multiple filter combinations (e.g., padel + tournaments + specific date range)
14. The system must provide clear visual indication of active filters
15. The system must allow users to clear all filters

### Map View Requirements
16. The system must provide a toggle between list view and map view
17. The system must display all user's clubs as pins on an embedded Google Map
18. The system must make map pins clickable to show club details
19. The system must embed the map within the page (not full-screen)
20. The system must optimize map for mobile-first design
21. The system must handle clubs without GPS coordinates by not displaying them on the map

### Data Integration
22. The system must automatically update the courts list when new activities are added
23. The system must pull club data from existing activity records
24. The system must calculate play frequency based on activity history

### Edge Case Handling
25. The system must display appropriate message when user has no activities ("No activities added yet")
26. The system must disable map view when no clubs are available
27. The system must handle clubs with missing or invalid data gracefully

## Non-Goals (Out of Scope)

1. **Club Management:** This feature will not allow users to add, edit, or delete club information
2. **GPS Coordinate Entry:** Users cannot manually add GPS coordinates for clubs (future implementation)
3. **Club Reviews/Ratings:** No rating or review system for clubs
4. **Club Contact Information:** No display of club phone numbers, websites, or contact details
5. **Advanced Map Features:** No directions, navigation, or detailed map interactions beyond pin clicking
6. **Club Photos:** No display of club images or photos
7. **Real-time Availability:** No real-time court availability or booking features
8. **Social Features:** No sharing of favorite clubs or social interactions

## Design Considerations

### UI/UX Requirements
- **Mobile-First Design:** Optimize for mobile devices with responsive desktop layout
- **Modern, Clean Interface:** Use simple, modern design patterns consistent with existing app
- **Toggle Interface:** Implement smooth transitions between list and map views
- **Filter UI:** Use intuitive filter controls (dropdowns, date pickers, search)
- **Visual Hierarchy:** Clear distinction between favorite and non-favorite clubs
- **Loading States:** Provide appropriate loading indicators for map and data fetching

### Component Integration
- Leverage existing UI components from the design system
- Use existing card components for club display
- Integrate with existing navigation patterns
- Maintain consistency with current app styling

## Technical Considerations

### Performance Requirements
- Implement efficient data fetching and caching for club information
- Optimize map loading and rendering for mobile devices
- Ensure smooth transitions between list and map views
- Handle large datasets without performance degradation

### Integration Points
- Integrate with existing activity data structure
- Connect with Google Maps API for map functionality
- Utilize existing state management for favorites
- Integrate with current navigation system

### Data Requirements
- Club data structure: name, address, GPS coordinates (optional)
- Activity data integration for frequency calculation
- Favorites storage and persistence
- Filter state management

## Success Metrics

1. **User Engagement:** 70% of users visit the Courts page within 30 days of adding their first activity
2. **Feature Adoption:** 50% of users utilize the favorites feature within 60 days
3. **Map Usage:** 30% of users switch to map view at least once
4. **Filter Usage:** 40% of users apply at least one filter within 90 days
5. **Performance:** Page load time under 2 seconds on mobile devices
6. **User Satisfaction:** Positive feedback on ease of finding and managing favorite clubs

## Open Questions

1. **Filter Persistence:** Should user's filter preferences be saved across sessions?
2. **Map Default View:** Should the page default to list view or remember user's last preference?
3. **Club Details Modal:** What information should be shown when clicking on map pins?
4. **Search Functionality:** Should there be a text search for club names?
5. **Export/Share:** Should users be able to export or share their favorite clubs list?
6. **Analytics:** What specific user behavior should be tracked for future improvements? 