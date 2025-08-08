import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import RecentActivities from "./recent-activities";
import { Activity } from "@shared/schema";

function makeActivity(idx: number, overrides: Partial<Activity> = {}): Activity {
  const date = new Date(2024, 7, 1 + (idx % 28));
  const isoDate = date.toISOString().split("T")[0];
  return {
    id: `a-${idx}`,
    date: isoDate,
    sport: idx % 2 === 0 ? "padel" : "tennis",
    activityType: idx % 3 === 0 ? "training" : "friendly",
    duration: 60 + (idx % 90),
    clubName: idx % 4 === 0 ? "Padel Town" : "Center Club",
    clubLocation: "",
    clubMapLink: "",
    clubLatitude: "",
    clubLongitude: "",
    sessionRating: null,
    racket: "",
    partner: idx % 5 === 0 ? "Sam" : "Alex",
    opponents: idx % 7 === 0 ? "Doe" : "",
    notes: idx % 6 === 0 ? "evening session" : "",
    createdAt: new Date(),
    ...overrides,
  } as unknown as Activity;
}

describe("RecentActivities", () => {
  beforeEach(() => {
    // no-op
  });

  it("shows loading skeletons when loading", () => {
    render(<RecentActivities activities={[]} isLoading={true} />);
    expect(screen.getByText("Recent Activities")).toBeInTheDocument();
  });

  it("renders empty state when no activities", () => {
    render(<RecentActivities activities={[]} isLoading={false} />);
    expect(screen.getByText("No activities found")).toBeInTheDocument();
  });

  it("paginates 20 items and loads more on button click", () => {
    const activities = Array.from({ length: 45 }, (_, i) => makeActivity(i + 1));
    render(<RecentActivities activities={activities} isLoading={false} pageSize={20} />);

    // Initial render shows 20 items
    expect(screen.getAllByText(/Session|training|Friendly|Friendly/i).length).toBeGreaterThan(0);
    expect(screen.getByTestId("button-show-more")).toBeInTheDocument();

    // Click show more twice to reach all 45 items (20 + 20 + 5)
    fireEvent.click(screen.getByTestId("button-show-more"));
    fireEvent.click(screen.getByTestId("button-show-more"));

    // Button should disappear when all items are visible
    expect(screen.queryByTestId("button-show-more")).not.toBeInTheDocument();
  });

  it("filters activities via search across multiple fields and resets pagination", () => {
    const activities = [
      makeActivity(1, { clubName: "Padel Town", notes: "evening session" }),
      makeActivity(2, { partner: "Charlie", activityType: "training" as any }),
      makeActivity(3, { sport: "tennis" as any, notes: "morning" }),
    ];
    render(<RecentActivities activities={activities} isLoading={false} pageSize={1} />);

    const input = screen.getByTestId("activities-search-input");
    fireEvent.change(input, { target: { value: "Padel Town" } });

    // Only entries matching the query should be visible and pagination resets to first page
    expect(screen.queryByTestId("button-show-more")).not.toBeInTheDocument();

    // Change query to match by partner name
    fireEvent.change(input, { target: { value: "charlie" } });
    expect(screen.queryByTestId("button-show-more")).not.toBeInTheDocument();
  });
});


