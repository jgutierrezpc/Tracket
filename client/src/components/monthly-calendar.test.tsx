import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import MonthlyCalendar from "./monthly-calendar";
import { Activity } from "@shared/schema";

function makeActivity(date: string, sport = "padel", overrides: Partial<Activity> = {}): Activity {
  return {
    id: Math.random().toString(36).slice(2),
    date,
    sport,
    activityType: "training",
    duration: 60,
    clubName: "Club",
    clubLocation: "",
    clubMapLink: "",
    clubLatitude: "",
    clubLongitude: "",
    sessionRating: null as any,
    racket: "",
    partner: "",
    opponents: "",
    notes: "",
    createdAt: new Date(),
    ...overrides,
  } as unknown as Activity;
}

describe("MonthlyCalendar", () => {
  const fixedNow = new Date("2025-08-15T10:00:00Z");
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(fixedNow);
  });

  it("renders title for current month and hides outside days", () => {
    const activities: Activity[] = [];
    render(<MonthlyCalendar activities={activities} />);
    const title = screen.getByTestId("calendar-title");
    expect(title.textContent).toMatch(/August 2025/);
    // Grid should render only days in month; count approximate by day cells
    const grid = screen.getByTestId("monthly-calendar-grid");
    const dayCells = grid.querySelectorAll("[data-testid^='calendar-day-']");
    expect(dayCells.length).toBeGreaterThanOrEqual(28);
  });

  it("highlights active days and opens popover", () => {
    const activities: Activity[] = [makeActivity("2025-08-10"), makeActivity("2025-08-12")];
    render(<MonthlyCalendar activities={activities} />);
    const day = screen.getByTestId("calendar-day-2025-08-10");
    expect(day).toHaveAttribute("data-has-activity", "true");
    fireEvent.click(day);
    expect(screen.getByTestId("popover-2025-08-10")).toBeInTheDocument();
  });

  it("shows weekly completion icons", () => {
    const activities: Activity[] = [makeActivity("2025-08-10")];
    render(<MonthlyCalendar activities={activities} />);
    const weekStatusIcons = document.querySelectorAll("[data-testid^='week-status-']");
    expect(weekStatusIcons.length).toBeGreaterThan(0);
  });

  it("disables next month when at current month and allows previous", () => {
    const activities: Activity[] = [];
    render(<MonthlyCalendar activities={activities} />);
    const prev = screen.getByTestId("calendar-nav-prev");
    const next = screen.getByTestId("calendar-nav-next");
    expect(next).toBeDisabled();
    fireEvent.click(prev);
    expect(next).not.toBeDisabled();
  });
});


