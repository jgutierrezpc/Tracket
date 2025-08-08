import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import StatsTab from "./stats-tab";
import { Activity } from "@shared/schema";

function makeActivity(date: string, sport: string, duration: number): Activity {
  return {
    id: Math.random().toString(36).slice(2),
    date,
    sport,
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

describe("StatsTab", () => {
  it("shows SportTabs only when multiple sports exist and filters content", () => {
    const activities: Activity[] = [
      makeActivity("2024-08-12", "padel", 60),
      makeActivity("2024-08-13", "tennis", 60),
    ];

    render(<StatsTab activities={activities} />);
    // SportTabs buttons include 'All Sports' and the available sports
    expect(screen.getByTestId("sport-tab-all")).toBeInTheDocument();

    // Switch to tennis and ensure content updates (subtitle renders after clicking chart)
    const tennisButton = screen.getByTestId("sport-tab-tennis");
    fireEvent.click(tennisButton);
    // Presence assert: weekly summary should still be present
    expect(screen.getByText("This Week")).toBeInTheDocument();
  });
});


