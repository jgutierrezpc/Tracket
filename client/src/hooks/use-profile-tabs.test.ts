import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useProfileTabs } from "./use-profile-tabs";

describe("useProfileTabs", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("initializes with default tab and persists changes", () => {
    const { result } = renderHook(() => useProfileTabs());
    expect(result.current.selectedTab).toBe("stats");

    act(() => {
      result.current.onValueChange("activities");
    });

    expect(result.current.selectedTab).toBe("activities");
    expect(window.localStorage.getItem("profileTabs.selectedTab")).toBe("activities");
  });

  it("restores saved tab from localStorage", () => {
    window.localStorage.setItem("profileTabs.selectedTab", "equipment");
    const { result } = renderHook(() => useProfileTabs());
    expect(result.current.selectedTab).toBe("equipment");

    act(() => {
      result.current.resetToDefault();
    });
    expect(result.current.selectedTab).toBe("stats");
  });

  it("ignores invalid saved values", () => {
    window.localStorage.setItem("profileTabs.selectedTab", "invalid-value");
    const { result } = renderHook(() => useProfileTabs());
    expect(result.current.selectedTab).toBe("stats");
  });
});


