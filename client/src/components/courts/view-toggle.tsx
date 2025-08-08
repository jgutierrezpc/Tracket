import { List, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type ViewMode = 'list' | 'map';

interface ViewToggleProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  listCount?: number;
  mapCount?: number;
  className?: string;
}

export default function ViewToggle({
  currentView,
  onViewChange,
  listCount = 0,
  mapCount = 0,
  className = ""
}: ViewToggleProps) {
  return (
    <div className={`flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg ${className}`}>
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          View:
        </span>
      </div>
      
      <div className="flex items-center gap-1">
        <Button
          variant={currentView === 'list' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewChange('list')}
          className="flex items-center gap-2"
        >
          <List className="h-4 w-4" />
          <span>List</span>
        </Button>
        
        <Button
          variant={currentView === 'map' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewChange('map')}
          className="flex items-center gap-2"
        >
          <Map className="h-4 w-4" />
          <span>Map</span>
        </Button>
      </div>
    </div>
  );
} 