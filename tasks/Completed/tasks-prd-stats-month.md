## Relevant Files

- `client/src/components/stats-tab.tsx` - Host screen; insert the new section after `WeeksChart` and before `ActivityHeatmap`, pass filtered activities.
- `client/src/components/weeks-chart.tsx` - Reference for placement; no changes expected.
- `client/src/components/activity-heatmap.tsx` - Reference for placement; no changes expected.
- `client/src/components/sport-tabs.tsx` - Source of selected sports; the calendar and stats must respect this filter.
- `client/src/components/ui/popover.tsx` - Popover primitive to show day activity details.
- `client/src/components/ui/calendar.tsx` - Potential reference for styles/behaviors; may opt for a custom grid to support the weekly icon column and hidden outside days.
- `client/src/lib/utils.ts` - Utility helpers (e.g., `cn`), shared styling helpers.
- `client/src/components/monthly-calendar.tsx` - New component implementing the Monthly Activity Calendar.
- `client/src/components/monthly-calendar.test.tsx` - Component tests for the Monthly Activity Calendar.
- `client/src/utils/activity-calendar.ts` - New date/time and calendar helpers for UTC→local conversion and week generation.
- `client/src/utils/activity-calendar.test.ts` - Unit tests for calendar/date helpers.
- `shared/schema.ts` - Defines `Activity` type and fields used by the calendar and metrics.

### Notes

- Use mobile-first layout. No dropdowns for month selection; chevrons only. Hide outside days. Week starts Monday.
- Treat `Activity.date` as UTC ISO text; convert to local timezone for all month/day computations.
- Duration display: format minutes → "Xh Ym". Tournaments: `activityType === 'tournament'`.
- Use `lucide-react` icons: `CircleCheck`, `Circle` for weekly completion.
- Testing with Vitest and Testing Library (`npm run test` or `pnpm test`).

## Tasks

- [x] 1.0 Build Monthly Activity Calendar component
  - [x] 1.1 Create `client/src/components/monthly-calendar.tsx` with props: `activities: Activity[]`, optional `className?: string`.
  - [x] 1.2 Maintain internal state `currentMonth: Date` defaulting to now (local time) capped at current month.
  - [x] 1.3 Build a Monday→Sunday grid with dynamic 5–6 rows; hide outside days (do not render cells for other months).
  - [x] 1.4 Render left/right chevrons to navigate month-by-month; disable forward nav beyond current month.
  - [x] 1.5 Add `data-testid` hooks for calendar container, nav buttons, and day cells.

- [x] 2.0 Implement day highlighting and popover
  - [x] 2.1 Group activities by local date key (YYYY-MM-DD) after UTC→local conversion; filter by provided activities input.
  - [x] 2.2 Highlight days with ≥1 activity using primary color styles; non-active days remain white.
  - [x] 2.3 Integrate `Popover` from `ui/popover`; tap on active day opens popover listing that day's activities; outside tap closes.
  - [x] 2.4 Popover item fields: sport, activityType, duration (Xh Ym), clubName (if present); order newest first.

- [x] 3.0 Implement monthly header and subtitle metrics
  - [x] 3.1 Title above calendar: format current month as "Month YYYY" using `date-fns`.
  - [x] 3.2 Compute monthly totals across input activities: sessions count, duration sum (Xh Ym), tournaments count.
  - [x] 3.3 Show "-" for each metric when totals are zero; layout subtitle as two rows, multiple columns, no borders.

- [x] 4.0 Add weekly completion indicator
  - [x] 4.1 For each week row, compute if any displayed day has activities; show `CircleCheck` if yes, else `Circle`.
  - [x] 4.2 Right-align the icon per row; confirm spacing and sizing for mobile.

- [x] 5.0 Integrate into Stats tab and sport filters
  - [x] 5.1 Import and render the calendar in `client/src/components/stats-tab.tsx` after `WeeksChart` and before `ActivityHeatmap`.
  - [x] 5.2 Pass `filteredActivities` from `StatsTab` to the calendar so sport filters are inherently applied.
  - [x] 5.3 Ensure calendar re-renders when sport selection changes and when month changes.

- [x] 6.0 Implement date/time utilities and helpers
  - [x] 6.1 Create `client/src/utils/activity-calendar.ts` with pure helpers:
    - `parseUtcDateToLocal(dateText: string): Date`
    - `formatMinutesToHoursMinutes(totalMinutes: number): string`
    - `startOfMonthLocal(date: Date): Date`, `endOfMonthLocal(date: Date): Date`
    - `buildMonthMatrix(date: Date, weekStartsOn: 1): (Date | null)[][]`
    - `groupActivitiesByLocalDate(activities: Activity[]): Record<string, Activity[]>`
  - [x] 6.2 Ensure week generation starts on Monday and excludes outside days (use `null` placeholders if helpful for layout).
  - [x] 6.3 Add unit tests in `client/src/utils/activity-calendar.test.ts` covering UTC→local conversion, matrix generation, grouping, and formatting.

- [x] 7.0 Add tests (unit and component)
  - [x] 7.1 In `client/src/components/monthly-calendar.test.tsx`, cover:
    - Renders title for current month
    - Hides outside days
    - Highlights active days
    - Popover opens on active day and lists items newest-first
    - Weekly completion icons per row
    - Month navigation limits (cannot go beyond current month)
    - Reacts to filtered activities (e.g., changing props updates highlights)
  - [x] 7.2 In `client/src/components/stats-tab.test.tsx`, assert the new section renders in correct position and responds to sport filter changes.
  - [x] 7.3 Run test suite and fix any issues.


