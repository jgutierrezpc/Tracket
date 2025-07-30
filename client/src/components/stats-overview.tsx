interface StatsOverviewProps {
  stats?: {
    totalActivities: number;
    totalHours: number;
    averageDuration: number;
    trainingTournamentRatio: number;
    sportStats: Record<string, number>;
  };
}

export default function StatsOverview({ stats }: StatsOverviewProps) {
  if (!stats) {
    return (
      <section className="p-4 bg-white dark:bg-gray-900">
        <h2 className="text-lg font-medium mb-4">Activity Overview</h2>
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
      <h2 className="text-lg font-medium mb-4">Activity Overview</h2>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-primary" data-testid="stat-total-activities">
            {stats.totalActivities}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Total Sessions</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-secondary" data-testid="stat-total-hours">
            {stats.totalHours}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Hours Played</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-accent" data-testid="stat-average-duration">
            {stats.averageDuration}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Avg. Session Duration</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600" data-testid="stat-training-tournament-ratio">
            {stats.trainingTournamentRatio}:1
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Training:Tournament Ratio</div>
        </div>
      </div>
    </section>
  );
}
