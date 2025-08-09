import { Marker } from "react-map-gl/mapbox";

interface CourtMarkerProps {
  longitude: number;
  latitude: number;
  isFavorite?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  className?: string;
  ariaLabel?: string;
}

export default function CourtMarker({
  longitude,
  latitude,
  isFavorite = false,
  isSelected = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
  className = "",
  ariaLabel = "Court marker",
}: CourtMarkerProps) {
  // Use currentColor for SVG fill/stroke so Tailwind text-* controls the color
  const baseColor = isFavorite ? "text-yellow-500" : "text-primary";
  const selectedRing = isSelected ? "ring-2 ring-offset-2 ring-primary scale-105" : "";

  return (
    <Marker longitude={longitude} latitude={latitude} anchor="bottom">
      <button
        type="button"
        aria-label={ariaLabel}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={`rounded-full bg-transparent p-0 shadow-none hover:shadow-none transition-transform hover:scale-110 ${selectedRing} ${className}`}
        style={{ lineHeight: 0 }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className={`h-7 w-7 ${baseColor} drop-shadow-sm`}
        >
          <path
            d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
            strokeWidth="1.5"
            fill="currentColor"
            stroke="currentColor"
          />
          <circle cx="12" cy="9" r="2.5" fill="white" opacity="0.9" />
        </svg>
      </button>
    </Marker>
  );
}


