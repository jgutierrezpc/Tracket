import { Activity } from "@shared/schema";
import { format } from "date-fns";
import { UserRound, ThumbsUp, MessageSquareText, Star, MapPin } from "lucide-react";

interface ActivityDetailProps {
  activity: Activity;
  isOwnActivity?: boolean;
}

export default function ActivityDetail({ activity, isOwnActivity = false }: ActivityDetailProps) {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const renderStars = (rating: number | null) => {
    if (!rating) return null;
    
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={16}
            className={`${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  const formatParticipants = (partner?: string, opponents?: string) => {
    const participants = [];
    if (partner) participants.push(partner);
    if (opponents) participants.push(opponents);
    return participants.join(", ");
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header Section */}
      <div className="flex items-center space-x-3 mb-3">
        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
          <UserRound size={20} className="text-gray-500" />
        </div>
        <div>
          <div className="text-xs font-medium">
            {isOwnActivity ? "JJ Jason" : "User Name"}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {format(new Date(activity.date), "MMMM d, yyyy 'at' h:mm a")}
          </div>
        </div>
      </div>

      {/* Activity Title */}
      <h3 className="text-medium font-medium mb-2 capitalize">
        {activity.sport} {activity.activityType || 'Session'} by {isOwnActivity ? "JJ Jason" : "user or system generated"}
      </h3>

      {/* Activity Details Grid */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Type</div>
          <div className="text-sm font-medium capitalize">{activity.activityType || 'Friendly'}</div>
        </div>
        <div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Time on Court</div>
          <div className="text-sm font-medium">{formatDuration(activity.duration)}</div>
        </div>
        <div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Court Feeling</div>
          <div className="mt-1">
            {renderStars(activity.sessionRating)}
          </div>
        </div>
      </div>

      {/* Participants and Location */}
      {(activity.partner || activity.opponents) && (
        <div className="mb-3">
          <div className="text-xs text-gray-600 dark:text-gray-400">Played with</div>
          <div className="text-sm font-medium">
            {formatParticipants(activity.partner, activity.opponents)}
          </div>
        </div>
      )}

      {activity.clubName && (
        <div className="flex items-center space-x-2 mb-4">
          <MapPin size={16} className="text-gray-600" />
          <span className="text-sm">{activity.clubName}</span>
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex justify-center space-x-12 pt-4 dark:border-gray-700">
        <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
          <ThumbsUp size={20} />
          <span className="text-sm">Like</span>
        </button>
        <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
          <MessageSquareText size={20} />
          <span className="text-sm">Comment</span>
        </button>
      </div>
    </div>
  );
} 