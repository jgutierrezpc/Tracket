import { useCallback, useEffect, useMemo, useState } from "react";

export type ProfileTabId = "stats" | "activities" | "equipment";

interface UseProfileTabsOptions {
  defaultTab?: ProfileTabId;
  storageKey?: string;
  persist?: boolean;
}

interface UseProfileTabsResult {
  selectedTab: ProfileTabId;
  setSelectedTab: (tab: ProfileTabId) => void;
  value: ProfileTabId;
  onValueChange: (nextValue: string) => void;
  resetToDefault: () => void;
}

const DEFAULT_TAB: ProfileTabId = "stats";
const DEFAULT_STORAGE_KEY = "profileTabs.selectedTab";

function isValidTab(value: string | null): value is ProfileTabId {
  return value === "stats" || value === "activities" || value === "equipment";
}

export function useProfileTabs(options: UseProfileTabsOptions = {}): UseProfileTabsResult {
  const { defaultTab = DEFAULT_TAB, storageKey = DEFAULT_STORAGE_KEY, persist = true } = options;

  const readInitial = useCallback((): ProfileTabId => {
    if (!persist) return defaultTab;
    try {
      if (typeof window !== "undefined") {
        const saved = window.localStorage.getItem(storageKey);
        if (isValidTab(saved)) return saved;
      }
    } catch {
      // ignore
    }
    return defaultTab;
  }, [defaultTab, persist, storageKey]);

  const [selectedTab, setSelectedTab] = useState<ProfileTabId>(readInitial);

  useEffect(() => {
    if (!persist) return;
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(storageKey, selectedTab);
      }
    } catch {
      // ignore
    }
  }, [persist, selectedTab, storageKey]);

  const onValueChange = useCallback(
    (nextValue: string) => {
      const nextTab = isValidTab(nextValue) ? nextValue : DEFAULT_TAB;
      setSelectedTab(nextTab);
    },
    []
  );

  const resetToDefault = useCallback(() => {
    setSelectedTab(defaultTab);
  }, [defaultTab]);

  return useMemo(
    () => ({ selectedTab, setSelectedTab, value: selectedTab, onValueChange, resetToDefault }),
    [onValueChange, resetToDefault, selectedTab]
  );
}


