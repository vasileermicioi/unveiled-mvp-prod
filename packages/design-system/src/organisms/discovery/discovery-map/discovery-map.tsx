import type { DragEvent, ReactElement } from "react";
import * as React from "react";
import { Button } from "../../../atoms/button";

export const DISCOVERY_MAP_MIN_ZOOM = 10;
export const DISCOVERY_MAP_MAX_ZOOM = 17;
export const DISCOVERY_MAP_DEFAULT_ZOOM = 13;
export const DISCOVERY_MAP_TILE_SIZE = 256;
export const DISCOVERY_MAP_DEFAULT_CENTER = { lat: 52.52, lng: 13.405 };

export interface DiscoveryMapMarkerPosition {
  id: string;
  title: string;
  neighborhood: string;
  mapLabel: string;
  style: { left: string; top: string };
}

export interface DiscoveryMapTilePosition {
  id: string;
  src: string;
  style: { left: string; top: string };
}

export interface DiscoveryMapSelectedEvent {
  id: string;
  title: string;
  category: string;
  neighborhood: string;
  dateLabel: string;
}

export interface DiscoveryMapPresentationalProps {
  surface: "public" | "member";
  formId: string;
  regionLabel: string;
  surfaceLabel: string;
  markerCountLabel: string;
  emptyHint: string;
  actionLabel: string;
  tileUrlTemplate: string;
  tiles: DiscoveryMapTilePosition[];
  markerPositions: DiscoveryMapMarkerPosition[];
  selectedMarkerId: string | null;
  selectedEvent: DiscoveryMapSelectedEvent | null;
  hasMarkers: boolean;
  plusIcon: ReactElement;
  minusIcon: ReactElement;
  mapPinIcon: ReactElement;
  closeIcon: ReactElement;
  onMarkerClick: (id: string) => void;
  onClearSelection: () => void;
  onOpenSelected: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
}

export function DiscoveryMapPresentational(
  props: DiscoveryMapPresentationalProps,
): ReactElement {
  const {
    surface,
    formId,
    regionLabel,
    surfaceLabel,
    markerCountLabel,
    emptyHint,
    actionLabel,
    tileUrlTemplate: _tileUrlTemplate,
    tiles,
    markerPositions,
    selectedMarkerId,
    selectedEvent,
    hasMarkers,
    plusIcon,
    minusIcon,
    mapPinIcon,
    closeIcon,
    onMarkerClick,
    onClearSelection,
    onOpenSelected,
    onZoomIn,
    onZoomOut,
    onResetView,
  } = props;
  const mapHeadingId = `discovery-map-heading-${surface}-${formId}`;
  return (
    <section className="border-4 border-brand-dark bg-brand-cream overflow-hidden">
      <h2 id={mapHeadingId} className="sr-only">
        {regionLabel}
      </h2>
      <section
        aria-labelledby={mapHeadingId}
        className="relative min-h-[26rem] overflow-hidden border-[12px] border-brand-cream bg-brand-grey touch-none"
      >
        <div className="absolute inset-0 cursor-grab active:cursor-grabbing">
          {tiles.map((tile) => {
            const tileImageProps = {
              key: tile.id,
              alt: "",
              "aria-hidden": true,
              src: tile.src,
              className:
                "absolute h-64 w-64 max-w-none select-none object-cover",
              draggable: false,
              onDragStart: (event: DragEvent<HTMLImageElement>) =>
                event.preventDefault(),
              style: tile.style,
            } as const;
            return React.createElement("img", tileImageProps);
          })}
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
                  {emptyHint}
                </p>
              )}
            </div>
            {selectedEvent ? (
              <Button
                type="button"
                variant="secondary"
                size="icon-sm"
                aria-label="Clear marker selection"
                onClick={onClearSelection}
              >
                {closeIcon}
              </Button>
            ) : null}
          </div>
          {selectedEvent ? (
            <Button
              type="button"
              className="mt-3 w-full"
              onClick={onOpenSelected}
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
            onClick={onZoomIn}
          >
            {plusIcon}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="icon-sm"
            aria-label="Zoom out"
            onClick={onZoomOut}
          >
            {minusIcon}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={!hasMarkers}
            onClick={onResetView}
          >
            Reset view
          </Button>
        </div>
        {markerPositions.map((marker) => {
          const active = marker.id === selectedMarkerId;
          return (
            <button
              key={marker.id}
              type="button"
              className={
                active
                  ? "absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 scale-110"
                  : "absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 hover:scale-105"
              }
              style={marker.style}
              onClick={() => onMarkerClick(marker.id)}
              aria-label={`${marker.title} — ${marker.neighborhood}`}
              title={marker.mapLabel}
            >
              <span className="grid size-11 place-items-center border-4 border-brand-dark bg-brand-dark text-brand-yellow shadow-[5px_5px_0_0_#202621]">
                <span className="inline-flex items-center justify-center size-5">
                  {mapPinIcon}
                </span>
              </span>
              <span className="max-w-[9rem] border-2 border-brand-dark bg-white px-2 py-1 text-[9px] font-black uppercase tracking-[0.25em] shadow-[3px_3px_0_0_202621]">
                {marker.mapLabel}
              </span>
            </button>
          );
        })}
      </section>
    </section>
  );
}

export interface DiscoveryMapFallbackPresentationalProps {
  title: string;
  text: string;
  retryLabel?: string;
  alertIcon: ReactElement;
  onRetry?: () => void;
}

export function DiscoveryMapFallbackPresentational(
  props: DiscoveryMapFallbackPresentationalProps,
): ReactElement {
  const { title, text, retryLabel, alertIcon, onRetry } = props;
  return (
    <section className="relative min-h-[26rem] flex items-center justify-center border-[12px] border-brand-cream bg-brand-grey p-5 text-center">
      <div className="max-w-md space-y-4">
        <p className="headline-md text-brand-dark">{title}</p>
        <p className="text-sm font-bold uppercase tracking-widest text-brand-dark opacity-60">
          {text}
        </p>
        {onRetry ? (
          <Button type="button" variant="secondary" onClick={onRetry}>
            <span className="inline-flex items-center mr-2 size-4">
              {alertIcon}
            </span>
            {retryLabel ?? "Retry"}
          </Button>
        ) : null}
      </div>
    </section>
  );
}
