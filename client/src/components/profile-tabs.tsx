import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export type ProfileTabId = "stats" | "activities" | "equipment";

interface ProfileTabsProps {
  initialTab?: ProfileTabId;
  onTabChange?: (tab: ProfileTabId) => void;
  className?: string;
  renderStats?: () => React.ReactNode;
  renderActivities?: () => React.ReactNode;
  renderEquipment?: () => React.ReactNode;
}

const DEFAULT_TAB: ProfileTabId = "stats";
const STORAGE_KEY = "profileTabs.selectedTab";

export default function ProfileTabs({
  initialTab = DEFAULT_TAB,
  onTabChange,
  className,
  renderStats,
  renderActivities,
  renderEquipment,
}: ProfileTabsProps) {
  const [selectedTab, setSelectedTab] = useState<ProfileTabId>(initialTab);

  const handleTabChange = useCallback(
    (nextValue: string) => {
      const nextTab = (nextValue as ProfileTabId) ?? DEFAULT_TAB;
      setSelectedTab(nextTab);
      if (onTabChange) onTabChange(nextTab);
      try {
        if (typeof window !== "undefined") {
          window.localStorage.setItem(STORAGE_KEY, nextTab);
        }
      } catch {
        // ignore persistence errors
      }
    },
    [onTabChange]
  );

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved === "stats" || saved === "activities" || saved === "equipment") {
          setSelectedTab(saved);
        }
      }
    } catch {
      // ignore hydration/persistence errors
    }
  }, []);

  const tabs = useMemo(
    () => [
      { id: "stats" as ProfileTabId, label: "Stats" },
      { id: "activities" as ProfileTabId, label: "Activities" },
      { id: "equipment" as ProfileTabId, label: "Equipment" },
    ],
    []
  );

  return (
    <Tabs value={selectedTab} onValueChange={handleTabChange} className={cn("w-full", className)}>
      <TabsList className="grid grid-cols-3 w-full">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id} data-testid={`profile-tab-${tab.id}`}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="stats" data-testid="profile-tabpanel-stats">
        {renderStats ? renderStats() : null}
      </TabsContent>
      <TabsContent value="activities" data-testid="profile-tabpanel-activities">
        {renderActivities ? renderActivities() : null}
      </TabsContent>
      <TabsContent value="equipment" data-testid="profile-tabpanel-equipment">
        {renderEquipment ? renderEquipment() : null}
      </TabsContent>
    </Tabs>
  );
}


