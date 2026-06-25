import {
  DISCOVERY_MAP_DEFAULT_CENTER,
  DISCOVERY_MAP_DEFAULT_ZOOM,
  DISCOVERY_MAP_MAX_ZOOM,
  DISCOVERY_MAP_MIN_ZOOM,
  DISCOVERY_MAP_TILE_SIZE,
  DiscoveryMapFallbackPresentational,
  type DiscoveryMapMarkerPosition,
  DiscoveryMapPresentational,
  type DiscoveryMapPresentationalProps,
  type DiscoveryMapTilePosition,
} from "@unveiled/design-system";
import { AlertTriangle, MapPin, Minus, Plus, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createDiscoveryMapModel,
  DEFAULT_DISCOVERY_MAP_TILE_URL,
  type DiscoveryMapLoadState,
  hasDiscoveryMapCoordinates,
} from "~/lib/discovery-map";
import type { EventCardView } from "~/lib/unveiled-view-models";

const MAP_FORM_ID = "container";

function clampZoom(value: number) {
  return Math.max(
    DISCOVERY_MAP_MIN_ZOOM,
    Math.min(DISCOVERY_MAP_MAX_ZOOM, value),
  );
}

function toWorldCoordinates(lat: number, lng: number, zoom: number) {
  const scale = DISCOVERY_MAP_TILE_SIZE * 2 ** zoom;
  const sinLat = Math.sin((lat * Math.PI) / 180);
  return {
    x: ((lng + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * scale,
  };
}

function fromWorldCoordinates(x: number, y: number, zoom: number) {
  const scale = DISCOVERY_MAP_TILE_SIZE * 2 ** zoom;
  const lng = (x / scale) * 360 - 180;
  const n = Math.PI - (2 * Math.PI * y) / scale;
  const lat = (180 / Math.PI) * Math.atan(Math.sinh(n));
  return { lat, lng };
}

function buildTileUrl(template: string, x: number, y: number, zoom: number) {
  return template
    .replace("{z}", String(zoom))
    .replace("{x}", String(x))
    .replace("{y}", String(y));
}

function buildMapTiles(
  center: { lat: number; lng: number },
  zoom: number,
  template: string,
): DiscoveryMapTilePosition[] {
  const centerWorld = toWorldCoordinates(center.lat, center.lng, zoom);
  const centerTileX = Math.floor(centerWorld.x / DISCOVERY_MAP_TILE_SIZE);
  const centerTileY = Math.floor(centerWorld.y / DISCOVERY_MAP_TILE_SIZE);
  const tiles: DiscoveryMapTilePosition[] = [];
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      const tileX = centerTileX - 2 + col;
      const tileY = centerTileY - 2 + row;
      tiles.push({
        id: `${tileX}:${tileY}`,
        src: buildTileUrl(template, tileX, tileY, zoom),
        style: {
          left: `calc(50% + ${(tileX * DISCOVERY_MAP_TILE_SIZE - centerWorld.x).toFixed(2)}px)`,
          top: `calc(50% + ${(tileY * DISCOVERY_MAP_TILE_SIZE - centerWorld.y).toFixed(2)}px)`,
        },
      });
    }
  }
  return tiles;
}

type DiscoveryMapPanelProps = {
  events: EventCardView[];
  surface: "public" | "member";
  tileUrlTemplate?: string;
  loadStateOverride?: DiscoveryMapLoadState;
  selectedMarkerIdOverride?: string | null;
  actionLabel: string;
  emptyHint?: string;
  onOpenEvent: (event: EventCardView) => void;
  onRetry?: () => void;
};

export function DiscoveryMapPanel({
  events,
  surface,
  tileUrlTemplate,
  loadStateOverride,
  selectedMarkerIdOverride,
  actionLabel,
  emptyHint = "Select an event to preview details and continue to booking.",
  onOpenEvent,
  onRetry,
}: DiscoveryMapPanelProps) {
  const resolvedTileUrlTemplate =
    tileUrlTemplate ?? DEFAULT_DISCOVERY_MAP_TILE_URL;
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(
    selectedMarkerIdOverride ?? null,
  );
  const [center, setCenter] = useState(DISCOVERY_MAP_DEFAULT_CENTER);
  const [zoom, setZoom] = useState(DISCOVERY_MAP_DEFAULT_ZOOM);
  const [internalLoadState, setInternalLoadState] =
    useState<DiscoveryMapLoadState>("loading");

  const centerRef = useRef(center);
  useEffect(() => {
    centerRef.current = center;
  }, [center]);

  const animationFrameIdRef = useRef<number | null>(null);
  const lastPannedIdRef = useRef<string | null>(null);
  const mapViewportRef = useRef<HTMLDivElement | null>(null);
  const dragState = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startCenterWorld: { x: number; y: number };
  } | null>(null);

  const panTo = useCallback((targetLat: number, targetLng: number) => {
    if (animationFrameIdRef.current !== null) {
      cancelAnimationFrame(animationFrameIdRef.current);
    }
    const duration = 400;
    const startTime = performance.now();
    const startLat = centerRef.current.lat;
    const startLng = centerRef.current.lng;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - (-2 * progress + 2) ** 3 / 2;
      setCenter({
        lat: startLat + (targetLat - startLat) * ease,
        lng: startLng + (targetLng - startLng) * ease,
      });
      if (progress < 1) {
        animationFrameIdRef.current = requestAnimationFrame(animate);
      } else {
        animationFrameIdRef.current = null;
      }
    };
    animationFrameIdRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    if (loadStateOverride) {
      setInternalLoadState(loadStateOverride);
      return;
    }
    setInternalLoadState("loading");
    const timeout = window.setTimeout(() => {
      setInternalLoadState("ready");
    }, 450);
    return () => window.clearTimeout(timeout);
  }, [loadStateOverride]);

  const loadState = loadStateOverride ?? internalLoadState;
  useEffect(() => {
    if (selectedMarkerIdOverride !== undefined) {
      setSelectedMarkerId(selectedMarkerIdOverride);
    }
  }, [selectedMarkerIdOverride]);

  const model = useMemo(
    () =>
      createDiscoveryMapModel({
        events,
        selectedMarkerId,
        loadState,
      }),
    [events, loadState, selectedMarkerId],
  );

  useEffect(() => {
    if (!selectedMarkerIdOverride) {
      lastPannedIdRef.current = null;
      return;
    }
    if (selectedMarkerIdOverride === lastPannedIdRef.current) return;
    const marker = model.readyMarkers.find(
      (m) => m.id === selectedMarkerIdOverride,
    );
    if (marker) {
      lastPannedIdRef.current = selectedMarkerIdOverride;
      panTo(marker.lat, marker.lng);
    }
  }, [selectedMarkerIdOverride, model.readyMarkers, panTo]);

  useEffect(() => {
    if (model.readyMarkers.length === 0) return;
    const totals = model.readyMarkers.reduce(
      (accumulator, marker) => ({
        lat: accumulator.lat + marker.lat,
        lng: accumulator.lng + marker.lng,
      }),
      { lat: 0, lng: 0 },
    );
    setCenter({
      lat: totals.lat / model.readyMarkers.length,
      lng: totals.lng / model.readyMarkers.length,
    });
    setZoom(DISCOVERY_MAP_DEFAULT_ZOOM);
  }, [model.readyMarkers]);

  useEffect(() => {
    if (
      selectedMarkerId &&
      !model.readyMarkers.some((marker) => marker.id === selectedMarkerId)
    ) {
      setSelectedMarkerId(null);
    }
  }, [model.readyMarkers, selectedMarkerId]);

  useEffect(() => {
    const element = mapViewportRef.current;
    if (!element) return;
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      if (animationFrameIdRef.current !== null) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
      const delta = event.deltaY < 0 ? 1 : -1;
      setZoom((currentZoom) => clampZoom(currentZoom + delta));
    };
    element.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      element.removeEventListener("wheel", handleWheel);
      if (animationFrameIdRef.current !== null) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, []);

  const tiles = buildMapTiles(center, zoom, resolvedTileUrlTemplate);
  const centerWorld = toWorldCoordinates(center.lat, center.lng, zoom);
  const markerPositions: DiscoveryMapMarkerPosition[] = model.readyMarkers.map(
    (marker) => {
      const markerWorld = toWorldCoordinates(marker.lat, marker.lng, zoom);
      return {
        id: marker.id,
        title: marker.title,
        neighborhood: marker.neighborhood,
        mapLabel: marker.mapLabel,
        style: {
          left: `calc(50% + ${(markerWorld.x - centerWorld.x).toFixed(2)}px)`,
          top: `calc(50% + ${(markerWorld.y - centerWorld.y).toFixed(2)}px)`,
        },
      };
    },
  );

  if (loadState !== "ready" || !model.hasMarkers) {
    return (
      <DiscoveryMapFallbackPresentational
        title={model.fallbackTitle}
        text={model.fallbackMessage}
        retryLabel="Retry Connection"
        alertIcon={<AlertTriangle className="ui-100c22d5" />}
        onRetry={loadState === "error" ? onRetry : undefined}
      />
    );
  }

  const selectedMarker = model.selectedMarker;
  const selectedEvent = selectedMarker
    ? (events.find((event) => event.id === selectedMarker.id) ?? null)
    : null;
  const surfaceLabel =
    surface === "public" ? "Public discovery map" : "Member discovery map";
  const regionLabel = surfaceLabel;
  const markerCountLabel =
    model.readyMarkers.length === 1
      ? "1 event on map"
      : `${model.readyMarkers.length} events on map`;

  const presentationalProps: DiscoveryMapPresentationalProps = {
    surface,
    formId: MAP_FORM_ID,
    regionLabel,
    surfaceLabel,
    markerCountLabel,
    emptyHint,
    actionLabel,
    tileUrlTemplate: resolvedTileUrlTemplate,
    tiles,
    markerPositions,
    selectedMarkerId: selectedMarkerId ?? null,
    selectedEvent: selectedEvent
      ? {
          id: selectedEvent.id,
          title: selectedEvent.title,
          category: selectedEvent.category,
          neighborhood: selectedEvent.neighborhood,
          dateLabel: selectedEvent.dateLabel,
        }
      : null,
    hasMarkers: model.hasMarkers,
    plusIcon: <Plus className="ui-100c22d5" />,
    minusIcon: <Minus className="ui-100c22d5" />,
    mapPinIcon: <MapPin className="ui-2bd43fb5" />,
    closeIcon: <X className="ui-100c22d5" />,
    onMarkerClick: (id) => setSelectedMarkerId(id),
    onClearSelection: () => setSelectedMarkerId(null),
    onOpenSelected: () => {
      if (selectedEvent) onOpenEvent(selectedEvent);
    },
    onZoomIn: () => setZoom((currentZoom) => clampZoom(currentZoom + 1)),
    onZoomOut: () => setZoom((currentZoom) => clampZoom(currentZoom - 1)),
    onResetView: () => {
      if (model.readyMarkers.length === 0) return;
      const totals = model.readyMarkers.reduce(
        (accumulator, marker) => ({
          lat: accumulator.lat + marker.lat,
          lng: accumulator.lng + marker.lng,
        }),
        { lat: 0, lng: 0 },
      );
      setCenter({
        lat: totals.lat / model.readyMarkers.length,
        lng: totals.lng / model.readyMarkers.length,
      });
      setZoom(DISCOVERY_MAP_DEFAULT_ZOOM);
    },
  };

  return (
    <DiscoveryMapViewport
      {...presentationalProps}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        if (animationFrameIdRef.current !== null) {
          cancelAnimationFrame(animationFrameIdRef.current);
          animationFrameIdRef.current = null;
        }
        dragState.current = {
          pointerId: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          startCenterWorld: toWorldCoordinates(center.lat, center.lng, zoom),
        };
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        if (
          !dragState.current ||
          dragState.current.pointerId !== event.pointerId
        ) {
          return;
        }
        const deltaX = event.clientX - dragState.current.startX;
        const deltaY = event.clientY - dragState.current.startY;
        setCenter(
          fromWorldCoordinates(
            dragState.current.startCenterWorld.x - deltaX,
            dragState.current.startCenterWorld.y - deltaY,
            zoom,
          ),
        );
      }}
      onPointerUp={(event) => {
        if (dragState.current?.pointerId === event.pointerId) {
          dragState.current = null;
        }
      }}
      onPointerCancel={(event) => {
        if (dragState.current?.pointerId === event.pointerId) {
          dragState.current = null;
        }
      }}
      viewportRef={mapViewportRef}
    />
  );
}

function DiscoveryMapViewport(
  props: DiscoveryMapPresentationalProps & {
    onPointerDown: React.PointerEventHandler<HTMLDivElement>;
    onPointerMove: React.PointerEventHandler<HTMLDivElement>;
    onPointerUp: React.PointerEventHandler<HTMLDivElement>;
    onPointerCancel: React.PointerEventHandler<HTMLDivElement>;
    viewportRef: React.RefObject<HTMLDivElement | null>;
  },
) {
  const {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    viewportRef,
    ...presentationalProps
  } = props;
  return (
    <div
      ref={viewportRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      <DiscoveryMapPresentational {...presentationalProps} />
    </div>
  );
}

export function DiscoveryMapFallback({
  title,
  text,
  onRetry,
}: {
  title: string;
  text: string;
  onRetry?: () => void;
}) {
  return (
    <DiscoveryMapFallbackPresentational
      title={title}
      text={text}
      retryLabel="Retry Connection"
      alertIcon={<AlertTriangle className="ui-100c22d5" />}
      onRetry={onRetry}
    />
  );
}

export function discoveryMapHasReadyMarkers(events: EventCardView[]) {
  return events.some(hasDiscoveryMapCoordinates);
}
