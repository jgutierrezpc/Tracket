import { Activity } from "@shared/schema";

export function parseUtcDateToLocal(dateText: string): Date {
  const iso = dateText.includes("T") ? dateText : `${dateText}T00:00:00Z`;
  return new Date(iso);
}

export function formatMinutesToHoursMinutes(totalMinutes: number): string {
  if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) return "0h 0m";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

export function startOfMonthLocal(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonthLocal(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

export function buildMonthMatrix(
  date: Date,
  weekStartsOn: 0 | 1 = 1
): (Date | null)[][] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const lastDayNumber = new Date(year, month + 1, 0).getDate();

  const result: (Date | null)[][] = [];
  let currentWeek: (Date | null)[] = [];

  for (let day = 1; day <= lastDayNumber; day += 1) {
    const d = new Date(year, month, day);
    const dow = d.getDay(); // 0=Sun..6=Sat
    const mondayBasedDow = weekStartsOn === 1 ? (dow + 6) % 7 : dow; // 0..6
    if (mondayBasedDow === 0 && currentWeek.length > 0) {
      result.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(d);
  }

  if (currentWeek.length > 0) result.push(currentWeek);
  return result;
}

export function groupActivitiesByLocalDate(
  activities: Activity[]
): Record<string, Activity[]> {
  const map: Record<string, Activity[]> = {};
  for (const a of activities || []) {
    const local = parseUtcDateToLocal(a.date);
    const key = formatDateKey(local);
    if (!map[key]) map[key] = [];
    map[key].push(a);
  }
  return map;
}

export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}


