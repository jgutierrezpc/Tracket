import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import StatsOverview from "./stats-overview";
import { Activity } from "@shared/schema";

function makeActivity(date: string, duration: number): Activity {
  return {
    id: Math.random().toString(36).slice(2),
    date,
    sport: "padel",
    activityType: "training",
    duration,
    clubName: "",
    clubLocation: "",
    clubMapLink: "",
    clubLatitude: "",
    clubLongitude: "",
    sessionRating: null,
    racket: "",
    partner: "",
    opponents: "",
    notes: "",
    createdAt: new Date(),
  } as unknown as Activity;
}

describe("StatsOverview weekly mode", () => {
  const fixedMonday = new Date("2024-08-12T10:00:00Z"); // Monday

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(fixedMonday);
  });

  it("shows total activities and hours, and hides average when only 1 session", () => {
    const activities: Activity[] = [makeActivity("2024-08-12", 90)];
    render(<StatsOverview mode="weekly" activities={activities} />);
    expect(screen.getByTestId("weekly-total-activities")).toHaveTextContent("1");
    expect(screen.getByTestId("weekly-total-duration")).toBeInTheDocument();
    expect(screen.queryByTestId("weekly-average-duration")).not.toBeInTheDocument();
  });

  it("shows average when 2+ sessions", () => {
    const activities: Activity[] = [
      makeActivity("2024-08-12", 60),
      makeActivity("2024-08-13", 120),
    ];
    render(<StatsOverview mode="weekly" activities={activities} />);
    expect(screen.getByTestId("weekly-average-duration")).toBeInTheDocument();
  });
});


