import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Activity } from "@shared/schema";
import { parseCsvText, csvRowToActivity, CSV_DATA } from "@/lib/csv-parser";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ActivityHeatmap from "../components/activity-heatmap";
import AddActivityForm from "../components/add-activity-form";
import RecentActivities from "../components/recent-activities";
import SportTabs from "../components/sport-tabs";
import StatsOverview from "../components/stats-overview";
import { useState } from "react";
import { Moon, Sun, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Dashboard() {
  const [selectedSport, setSelectedSport] = useState<string>("all");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });
  
  const { toast } = useToast();

  // Initialize theme
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  // Fetch activities
  const { data: activities = [], isLoading: activitiesLoading } = useQuery<Activity[]>({
    queryKey: ['/api/activities'],
  });

  // Fetch statistics
  const { data: stats } = useQuery<{
    totalActivities: number;
    totalHours: number;
    averageDuration: number;
    trainingTournamentRatio: number;
    sportStats: Record<string, number>;
  }>({
    queryKey: ['/api/activities/stats/overview'],
  });

  // CSV import mutation
  const importCsvMutation = useMutation({
    mutationFn: async (csvData: any[]) => {
      return await apiRequest('POST', '/api/activities/import-csv', { csvData });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activities/stats/overview'] });
      toast({
        title: "Data imported successfully",
        description: "CSV data has been loaded into the application.",
      });
    },
    onError: () => {
      toast({
        title: "Import failed",
        description: "Failed to import CSV data. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Import CSV data on first load if no activities exist
  useEffect(() => {
    if (activities.length === 0 && !activitiesLoading) {
      const csvRows = parseCsvText(CSV_DATA);
      const activityData = csvRows.map(csvRowToActivity);
      importCsvMutation.mutate(activityData);
    }
  }, [activities.length, activitiesLoading]);

  // Filter activities by sport
  const filteredActivities = selectedSport === "all" 
    ? activities 
    : activities.filter(activity => activity.sport === selectedSport);

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto bg-white dark:bg-gray-900 shadow-lg">
      {/* Header */}
      <header className="bg-primary text-white p-4 sticky top-0 z-30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-medium">Tracket</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Stats Overview */}
        <StatsOverview stats={stats} />

        {/* Activity Heatmap */}
        <ActivityHeatmap activities={activities} />

        {/* Sport Filter Tabs */}
        <SportTabs 
          selectedSport={selectedSport} 
          onSportChange={setSelectedSport} 
          activities={activities}
        />

        {/* Recent Activities */}
        <RecentActivities 
          activities={filteredActivities} 
          isLoading={activitiesLoading} 
        />

        {/* Bottom spacing for FAB */}
        <div className="h-20"></div>
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 sticky bottom-0">
        <div className="flex items-center justify-around py-2">
          <button className="flex flex-col items-center p-2 text-primary" data-testid="nav-stats">
            <div className="text-lg">📊</div>
            <span className="text-xs mt-1">Stats</span>
          </button>
          <button className="flex flex-col items-center p-2 text-gray-400" data-testid="nav-activities">
            <div className="text-lg">📋</div>
            <span className="text-xs mt-1">Activities</span>
          </button>
          <button className="flex flex-col items-center p-2 text-gray-400" data-testid="nav-courts">
            <div className="text-lg">📍</div>
            <span className="text-xs mt-1">Courts</span>
          </button>
          <button className="flex flex-col items-center p-2 text-gray-400" data-testid="nav-profile">
            <div className="text-lg">👤</div>
            <span className="text-xs mt-1">Profile</span>
          </button>
        </div>
      </nav>

      {/* Floating Action Button */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button
            className="fixed bottom-20 right-4 w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:bg-secondary transition-colors z-20"
            size="icon"
            data-testid="button-add-activity"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl p-0">
          <AddActivityForm onClose={() => setIsSheetOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
