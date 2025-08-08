import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ProfileTabs from "./profile-tabs";

const STORAGE_KEY = "profileTabs.selectedTab";

describe("ProfileTabs", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  function setup() {
    const onTabChange = vi.fn();
    render(
      <ProfileTabs
        onTabChange={onTabChange}
        renderStats={() => <div>Stats Content</div>}
        renderActivities={() => <div>Activities Content</div>}
        renderEquipment={() => <div>Equipment Content</div>}
      />
    );
    return { onTabChange };
  }

  it("renders three tabs and selects Stats by default", () => {
    setup();
    expect(screen.getByTestId("profile-tab-stats")).toBeInTheDocument();
    expect(screen.getByTestId("profile-tab-activities")).toBeInTheDocument();
    expect(screen.getByTestId("profile-tab-equipment")).toBeInTheDocument();

    // Radix applies data-state="active" on the active trigger
    expect(screen.getByTestId("profile-tab-stats").getAttribute("data-state")).toBe(
      "active"
    );
    expect(screen.getByText("Stats Content")).toBeInTheDocument();
  });

  it("changes tab on click and calls onTabChange", async () => {
    const { onTabChange } = setup();
    const trigger = screen.getByTestId("profile-tab-activities");
    fireEvent.click(trigger);
    await waitFor(() =>
      expect(screen.getByTestId("profile-tab-activities")).toHaveAttribute("data-state", "active")
    );
    expect(onTabChange).toHaveBeenCalledWith("activities");
    expect(screen.getByText("Activities Content")).toBeInTheDocument();
  });

  it("persists selected tab to localStorage and restores it on mount", async () => {
    // Save a previous selection
    window.localStorage.setItem(STORAGE_KEY, "equipment");

    render(
      <ProfileTabs
        renderStats={() => <div>Stats Content</div>}
        renderActivities={() => <div>Activities Content</div>}
        renderEquipment={() => <div>Equipment Content</div>}
      />
    );

    await waitFor(() =>
      expect(screen.getByTestId("profile-tab-equipment")).toHaveAttribute("data-state", "active")
    );
    expect(screen.getByText("Equipment Content")).toBeInTheDocument();

    // Switch and ensure it writes to localStorage
    fireEvent.click(screen.getByTestId("profile-tab-stats"));
    await waitFor(() => expect(window.localStorage.getItem(STORAGE_KEY)).toBe("stats"));
  });
});


