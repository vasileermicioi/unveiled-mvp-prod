import type {
  DiscoveryMapMarkerPosition,
  DiscoveryMapPresentationalProps,
  DiscoveryMapSelectedEvent,
  DiscoveryMapTilePosition,
} from "./discovery-map";

const TILE_SIZE = 256;

function toWorld(lat: number, lng: number, zoom: number) {
  const scale = TILE_SIZE * 2 ** zoom;
  const sinLat = Math.sin((lat * Math.PI) / 180);
  return {
    x: ((lng + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * scale,
  };
}

export function buildMockTiles(
  center: { lat: number; lng: number },
  zoom: number,
  count = 5,
  template = "https://tile.example.com/{z}/{x}/{y}.png",
): DiscoveryMapTilePosition[] {
  const centerWorld = toWorld(center.lat, center.lng, zoom);
  const centerTileX = Math.floor(centerWorld.x / TILE_SIZE);
  const centerTileY = Math.floor(centerWorld.y / TILE_SIZE);
  const tiles: DiscoveryMapTilePosition[] = [];
  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      const tileX = centerTileX - 2 + col;
      const tileY = centerTileY - 2 + row;
      tiles.push({
        id: `${tileX}:${tileY}`,
        src: template
          .replace("{z}", String(zoom))
          .replace("{x}", String(tileX))
          .replace("{y}", String(tileY)),
        style: {
          left: `calc(50% + ${(tileX * TILE_SIZE - centerWorld.x).toFixed(2)}px)`,
          top: `calc(50% + ${(tileY * TILE_SIZE - centerWorld.y).toFixed(2)}px)`,
        },
      });
    }
  }
  return tiles;
}

export interface MockMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  neighborhood: string;
  mapLabel: string;
}

export function buildMockMarkerPositions(
  markers: MockMarker[],
  center: { lat: number; lng: number },
  zoom: number,
): DiscoveryMapMarkerPosition[] {
  const centerWorld = toWorld(center.lat, center.lng, zoom);
  return markers.map((m) => {
    const w = toWorld(m.lat, m.lng, zoom);
    return {
      id: m.id,
      title: m.title,
      neighborhood: m.neighborhood,
      mapLabel: m.mapLabel,
      style: {
        left: `calc(50% + ${(w.x - centerWorld.x).toFixed(2)}px)`,
        top: `calc(50% + ${(w.y - centerWorld.y).toFixed(2)}px)`,
      },
    };
  });
}

const DEFAULT_MARKERS: MockMarker[] = [
  {
    id: "evt-1",
    lat: 52.508,
    lng: 13.41,
    title: "Late Night Jazz at Donau115",
    neighborhood: "Kreuzberg",
    mapLabel: "Donau115",
  },
  {
    id: "evt-2",
    lat: 52.535,
    lng: 13.395,
    title: "Vinyl Listening Room",
    neighborhood: "Mitte",
    mapLabel: "SchwuZ",
  },
  {
    id: "evt-3",
    lat: 52.499,
    lng: 13.43,
    title: "Experimental Sound Salon",
    neighborhood: "Friedrichshain",
    mapLabel: "Berghain Kantine",
  },
];

export function makeMockDiscoveryMapProps(
  overrides: Partial<DiscoveryMapPresentationalProps> = {},
): DiscoveryMapPresentationalProps {
  const center = { lat: 52.52, lng: 13.405 };
  const zoom = 13;
  const markers = DEFAULT_MARKERS;
  const tiles = buildMockTiles(center, zoom);
  const markerPositions = buildMockMarkerPositions(markers, center, zoom);
  return {
    surface: "public",
    formId: "discovery-map-mock",
    regionLabel: "Public discovery map",
    surfaceLabel: "Public discovery map",
    markerCountLabel: `${markers.length} events on map`,
    emptyHint: "Select an event to preview details and continue to booking.",
    actionLabel: "View event",
    tileUrlTemplate: "https://tile.example.com/{z}/{x}/{y}.png",
    tiles,
    markerPositions,
    selectedMarkerId: null,
    selectedEvent: null,
    hasMarkers: markers.length > 0,
    plusIcon: (
      // source: lucide-static
      <svg
        aria-hidden="true"
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
    minusIcon: (
      // source: lucide-static
      <svg
        aria-hidden="true"
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
    mapPinIcon: (
      // source: lucide-static
      <svg
        aria-hidden="true"
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M12 22s8-7.6 8-13a8 8 0 1 0-16 0c0 5.4 8 13 8 13z" />
        <circle cx="12" cy="9" r="2.5" />
      </svg>
    ),
    closeIcon: (
      // source: lucide-static
      <svg
        aria-hidden="true"
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line x1="6" y1="6" x2="18" y2="18" />
        <line x1="6" y1="18" x2="18" y2="6" />
      </svg>
    ),
    onMarkerClick: () => undefined,
    onClearSelection: () => undefined,
    onOpenSelected: () => undefined,
    onZoomIn: () => undefined,
    onZoomOut: () => undefined,
    onResetView: () => undefined,
    ...overrides,
  };
}

export function buildMockSelectedEvent(
  markers: MockMarker[],
  selectedId: string,
): DiscoveryMapSelectedEvent | null {
  const m = markers.find((marker) => marker.id === selectedId);
  if (!m) return null;
  return {
    id: m.id,
    title: m.title,
    category: "Music",
    neighborhood: m.neighborhood,
    dateLabel: "Fri 24 Oct · 21:00",
  };
}

export const mockDiscoveryMapMarkers = DEFAULT_MARKERS;
