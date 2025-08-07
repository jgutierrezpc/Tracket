import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PlaceResult {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface PlaceDetails {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  types: string[];
}

interface PlacesAutocompleteProps {
  onPlaceSelect: (place: PlaceDetails) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}

declare global {
  interface Window {
    google: any;
  }
}

export function PlacesAutocomplete({
  onPlaceSelect,
  placeholder = "Search for a venue...",
  className = "",
  disabled = false,
  value = "",
  onChange
}: PlacesAutocompleteProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [predictions, setPredictions] = useState<PlaceResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isApiReady, setIsApiReady] = useState(false);
  const [isLoadingApi, setIsLoadingApi] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const autocompleteService = useRef<any>(null);
  const placesService = useRef<any>(null);

  // Initialize Google Places services
  useEffect(() => {
    console.log('=== PLACES AUTOCOMPLETE DEBUG ===');
    console.log('Initializing Places Autocomplete...');
    console.log('Environment variable test:');
    console.log('  import.meta.env.VITE_GOOGLE_MAPS_API_KEY:', import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
    console.log('  typeof import.meta.env.VITE_GOOGLE_MAPS_API_KEY:', typeof import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
    console.log('  import.meta.env.VITE_GOOGLE_MAPS_API_KEY length:', import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.length);
    console.log('window.google:', window.google);
    console.log('window.google?.maps:', window.google?.maps);
    console.log('window.google?.maps?.places:', window.google?.maps?.places);
    
    const loadGoogleMapsScript = () => {
      return new Promise<void>((resolve, reject) => {
        if (window.google && window.google.maps) {
          resolve();
          return;
        }

                 const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY';
         console.log('Environment variable check:');
         console.log('  import.meta.env.VITE_GOOGLE_MAPS_API_KEY:', import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
         console.log('  apiKey:', apiKey);
         console.log('  apiKey length:', apiKey.length);
         console.log('  apiKey starts with AIza:', apiKey.startsWith('AIza'));
        
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
          console.log('Google Maps script loaded successfully');
          resolve();
        };
        script.onerror = () => {
          console.error('Failed to load Google Maps script');
          reject(new Error('Failed to load Google Maps script'));
        };
        document.head.appendChild(script);
      });
    };

    const initializeServices = () => {
      if (!window.google || !window.google.maps) {
        console.warn('Google Maps not loaded');
        return false;
      }

      if (!window.google.maps.places) {
        console.warn('Google Places API not loaded');
        return false;
      }

             try {
         // Use AutocompleteService (deprecated but still functional)
         autocompleteService.current = new window.google.maps.places.AutocompleteService();
         placesService.current = new window.google.maps.places.PlacesService(
           document.createElement('div')
         );
         console.log('Places services initialized successfully');
         setIsApiReady(true);
         setIsLoadingApi(false);
         return true;
       } catch (error) {
         console.error('Error initializing Places services:', error);
         return false;
       }
    };

    const initialize = async () => {
      try {
        // Load Google Maps script if not already loaded
        await loadGoogleMapsScript();
        
        // Try to initialize services
        if (initializeServices()) {
          return;
        }

        // If not available immediately, poll until it's ready
        const pollInterval = setInterval(() => {
          console.log('Polling for Google Maps API...');
          if (initializeServices()) {
            clearInterval(pollInterval);
          }
        }, 500);

        // Cleanup after 10 seconds to avoid infinite polling
        setTimeout(() => {
          clearInterval(pollInterval);
          console.warn('Timeout waiting for Google Maps API');
          setIsLoadingApi(false);
        }, 10000);
              } catch (error) {
          console.error('Error loading Google Maps:', error);
          setIsLoadingApi(false);
        }
    };

    initialize();
  }, []);

  // Handle input changes
  const handleInputChange = useCallback(async (inputValue: string) => {
    console.log('Input changed:', inputValue);
    console.log('autocompleteService.current:', autocompleteService.current);
    console.log('isApiReady:', isApiReady);
    
    if (onChange) {
      onChange(inputValue);
    }

    if (!inputValue.trim() || !autocompleteService.current || !isApiReady) {
      console.log('No input, no autocomplete service, or API not ready');
      setPredictions([]);
      setShowDropdown(false);
      return;
    }

    setIsLoading(true);
    setShowDropdown(true);
    console.log('Making autocomplete request for:', inputValue);

    try {
      const request = {
        input: inputValue,
        types: ['establishment', 'geocode']
        // Removed country restriction to work globally
      };

                    console.log('Autocomplete request:', request);

       autocompleteService.current.getPlacePredictions(request, (results: PlaceResult[], status: string) => {
         console.log('Autocomplete response - status:', status);
         console.log('Autocomplete response - results:', results);
         
         setIsLoading(false);
         
         if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
           setPredictions(results);
           console.log('Setting predictions:', results);
         } else {
           setPredictions([]);
           console.log('No predictions found');
         }
       });
    } catch (error) {
      console.error('Error fetching predictions:', error);
      setIsLoading(false);
      setPredictions([]);
    }
  }, [onChange, isApiReady]);

  // Handle place selection
  const handlePlaceSelect = useCallback((placeId: string) => {
    console.log('Place selected, placeId:', placeId);
    if (!placesService.current) {
      console.warn('Places service not available');
      return;
    }

    const request = {
      placeId: placeId,
      fields: ['place_id', 'name', 'formatted_address', 'geometry', 'types']
    };

    console.log('Getting place details for:', placeId);
    placesService.current.getDetails(request, (place: PlaceDetails, status: string) => {
      console.log('Place details response - status:', status);
      console.log('Place details response - place:', place);
      
      if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
        console.log('Place selected successfully:', place.name);
        onPlaceSelect(place);
        setShowDropdown(false);
        setPredictions([]);
        if (onChange) {
          console.log('Calling onChange with:', place.name);
          onChange(place.name);
        }
      } else {
        console.warn('Failed to get place details, status:', status);
      }
    });
  }, [onPlaceSelect, onChange]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showDropdown || predictions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < predictions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < predictions.length) {
          handlePlaceSelect(predictions[selectedIndex].place_id);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  }, [showDropdown, predictions, selectedIndex, handlePlaceSelect]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={isApiReady ? placeholder : isLoadingApi ? "Loading Google Places API..." : "Google Places API not available"}
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || !isApiReady}
          className="pl-10 pr-4"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 animate-spin" />
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && predictions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {predictions.map((prediction, index) => (
            <div
              key={prediction.place_id}
              className={`px-4 py-3 cursor-pointer hover:bg-gray-50 ${
                index === selectedIndex ? 'bg-blue-50' : ''
              }`}
              onClick={() => handlePlaceSelect(prediction.place_id)}
            >
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900">
                    {prediction.structured_formatting.main_text}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    {prediction.structured_formatting.secondary_text}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results */}
      {showDropdown && !isLoading && predictions.length === 0 && value.trim() && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
          <div className="px-4 py-3 text-gray-500 text-sm">
            No venues found. Try a different search term.
          </div>
        </div>
      )}
    </div>
  );
}

export type { PlaceDetails, PlaceResult }; 