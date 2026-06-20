import type { EventCardView } from "~/lib/unveiled-view-models";

export type DiscoveryMapSurface = "public" | "member";

export type DiscoveryMapLoadState = "loading" | "ready" | "error" | "missing";

export const DEFAULT_DISCOVERY_MAP_TILE_URL =
  "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

export type DiscoveryMapProviderConfig = {
  tileUrlTemplate: string;
  available: boolean;
};

export type DiscoveryMapMarker = {
  id: string;
  title: string;
  partnerName: string;
  category: string;
  dateLabel: string;
  neighborhood: string;
  address: string;
  mapLabel: string;
  lat: number;
  lng: number;
  position: {
    left: string;
    top: string;
  };
};

export type DiscoveryMapModel = {
  readyMarkers: DiscoveryMapMarker[];
  selectedMarker: DiscoveryMapMarker | null;
  markerLabels: string[];
  hasMarkers: boolean;
  fallbackTitle: string;
  fallbackMessage: string;
};

const berlinBounds = {
  minLat: 52.35,
  maxLat: 52.65,
  minLng: 13.2,
  maxLng: 13.65,
};

export function readDiscoveryMapProviderConfig(
  env: { PUBLIC_MAP_TILE_URL?: string | undefined } = {},
): DiscoveryMapProviderConfig {
  const configured = env.PUBLIC_MAP_TILE_URL?.trim();
  const tileUrlTemplate = configured || DEFAULT_DISCOVERY_MAP_TILE_URL;
  return {
    tileUrlTemplate,
    available:
      tileUrlTemplate.includes("{z}") &&
      tileUrlTemplate.includes("{x}") &&
      tileUrlTemplate.includes("{y}"),
  };
}

export function hasDiscoveryMapCoordinates(
  event: Pick<EventCardView, "lat" | "lng">,
) {
  return typeof event.lat === "number" && typeof event.lng === "number";
}

function hashDiscoveryMapSeed(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 10_000;
  }
  return hash;
}

export function deriveDiscoveryMapCoordinates(event: {
  id: string;
  address: string;
  neighborhood: string;
}) {
  const seed = hashDiscoveryMapSeed(
    `${event.id}|${event.address}|${event.neighborhood}`,
  );
  const latOffset = (seed % 2600) / 100_000;
  const lngOffset = ((seed * 7) % 3600) / 100_000;

  return {
    lat: 52.39 + latOffset,
    lng: 13.24 + lngOffset,
  };
}

export function projectDiscoveryMapPosition(lat: number, lng: number) {
  const horizontalRange = berlinBounds.maxLng - berlinBounds.minLng;
  const verticalRange = berlinBounds.maxLat - berlinBounds.minLat;
  const normalizedX = (lng - berlinBounds.minLng) / horizontalRange;
  const normalizedY = (berlinBounds.maxLat - lat) / verticalRange;
  const clampedX = Math.max(0.06, Math.min(0.94, normalizedX));
  const clampedY = Math.max(0.08, Math.min(0.92, normalizedY));

  return {
    left: `${clampedX * 100}%`,
    top: `${clampedY * 100}%`,
  };
}

export function createDiscoveryMapModel(input: {
  events: EventCardView[];
  selectedMarkerId?: string | null;
  loadState: DiscoveryMapLoadState;
}): DiscoveryMapModel {
  const readyMarkers = input.events.map((event) => {
    const fallbackCoordinates = deriveDiscoveryMapCoordinates(event);
    const lat =
      typeof event.lat === "number" ? event.lat : fallbackCoordinates.lat;
    const lng =
      typeof event.lng === "number" ? event.lng : fallbackCoordinates.lng;

    return {
      id: event.id,
      title: event.title,
      partnerName: event.partnerName,
      category: event.category,
      dateLabel: event.dateLabel,
      neighborhood: event.neighborhood,
      address: event.address,
      mapLabel: event.mapLabel,
      lat,
      lng,
      position: projectDiscoveryMapPosition(lat, lng),
    };
  });

  const selectedMarker =
    readyMarkers.find((marker) => marker.id === input.selectedMarkerId) ?? null;

  const markerLabels = readyMarkers.map((marker) => marker.mapLabel);

  if (input.loadState === "missing") {
    return {
      readyMarkers,
      selectedMarker,
      markerLabels,
      hasMarkers: readyMarkers.length > 0,
      fallbackTitle: "Map provider missing",
      fallbackMessage:
        "The map is unavailable in this environment. Events are still listed below.",
    };
  }

  if (input.loadState === "error") {
    return {
      readyMarkers,
      selectedMarker,
      markerLabels,
      hasMarkers: readyMarkers.length > 0,
      fallbackTitle: "Map connection failed",
      fallbackMessage:
        "The interactive map could not be loaded. Events are still listed below.",
    };
  }

  if (input.loadState === "loading") {
    return {
      readyMarkers,
      selectedMarker,
      markerLabels,
      hasMarkers: readyMarkers.length > 0,
      fallbackTitle: "Loading map",
      fallbackMessage: "Loading map tiles and preparing events.",
    };
  }

  if (readyMarkers.length === 0) {
    return {
      readyMarkers,
      selectedMarker,
      markerLabels,
      hasMarkers: false,
      fallbackTitle: "No map-ready events",
      fallbackMessage:
        "No visible events currently have map positions. The event list remains usable.",
    };
  }

  return {
    readyMarkers,
    selectedMarker,
    markerLabels,
    hasMarkers: true,
    fallbackTitle: "Map ready",
    fallbackMessage: "Select an event to preview the details.",
  };
}
