import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";

interface FavoritesFilterProps {
  showOnlyFavorites: boolean;
  onToggleFavoritesFilter: (showOnly: boolean) => void;
  favoritesCount: number;
  totalCourtsCount: number;
}

export default function FavoritesFilter({
  showOnlyFavorites,
  onToggleFavoritesFilter,
  favoritesCount,
  totalCourtsCount
}: FavoritesFilterProps) {
  return (
    <div className="flex items-center justify-between p-2 dark:bg-gray-800 rounded-lg">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-yellow-500" />
          <Label htmlFor="favorites-filter" className="text-sm font-medium">
            Show favorites
          </Label>
        </div>
        <Switch
          id="favorites-filter"
          checked={showOnlyFavorites}
          onCheckedChange={onToggleFavoritesFilter}
        />
      </div>
      
      <div className="text-sm text-gray-600 dark:text-gray-400">
      </div>
    </div>
  );
} 