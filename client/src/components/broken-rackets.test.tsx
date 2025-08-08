import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import BrokenRackets from "./broken-rackets";
import { Racket } from "@shared/schema";

function racket(partial: Partial<Racket>): Racket {
  return {
    id: partial.id || Math.random().toString(36).slice(2),
    brand: partial.brand || "Brand",
    model: partial.model || "Model",
    isActive: partial.isActive ?? false,
    isBroken: partial.isBroken ?? true,
    notes: (partial as any).notes ?? null,
    imageUrl: (partial as any).imageUrl ?? null,
    createdAt: new Date(),
  } as unknown as Racket;
}

describe("BrokenRackets", () => {
  it("renders nothing if no broken rackets", () => {
    const { container } = render(<BrokenRackets rackets={[]} onUpdate={async () => {}} onReactivate={async () => {}} />);
    expect(container).toBeTruthy();
  });

  it("reactivates broken racket on button", () => {
    const onReactivate = vi.fn();
    const r = racket({ id: "rx", brand: "X", model: "Y" });
    render(<BrokenRackets rackets={[r]} onUpdate={async () => {}} onReactivate={onReactivate} />);
    fireEvent.click(screen.getByTestId("broken-reactivate-rx"));
    expect(onReactivate).toHaveBeenCalledWith("rx");
  });

  it("saves notes via onUpdate", () => {
    const onUpdate = vi.fn();
    const r = racket({ id: "ry", brand: "Y", model: "Z" });
    render(<BrokenRackets rackets={[r]} onUpdate={onUpdate} onReactivate={async () => {}} />);
    fireEvent.change(screen.getByTestId("broken-notes-ry"), { target: { value: "cracked frame" } });
    fireEvent.click(screen.getByTestId("broken-save-notes-ry"));
    expect(onUpdate).toHaveBeenCalledWith("ry", { notes: "cracked frame" });
  });
});


