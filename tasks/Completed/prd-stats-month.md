## Introduction / Overview

Add a new "Monthly Activity Calendar" section to the `You / Stats` tab, positioned after the week chart and before the heatmap within `client/src/components/stats-tab.tsx`. The section displays a mobile‑first, single‑month calendar view (Monday–Sunday columns) with month navigation via chevrons, highlights days with recorded activities, and shows a simple popover with activity details on day tap. A weekly completion indicator appears to the right of each week row. Above the calendar, a title shows the selected month and year, and a subtitle shows monthly stats: total sessions, total duration, and total tournaments. All data respects the selected sports via `sport-tabs.tsx`.

Goal: Help users quickly understand when they were active during a month, skim per‑month totals, and drill into a specific day’s activities.

## Goals

- Provide a clear, mobile‑first monthly calendar view that highlights days with activities.
- Allow simple, frictionless month navigation with chevrons (no dropdowns).
- Surface at‑a‑glance monthly stats (sessions, duration, tournaments) for the selected month.
- Offer quick per‑day details via a lightweight popover.
- Reflect the sport filter selection from `sport-tabs.tsx` across calendar highlights and stats.
- Show a weekly completion indicator per week row.

## User Stories

- As a user, I want to see which days I played this month so I can spot streaks or gaps.
- As a user, I want to switch months to review my past activity.
- As a user, I want to tap a day to see the sessions I logged that day.
- As a user, I want to see my monthly totals so I know how much I trained and competed.
- As a user, I want the calendar and totals to update when I filter by sport(s).

## Functional Requirements

1) Placement and Scope
   - The Monthly Activity Calendar appears in `StatsTab` after `WeeksChart` and before `ActivityHeatmap`.
   - It operates entirely on the activities already loaded into `StatsTab`, filtered by selected sports from `SportTabs`.

2) Calendar Layout
   - Single month view, one month at a time.
   - Columns: Monday → Sunday.
   - Rows: 5–6 weeks as needed for the month.
   - Outside days (from previous/next month) are not displayed.
   - Default selection is the current month based on the user’s local timezone (see Technical Considerations for UTC handling).

3) Navigation
   - Left and right chevrons navigate month-by-month backward/forward.
   - No month/year dropdown.
   - Forward navigation cannot go beyond the current month.
   - Backward navigation has no explicit cap; users may navigate to past months regardless of activity presence.

4) Section Header
   - Title: dynamic, format "Month YYYY" (e.g., "August 2025").
   - Subtitle: two rows, multiple columns, no borders; shows metrics for the selected month across currently selected sports:
     - Total Sessions: number of activities in the month.
     - Total Duration: sum of `duration` (minutes) formatted as "Xh Ym".
     - Total Tournaments: count of activities with `activityType === 'tournament'`.
   - Empty state for metrics when there are zero activities: display "-" for each metric.

5) Day Highlighting and Interaction
   - A day is highlighted with the primary color if there is at least one activity (after sport filter) on that date.
   - Non-active days remain on white background; no intensity or heat scale.
   - Tapping a highlighted day opens a popover anchored to the day cell.
   - Tapping an empty day does nothing.
   - Tapping outside the popover closes it.
   - No keyboard navigation requirements (mobile-first focus).

6) Popover Content (Simple)
   - Shows a list of that day’s activities (filtered by selected sports), newest first.
   - Each list item includes: sport, `activityType`, duration ("Xh Ym"), and `clubName` when available. Notes may be truncated.
   - If multiple activities exist, all are listed in the popover; scrolling is allowed if content exceeds viewport.

7) Weekly Completion Indicator
   - At the right end of each week row, display an icon:
     - `CircleCheck` (lucide) if the week has at least one highlighted day (i.e., at least one activity in the displayed days for that week within the month).
     - `Circle` (lucide) if there are no highlighted days for that week.
   - Mobile-first sizing and spacing.

8) Sport Filters Integration
   - The calendar highlights and the monthly subtitle metrics must reflect only the currently selected sports in `SportTabs`.
   - If the user deselects all sports, treat as "All sports" (match current `StatsTab` behavior) so the calendar and metrics reflect all activities.

9) Empty State
   - If a selected month has no activities (after filters), show no day highlights and show "-" for each subtitle metric.

10) Performance and Loading
   - All computations should be client-side based on the provided `activities` prop to `StatsTab`.
   - Rendering should be smooth on low-end mobile devices.

## Non-Goals (Out of Scope)

- Year view, week view, or multi-month side-by-side displays.
- Color intensity scales based on frequency or duration.
- Desktop-specific layout or keyboard navigation.
- Creating or editing activities within the calendar.
- Server-side pagination or fetching on month navigation (all data is assumed preloaded for the user session).

## Design Considerations (Optional)

- Visual style: simple, white background for days; primary color for highlighted active days; minimal borders.
- Subtitle layout: two rows with multiple columns, no borders, spacing optimized for mobile.
- Icons: use `lucide-react` `CircleCheck` and `Circle` with small size (e.g., 18–20px) and muted color when inactive.
- Consistency: align typography and spacing with existing UI system and `ui/calendar`/`ui/popover` tokens.

## Technical Considerations (Optional)

- Components: Prefer reusing `client/src/components/ui/calendar.tsx` (react-day-picker) and `client/src/components/ui/popover.tsx` for base primitives and styling.
- Week start: ensure Monday start; configure react-day-picker to start weeks on Monday.
- Outside days: hide them in the grid.
- Timezone & dates:
  - Activities store `date` as text; treat as ISO date string in UTC.
  - Convert to the user’s local timezone when computing the month and day boundaries and when matching activities to days.
  - Use `date-fns` utilities for parsing and formatting where helpful.
- Data model references (`@shared/schema`):
  - `Activity`: fields include `date` (text), `sport`, `activityType`, `duration` (minutes), `clubName`, `createdAt`.
  - Tournament detection: `activityType === 'tournament'`.
  - Duration formatting: convert minutes → "Xh Ym".
- Sorting within popover: for multiple activities on the same date, sort by `createdAt` descending if available; otherwise, stable order.
- Weekly completion computation: consider only the cells displayed for that month’s weeks (outside days hidden) when determining each week’s icon state.
- Accessibility: mobile-first; popover closes on outside tap; no keyboard navigation required.

## Success Metrics

- At least 60% of users who visit the Stats tab interact with month navigation or open at least one day popover within the first week after release.
- Increase in monthly session reviews (visits to Stats tab that interact with the new section) by 20%.
- Reduction in support questions about “how to see activity days” compared to prior weeks.

## Acceptance Criteria

1. The new section appears after the week chart and before the heatmap in `StatsTab`.
2. Title shows the current month on initial load, formatted as "Month YYYY".
3. Subtitle shows three metrics for the selected month across selected sports: Sessions, Duration ("Xh Ym"), Tournaments; shows "-" for each if zero.
4. Calendar columns are Monday–Sunday; outside days are not displayed.
5. Days with at least one activity (after sport filter) are highlighted with the primary color; others are white.
6. Tapping a highlighted day opens a popover listing all that day’s activities with sport, type, duration, and club (if present); tapping outside closes it; tapping empty days does nothing.
7. Each week row shows a right-aligned icon: `CircleCheck` if any highlighted day exists in that row; otherwise `Circle`.
8. Left/right chevrons navigate months; forward navigation does not go beyond the current month; initial month is current in local time.
9. Changing the sport selection updates highlights and subtitle metrics accordingly; deselecting all sports treats the selection as "All".
10. Behavior and layout are mobile-first and performant on low-end devices.

## Open Questions

- Localization: Do we need localized month names and weekday labels beyond English? If yes, define locale(s) and formatting.
- Max navigation range: Should backward navigation be limited (e.g., last 24 months) or stop at the earliest activity?
- Popover content expansion: Should we include opponent/partner or rating in a future iteration?
- Duration formatting: Is "Xh Ym" acceptable for all locales, or should we use "hh:mm"?


