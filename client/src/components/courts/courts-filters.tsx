import React, { useState } from "react";
import { Calendar, SlidersHorizontal, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export interface CourtFilters {
  dateRange?: 'this-year' | 'last-year' | 'custom';
  startDate?: string;
  endDate?: string;
  sport?: string;
  activityType?: string;
  player?: string;
}

interface CourtsFiltersProps {
  filters: CourtFilters;
  onFiltersChange: (filters: CourtFilters) => void;
  onClearFilters: () => void;
  availableSports: string[];
  availableActivityTypes: string[];
  availablePlayers: string[];
  isExpanded?: boolean;
  onToggleExpanded?: (expanded: boolean) => void;
}

export default function CourtsFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  availableSports,
  availableActivityTypes,
  availablePlayers,
  isExpanded = false,
  onToggleExpanded
}: CourtsFiltersProps) {
  const [localPlayer, setLocalPlayer] = useState(filters.player || '');
  const [internalExpanded, setInternalExpanded] = useState<boolean>(isExpanded);

  const handleFilterChange = (key: keyof CourtFilters, value: string | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const handleDateRangeChange = (range: string) => {
    const now = new Date();
    let startDate: string | undefined;
    let endDate: string | undefined;
    let dateRange: CourtFilters['dateRange'] | undefined;

    switch (range) {
      case 'all-time':
        dateRange = undefined;
        startDate = undefined;
        endDate = undefined;
        break;
      case 'this-year':
        dateRange = 'this-year';
        startDate = `${now.getFullYear()}-01-01`;
        endDate = `${now.getFullYear()}-12-31`;
        break;
      case 'last-year':
        dateRange = 'last-year';
        startDate = `${now.getFullYear() - 1}-01-01`;
        endDate = `${now.getFullYear() - 1}-12-31`;
        break;
      case 'custom':
        dateRange = 'custom';
        // Keep existing custom dates
        startDate = filters.startDate;
        endDate = filters.endDate;
        break;
      default:
        dateRange = undefined;
        startDate = undefined;
        endDate = undefined;
    }

    onFiltersChange({
      ...filters,
      dateRange,
      startDate,
      endDate
    });
  };

  const handlePlayerSearch = () => {
    handleFilterChange('player', localPlayer.trim() || undefined);
  };

  const handlePlayerKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handlePlayerSearch();
    }
  };

  const clearFilter = (key: keyof CourtFilters) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined && value !== '');

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => value !== undefined).length;
  };

  return (
    <div className="space-y-1">
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Filters</span>
 
          {hasActiveFilters && (
            <Badge variant="secondary" className="text-xs">
              {getActiveFiltersCount()} active
            </Badge>
          )}
        </div>
        
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-3 w-3 mr-1" />
            Clear all
          </Button>
        )}
      </div>

      {/* Filter Controls */}
      <Collapsible
        open={internalExpanded}
        onOpenChange={(next) => {
          setInternalExpanded(next);
          onToggleExpanded?.(next);
        }}
      >
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <span>Filter Options</span>
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="space-y-4 pt-4">
          {/* Date Range Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Date Range
            </label>
            <Select
              value={filters.dateRange}
              onValueChange={handleDateRangeChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-time">All time</SelectItem>
                <SelectItem value="this-year">This year</SelectItem>
                <SelectItem value="last-year">Last year</SelectItem>
                <SelectItem value="custom">Custom range</SelectItem>
              </SelectContent>
            </Select>
            
            {filters.dateRange === 'custom' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400">Start Date</label>
                  <Input
                    type="date"
                    value={filters.startDate || ''}
                    onChange={(e) => handleFilterChange('startDate', e.target.value || undefined)}
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400">End Date</label>
                  <Input
                    type="date"
                    value={filters.endDate || ''}
                    onChange={(e) => handleFilterChange('endDate', e.target.value || undefined)}
                    className="text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sport Type Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Sport Type
            </label>
            <Select
              value={filters.sport ?? 'all-sports'}
              onValueChange={(value) => handleFilterChange('sport', value === 'all-sports' ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All sports" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-sports">All sports</SelectItem>
                {/* options derived from availableSports */}
                {availableSports.map((sport) => (
                  <SelectItem key={sport} value={sport}>
                    {sport.charAt(0).toUpperCase() + sport.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Activity Type Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Activity Type
            </label>
            <Select
              value={filters.activityType ?? 'all-activities'}
              onValueChange={(value) => handleFilterChange('activityType', value === 'all-activities' ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All activities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-activities">All activities</SelectItem>
                {/* options derived from availableActivityTypes */}
                {availableActivityTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Player Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Player
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="Search by player name..."
                value={localPlayer}
                onChange={(e) => setLocalPlayer(e.target.value)}
                onKeyPress={handlePlayerKeyPress}
                className="flex-1"
              />
              <Button
                size="sm"
                onClick={handlePlayerSearch}
                aria-label="Search"
                className="px-3"
              >
                <Search className="h-3 w-3" />
              </Button>
            </div>
            {availablePlayers.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {availablePlayers.slice(0, 5).map((player) => (
                  <Badge
                    key={player}
                    variant="outline"
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      setLocalPlayer(player);
                      handleFilterChange('player', player);
                    }}
                  >
                    {player}
                  </Badge>
                ))}
                {availablePlayers.length > 5 && (
                  <Badge variant="outline" className="text-gray-500">
                    +{availablePlayers.length - 5} more
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Active Filter Badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.dateRange && filters.dateRange !== 'custom' && (
            <Badge variant="secondary" className="text-xs">
              {filters.dateRange === 'this-year' ? 'This year' : 'Last year'}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => clearFilter('dateRange')}
              />
            </Badge>
          )}
          {filters.dateRange === 'custom' && (filters.startDate || filters.endDate) && (
            <Badge variant="secondary" className="text-xs">
              Custom date range
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => {
                  clearFilter('dateRange');
                  clearFilter('startDate');
                  clearFilter('endDate');
                }}
              />
            </Badge>
          )}
          {filters.sport && (
            <Badge variant="secondary" className="text-xs">
              {filters.sport}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => clearFilter('sport')}
              />
            </Badge>
          )}
          {filters.activityType && (
            <Badge variant="secondary" className="text-xs">
              {filters.activityType}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => clearFilter('activityType')}
              />
            </Badge>
          )}
          {filters.player && (
            <Badge variant="secondary" className="text-xs">
              Player: {filters.player}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => clearFilter('player')}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
} 