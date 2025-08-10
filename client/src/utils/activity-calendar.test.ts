import { describe, expect, it } from "vitest";
import {
  parseUtcDateToLocal,
  formatMinutesToHoursMinutes,
  startOfMonthLocal,
  endOfMonthLocal,
  buildMonthMatrix,
  groupActivitiesByLocalDate,
  formatDateKey,
} from "./activity-calendar";

describe("activity-calendar utils", () => {
  it("parseUtcDateToLocal handles plain date as UTC midnight", () => {
    const d = parseUtcDateToLocal("2025-08-10");
    expect(d instanceof Date).toBe(true);
    expect(d.getUTCFullYear()).toBe(2025);
  });

  it("formatMinutesToHoursMinutes formats", () => {
    expect(formatMinutesToHoursMinutes(0)).toBe("0h 0m");
    expect(formatMinutesToHoursMinutes(30)).toBe("0h 30m");
    expect(formatMinutesToHoursMinutes(90)).toBe("1h 30m");
  });

  it("start/endOfMonthLocal produce boundaries", () => {
    const d = new Date(2025, 7, 10); // Aug 10, 2025
    expect(startOfMonthLocal(d).getDate()).toBe(1);
    expect(endOfMonthLocal(d).getDate()).toBe(31);
  });

  it("buildMonthMatrix yields weeks starting Monday", () => {
    const d = new Date(2025, 7, 1); // Aug 2025
    const matrix = buildMonthMatrix(d, 1);
    expect(Array.isArray(matrix)).toBe(true);
    expect(matrix.length >= 4 && matrix.length <= 6).toBe(true);
  });

  it("groupActivitiesByLocalDate groups by YYYY-MM-DD", () => {
    const activities = [
      { id: "1", date: "2025-08-10", sport: "padel", duration: 60 } as any,
      { id: "2", date: "2025-08-10", sport: "tennis", duration: 30 } as any,
      { id: "3", date: "2025-08-11", sport: "padel", duration: 45 } as any,
    ];
    const map = groupActivitiesByLocalDate(activities);
    expect(Object.keys(map)).toContain("2025-08-10");
    expect(map["2025-08-10"].length).toBe(2);
  });

  it("formatDateKey returns YYYY-MM-DD", () => {
    const d = new Date(2025, 7, 5);
    expect(formatDateKey(d)).toBe("2025-08-05");
  });
});


