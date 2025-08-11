import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Activity } from "@shared/schema";
import { parseCsvText, csvRowToActivity, CSV_DATA } from "@/lib/csv-parser";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import RecentActivities from "../components/recent-activities";
import StatsTab from "../components/stats-tab";
import EquipmentTab from "../components/equipment-tab";
import ProfileTabs from "../components/profile-tabs";
import BottomNavigation from "../components/bottom-navigation";
import { useState } from "react";
import { Moon, Sun, Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigation } from "@/hooks/use-navigation";

export default function Profile() {
  const [selectedSport, setSelectedSport] = useState<string>("all");
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });
  
  const { toast } = useToast();
  const { getCurrentPage, navigate } = useNavigation();

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
    <div
      className="min-h-screen flex flex-col max-w-md mx-auto bg-white dark:bg-gray-900 shadow-lg"
      style={{
        // Sticky offset used by tabs below header; keep in sync with header height
        ["--profile-header-h" as any]: "48px",
      }}
    >
      {/* Header */}
      <header className="bg-white text-black sticky top-0 z-30 border-gray-200 h-12">
        <div className="relative h-full flex items-center justify-center">
          <h1 className="text-lg font-medium">You</h1>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Settings"
            onClick={() => navigate('settings')}
            data-testid="profile-settings-button"
            className="absolute right-2 top-1/2 -translate-y-1/2"
          >
            <SettingsIcon className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-2 flex-1">
        <ProfileTabs
          renderStats={() => (
            <StatsTab activities={activities} />
          )}
          renderActivities={() => (
            <RecentActivities activities={filteredActivities} isLoading={activitiesLoading} isOwnActivities={true} />
          )}
          renderEquipment={() => (
            <EquipmentTab />
          )}
        />
        <div className="h-20" />
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation currentPage={getCurrentPage()} />
    </div>
  );
} 