import React, { useEffect, useMemo, useState } from "react";
import { Activity } from "@shared/schema";
import StatsOverview from "./stats-overview";
import WeeksChart from "./weeks-chart";
import ActivityHeatmap from "./activity-heatmap";
import SportTabs from "./sport-tabs";

interface StatsTabProps {
  activities: Activity[];
  className?: string;
}

export default function StatsTab({ activities, className }: StatsTabProps) {
  const [selectedSports, setSelectedSports] = useState<string[]>([]);

  const sportsPresent = useMemo(() => {
    const set = new Set(activities.map((a) => a.sport));
    return Array.from(set);
  }, [activities]);

  // Initialize selected sports to all available on first load
  useEffect(() => {
    if (sportsPresent.length > 0 && selectedSports.length === 0) {
      setSelectedSports(sportsPresent);
    }
  }, [sportsPresent, selectedSports.length]);

  const filteredActivities = useMemo(() => {
    if (!selectedSports || selectedSports.length === 0) return activities;
    const set = new Set(selectedSports);
    return activities.filter((a) => set.has(a.sport));
  }, [activities, selectedSports]);

  const showSportTabs = sportsPresent.length > 1;

  return (
    <div className={className}>
      {showSportTabs && (
        <SportTabs
          selectedSports={selectedSports}
          onSelectedSportsChange={setSelectedSports}
          activities={activities}
        />
      )}
      <WeeksChart activities={filteredActivities} />
      <ActivityHeatmap activities={filteredActivities} />
      
    </div>
  );
}


