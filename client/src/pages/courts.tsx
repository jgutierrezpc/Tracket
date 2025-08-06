import React, { useState, useMemo, useCallback, lazy, Suspense } from "react";
import BottomNavigation from "../components/bottom-navigation";
import { useNavigation } from "@/hooks/use-navigation";
import { useCourts } from "@/hooks/use-courts";
import ViewToggle from "@/components/courts/view-toggle";
import CourtsList from "@/components/courts/courts-list";
import CourtsFilters from "@/components/courts/courts-filters";
import FavoritesFilter from "@/components/courts/favorites-filter";
import { CourtsErrorBoundary } from "@/components/courts/courts-error-boundary";
import { 
  LoadingState, 
  DataError, 
  NetworkError, 
  EmptyState,
  OfflineState,
  PartialDataState
} from "@/components/courts/fallback-states";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle } from "lucide-react";

// Lazy load the map component since it's heavy and not always needed
const CourtsMap = lazy(() => import("@/components/courts/courts-map"));

export default function Courts() {
  const { getCurrentPage } = useNavigation();
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  // Use the courts hook for data management
  const {
    // Data
    courts,
    filteredCourts,
    favorites,
    
    // Loading and error states
    isLoading,
    isError,
    error,
    
    // Filtering
    filters,
    setFilters,
    clearFilters,
    hasActiveFilters,
    availableSports,
    availableActivityTypes,
    availablePlayers,
    
    // Favorites
    toggleFavorite,
    isFavorite,
    showOnlyFavorites,
    setShowOnlyFavorites,
    
    // View management
    currentView,
    setCurrentView,
    
    // Statistics
    totalCourts,
    totalFavorites,
    courtsWithCoordinates,
    
    // Real-time updates
    isRefreshing,
    lastUpdated,
    
    // Mutations
    refreshData,
    forceRefresh,
  } = useCourts({
    enableRealTimeUpdates: !isOffline,
    realTimeInterval: 30 * 1000, // 30 seconds
    enableOptimisticUpdates: true,
  });

  const handleCourtClick = useCallback((court: any) => {
    // Handle court click - could open details modal or navigate to court page
    console.log('Court clicked:', court);
    // TODO: Implement court details modal or navigation
  }, []);

  const handleFiltersChange = useCallback((newFilters: any) => {
    setFilters(newFilters);
  }, [setFilters]);

  const handleClearFilters = useCallback(() => {
    clearFilters();
  }, [clearFilters]);

  const handleToggleFavorite = useCallback((clubName: string, clubLocation: string) => {
    toggleFavorite(clubName, clubLocation);
  }, [toggleFavorite]);

  const handleViewChange = useCallback((view: 'list' | 'map') => {
    setCurrentView(view);
  }, [setCurrentView]);



  // Memoize expensive computations
  const shouldShowEmptyState = useMemo(() => 
    !isLoading && !isError && !isOffline && filteredCourts.length === 0,
    [isLoading, isError, isOffline, filteredCourts.length]
  );

  const shouldShowList = useMemo(() => 
    !isLoading && !isError && !isOffline && currentView === 'list' && filteredCourts.length > 0,
    [isLoading, isError, isOffline, currentView, filteredCourts.length]
  );

  const shouldShowMap = useMemo(() => 
    !isLoading && !isError && !isOffline && currentView === 'map',
    [isLoading, isError, isOffline, currentView]
  );

  return (
    <CourtsErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Courts page error:', error, errorInfo);
      }}
      onRetry={() => {
        forceRefresh();
      }}
    >
      <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 text-black dark:text-white p-4 sticky top-0 z-30 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="max-w-md mx-auto md:max-w-2xl lg:max-w-4xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h1 className="text-lg font-medium md:text-xl">Courts</h1>
              {totalCourts > 0 && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ({totalCourts})
                </span>
              )}
              {isRefreshing && (
                <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                  <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse"></div>
                  <span>Live</span>
                </div>
              )}
            </div>
            
            {/* Refresh Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={forceRefresh}
              disabled={isLoading || isRefreshing}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              title={lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : 'Refresh data'}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading || isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-md mx-auto md:max-w-2xl lg:max-w-4xl w-full">
          {/* Filters Section */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <CourtsFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
              availableSports={availableSports}
              availableActivityTypes={availableActivityTypes}
              availablePlayers={availablePlayers}
              isExpanded={filtersExpanded}
              onToggleExpanded={setFiltersExpanded}
            />
            
            {/* Favorites Filter */}
            <div className="mt-4">
              <FavoritesFilter
                showOnlyFavorites={showOnlyFavorites}
                onToggleFavoritesFilter={setShowOnlyFavorites}
                favoritesCount={totalFavorites}
                totalCourtsCount={totalCourts}
              />
            </div>
          </div>

          {/* View Toggle */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <ViewToggle
              currentView={currentView}
              onViewChange={handleViewChange}
              listCount={filteredCourts.length}
              mapCount={courtsWithCoordinates}
            />
          </div>

          {/* Content Area */}
          <div className="flex-1">
            {/* Offline State */}
            {isOffline && (
              <div className="p-4">
                <OfflineState onRetry={() => setIsOffline(false)} />
              </div>
            )}

            {/* Error State */}
            {isError && !isOffline && (
              <div className="p-4">
                {error?.includes('network') || error?.includes('fetch') ? (
                  <NetworkError onRetry={forceRefresh} error={error || undefined} />
                ) : (
                  <DataError onRetry={forceRefresh} error={error || undefined} />
                )}
              </div>
            )}

            {/* Loading State */}
            {isLoading && !isError && !isOffline && (
              <LoadingState message="Loading courts..." />
            )}

            {/* Empty State */}
            {shouldShowEmptyState && (
              <EmptyState 
                hasFilters={hasActiveFilters}
                onClearFilters={handleClearFilters}
                onAddActivity={() => {
                  // TODO: Navigate to add activity page
                  console.log('Navigate to add activity');
                }}
              />
            )}

            {/* List View */}
            {shouldShowList && (
              <div className="p-4">
                <CourtsList
                  courts={filteredCourts}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                  onCourtClick={handleCourtClick}
                  isLoading={isLoading}
                  error={error}
                />
              </div>
            )}

            {/* Map View */}
            {shouldShowMap && (
              <div className="h-[calc(100vh-300px)] md:h-[calc(100vh-200px)] lg:h-[calc(100vh-150px)]">
                <Suspense fallback={<LoadingState message="Loading map..." />}>
                  <CourtsMap
                    courts={filteredCourts}
                    favorites={favorites}
                    onToggleFavorite={handleToggleFavorite}
                    onCourtClick={handleCourtClick}
                    isLoading={isLoading}
                    error={error}
                    className="h-full"
                  />
                </Suspense>
              </div>
            )}
          </div>
          
          {/* Bottom spacing for FAB */}
          <div className="h-20"></div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation currentPage={getCurrentPage()} />
    </div>
    </CourtsErrorBoundary>
  );
} 