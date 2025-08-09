import { useEffect, useMemo, useRef, useState } from "react";
import Map, { type MapRef, NavigationControl } from "react-map-gl/mapbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Loader2, MapPin, Scan } from "lucide-react";
import CourtMarker from "@/components/courts/court-marker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type LatLng = { lat: number; lng: number };

interface CourtData {
  clubName: string;
  clubLocation: string;
  playCount: number;
  totalDuration: number;
  lastPlayed: string;
  sports: string[];
  activityTypes: string[];
  players: string[];
  coordinates?: LatLng;
}

interface CourtsMapMapboxProps {
  courts: CourtData[];
  favorites: string[];
  onToggleFavorite: (clubName: string, clubLocation: string) => void;
  onCourtClick?: (court: CourtData) => void;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
}

export default function CourtsMapMapbox({
  courts,
  favorites,
  onToggleFavorite,
  onCourtClick,
  isLoading = false,
  error = null,
  className = "",
}: CourtsMapMapboxProps) {
  const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || (import.meta.env.MODE === 'test' ? 'test-token' : "");
  const [mapIsLoading, setMapIsLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const mapRef = useRef<MapRef | null>(null);
  const firstRenderHandledRef = useRef(false);
  const [selectedCourt, setSelectedCourt] = useState<CourtData | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileDetails, setShowMobileDetails] = useState(false);
  const [currentZoom, setCurrentZoom] = useState<number>(10);

  const defaultCenter = useMemo(() => ({ lat: 40.7128, lng: -74.006 }), []);

  const isValidCoord = (c?: LatLng): c is LatLng => !!c && Number.isFinite(c.lat) && Number.isFinite(c.lng);

  const validCourts = useMemo(() => courts.filter(c => isValidCoord(c.coordinates)), [courts]);

  // Pick most recent venue with coordinates; fallback to default
  const mostRecentWithCoords = useMemo(() => {
    const courtsWithCoords = courts.filter(c => isValidCoord(c.coordinates) && c.lastPlayed);
    if (courtsWithCoords.length === 0) return null;
    return courtsWithCoords.reduce((latest, current) => {
      const latestTime = new Date(latest.lastPlayed).getTime();
      const currentTime = new Date(current.lastPlayed).getTime();
      return currentTime > latestTime ? current : latest;
    });
  }, [courts]);

  const initialView = useMemo(() => {
    if (mostRecentWithCoords && mostRecentWithCoords.coordinates) {
      return {
        longitude: mostRecentWithCoords.coordinates.lng,
        latitude: mostRecentWithCoords.coordinates.lat,
        zoom: 11, // city-level
      } as const;
    }
    return {
      longitude: defaultCenter.lng,
      latitude: defaultCenter.lat,
      zoom: 10,
    } as const;
  }, [mostRecentWithCoords, defaultCenter]);

  // Sync current zoom with the computed initial view once available
  useEffect(() => {
    setCurrentZoom(initialView.zoom);
  }, [initialView.zoom]);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Basic guard to avoid runtime errors during local/test runs without token
  if (!mapboxToken) {
    return (
      <div
        className={`flex items-center justify-center h-80 md:h-96 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 ${className}`}
      >
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Mapbox token not configured. Set VITE_MAPBOX_ACCESS_TOKEN in your environment.
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertDescription>Failed to load courts: {error}</AlertDescription>
      </Alert>
    );
  }

  // Do not early-return for mapIsLoading: we must mount the Map so it can fire onLoad

  // Controls
  const handleZoomIn = () => {
    mapRef.current?.zoomIn({ duration: 300 });
  };

  const handleZoomOut = () => {
    mapRef.current?.zoomOut({ duration: 300 });
  };

  const handleResetView = () => {
    const coords = courts.filter(c => c.coordinates).map(c => [c.coordinates!.lng, c.coordinates!.lat] as [number, number]);
    if (coords.length > 0) {
      const lngs = coords.map(([lng]) => lng);
      const lats = coords.map(([, lat]) => lat);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      mapRef.current?.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat],
        ],
        { padding: 40, duration: 500 }
      );
    } else {
      mapRef.current?.flyTo({ center: [initialView.longitude, initialView.latitude], zoom: initialView.zoom, duration: 500 });
    }
  };

  const handlePanBy = (dx: number, dy: number) => {
    // dx, dy are in pixels
    mapRef.current?.panBy([dx, dy], { duration: 250 });
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === "+" || e.key === "=") {
      e.preventDefault();
      handleZoomIn();
    } else if (e.key === "-" || e.key === "_") {
      e.preventDefault();
      handleZoomOut();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      handlePanBy(0, -100);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      handlePanBy(0, 100);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      handlePanBy(-100, 0);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      handlePanBy(100, 0);
    } else if (e.key.toLowerCase() === "r") {
      e.preventDefault();
      handleResetView();
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours === 0) return `${remainingMinutes}m`;
    if (remainingMinutes === 0) return `${hours}h`;
    return `${hours}h ${remainingMinutes}m`;
  };

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

  // Cleanup map resources on unmount
  useEffect(() => {
    return () => {
      try {
        // MapRef#getMap returns the Mapbox GL JS instance, which has remove()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapboxMap: any = (mapRef as unknown as { current?: MapRef | null }).current?.getMap?.();
        mapboxMap?.remove?.();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (mapRef as unknown as { current?: any }).current = null;
      } catch {
        // no-op
      }
    };
  }, []);

  // Safety timeout: if the map never triggers load, stop showing the spinner
  useEffect(() => {
    if (!mapIsLoading) return;
    const timeout = window.setTimeout(() => {
      if (mapIsLoading) {
        setMapError((prev) => prev ?? "Failed to load Mapbox map (timeout)");
        setMapIsLoading(false);
      }
    }, 6000);
    return () => window.clearTimeout(timeout);
  }, [mapIsLoading]);

  return (
    <div className={`relative ${className}`} role="region" aria-label="Courts map" tabIndex={0} onKeyDown={handleKeyDown}>
      <div className="w-full h-[60vh] md:h-[70vh] lg:h-[72vh] min-h-80 md:min-h-96 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <Map
          mapboxAccessToken={mapboxToken}
          initialViewState={initialView}
          mapStyle="mapbox://styles/mapbox/light-v11"
          style={{ width: "100%", height: "100%" }}
          ref={mapRef}
          onLoad={() => setMapIsLoading(false)}
          onError={() => {
            setMapError("Failed to load Mapbox map");
            setMapIsLoading(false);
          }}
          onMove={(e) => setCurrentZoom(e.viewState.zoom)}
        >
          <NavigationControl position="top-right" visualizePitch={true} showCompass={false} />
          {/* Markers must be children of Map */}
          {validCourts.map((court) => (
            <Popover key={`${court.clubName}|${court.clubLocation}`} open={selectedCourt?.clubName === court.clubName && selectedCourt?.clubLocation === court.clubLocation} onOpenChange={(open) => {
              setSelectedCourt(open ? court : null);
            }}>
              <PopoverTrigger asChild>
                <div>
                  <CourtMarker
                    longitude={court.coordinates!.lng}
                    latitude={court.coordinates!.lat}
                    isFavorite={favorites.includes(`${court.clubName}|${court.clubLocation}`)}
                    isSelected={selectedCourt?.clubName === court.clubName && selectedCourt?.clubLocation === court.clubLocation}
                    onClick={() => {
                      setSelectedCourt(court);
                      onCourtClick?.(court);
                    }}
                    ariaLabel={`${court.clubName} marker`}
                  />
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-3" sideOffset={8} align="center">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{court.clubName}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 truncate">{court.clubLocation || "No location"}</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`p-1 h-auto transition-colors ${
                        favorites.includes(`${court.clubName}|${court.clubLocation}`)
                          ? "text-yellow-500 hover:text-yellow-600"
                          : "text-gray-400 hover:text-yellow-500"
                      }`}
                      onClick={() => onToggleFavorite(court.clubName, court.clubLocation)}
                      aria-label="Toggle favorite"
                    >
                      <MapPin className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">
                      {court.playCount} {court.playCount === 1 ? "session" : "sessions"}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">{formatDuration(court.totalDuration)}</span>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Last played: {formatLastPlayed(court.lastPlayed)}</div>
                  <div className="flex flex-wrap gap-1">
                    {court.sports.map((sport) => (
                      <Badge key={sport} variant="secondary" className="text-[10px]">
                        {sport}
                      </Badge>
                    ))}
                    {court.activityTypes.slice(0, 2).map((type) => (
                      <Badge key={type} variant="outline" className="text-[10px]">
                        {type}
                      </Badge>
                    ))}
                    {court.activityTypes.length > 2 && (
                      <Badge variant="outline" className="text-[10px]">+{court.activityTypes.length - 2} more</Badge>
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          ))}
        </Map>
        {(isLoading || mapIsLoading) && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 dark:bg-gray-800/80">
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>{isLoading ? "Loading data..." : "Loading map..."}</span>
            </div>
          </div>
        )}
        {/* Mobile-only reset view button placed where the compass was */}
        {isMobile && (
          <div className="absolute right-4 top-28">
            <button
              type="button"
              aria-label="Reset view"
              onClick={handleResetView}
              title="Reset view"
              className="mapboxgl-ctrl mapboxgl-ctrl-group bg-white/90 dark:bg-gray-800/90 p-1 rounded-md"
            >
              <Scan className="h-5 w-5 text-gray-900 dark:text-gray-100" />
            </button>
          </div>
        )}
      </div>

      {/* Courts Summary */}
      <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
        {courts.length === 0 ? (
          <span>No courts available</span>
        ) : validCourts.length > 0 ? (
          <span>
            Showing {validCourts.length} of {courts.length} courts on map
            {courts.length !== validCourts.length && (
              <span className="text-gray-500"> ({courts.length - validCourts.length} without coordinates)</span>
            )}
            {!isMobile && (
              <span className="text-gray-500 ml-2">• Zoom: {Math.round(currentZoom)}</span>
            )}
          </span>
        ) : (
          <span>
            No courts with location data available. <span className="text-gray-500 ml-1">Add coordinates to see courts on the map.</span>
          </span>
        )}
      </div>

      {mapError && (
        <div className="absolute bottom-4 left-4 right-4">
          <Alert variant="destructive">
            <AlertDescription>{mapError}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Courts without coordinates warning */}
      {courts.length > 0 && validCourts.length === 0 && (
        <div className="absolute bottom-4 left-4 right-4">
          <Alert>
            <AlertDescription>
              No courts with location data found. Add coordinates to see courts on the map.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Partial coordinates warning */}
      {courts.length > 0 && validCourts.length > 0 && validCourts.length < courts.length && (
        <div className="absolute bottom-4 left-4 right-4">
          <Alert>
            <AlertDescription>
              {courts.length - validCourts.length} court
              {courts.length - validCourts.length === 1 ? "" : "s"} without location data
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Selected Court Details - Desktop */}
      {selectedCourt && !isMobile && (
        <Card className="mt-4">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg truncate">{selectedCourt.clubName}</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {selectedCourt.clubLocation || "No location"}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className={`p-1 h-auto transition-colors ${
                  favorites.includes(`${selectedCourt.clubName}|${selectedCourt.clubLocation}`)
                    ? "text-yellow-500 hover:text-yellow-600"
                    : "text-gray-400 hover:text-yellow-500"
                }`}
                onClick={() => onToggleFavorite(selectedCourt.clubName, selectedCourt.clubLocation)}
              >
                <MapPin className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  {selectedCourt.playCount} {selectedCourt.playCount === 1 ? "session" : "sessions"}
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {formatDuration(selectedCourt.totalDuration)}
                </span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Last played: {formatLastPlayed(selectedCourt.lastPlayed)}
              </div>
              <div className="flex flex-wrap gap-1">
                {selectedCourt.sports.map((sport) => (
                  <Badge key={sport} variant="secondary" className="text-xs">
                    {sport}
                  </Badge>
                ))}
                {selectedCourt.activityTypes.slice(0, 2).map((type) => (
                  <Badge key={type} variant="outline" className="text-xs">
                    {type}
                  </Badge>
                ))}
                {selectedCourt.activityTypes.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{selectedCourt.activityTypes.length - 2} more
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Court Details - Mobile */}
      {isMobile && selectedCourt && (
        <Sheet open={showMobileDetails} onOpenChange={setShowMobileDetails}>
          <SheetContent side="bottom" className="h-[60vh]">
            <SheetHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <SheetTitle className="text-lg truncate">{selectedCourt.clubName}</SheetTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {selectedCourt.clubLocation || "No location"}
                  </p>
                </div>
              </div>
            </SheetHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {selectedCourt.playCount} {selectedCourt.playCount === 1 ? "session" : "sessions"}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDuration(selectedCourt.totalDuration)}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`p-2 transition-colors ${
                    favorites.includes(`${selectedCourt.clubName}|${selectedCourt.clubLocation}`)
                      ? "text-yellow-500 hover:text-yellow-600"
                      : "text-gray-400 hover:text-yellow-500"
                  }`}
                  onClick={() => onToggleFavorite(selectedCourt.clubName, selectedCourt.clubLocation)}
                >
                  <MapPin className="h-5 w-5" />
                </Button>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Last played: {formatLastPlayed(selectedCourt.lastPlayed)}
              </div>
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium mb-2">Sports</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedCourt.sports.map((sport) => (
                      <Badge key={sport} variant="secondary" className="text-xs">
                        {sport}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Activity Types</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedCourt.activityTypes.map((type) => (
                      <Badge key={type} variant="outline" className="text-xs">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
                {selectedCourt.players.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Players</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedCourt.players.slice(0, 5).map((player) => (
                        <Badge key={player} variant="outline" className="text-xs">
                          {player}
                        </Badge>
                      ))}
                      {selectedCourt.players.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{selectedCourt.players.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
