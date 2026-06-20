import { AlertTriangle, MapPin, Minus, Plus, RefreshCw, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@unveiled/design-system";
import { Panel, StatePanel } from "@unveiled/design-system";
import {
  createDiscoveryMapModel,
  DEFAULT_DISCOVERY_MAP_TILE_URL,
  type DiscoveryMapLoadState,
  hasDiscoveryMapCoordinates,
} from "~/lib/discovery-map";
import type { EventCardView } from "~/lib/unveiled-view-models";
import { cn } from "@unveiled/design-system/lib/utils";

const MAP_MIN_ZOOM = 10;
const MAP_MAX_ZOOM = 17;
const MAP_DEFAULT_ZOOM = 13;
const MAP_TILE_SIZE = 256;
const MAP_DEFAULT_CENTER = { lat: 52.52, lng: 13.405 };

type DiscoveryMapPanelProps = {
  events: EventCardView[];
  surface: "public" | "member";
  tileUrlTemplate?: string;
  loadStateOverride?: DiscoveryMapLoadState;
  selectedMarkerIdOverride?: string | null;
  actionLabel: string;
  onOpenEvent: (event: EventCardView) => void;
  onRetry?: () => void;
};

function toWorldCoordinates(lat: number, lng: number, zoom: number) {
  const scale = MAP_TILE_SIZE * 2 ** zoom;
  const sinLat = Math.sin((lat * Math.PI) / 180);
  return {
    x: ((lng + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * scale,
  };
}

function fromWorldCoordinates(x: number, y: number, zoom: number) {
  const scale = MAP_TILE_SIZE * 2 ** zoom;
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

function clampZoom(value: number) {
  return Math.max(MAP_MIN_ZOOM, Math.min(MAP_MAX_ZOOM, value));
}

function buildMapTiles(center: { lat: number; lng: number }, zoom: number) {
  const centerWorld = toWorldCoordinates(center.lat, center.lng, zoom);
  const centerTileX = Math.floor(centerWorld.x / MAP_TILE_SIZE);
  const centerTileY = Math.floor(centerWorld.y / MAP_TILE_SIZE);

  return Array.from({ length: 5 }, (_, rowIndex) =>
    Array.from({ length: 5 }, (_, columnIndex) => {
      const tileX = centerTileX - 2 + columnIndex;
      const tileY = centerTileY - 2 + rowIndex;

      return {
        id: `${tileX}:${tileY}`,
        tileX,
        tileY,
        left: `calc(50% + ${(tileX * MAP_TILE_SIZE - centerWorld.x).toFixed(2)}px)`,
        top: `calc(50% + ${(tileY * MAP_TILE_SIZE - centerWorld.y).toFixed(2)}px)`,
      };
    }),
  ).flat();
}

export function DiscoveryMapPanel({
  events,
  surface,
  tileUrlTemplate,
  loadStateOverride,
  selectedMarkerIdOverride,
  actionLabel,
  onOpenEvent,
  onRetry,
}: DiscoveryMapPanelProps) {
  const resolvedTileUrlTemplate =
    tileUrlTemplate ?? DEFAULT_DISCOVERY_MAP_TILE_URL;
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(
    selectedMarkerIdOverride ?? null,
  );
  const [center, setCenter] = useState(MAP_DEFAULT_CENTER);
  const [zoom, setZoom] = useState(MAP_DEFAULT_ZOOM);
  const [internalLoadState, setInternalLoadState] =
    useState<DiscoveryMapLoadState>("loading");
  const mapViewportRef = useRef<HTMLDivElement | null>(null);
  const dragState = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startCenterWorld: { x: number; y: number };
  } | null>(null);

  const centerRef = useRef(center);
  useEffect(() => {
    centerRef.current = center;
  }, [center]);

  const animationFrameIdRef = useRef<number | null>(null);
  const lastPannedIdRef = useRef<string | null>(null);

  const panTo = useCallback((targetLat: number, targetLng: number) => {
    if (animationFrameIdRef.current !== null) {
      cancelAnimationFrame(animationFrameIdRef.current);
    }

    const duration = 400; // ms
    const startTime = performance.now();
    const startLat = centerRef.current.lat;
    const startLng = centerRef.current.lng;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // easeInOutCubic
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
    setZoom(MAP_DEFAULT_ZOOM);
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

  const tiles = buildMapTiles(center, zoom);
  const centerWorld = toWorldCoordinates(center.lat, center.lng, zoom);
  const markerPositions = model.readyMarkers.map((marker) => {
    const markerWorld = toWorldCoordinates(marker.lat, marker.lng, zoom);
    return {
      ...marker,
      style: {
        left: `calc(50% + ${(markerWorld.x - centerWorld.x).toFixed(2)}px)`,
        top: `calc(50% + ${(markerWorld.y - centerWorld.y).toFixed(2)}px)`,
      },
    };
  });

  if (loadState !== "ready" || !model.hasMarkers) {
    const retryAction =
      loadState === "error" ? (
        <Button type="button" variant="secondary" onClick={onRetry}>
          <RefreshCw />
          Retry Connection
        </Button>
      ) : undefined;

    return (
      <Panel tone="cream" shadow={false} className="overflow-hidden p-0">
        <div className="relative min-h-[26rem] flex items-center justify-center border-[12px] border-brand-cream bg-brand-grey p-5 text-center">
          <div className="max-w-md space-y-4">
            <p className="headline-md text-brand-dark">{model.fallbackTitle}</p>
            <p className="text-sm font-bold uppercase tracking-widest text-brand-dark opacity-60">
              {model.fallbackMessage}
            </p>
            {retryAction}
          </div>
        </div>
      </Panel>
    );
  }

  const selectedMarker = model.selectedMarker;
  const selectedEvent = selectedMarker
    ? (events.find((event) => event.id === selectedMarker.id) ?? null)
    : null;
  const surfaceLabel =
    surface === "public" ? "Public discovery map" : "Member discovery map";
  const markerCountLabel =
    model.readyMarkers.length === 1
      ? "1 event on map"
      : `${model.readyMarkers.length} events on map`;
  const mapHeadingId = `discovery-map-heading-${surface}`;
  const mapRegionLabel =
    surface === "public" ? "Public discovery map" : "Member discovery map";

  return (
    <Panel tone="cream" shadow={false} className="overflow-hidden p-0">
      <h2 id={mapHeadingId} className="sr-only">
        {mapRegionLabel}
      </h2>
      <div
        ref={mapViewportRef}
        role="region"
        aria-labelledby={mapHeadingId}
        className="relative min-h-[26rem] overflow-hidden border-[12px] border-brand-cream bg-brand-grey touch-none"
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
      >
        <div className="absolute inset-0 cursor-grab active:cursor-grabbing">
          {tiles.map((tile) => (
            <img
              key={tile.id}
              alt=""
              aria-hidden="true"
              src={buildTileUrl(
                resolvedTileUrlTemplate,
                tile.tileX,
                tile.tileY,
                zoom,
              )}
              className="absolute h-64 w-64 max-w-none select-none object-cover"
              draggable={false}
              onDragStart={(event) => event.preventDefault()}
              style={{
                left: tile.left,
                top: tile.top,
              }}
            />
          ))}
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(254,255,226,0.06),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),transparent_18%,transparent_82%,rgba(255,255,255,0.08))]" />
        <div className="absolute left-4 top-4 z-20 max-w-[min(22rem,calc(100%-6rem))] border-4 border-brand-dark bg-white/95 px-3 py-2 shadow-[6px_6px_0_0_#202621] backdrop-blur-sm md:max-w-[min(26rem,calc(100%-6rem))] md:px-4 md:py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="border-2 border-brand-dark bg-brand-dark px-2 py-1 text-[9px] font-black uppercase tracking-[0.25em] text-white">
                  {surfaceLabel}
                </span>
                <span className="border-2 border-brand-dark bg-brand-yellow px-2 py-1 text-[9px] font-black uppercase tracking-[0.25em]">
                  {markerCountLabel}
                </span>
              </div>
              {selectedEvent ? (
                <>
                  <p className="mt-2 text-[10px] font-black uppercase tracking-[0.22em] opacity-55">
                    {selectedEvent.category} · {selectedEvent.neighborhood}
                  </p>
                  <p className="mt-1 truncate font-display text-xl font-black uppercase leading-none md:text-2xl">
                    {selectedEvent.title}
                  </p>
                  <p className="mt-1 text-[10px] font-black uppercase tracking-[0.22em] opacity-65">
                    {selectedEvent.dateLabel}
                  </p>
                </>
              ) : (
                <p className="mt-2 text-[10px] font-black uppercase tracking-[0.22em] opacity-65 md:mt-3 md:text-xs">
                  Select an event to preview details and continue to booking.
                </p>
              )}
            </div>
            {selectedEvent ? (
              <Button
                type="button"
                variant="secondary"
                size="icon-sm"
                aria-label="Clear marker selection"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  setSelectedMarkerId(null);
                }}
              >
                <X />
              </Button>
            ) : null}
          </div>
          {selectedEvent ? (
            <Button
              type="button"
              className="mt-3 w-full"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();
                onOpenEvent(selectedEvent);
              }}
            >
              {actionLabel}
            </Button>
          ) : null}
        </div>
        <div className="absolute right-4 top-4 z-20 flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="icon-sm"
            aria-label="Zoom in"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              setZoom((currentZoom) => clampZoom(currentZoom + 1));
            }}
          >
            <Plus />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="icon-sm"
            aria-label="Zoom out"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              setZoom((currentZoom) => clampZoom(currentZoom - 1));
            }}
          >
            <Minus />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
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
              setZoom(MAP_DEFAULT_ZOOM);
            }}
          >
            Reset view
          </Button>
        </div>
        {markerPositions.map((marker) => {
          const active = marker.id === selectedMarker?.id;

          return (
            <button
              key={marker.id}
              type="button"
              className={cn(
                "absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1",
                active ? "scale-110" : "hover:scale-105",
              )}
              style={marker.style}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();
                setSelectedMarkerId(marker.id);
              }}
              aria-label={`${marker.title} — ${marker.neighborhood}`}
              title={marker.mapLabel}
            >
              <span className="grid size-11 place-items-center border-4 border-brand-dark bg-brand-dark text-brand-yellow shadow-[5px_5px_0_0_#202621]">
                <MapPin className="size-5" />
              </span>
              <span className="max-w-[9rem] border-2 border-brand-dark bg-white px-2 py-1 text-[9px] font-black uppercase tracking-[0.25em] shadow-[3px_3px_0_0_#202621]">
                {marker.mapLabel}
              </span>
            </button>
          );
        })}
      </div>
    </Panel>
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
    <StatePanel
      title={title}
      text={text}
      state="error"
      action={
        onRetry ? (
          <Button type="button" variant="secondary" onClick={onRetry}>
            <AlertTriangle />
            Retry Connection
          </Button>
        ) : undefined
      }
    />
  );
}

export function discoveryMapHasReadyMarkers(events: EventCardView[]) {
  return events.some(hasDiscoveryMapCoordinates);
}
