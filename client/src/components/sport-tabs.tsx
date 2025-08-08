import { Button } from "@/components/ui/button";
import { Activity } from "@shared/schema";
import { useMemo } from "react";

interface SportTabsProps {
  selectedSports: string[];
  onSelectedSportsChange: (sports: string[]) => void;
  activities: Activity[];
}

export default function SportTabs({ selectedSports, onSelectedSportsChange, activities }: SportTabsProps) {
  const availableSports = useMemo(() => {
    if (!activities || activities.length === 0) {
      return [] as { id: string; name: string }[];
    }

    const sportCounts = activities.reduce((acc, activity) => {
      acc[activity.sport] = (acc[activity.sport] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const allSports = [
      { id: 'padel', name: 'Padel' },
      { id: 'tennis', name: 'Tennis' },
      { id: 'pickleball', name: 'Pickleball' },
    ];

    // Only include sports that have recorded activities
    return allSports.filter((sport) => sportCounts[sport.id] > 0);
  }, [activities]);

  return (
    <section className="p-4">
      <div className="flex items-center gap-2">
        {availableSports.map((sport) => {
          const isSelected = selectedSports.includes(sport.id);
          return (
            <Button
              key={sport.id}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              className={`text-sm ${
                isSelected
                  ? 'bg-primary text-white'
                  : 'bg-white text-black border border-gray-300 hover:bg-white hover:text-black focus:bg-white active:bg-white'
              }`}
              onClick={() => {
                const next = isSelected
                  ? selectedSports.filter((s) => s !== sport.id)
                  : [...selectedSports, sport.id];
                onSelectedSportsChange(next);
              }}
              data-testid={`sport-tab-${sport.id}`}
            >
              {sport.name}
            </Button>
          );
        })}
      </div>
    </section>
  );
}