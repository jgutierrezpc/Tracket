import { useEffect, useRef, useState, useCallback } from "react";
import { MapPin, Loader2, AlertCircle, Info, ZoomIn, ZoomOut, Navigation, X, Move, RotateCcw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface CourtData {
  clubName: string;
  clubLocation: string;
  playCount: number;
  totalDuration: number;
  lastPlayed: string;
  sports: string[];
  activityTypes: string[];
  players: string[];
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface CourtsMapProps {
  courts: CourtData[];
  favorites: string[];
  onToggleFavorite: (clubName: string, clubLocation: string) => void;
  onCourtClick?: (court: CourtData) => void;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
}

// Google Maps types
declare global {
  interface Window {
    google: any;
  }
}

export default function CourtsMap({
  courts,
  favorites,
  onToggleFavorite,
  onCourtClick,
  isLoading = false,
  error = null,
  className = ""
}: CourtsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
           const [mapLoaded, setMapLoaded] = useState(false);
         const [mapError, setMapError] = useState<string | null>(null);
         const [selectedCourt, setSelectedCourt] = useState<CourtData | null>(null);
         const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
         const [isMobile, setIsMobile] = useState(false);
         const [showMobileDetails, setShowMobileDetails] = useState(false);
         const [mapBounds, setMapBounds] = useState<any>(null);
         const [currentZoom, setCurrentZoom] = useState(10);
         const [isMapInitializing, setIsMapInitializing] = useState(false);
         const [isLoadingLocation, setIsLoadingLocation] = useState(false);
         const [locationError, setLocationError] = useState<string | null>(null);

           // Check if a court is favorited
         const isFavorite = useCallback((clubName: string, clubLocation: string) => {
           return favorites.includes(`${clubName}|${clubLocation}`);
         }, [favorites]);

         // Detect mobile device
         useEffect(() => {
           const checkMobile = () => {
             setIsMobile(window.innerWidth < 768);
           };
           
           checkMobile();
           window.addEventListener('resize', checkMobile);
           
           return () => window.removeEventListener('resize', checkMobile);
         }, []);

  // Initialize Google Maps
  useEffect(() => {
    if (!mapRef.current || mapLoaded) return;

         const initMap = () => {
       setIsMapInitializing(true);
       try {
         if (!window.google) {
           setMapError("Google Maps failed to load");
           setIsMapInitializing(false);
           return;
         }

        const map = new window.google.maps.Map(mapRef.current, {
          center: { lat: 40.7128, lng: -74.0060 }, // Default to NYC
          zoom: 10,
          mapTypeId: window.google.maps.MapTypeId.ROADMAP,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
          gestureHandling: "cooperative",
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ]
        });

                 mapInstanceRef.current = map;
         setMapLoaded(true);
         setIsMapInitializing(false);

                   // Get user location if available
          if (navigator.geolocation) {
            setIsLoadingLocation(true);
            setLocationError(null);
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const userPos = {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude
                };
                setUserLocation(userPos);
                setIsLoadingLocation(false);
                
                // Center map on user location if no courts with coordinates
                const courtsWithCoords = courts.filter(court => court.coordinates);
                if (courtsWithCoords.length === 0) {
                  map.setCenter(userPos);
                  map.setZoom(12);
                }
              },
              (error) => {
                console.warn("Could not get user location:", error);
                setIsLoadingLocation(false);
                // Don't show error for location - just continue without user location
                // setLocationError("Could not get your location. Please check your browser permissions.");
              }
            );
          }
       } catch (err) {
         setMapError("Failed to initialize map");
         setIsMapInitializing(false);
         console.error("Map initialization error:", err);
       }
    };

         // Load Google Maps script if not already loaded
     if (!window.google) {
       setIsMapInitializing(true);
       const script = document.createElement("script");
       script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY'}&libraries=places`;
       script.async = true;
       script.defer = true;
       script.onload = initMap;
       script.onerror = () => {
         setMapError("Failed to load Google Maps");
         setIsMapInitializing(false);
       };
       document.head.appendChild(script);
     } else {
       initMap();
     }

    return () => {
      // Cleanup markers
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
    };
  }, [mapLoaded]);

  // Add markers when courts data changes
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add new markers
    courts.forEach((court) => {
      if (!court.coordinates) return;

      const marker = new window.google.maps.Marker({
        position: court.coordinates,
        map: mapInstanceRef.current,
        title: court.clubName,
        icon: {
          url: isFavorite(court.clubName, court.clubLocation)
            ? "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#FFD700" stroke="#FFA500" stroke-width="2"/>
              </svg>
            `)
            : "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#FF6B6B" stroke="#FF4757" stroke-width="2"/>
              </svg>
            `),
          scaledSize: new window.google.maps.Size(24, 24),
          anchor: new window.google.maps.Point(12, 12)
        }
      });

                   // Add click listener
             marker.addListener("click", () => {
               setSelectedCourt(court);
               if (isMobile) {
                 setShowMobileDetails(true);
               }
               if (onCourtClick) {
                 onCourtClick(court);
               }
             });

      markersRef.current.push(marker);
    });

             // Fit bounds if we have markers
         if (markersRef.current.length > 0) {
           const bounds = new window.google.maps.LatLngBounds();
           markersRef.current.forEach(marker => {
             bounds.extend(marker.getPosition());
           });
           mapInstanceRef.current.fitBounds(bounds);
           
           // Add some padding to bounds
           const listener = window.google.maps.event.addListener(mapInstanceRef.current, "bounds_changed", () => {
             window.google.maps.event.removeListener(listener);
             const currentBounds = mapInstanceRef.current.getBounds();
             if (currentBounds) {
               const ne = currentBounds.getNorthEast();
               const sw = currentBounds.getSouthWest();
               const latDiff = (ne.lat() - sw.lat()) * 0.1;
               const lngDiff = (ne.lng() - sw.lng()) * 0.1;
               
               const newBounds = new window.google.maps.LatLngBounds(
                 new window.google.maps.LatLng(sw.lat() - latDiff, sw.lng() - lngDiff),
                 new window.google.maps.LatLng(ne.lat() + latDiff, ne.lng() + lngDiff)
               );
               mapInstanceRef.current.fitBounds(newBounds);
             }
           });
         } else if (courts.length > 0) {
           // If we have courts but no coordinates, center on user location or default
           const centerLocation = userLocation || { lat: 40.7128, lng: -74.0060 };
           mapInstanceRef.current.setCenter(centerLocation);
           mapInstanceRef.current.setZoom(10);
         }
  }, [courts, mapLoaded, isFavorite, onCourtClick]);

           // Handle favorite toggle
         const handleToggleFavorite = useCallback((court: CourtData) => {
           onToggleFavorite(court.clubName, court.clubLocation);
         }, [onToggleFavorite]);

         // Map control functions
         const handleZoomIn = useCallback(() => {
           if (mapInstanceRef.current) {
             mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() + 1);
           }
         }, []);

         const handleZoomOut = useCallback(() => {
           if (mapInstanceRef.current) {
             mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() - 1);
           }
         }, []);

         const handleGoToUserLocation = useCallback(() => {
           if (userLocation && mapInstanceRef.current) {
             mapInstanceRef.current.setCenter(userLocation);
             mapInstanceRef.current.setZoom(12);
           }
         }, [userLocation]);

         const handleCloseMobileDetails = useCallback(() => {
           setShowMobileDetails(false);
           setSelectedCourt(null);
         }, []);

         // Enhanced map control functions
         const handleResetView = useCallback(() => {
           if (mapInstanceRef.current) {
             if (markersRef.current.length > 0) {
               // Fit bounds to all markers
               const bounds = new window.google.maps.LatLngBounds();
               markersRef.current.forEach(marker => {
                 bounds.extend(marker.getPosition());
               });
               mapInstanceRef.current.fitBounds(bounds);
             } else if (userLocation) {
               // Center on user location
               mapInstanceRef.current.setCenter(userLocation);
               mapInstanceRef.current.setZoom(12);
             } else {
               // Default view
               mapInstanceRef.current.setCenter({ lat: 40.7128, lng: -74.0060 });
               mapInstanceRef.current.setZoom(10);
             }
           }
         }, [userLocation]);

         const handlePanToCenter = useCallback(() => {
           if (mapInstanceRef.current) {
             const center = mapInstanceRef.current.getCenter();
             if (center) {
               mapInstanceRef.current.panTo(center);
             }
           }
         }, []);

         // Map event listeners for zoom and bounds tracking
         useEffect(() => {
           if (!mapInstanceRef.current || !mapLoaded) return;

           const zoomListener = window.google.maps.event.addListener(
             mapInstanceRef.current,
             'zoom_changed',
             () => {
               if (mapInstanceRef.current) {
                 setCurrentZoom(mapInstanceRef.current.getZoom());
               }
             }
           );

           const boundsListener = window.google.maps.event.addListener(
             mapInstanceRef.current,
             'bounds_changed',
             () => {
               if (mapInstanceRef.current) {
                 setMapBounds(mapInstanceRef.current.getBounds());
               }
             }
           );

           return () => {
             window.google.maps.event.removeListener(zoomListener);
             window.google.maps.event.removeListener(boundsListener);
           };
         }, [mapLoaded]);

  // Format duration
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours === 0) return `${remainingMinutes}m`;
    if (remainingMinutes === 0) return `${hours}h`;
    return `${hours}h ${remainingMinutes}m`;
  };

  // Format last played date
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

     if (isLoading || isMapInitializing) {
     return (
       <div className={`flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-lg ${className}`}>
         <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
           <Loader2 className="h-5 w-5 animate-spin" />
           <span>{isMapInitializing ? 'Initializing map...' : 'Loading map...'}</span>
         </div>
       </div>
     );
   }

  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load courts: {error}
        </AlertDescription>
      </Alert>
    );
  }

     if (mapError) {
     return (
       <Alert variant="destructive" className={className}>
         <AlertCircle className="h-4 w-4" />
         <AlertDescription>
           {mapError}
         </AlertDescription>
       </Alert>
     );
   }

   

  const courtsWithCoordinates = courts.filter(court => court.coordinates);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Map Container */}
      <div className="relative">
        <div
          ref={mapRef}
          className="w-full h-96 rounded-lg border border-gray-200 dark:border-gray-700"
        />
        
                       {/* Map Controls Overlay */}
               <div className="absolute top-4 right-4 space-y-2">
                 <Button
                   size="sm"
                   onClick={handleGoToUserLocation}
                   disabled={!userLocation || isLoadingLocation}
                   className="bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800"
                 >
                   {isLoadingLocation ? (
                     <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                   ) : (
                     <Navigation className="h-4 w-4 mr-1" />
                   )}
                   {isMobile ? '' : (isLoadingLocation ? 'Getting location...' : 'My Location')}
                 </Button>
                 
                 {/* Mobile Zoom Controls */}
                 {isMobile && (
                   <div className="flex flex-col gap-1">
                     <Button
                       size="sm"
                       onClick={handleZoomIn}
                       className="bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800 p-2"
                     >
                       <ZoomIn className="h-4 w-4" />
                     </Button>
                     <Button
                       size="sm"
                       onClick={handleZoomOut}
                       className="bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800 p-2"
                     >
                       <ZoomOut className="h-4 w-4" />
                     </Button>
                     <Button
                       size="sm"
                       onClick={handleResetView}
                       className="bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800 p-2"
                       title="Reset view"
                     >
                       <RotateCcw className="h-4 w-4" />
                     </Button>
                   </div>
                 )}

                 {/* Desktop Map Controls */}
                 {!isMobile && (
                   <div className="flex flex-col gap-1">
                     <Button
                       size="sm"
                       onClick={handleZoomIn}
                       className="bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800 p-2"
                       title="Zoom in"
                     >
                       <ZoomIn className="h-4 w-4" />
                     </Button>
                     <Button
                       size="sm"
                       onClick={handleZoomOut}
                       className="bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800 p-2"
                       title="Zoom out"
                     >
                       <ZoomOut className="h-4 w-4" />
                     </Button>
                     <Button
                       size="sm"
                       onClick={handleResetView}
                       className="bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800 p-2"
                       title="Reset view"
                     >
                       <RotateCcw className="h-4 w-4" />
                     </Button>
                     <Button
                       size="sm"
                       onClick={handlePanToCenter}
                       className="bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800 p-2"
                       title="Center map"
                     >
                       <Move className="h-4 w-4" />
                     </Button>
                   </div>
                 )}
               </div>

                 {/* Courts without coordinates warning */}
         {courts.length > 0 && courtsWithCoordinates.length === 0 && (
           <div className="absolute bottom-4 left-4 right-4">
             <Alert>
               <Info className="h-4 w-4" />
               <AlertDescription>
                 No courts with location data found. Add coordinates to see courts on the map.
               </AlertDescription>
             </Alert>
           </div>
         )}

                   {/* Partial coordinates warning */}
          {courts.length > 0 && courtsWithCoordinates.length > 0 && courtsWithCoordinates.length < courts.length && (
            <div className="absolute bottom-4 left-4 right-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  {courts.length - courtsWithCoordinates.length} court{courts.length - courtsWithCoordinates.length === 1 ? '' : 's'} without location data
                </AlertDescription>
              </Alert>
            </div>
          )}
      </div>

                   {/* Selected Court Details */}
             {selectedCourt && !isMobile && (
               <Card>
                 <CardHeader className="pb-3">
                   <div className="flex items-start justify-between">
                     <div className="flex-1 min-w-0">
                       <CardTitle className="text-lg truncate">
                         {selectedCourt.clubName}
                       </CardTitle>
                       <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                         {selectedCourt.clubLocation || "No location"}
                       </p>
                     </div>
                     <Button
                       variant="ghost"
                       size="sm"
                       className={`p-1 h-auto transition-colors ${
                         isFavorite(selectedCourt.clubName, selectedCourt.clubLocation)
                           ? 'text-yellow-500 hover:text-yellow-600'
                           : 'text-gray-400 hover:text-yellow-500'
                       }`}
                       onClick={() => handleToggleFavorite(selectedCourt)}
                     >
                       <MapPin className="h-4 w-4" />
                     </Button>
                   </div>
                 </CardHeader>
                 <CardContent className="pt-0">
                   <div className="space-y-3">
                     <div className="flex items-center justify-between text-sm">
                       <span className="text-gray-600 dark:text-gray-400">
                         {selectedCourt.playCount} {selectedCourt.playCount === 1 ? 'session' : 'sessions'}
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

             {/* Mobile Court Details Sheet */}
             {isMobile && selectedCourt && (
               <Sheet open={showMobileDetails} onOpenChange={setShowMobileDetails}>
                 <SheetContent side="bottom" className="h-[60vh]">
                   <SheetHeader className="pb-4">
                     <div className="flex items-start justify-between">
                       <div className="flex-1 min-w-0">
                         <SheetTitle className="text-lg truncate">
                           {selectedCourt.clubName}
                         </SheetTitle>
                         <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                           {selectedCourt.clubLocation || "No location"}
                         </p>
                       </div>
                       <Button
                         variant="ghost"
                         size="sm"
                         onClick={handleCloseMobileDetails}
                         className="p-1 h-auto"
                       >
                         <X className="h-4 w-4" />
                       </Button>
                     </div>
                   </SheetHeader>
                   
                   <div className="space-y-4">
                     <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                         <span className="text-sm font-medium">
                           {selectedCourt.playCount} {selectedCourt.playCount === 1 ? 'session' : 'sessions'}
                         </span>
                         <span className="text-sm text-gray-600 dark:text-gray-400">
                           {formatDuration(selectedCourt.totalDuration)}
                         </span>
                       </div>
                       <Button
                         variant="ghost"
                         size="sm"
                         className={`p-2 transition-colors ${
                           isFavorite(selectedCourt.clubName, selectedCourt.clubLocation)
                             ? 'text-yellow-500 hover:text-yellow-600'
                             : 'text-gray-400 hover:text-yellow-500'
                         }`}
                         onClick={() => handleToggleFavorite(selectedCourt)}
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

             {/* Courts Summary */}
       <div className="text-sm text-gray-600 dark:text-gray-400">
         {courtsWithCoordinates.length > 0 ? (
           <span>
             Showing {courtsWithCoordinates.length} of {courts.length} courts on map
             {courts.length !== courtsWithCoordinates.length && (
               <span className="text-gray-500">
                 {" "}({courts.length - courtsWithCoordinates.length} without coordinates)
               </span>
             )}
             {!isMobile && (
               <span className="text-gray-500 ml-2">
                 • Zoom: {currentZoom}
               </span>
             )}
           </span>
         ) : courts.length > 0 ? (
           <span>
             No courts with location data available. 
             <span className="text-gray-500 ml-1">
               Add coordinates to see courts on the map.
             </span>
           </span>
         ) : (
           <span>No courts available</span>
         )}
       </div>
    </div>
  );
} 