import { Activity } from "@shared/schema";

type StatsOverviewMode = "overall" | "weekly";

interface StatsOverviewProps {
  stats?: {
    totalActivities: number;
    totalHours: number;
    averageDuration: number;
    trainingTournamentRatio: number;
    sportStats: Record<string, number>;
  };
  mode?: StatsOverviewMode;
  activities?: Activity[];
}

function getMonday(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = (day === 0 ? -6 : 1) - day; // adjust so Monday is first day
  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

function toIsoDateString(date: Date): string {
  return date.toISOString().split("T")[0];
}

export default function StatsOverview({ stats, mode = "overall", activities }: StatsOverviewProps) {
  if (mode === "weekly") {
    if (!activities) {
      return (
        <section className="p-4 bg-white dark:bg-gray-900">
          <h2 className="text-medium font-medium mb-4">This Week</h2>
          <div className="grid grid-cols-3 gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center animate-pulse">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </section>
      );
    }

    const today = new Date();
    const weekStart = getMonday(today);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const weekStartStr = toIsoDateString(weekStart);
    const weekEndStr = toIsoDateString(weekEnd);

    const weeklyActivities = activities.filter((a) => a.date >= weekStartStr && a.date <= weekEndStr);
    const totalActivities = weeklyActivities.length;
    const totalMinutes = weeklyActivities.reduce((sum, a) => sum + (a.duration || 0), 0);
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
    const showAverage = totalActivities > 1;
    const averageMinutes = showAverage ? Math.round(totalMinutes / totalActivities) : 0;

    const gridCols = showAverage ? "grid-cols-3" : "grid-cols-2";

    return (
      <section className="p-4 bg-white dark:bg-gray-900">
        <h2 className="text-medium font-medium mb-4">This Week</h2>
        <div className={`grid ${gridCols} gap-3`}>
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-primary" data-testid="weekly-total-activities">
              {totalActivities}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Total Activities</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-primary" data-testid="weekly-total-duration">
              {totalHours}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Total Duration (hours)</div>
          </div>
          {showAverage && (
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-primary" data-testid="weekly-average-duration">
                {averageMinutes}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Avg. Session (minutes)</div>
            </div>
          )}
        </div>
      </section>
    );
  }

  // overall mode (default), preserve existing behavior
  if (!stats) {
    return (
      <section className="p-4 bg-white dark:bg-gray-900">
        <h2 className="text-medium font-medium mb-4">Activity Overview</h2>
        <div className="grid grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="p-4 bg-white dark:bg-gray-900">
      <h2 className="text-medium font-medium mb-4">Activity Overview</h2>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-primary" data-testid="stat-total-activities">
            {stats.totalActivities}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Total Sessions</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-primary" data-testid="stat-total-hours">
            {stats.totalHours}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Hours Played</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-primary" data-testid="stat-average-duration">
            {stats.averageDuration}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Avg. Session Duration</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-primary" data-testid="stat-training-tournament-ratio">
            {stats.trainingTournamentRatio}:1
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Training:Tournament Ratio</div>
        </div>
      </div>
    </section>
  );
}
