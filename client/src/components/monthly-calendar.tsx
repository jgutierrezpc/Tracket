import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Circle, CircleCheck } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Activity } from "@shared/schema";

interface MonthlyCalendarProps {
  activities: Activity[];
  className?: string;
}

export default function MonthlyCalendar({ activities, className }: MonthlyCalendarProps) {
  const hasActivities = activities.length > 0;

  // 1.2 currentMonth state (local time), capped at current month
  const now = new Date();
  const firstOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const [currentMonth, setCurrentMonth] = useState<Date>(firstOfCurrentMonth);

  // Helper to normalize/clamp any assigned month to first-of-month and not beyond current month
  const clampToCurrentMonth = (date: Date): Date => {
    const normalized = new Date(date.getFullYear(), date.getMonth(), 1);
    return normalized > firstOfCurrentMonth ? firstOfCurrentMonth : normalized;
  };

  // 1.4 Month navigation
  const isAtCurrentMonth =
    currentMonth.getFullYear() === firstOfCurrentMonth.getFullYear() &&
    currentMonth.getMonth() === firstOfCurrentMonth.getMonth();

  const goToPreviousMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth((prev) => clampToCurrentMonth(new Date(prev.getFullYear(), prev.getMonth() + 1, 1)));
  };

  // 1.3 Build Monday→Sunday grid with dynamic 5–6 rows; pad weeks with nulls so every row has 7 cells
  const buildWeeksForMonth = (monthDate: Date): (Date | null)[][] => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const lastDayNumber = new Date(year, month + 1, 0).getDate();

    const weeks: (Date | null)[][] = [];
    let currentWeek: (Date | null)[] = [];

    const firstOfMonth = new Date(year, month, 1);
    const firstDow = (firstOfMonth.getDay() + 6) % 7; // 0=Mon ... 6=Sun
    // Pad leading nulls before the 1st to align with Monday start
    for (let i = 0; i < firstDow; i += 1) {
      currentWeek.push(null);
    }

    for (let day = 1; day <= lastDayNumber; day += 1) {
      const date = new Date(year, month, day);
      currentWeek.push(date);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    // Pad trailing nulls at the end of the month
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) currentWeek.push(null);
      weeks.push(currentWeek);
    }

    return weeks;
  };

  const weekdayLabels = ["M", "T", "W", "T", "F", "S", "S"];
  const weeks = buildWeeksForMonth(currentMonth);

  const formatLocalDateKey = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  // 2.1 Group activities by local date (UTC -> local)
  const parseUtcDateTextToLocalDate = (dateText: string): Date => {
    const iso = dateText.includes("T") ? dateText : `${dateText}T00:00:00Z`;
    return new Date(iso);
  };

  const activitiesByLocalDate = useMemo(() => {
    const map: Record<string, Activity[]> = {};
    for (const activity of activities || []) {
      const localDate = parseUtcDateTextToLocalDate(activity.date);
      const key = formatLocalDateKey(localDate);
      if (!map[key]) map[key] = [];
      map[key].push(activity);
    }
    return map;
  }, [activities]);

  // 2.4 Helpers for popover content
  const formatMinutesToHoursMinutes = (totalMinutes: number): string => {
    if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) return "0h 0m";
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  const sortByNewest = (list: Activity[]): Activity[] => {
    return [...list].sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt as unknown as string).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt as unknown as string).getTime() : 0;
      return bTime - aTime;
    });
  };

  // 3.2 Compute monthly totals for selected month (local time)
  const monthlyActivities = useMemo(() => {
    return (activities || []).filter((a) => {
      const d = parseUtcDateTextToLocalDate(a.date);
      return (
        d.getFullYear() === currentMonth.getFullYear() && d.getMonth() === currentMonth.getMonth()
      );
    });
  }, [activities, currentMonth]);

  const monthlySessionsCount = monthlyActivities.length;
  const monthlyDurationMinutes = monthlyActivities.reduce((sum, a) => {
    return sum + (typeof a.duration === "number" ? a.duration : 0);
  }, 0);
  const monthlyTournamentsCount = monthlyActivities.reduce((sum, a) => {
    return sum + (a.activityType === "tournament" ? 1 : 0);
  }, 0);
  const monthlyDurationFormatted = formatMinutesToHoursMinutes(monthlyDurationMinutes);
  const todayStart = (() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  })();

  return (
    <section
      className={className}
      data-has-activities={hasActivities ? "true" : "false"}
      data-testid="monthly-calendar"
      data-activity-days={Object.keys(activitiesByLocalDate).length}
    >
      <div
        className="hidden"
        aria-hidden
        data-month-sessions={monthlySessionsCount}
        data-month-duration-minutes={monthlyDurationMinutes}
        data-month-duration-formatted={monthlyDurationFormatted}
        data-month-tournaments={monthlyTournamentsCount}
      />
      <div className="flex items-center justify-between px-2">
        <div className="text-medium font-medium" data-testid="calendar-title">
          {currentMonth.toLocaleString(undefined, { month: "long", year: "numeric" })}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous month"
            onClick={goToPreviousMonth}
            data-testid="calendar-nav-prev"
            className="h-8 w-8 inline-flex items-center justify-center rounded-md text-gray-700"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next month"
            onClick={goToNextMonth}
            disabled={isAtCurrentMonth}
            data-testid="calendar-nav-next"
            className="h-8 w-8 inline-flex items-center justify-center rounded-md text-gray-700 disabled:opacity-50"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 3.3 Subtitle: labels top row, stats bottom row, no borders */}
      <div className="mt-2 mb-2 px-2" data-testid="calendar-subtitle">
        <div className="grid grid-cols-3 text-center text-xs text-muted-foreground">
          <div>Total Sessions</div>
          <div>Time on Court</div>
          <div>Tournaments</div>
        </div>
        <div className="grid grid-cols-3 text-center text-base font-semibold mt-0.5">
          <div data-testid="metric-sessions-value">
            {monthlySessionsCount === 0 ? "-" : monthlySessionsCount}
          </div>
          <div data-testid="metric-duration-value">
            {monthlyDurationMinutes === 0 ? "-" : monthlyDurationFormatted}
          </div>
          <div data-testid="metric-tournaments-value">
            {monthlyTournamentsCount === 0 ? "-" : monthlyTournamentsCount}
          </div>
        </div>
      </div>

      <div className="mt-2 mb-2 px-2" aria-label="weekday-labels" role="row">
        <div className="grid grid-cols-8 gap-1 text-xs text-muted-foreground items-center">
          {weekdayLabels.map((label) => (
            <div key={label} className="text-center">
              {label}
            </div>
          ))}
          <div />
        </div>
      </div>

      <div className="mt-1 space-y-2 px-2" data-testid="monthly-calendar-grid">
        {weeks.map((week, idx) => (
          <div key={idx} className="grid grid-cols-8 gap-2" role="row">
            {week.map((date, colIdx) => {
              if (!date) {
                return (
                  <div
                    key={`empty-${idx}-${colIdx}`}
                    className="aspect-square rounded-md opacity-0 pointer-events-none"
                    aria-hidden
                  />
                );
              }
              const key = formatLocalDateKey(date);
              const isActive = Boolean(activitiesByLocalDate[key] && activitiesByLocalDate[key].length > 0);
              const baseClasses =
                "w-full aspect-square rounded-full text-center text-sm leading-none flex items-center justify-center ";
              const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
              const isToday = dateStart.getTime() === todayStart.getTime();
              const isPast = dateStart < todayStart || isToday;
              const isFuture = dateStart > todayStart;
              if (!isActive) {
                const nonActiveClasses = isPast
                  ? "bg-muted text-black"
                  : "bg-white text-black border border-gray-300";
                return (
                  <button
                    key={date.toISOString()}
                    type="button"
                    role="gridcell"
                    aria-label={date.toDateString()}
                    className={baseClasses + nonActiveClasses}
                    data-day={date.getDate()}
                    data-has-activity="false"
                    data-testid={`calendar-day-${key}`}
                    disabled
                  >
                    {date.getDate()}
                  </button>
                );
              }

              const dayActivities = activitiesByLocalDate[key] || [];
              const sortedDayActivities = sortByNewest(dayActivities);
              return (
                <Popover key={date.toISOString()}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      role="gridcell"
                      aria-label={`${date.toDateString()} (${sortedDayActivities.length} activities)`}
                      className={baseClasses + "bg-primary text-white"}
                      data-day={date.getDate()}
                      data-has-activity="true"
                      data-testid={`calendar-day-${key}`}
                    >
                      {date.getDate()}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent side="top" align="center">
                    <div className="space-y-2" data-testid={`popover-${key}`}>
                      <div className="text-sm font-medium">{date.toDateString()}</div>
                      <ul className="space-y-1 text-sm">
                        {sortedDayActivities.map((a, i) => {
                          const parts: string[] = [];
                          parts.push(a.sport);
                          if (a.activityType) parts.push(String(a.activityType));
                          if (typeof a.duration === "number") {
                            parts.push(formatMinutesToHoursMinutes(a.duration));
                          }
                          if (a.clubName) parts.push(String(a.clubName));
                          return (
                            <li key={a.id ?? i} className="truncate">
                              {parts.join(" • ")}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </PopoverContent>
                </Popover>
              );
            })}
            {(() => {
              const weekActive = week.some((date) => {
                if (!date) return false;
                const key = formatLocalDateKey(date);
                return Boolean(activitiesByLocalDate[key] && activitiesByLocalDate[key].length > 0);
              });
              return (
                <div
                  className="shrink-0 w-6 ml-2 flex items-center justify-center"
                  data-testid={`week-status-${idx}`}
                  aria-label={weekActive ? "Active week" : "No activity this week"}
                >
                  {weekActive ? (
                    <CircleCheck className="h-4 w-4 text-primary" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              );
            })()}
          </div>
        ))}
      </div>
    </section>
  );
}


