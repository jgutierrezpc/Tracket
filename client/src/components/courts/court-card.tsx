import { useState, memo, useCallback } from "react";
import { Star, MapPin, Calendar, Users, Clock } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

interface CourtCardProps {
  court: CourtData;
  isFavorite: boolean;
  onToggleFavorite: (clubName: string, clubLocation: string) => void;
  onClick?: () => void;
}

const CourtCard = memo(function CourtCard({ 
  court, 
  isFavorite, 
  onToggleFavorite, 
  onClick 
}: CourtCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleFavoriteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(court.clubName, court.clubLocation);
  }, [onToggleFavorite, court.clubName, court.clubLocation]);

  const formatLastPlayed = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours === 0) return `${remainingMinutes}m`;
    if (remainingMinutes === 0) return `${hours}h`;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <Card 
      className={`transition-all duration-200 cursor-pointer hover:shadow-lg ${
        isHovered ? 'scale-[1.02]' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-medium truncate text-gray-900 dark:text-gray-100">
              {court.clubName}
            </h3>
            <div className="flex items-center gap-1 mt-1 text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{court.clubLocation || "No location"}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className={`p-1 h-auto transition-colors ${
              isFavorite 
                ? 'text-yellow-500 hover:text-yellow-600' 
                : 'text-gray-400 hover:text-yellow-500'
            }`}
            onClick={handleFavoriteClick}
          >
            <Star className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Stats Row */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
              <Calendar className="h-3 w-3" />
              <span>{formatLastPlayed(court.lastPlayed)}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
              <Clock className="h-3 w-3" />
              <span>{formatDuration(court.totalDuration)}</span>
            </div>
          </div>

          {/* Play Count */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {court.playCount} {court.playCount === 1 ? 'session' : 'sessions'}
            </span>
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
              <Users className="h-3 w-3" />
              <span className="text-sm">{court.players.length} players</span>
            </div>
          </div>

          {/* Sports and Activity Types */}
          <div className="flex flex-wrap gap-1">
            {court.sports.map((sport) => (
              <Badge key={sport} variant="secondary" className="text-xs">
                {sport}
              </Badge>
            ))}
            {court.activityTypes.slice(0, 2).map((type) => (
              <Badge key={type} variant="outline" className="text-xs">
                {type}
              </Badge>
            ))}
            {court.activityTypes.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{court.activityTypes.length - 2} more
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export default CourtCard; 