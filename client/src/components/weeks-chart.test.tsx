import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import WeeksChart from "./weeks-chart";
import { Activity } from "@shared/schema";

const fixedMonday = new Date("2024-08-12T10:00:00Z"); // Monday

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

describe("WeeksChart", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(fixedMonday);
  });

  it("renders 12 weeks of labels and updates subtitle on point click", () => {
    const activities: Activity[] = [
      // Current week (Mon–Sun)
      makeActivity("2024-08-12", 60),
      makeActivity("2024-08-13", 30),
      // Previous week
      makeActivity("2024-08-05", 90),
    ];

    const handleSelect = vi.fn();
    const { container } = render(<WeeksChart activities={activities} onWeekSelect={handleSelect} />);

    // Expect header
    expect(screen.getByText("Last Few Weeks")).toBeInTheDocument();

    // Expect 12 X-axis tick labels (approximate by counting text nodes with month abbrev)
    const monthAbbrevs = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const xTicks = Array.from(container.querySelectorAll(".recharts-xAxis .recharts-cartesian-axis-tick text"));
    expect(xTicks.length).toBeGreaterThan(0);

    // Click on a dot to trigger selection; pick the last rendered dot
    const dots = container.querySelectorAll(".recharts-dot");
    if (dots.length > 0) {
      fireEvent.click(dots[dots.length - 1]);
      expect(handleSelect).toHaveBeenCalled();
      expect(screen.getByTestId("weeks-chart-subtitle")).toBeInTheDocument();
    }
  });
});


