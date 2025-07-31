import { Activity } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface RecentActivitiesProps {
  activities: Activity[];
  isLoading: boolean;
}

export default function RecentActivities({ activities, isLoading }: RecentActivitiesProps) {
  if (isLoading) {
    return (
      <section className="p-4">
        <h2 className="text-lg font-medium mb-4">Recent Activities</h2>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-1"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (activities.length === 0) {
    return (
      <section className="p-4">
        <h2 className="text-lg font-medium mb-4">Recent Activities</h2>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <div className="text-4xl mb-2">🎾</div>
          <p>No activities found</p>
          <p className="text-sm">Add your first activity to get started!</p>
        </div>
      </section>
    );
  }

  const getSportIcon = (sport: string) => {
    switch (sport) {
      case 'padel': return '🏓';
      case 'tennis': return '🎾';
      case 'pickleball': return '🏓';
      default: return '🎾';
    }
  };

  const getActivityTypeIcon = (type: string) => {
    switch (type) {
      case 'tournament': return '🏆';
      case 'training': return '🎓';
      case 'friendly': return '🤝';
      default: return '🎾';
    }
  };

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case 'tournament': return 'bg-gray-100';
      case 'training': return 'bg-gray-100';
      case 'friendly': return 'bg-gray-100';
      default: return 'bg-primary';
    }
  };

  const renderStars = (rating: number | null) => {
    if (!rating) return <div className="text-xs text-gray-500 dark:text-gray-500">No rating</div>;
    
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className={`text-xs ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
          >
            ⭐
          </span>
        ))}
      </div>
    );
  };

  return (
    <section className="p-4">
      <h2 className="text-lg font-medium mb-4">Recent Activities</h2>
      <div className="space-y-3">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700"
            data-testid={`activity-${activity.id}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 ${getActivityTypeColor(activity.activityType || 'friendly')} rounded-full flex items-center justify-center text-white text-sm`}>
                  {activity.activityType ? getActivityTypeIcon(activity.activityType) : getSportIcon(activity.sport)}
                </div>
                <div>
                  <div className="font-medium capitalize" data-testid={`activity-sport-${activity.id}`}>
                    {activity.sport}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 capitalize" data-testid={`activity-type-${activity.id}`}>
                    {activity.activityType || 'Session'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500" data-testid={`activity-date-${activity.id}`}>
                    {formatDistanceToNow(new Date(activity.date), { addSuffix: true })}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium" data-testid={`activity-duration-${activity.id}`}>
                  {activity.duration} min
                </div>
                <div className="mt-1">
                  {renderStars(activity.sessionRating)}
                </div>
              </div>
            </div>
            
            {(activity.clubName || activity.racket) && (
              <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-4 flex-wrap">
                  {activity.clubName && (
                    <span data-testid={`activity-club-${activity.id}`}>
                      📍 {activity.clubName}
                    </span>
                  )}
                  {activity.racket && (
                    <span data-testid={`activity-racket-${activity.id}`}>
                      🎾 {activity.racket}
                    </span>
                  )}
                </div>
                {activity.partner && (
                  <div className="mt-1" data-testid={`activity-partner-${activity.id}`}>
                    Partner: <span className="font-medium">{activity.partner}</span>
                  </div>
                )}
              </div>
            )}

            {activity.notes && (
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 italic" data-testid={`activity-notes-${activity.id}`}>
                "{activity.notes}"
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}