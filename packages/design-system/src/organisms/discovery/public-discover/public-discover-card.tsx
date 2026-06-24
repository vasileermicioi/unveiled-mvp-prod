import type { ReactElement } from "react";
import * as React from "react";
import { Button } from "../../../atoms/button";
import { Card } from "../../../atoms/card";

export interface PublicDiscoverCardEvent {
  id: string;
  title: string;
  imageUrl: string | null;
  partnerName: string;
  category: string;
  capacityLabel: string;
  ticketType: string;
  creditPrice: string | number;
  dateLabel: string;
  neighborhood: string;
  ctaLabel: string;
  saved: boolean;
  remainingCapacity: number;
}

export interface PublicDiscoverCardProps {
  event: PublicDiscoverCardEvent;
  compact?: boolean;
  creditsLabel: string;
  savedLabel: string;
  saveLabel: string;
  calendarIcon: ReactElement;
  mapPinIcon: ReactElement;
  bookmarkIcon: ReactElement;
  fallbackImage: string;
  onOpen: () => void;
  onSave?: () => void;
  onClick?: (event: PublicDiscoverCardEvent) => void;
}

function CardImage({
  src,
  alt,
  fallback,
  className,
}: {
  src: string | null;
  alt: string;
  fallback: string;
  className: string;
}) {
  const [resolvedSrc, setResolvedSrc] = React.useState(src ?? fallback);
  React.useEffect(() => {
    setResolvedSrc(src ?? fallback);
  }, [src, fallback]);
  const imgProps = {
    src: resolvedSrc,
    alt,
    onError: () => setResolvedSrc(fallback),
    className,
  } as const;
  return React.createElement("img", imgProps);
}

export function PublicDiscoverCardPresentational(
  props: PublicDiscoverCardProps,
): ReactElement {
  const {
    event,
    compact = false,
    creditsLabel,
    savedLabel,
    saveLabel,
    calendarIcon,
    mapPinIcon,
    bookmarkIcon,
    fallbackImage,
    onOpen,
    onSave,
    onClick,
  } = props;
  return (
    <Card
      interactive
      className="group flex h-full flex-col overflow-hidden cursor-pointer"
      data-testid={`event-card-${event.id}`}
      onClick={() => onClick?.(event)}
    >
      <div
        className={`relative overflow-hidden border-b-4 border-brand-dark ${
          compact ? "h-48" : "h-64"
        }`}
      >
        <CardImage
          src={event.imageUrl}
          alt={event.title}
          fallback={fallbackImage}
          className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:scale-110 group-hover:grayscale-0"
        />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 border-2 border-brand-dark bg-brand-dark px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-white">
          {event.category}
        </span>
        <div className="absolute inset-x-0 bottom-0 flex translate-y-0 items-center justify-between border-t-4 border-brand-dark bg-brand-yellow p-3 transition-transform md:translate-y-full md:group-hover:translate-y-0">
          <span className="unveiled-meta">{event.capacityLabel}</span>
          <span className="hidden text-[10px] font-black uppercase tracking-widest sm:block">
            {event.ticketType}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-5 p-5 md:p-7">
        <div>
          <h3 className="font-display text-3xl font-black uppercase leading-none">
            {event.title}
          </h3>
          <p className="mt-2 unveiled-meta opacity-40">{event.partnerName}</p>
        </div>
        <div className="grid flex-1 gap-3 text-[10px] font-black uppercase tracking-widest opacity-60">
          <span className="flex items-center gap-2">
            {calendarIcon}
            {event.dateLabel}
          </span>
          <span className="flex items-center gap-2">
            {mapPinIcon}
            {event.neighborhood}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 border-t-2 border-brand-grey pt-4">
          <div className="font-display text-3xl font-black uppercase leading-none">
            {String(event.creditPrice)}
            <span className="ml-1 font-sans text-[10px] tracking-widest opacity-35">
              {creditsLabel}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={event.saved ? "active" : "outline"}
              size="icon-sm"
              aria-label={event.saved ? savedLabel : saveLabel}
              onClick={(e) => {
                e.stopPropagation();
                onSave?.();
              }}
            >
              {bookmarkIcon}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={event.remainingCapacity === 0 ? "muted" : "primary"}
              onClick={(e) => {
                e.stopPropagation();
                onOpen();
              }}
            >
              {event.ctaLabel}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
