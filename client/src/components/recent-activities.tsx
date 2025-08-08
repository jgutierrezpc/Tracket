import { Activity } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import ActivityDetail from "./activity-detail";
import { Input } from "@/components/ui/input";

interface RecentActivitiesProps {
  activities: Activity[];
  isLoading: boolean;
  isOwnActivities?: boolean;
  pageSize?: number;
}

import { useState, useMemo } from "react";

export default function RecentActivities({ activities, isLoading, isOwnActivities = false, pageSize = 20 }: RecentActivitiesProps) {
  const [visibleCount, setVisibleCount] = useState<number>(pageSize);
  const [query, setQuery] = useState<string>("");

  const filteredActivities = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return activities;
    return activities.filter((a) => {
      const fields = [
        a.date ?? "",
        a.sport ?? "",
        a.activityType ?? "",
        a.partner ?? "",
        a.clubName ?? "",
        a.notes ?? "",
      ].map((v) => String(v).toLowerCase());
      return fields.some((f) => f.includes(q));
    });
  }, [activities, query]);

  const visibleActivities = useMemo(
    () => filteredActivities.slice(0, visibleCount),
    [filteredActivities, visibleCount]
  );
  const hasMore = visibleCount < filteredActivities.length;

  if (isLoading) {
    return (
      <section className="p-4">
        <h2 className="text-medium font-medium mb-4">Recent Activities</h2>
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
        <h2 className="text-medium font-medium mb-4">Recent Activities</h2>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <div className="text-4xl mb-2">🎾</div>
          <p>No activities found</p>
          <p className="text-sm">Add your first activity to get started!</p>
        </div>
      </section>
    );
  }



  return (
    <section className="p-4">
      <h2 className="text-medium font-medium mb-4">Recent Activities</h2>
      <div className="mb-3">
        <Input
          type="search"
          placeholder="Search activities..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setVisibleCount(pageSize);
          }}
          data-testid="activities-search-input"
        />
      </div>
      <div className="space-y-3">
        {visibleActivities.map((activity) => (
          <ActivityDetail
            key={activity.id}
            activity={activity}
            isOwnActivity={isOwnActivities}
          />
        ))}
      </div>
      {hasMore && (
        <div className="mt-4 flex justify-center">
          <button
            className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700"
            onClick={() => setVisibleCount((c) => Math.min(c + pageSize, activities.length))}
            data-testid="button-show-more"
          >
            Show More
          </button>
        </div>
      )}
    </section>
  );
}