import { Button } from "@/components/ui/button";

interface SportTabsProps {
  selectedSport: string;
  onSportChange: (sport: string) => void;
}

export default function SportTabs({ selectedSport, onSportChange }: SportTabsProps) {
  const sports = [
    { id: 'all', name: 'All Sports' },
    { id: 'padel', name: 'Padel' },
    { id: 'tennis', name: 'Tennis' },
    { id: 'pickleball', name: 'Pickleball' },
  ];

  return (
    <section className="p-4">
      <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {sports.map(sport => (
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