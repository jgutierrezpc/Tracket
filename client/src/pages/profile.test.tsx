import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Profile from "./profile";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

function Providers({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: 0 } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("Profile page tabs integration", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Mock fetch for queries used in Profile and nested components
    vi.spyOn(global, "fetch").mockImplementation(async (input: RequestInfo) => {
      const url = typeof input === "string" ? input : input.url;
      if (url.includes("/api/activities/stats/overview")) {
        return new Response(
          JSON.stringify({
            totalActivities: 2,
            totalHours: 3,
            averageDuration: 90,
            trainingTournamentRatio: 2,
            sportStats: { padel: 2 },
          }),
          { status: 200 }
        );
      }
      if (url.includes("/api/activities")) {
        return new Response(
          JSON.stringify([
            {
              id: "a1",
              date: "2024-08-12",
              sport: "padel",
              activityType: "training",
              duration: 60,
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
              createdAt: new Date().toISOString(),
            },
          ]),
          { status: 200 }
        );
      }
      if (url.includes("/api/equipment/rackets")) {
        return new Response(JSON.stringify([]), { status: 200 });
      }
      return new Response(JSON.stringify([]), { status: 200 });
    });
  });

  it("renders tabs and switches between views", async () => {
    render(
      <Providers>
        <Profile />
      </Providers>
    );

    // Header
    expect(screen.getByText("You")).toBeInTheDocument();

    // Tabs present
    expect(screen.getByTestId("profile-tab-stats")).toBeInTheDocument();
    expect(screen.getByTestId("profile-tab-activities")).toBeInTheDocument();
    expect(screen.getByTestId("profile-tab-equipment")).toBeInTheDocument();

    // Stats panel default
    await waitFor(() => expect(screen.getByText("This Week")).toBeInTheDocument());

    // Switch to Activities
    fireEvent.click(screen.getByTestId("profile-tab-activities"));
    await waitFor(() => expect(screen.getByText("Recent Activities")).toBeInTheDocument());
    expect(screen.getByPlaceholderText("Search activities...")).toBeInTheDocument();

    // Switch to Equipment
    fireEvent.click(screen.getByTestId("profile-tab-equipment"));
    await waitFor(() => expect(screen.getByTestId("button-add-racket")).toBeInTheDocument());
  });
});


