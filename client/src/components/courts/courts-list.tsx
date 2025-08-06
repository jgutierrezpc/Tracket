import { useState, memo, useCallback } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import CourtCard from "./court-card";

interface CourtData {
  clubName: string;
  clubLocation: string;
  playCount: number;
  totalDuration: number;
  lastPlayed: string;
  sports: string[];
  activityTypes: string[];
  players: string[];
}

interface CourtsListProps {
  courts: CourtData[];
  favorites: string[];
  onToggleFavorite: (clubName: string, clubLocation: string) => void;
  onCourtClick?: (court: CourtData) => void;
  isLoading?: boolean;
  error?: string | null;
}

const CourtsList = memo(function CourtsList({
  courts,
  favorites,
  onToggleFavorite,
  onCourtClick,
  isLoading = false,
  error = null
}: CourtsListProps) {
  const [hoveredCourt, setHoveredCourt] = useState<string | null>(null);

  const isFavorite = useCallback((clubName: string, clubLocation: string) => {
    return favorites.includes(`${clubName}|${clubLocation}`);
  }, [favorites]);

  const handleCourtClick = useCallback((court: CourtData) => {
    if (onCourtClick) {
      onCourtClick(court);
    }
  }, [onCourtClick]);

  // Sort courts by play frequency (most to least frequent)
  const sortedCourts = [...courts].sort((a, b) => b.playCount - a.playCount);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading courts...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load courts: {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (courts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 rounded-full bg-gray-100 dark:bg-gray-800 p-4">
          <AlertCircle className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          No courts found
        </h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-md">
          You haven't played at any clubs yet. Add some activities to see your courts here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {courts.length} {courts.length === 1 ? 'court' : 'courts'} found
        </p>
      </div>

      {/* Courts grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedCourts.map((court) => (
          <div
            key={`${court.clubName}|${court.clubLocation}`}
            className="transition-all duration-200"
            onMouseEnter={() => setHoveredCourt(`${court.clubName}|${court.clubLocation}`)}
            onMouseLeave={() => setHoveredCourt(null)}
          >
            <CourtCard
              court={court}
              isFavorite={isFavorite(court.clubName, court.clubLocation)}
              onToggleFavorite={onToggleFavorite}
              onClick={() => handleCourtClick(court)}
            />
          </div>
        ))}
      </div>

      {/* Load more indicator (for future pagination) */}
      {courts.length > 0 && (
        <div className="flex justify-center pt-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing all courts
          </p>
        </div>
      )}
    </div>
  );
});

export default CourtsList; 