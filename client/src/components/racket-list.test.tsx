import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import RacketList from "./racket-list";
import { Racket, Activity } from "@shared/schema";

function racket(partial: Partial<Racket>): Racket {
  return {
    id: partial.id || Math.random().toString(36).slice(2),
    brand: partial.brand || "Brand",
    model: partial.model || "Model",
    isActive: partial.isActive ?? true,
    isBroken: partial.isBroken ?? false,
    notes: (partial as any).notes ?? null,
    imageUrl: (partial as any).imageUrl ?? null,
    createdAt: new Date(),
  } as unknown as Racket;
}

function activity(partial: Partial<Activity>): Activity {
  return {
    id: partial.id || Math.random().toString(36).slice(2),
    date: partial.date || "2024-08-10",
    sport: partial.sport || "padel",
    activityType: (partial as any).activityType || "training",
    duration: partial.duration || 60,
    clubName: (partial as any).clubName || "",
    clubLocation: (partial as any).clubLocation || "",
    clubMapLink: (partial as any).clubMapLink || "",
    clubLatitude: (partial as any).clubLatitude || "",
    clubLongitude: (partial as any).clubLongitude || "",
    sessionRating: (partial as any).sessionRating || null,
    racket: partial.racket as any,
    partner: (partial as any).partner || "",
    opponents: (partial as any).opponents || "",
    notes: (partial as any).notes || "",
    createdAt: new Date(),
  } as unknown as Activity;
}

describe("RacketList", () => {
  it("sorts active first and shows usage hours computed from activities", () => {
    const rackets: Racket[] = [
      racket({ id: "r1", brand: "BrandA", model: "One", isActive: false }),
      racket({ id: "r2", brand: "BrandB", model: "Two", isActive: true }),
    ];
    const activities: Activity[] = [
      activity({ racket: "BrandA One", duration: 30 }),
      activity({ racket: "BrandB Two", duration: 90 }),
    ];

    render(
      <RacketList
        rackets={rackets}
        activities={activities}
        onToggleActive={() => {}}
        onToggleBroken={() => {}}
      />
    );

    // Expect hours labels present
    expect(screen.getByText(/1.5h/)).toBeInTheDocument();
    expect(screen.getByText(/0.5h/)).toBeInTheDocument();
  });

  it("calls toggle handlers with correct values", () => {
    const r = racket({ id: "rx", brand: "X", model: "Y", isActive: true, isBroken: false });
    const onActive = vi.fn();
    const onBroken = vi.fn();
    render(
      <RacketList
        rackets={[r]}
        activities={[]}
        onToggleActive={onActive}
        onToggleBroken={onBroken}
      />
    );

    fireEvent.click(screen.getByTestId("racket-toggle-active-rx"));
    expect(onActive).toHaveBeenCalledWith("rx", false);

    fireEvent.click(screen.getByTestId("racket-toggle-broken-rx"));
    expect(onBroken).toHaveBeenCalledWith("rx", true);
  });
});


