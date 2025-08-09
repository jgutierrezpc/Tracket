# Product Requirements Document: Profile Tabs Feature

## Introduction/Overview

The Profile page currently displays all user information in a single view, making it difficult for users to focus on specific aspects of their tennis/padel journey. This feature introduces a tabbed interface that organizes the profile into three distinct views: **Stats**, **Activities**, and **Equipment**. This reorganization provides better insights and organization, allowing users to quickly access the information most relevant to their current needs.

## Goals

1. **Improve User Experience**: Provide organized access to different types of profile information through intuitive tab navigation
2. **Enhance Data Insights**: Present meaningful statistics and visualizations to help users understand their playing patterns
3. **Streamline Equipment Management**: Centralize racket tracking and maintenance in a dedicated section
4. **Maintain Mobile-First Design**: Ensure all sections work seamlessly on mobile devices
5. **Preserve Existing Functionality**: Reuse existing components while improving their organization

## User Stories

1. **As a racket sports player**, I want to quickly view my weekly and monthly statistics so that I can track my progress and playing frequency.

2. **As a enthusiast**, I want to browse my recent activities with search functionality so that I can find specific sessions or analyze my playing history.

3. **As a player**, I want to manage my racket collection and track usage hours so that I can maintain my equipment properly and know when to replace gear.

4. **As a player**, I want to easily switch between different views of my profile so that I can focus on what matters most to me at any given time.

5. **As a user**, I want the app to remember my preferred tab view so that I don't have to navigate to it every time I visit my profile.

## Functional Requirements

### 1. Tab Navigation System
1. The profile page must display three tabs at the top: "Stats", "Activities", and "Equipment"
2. The tab navigation must use a simple tab-style switch design
3. The system must remember the user's last selected tab when they return to the profile page
4. The default tab must be "Stats" for new users
5. All tabs must be accessible on mobile devices with appropriate touch targets

### 2. Stats Tab
6. The Stats tab must display three main sections in order:
   - "This Week" summary
   - "Last Few Weeks" line chart
   - Activity heatmap

7. The "This Week" summary must:
   - Show data from Monday to Sunday of the current week
   - Display the total number of activities
   - Display the total duration of all activities
   - Display average session duration if more than 1 session, exclude if only 1 session

8. The "Last Few Weeks" line chart must:
   - Show total duration per week for the last 12 weeks (3 months)
   - Display month names on the x-axis
   - Include clickable data points that show detailed information in the chart subtitle
   - Show number of sessions, session average, and total duration for clicked weeks
   - Include corresponding dates for the selected week
   - Display a sport toggle filter only if the user has activities in more than 1 sport

9. The activity heatmap must:
   - Use the existing ActivityHeatmap component
   - Display activity intensity over time
   - Maintain all existing functionality

### 3. Activities Tab
10. The Activities tab must display a list of all user activities, sorted by most recent first
11. Each activity must use the existing ActivityDetail component
12. The list must initially show 20 activities
13. A "Show More" button must appear below the 20th activity
14. Clicking "Show More" must load the next 20 activities
15. The search functionality must:
   - Allow real-time search as the user types
   - Search across all activity fields (date, sport type, activity type, partner, club name, notes)
   - Display results immediately without requiring a search button

### 4. Equipment Tab
16. The Equipment tab must display a list of user rackets with the following information:
   - Racket brand and model
   - Active/Inactive status
   - Total hours played with the racket
   - Broken status (if applicable)

17. The racket list must:
   - Sort active rackets first, then inactive rackets
   - Show an icon for inactive and broken rackets
   - Allow users to toggle racket status between active and inactive
   - Allow users to mark rackets as broken (which moves them to inactive status)
   - Allow users to reactivate broken rackets

18. The racket management must:
   - Provide a simple text entry form for adding new rackets (brand and model)
   - Calculate total hours based on activities that used each racket
   - Populate the racket selection in the AddActivityForm component

19. The "Broken Rackets" section must:
   - Allow users to upload pictures of broken rackets
   - Allow users to add notes about the breakage
   - Display broken rackets with their associated images and notes

### 5. Header Settings
20. The header must display "You" on the left side
21. A settings icon (Lucide) must appear on the right side of the header
22. The settings icon must be visible on all three tab views
23. Clicking the settings icon must navigate to a new settings page (to be implemented in a separate PRD)

### 6. Technical Requirements
24. The feature must reuse existing components where possible:
   - ActivityDetail component for activity display
   - ActivityHeatmap component for the heatmap
   - AddActivityForm component for activity creation
25. The tab state must persist across app sessions using localStorage
26. All sections must maintain mobile-first responsive design
27. The feature must integrate with existing data structures without requiring schema changes

## Non-Goals (Out of Scope)

1. **Advanced Analytics**: Complex statistical analysis beyond basic summaries and charts
2. **Social Features**: Sharing equipment or activity data with other users
3. **Equipment Marketplace**: Buying or selling rackets through the app
4. **Advanced Equipment Tracking**: Detailed maintenance schedules or equipment recommendations
5. **Export Functionality**: Downloading activity or equipment data
6. **Equipment Recommendations**: AI-powered suggestions for new rackets
7. **Advanced Search Filters**: Date range filters, sport-specific filters, or advanced search operators
8. **Bulk Operations**: Adding multiple rackets at once or bulk editing activities

## Design Considerations

1. **Mobile-First Design**: All sections must work seamlessly on mobile devices with appropriate touch targets and spacing
2. **Consistent Styling**: Maintain consistency with existing app design patterns and components
3. **Tab Design**: Use simple tab-style switches that are easy to tap on mobile devices
4. **Loading States**: Provide appropriate loading indicators for data fetching operations
5. **Empty States**: Design appropriate empty states for each tab when no data is available
6. **Accessibility**: Ensure all interactive elements meet accessibility standards

## Technical Considerations

1. **State Management**: Use React state or context to manage tab selection and persist user preferences
2. **Data Integration**: Leverage existing activity data structures without requiring schema changes
3. **Performance**: Implement efficient data fetching and caching for large activity lists
4. **Component Reuse**: Maximize reuse of existing components to maintain consistency and reduce development time
5. **Local Storage**: Use localStorage to persist tab selection and user preferences
6. **Responsive Design**: Ensure all sections work well on various screen sizes

## Success Metrics

1. **User Engagement**: 70% of users switch between tabs at least once per session
2. **Feature Adoption**: 80% of users visit the Equipment tab within the first week of release
3. **User Retention**: Maintain or improve current profile page visit frequency
4. **Performance**: Page load times remain under 2 seconds on mobile devices
5. **User Satisfaction**: Positive feedback on the organized layout and improved data insights

## Open Questions

1. **Equipment Photos**: Should there be a limit on the number of photos users can upload for broken rackets?
2. **Activity Linking**: How should the system handle activities that don't specify a racket when calculating usage hours?
3. **Data Export**: Should users be able to export their equipment list or activity data?
4. **Notifications**: Should users receive notifications about racket maintenance or replacement recommendations?
5. **Advanced Analytics**: What additional statistics would be valuable for competitive players vs casual players?
