import React, { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Activity } from "@shared/schema";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { ChartContainer } from "@/components/ui/chart";

interface WeeksChartProps {
  activities: Activity[];
  onWeekSelect?: (weekIndexFromNow: number, details: {
    weekStart: string;
    weekEnd: string;
    totalMinutes: number;
    totalHours: number;
    sessions: number;
    averageMinutes?: number;
  }) => void;
}

type WeekDatum = {
  label: string; // e.g., "Aug 5"
  totalMinutes: number;
  totalHours: number;
  sessions: number;
  weekStart: string;
  weekEnd: string;
};

function getMonday(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = (day === 0 ? -6 : 1) - day; // adjust so Monday is first day
  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

function toIsoDateString(date: Date): string {
  return date.toISOString().split("T")[0];
}

export default function WeeksChart({ activities, onWeekSelect }: WeeksChartProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const data: WeekDatum[] = useMemo(() => {
    const now = new Date();
    const startOfCurrentWeek = getMonday(now);
    const weeks: WeekDatum[] = [];

    for (let i = 0; i < 12; i++) {
      const start = new Date(startOfCurrentWeek);
      start.setDate(start.getDate() - i * 7);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);

      const startStr = toIsoDateString(start);
      const endStr = toIsoDateString(end);

      const weekActivities = activities.filter((a) => a.date >= startStr && a.date <= endStr);
      const totalMinutes = weekActivities.reduce((sum, a) => sum + (a.duration || 0), 0);
      const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
      const sessions = weekActivities.length;

      const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      const label = `${monthNames[start.getMonth()]} ${start.getDate()}`;

      weeks.push({ label, totalMinutes, totalHours, sessions, weekStart: startStr, weekEnd: endStr });
    }

    return weeks.reverse();
  }, [activities]);

  // Initialize the selected index to the most recent week once data is ready
  useEffect(() => {
    if (data.length > 0 && (selectedIndex === null || selectedIndex >= data.length)) {
      setSelectedIndex(data.length - 1);
    }
  }, [data, selectedIndex]);

  const chartConfig = {
    hours: {
      label: "Total Hours",
      color: "hsl(180, 100%, 25%);",
    },
  } as const;

  // Compute month tick positions aligned to week data points
  const monthTickValues: string[] = useMemo(() => {
    const ticks: string[] = [];
    let lastMonth: number | null = null;
    data.forEach((d) => {
      const m = new Date(d.weekStart).getMonth();
      if (lastMonth === null || m !== lastMonth) {
        ticks.push(d.weekStart);
        lastMonth = m;
      }
    });
    return ticks;
  }, [data]);

  const monthFormatter = (value: string) => {
    const date = new Date(value);
    return ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][date.getMonth()];
  };

  const handlePointClick = (idx: number) => {
    if (typeof idx !== "number" || idx < 0 || idx >= data.length) return;
    setSelectedIndex(idx);
    const point = data[idx];
    const averageMinutes = point.sessions > 1 ? Math.round(point.totalMinutes / point.sessions) : undefined;
    onWeekSelect?.(data.length - 1 - idx, {
      weekStart: point.weekStart,
      weekEnd: point.weekEnd,
      totalMinutes: point.totalMinutes,
      totalHours: point.totalHours,
      sessions: point.sessions,
      averageMinutes,
    });
  };

  const resolvedLineColor = (() => {
    const fallback = '#0f766e';
    try {
      if (typeof window !== 'undefined') {
        const v = getComputedStyle(document.documentElement).getPropertyValue('--color-hours');
        const trimmed = (v || '').trim();
        return trimmed || fallback;
      }
    } catch {}
    return fallback;
  })();

  return (
    <section className="p-4">
      {(() => {
        const idx = selectedIndex ?? data.length - 1;
        const point = data[idx];
        if (!point) return null;
        const isCurrent = idx === data.length - 1;
        const title = isCurrent
          ? "This Week"
          : `${format(new Date(point.weekStart), "MMM d")} - ${format(new Date(point.weekEnd), "MMM d, yyyy")}`;
        const avgMinutes = point.sessions > 1 ? Math.round(point.totalMinutes / point.sessions) : null;
        return (
          <>
            <h3 className="text-medium font-medium mb-1">{title}</h3>
            <div className="mb-3">
              <div className="grid grid-cols-3 text-[11px] text-gray-600 dark:text-gray-400">
                <div>Time on Court</div>
                <div>Sessions</div>
                <div>Avg. Duration</div>
              </div>
              <div className="grid grid-cols-3 text-sm font-medium">
                <div>{point.totalHours}h</div>
                <div>{point.sessions}</div>
                <div>{avgMinutes !== null ? `${avgMinutes}m` : "-"}</div>
              </div>
            </div>
          </>
        );
      })()}
      <ChartContainer config={chartConfig} className="w-full h-52">
        <ResponsiveContainer>
          <LineChart data={data} margin={{ left: 8, right: 0, top: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="weekStart" ticks={monthTickValues} tickFormatter={monthFormatter} tickMargin={8} interval={0} />
            <YAxis orientation="right" />
            <Line
              type="monotone"
              dataKey="totalHours"
              stroke="var(--color-hours)"
              strokeWidth={2}
              dot={(props: any) => {
                const { cx, cy, index } = props;
                const isSelected = selectedIndex === index;
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isSelected ? 4 : 4}
                    fill={isSelected ? resolvedLineColor : '#ffffff'}
                    stroke={resolvedLineColor}
                    strokeWidth={2}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handlePointClick(index as number)}
                  />
                );
              }}
              activeDot={{ r: 5, onClick: (_e: any, payload: any) => handlePointClick((payload && payload.index) as number) }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </section>
  );
}


