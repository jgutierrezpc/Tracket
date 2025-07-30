import { Button } from "@/components/ui/button";
import { Activity } from "@shared/schema";
import { useMemo } from "react";

interface SportTabsProps {
  selectedSport: string;
  onSportChange: (sport: string) => void;
  activities: Activity[];
}

export default function SportTabs({ selectedSport, onSportChange, activities }: SportTabsProps) {
  const availableSports = useMemo(() => {
    if (!activities || activities.length === 0) {
      return [{ id: 'all', name: 'All Sports' }];
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

    const sports = [{ id: 'all', name: 'All Sports' }];
    
    // Only add sports that have recorded activities
    allSports.forEach(sport => {
      if (sportCounts[sport.id] > 0) {
        sports.push(sport);
      }
    });

    return sports;
  }, [activities]);

  return (
    <section className="p-4">
      <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {availableSports.map(sport => (
          <Button
            key={sport.id}
            variant={selectedSport === sport.id ? "default" : "ghost"}
            size="sm"
            className={`flex-1 text-sm font-medium ${
              selectedSport === sport.id 
                ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
            onClick={() => onSportChange(sport.id)}
            data-testid={`sport-tab-${sport.id}`}
          >
            {sport.name}
          </Button>
        ))}
      </div>
    </section>
  );
}