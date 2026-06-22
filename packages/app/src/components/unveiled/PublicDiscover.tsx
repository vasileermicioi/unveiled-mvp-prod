import {
  Badge,
  Button,
  Card,
  Panel,
  SafeImage,
  StatPanel,
} from "@unveiled/design-system";
import { cn } from "@unveiled/design-system/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Calendar,
  ChevronDown,
  Mail,
  MapPin,
} from "lucide-react";
import { useContext, useState } from "react";
import { DiscoveryShell } from "~/components/unveiled/app-shell";
import { DiscoveryMapPanel } from "~/components/unveiled/discovery-map";
import { demoDiscoveryShell } from "~/lib/app-shell-view-models";
import { readDiscoveryMapProviderConfig } from "~/lib/discovery-map";
import type { EventCardView } from "~/lib/unveiled-view-models";
import { BookingModal } from "./BookingModal";
import { LanguageContext, useCopy, useLiveData } from "./context";
import { DiscoveryFilterPanel } from "./DiscoveryFilterPanel";

export function EventCard({
  event,
  compact = false,
  onOpen,
  onSave,
  onClick,
}: {
  event: EventCardView;
  compact?: boolean;
  onOpen: (event: EventCardView) => void;
  onSave?: (event: EventCardView) => void;
  onClick?: (event: EventCardView) => void;
}) {
  const copy = useCopy().event;
  return (
    <Card
      interactive
      className="group flex h-full flex-col overflow-hidden cursor-pointer"
      data-testid={`event-card-${event.id}`}
      onClick={() => onClick?.(event)}
    >
      <div
        className={cn(
          "relative overflow-hidden border-b-4 border-brand-dark",
          compact ? "h-48" : "h-64",
        )}
      >
        <SafeImage
          src={event.imageUrl || undefined}
          alt={event.title}
          fallbackKind="event"
          fadeIn
          className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:scale-110 group-hover:grayscale-0"
        />
        <Badge tone="dark" className="absolute left-3 top-3">
          {event.category}
        </Badge>
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
            <Calendar className="size-4" />
            {event.dateLabel}
          </span>
          <span className="flex items-center gap-2">
            <MapPin className="size-4" />
            {event.neighborhood}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 border-t-2 border-brand-grey pt-4">
          <div className="font-display text-3xl font-black uppercase leading-none">
            {event.creditPrice}
            <span className="ml-1 font-sans text-[10px] tracking-widest opacity-35">
              {copy.credits}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={event.saved ? "active" : "outline"}
              size="icon-sm"
              aria-label={event.saved ? copy.saved : copy.save}
              onClick={(e) => {
                e.stopPropagation();
                onSave?.(event);
              }}
            >
              <Bookmark fill={event.saved ? "currentColor" : "none"} />
            </Button>
            <Button
              type="button"
              size="sm"
              variant={event.remainingCapacity === 0 ? "muted" : "primary"}
              onClick={(e) => {
                e.stopPropagation();
                onOpen(event);
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

export function PublicDiscover() {
  const copy = useCopy();
  const live = useLiveData();
  const selectedLanguage = useContext(LanguageContext);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [mapOpen, setMapOpen] = useState(false);
  const [selectedPublicEvent, setSelectedPublicEvent] =
    useState<EventCardView | null>(null);
  const mapProvider = readDiscoveryMapProviderConfig(
    import.meta.env as { PUBLIC_MAP_TILE_URL?: string },
  );
  const visible = live.events;
  const discovery = {
    ...demoDiscoveryShell,
    filtersOpen,
    mapOpen,
    visibleResultCount: visible.length,
    resultCountLabel: live.visibleEventCountLabel,
    activeRangeLabel: live.activeRangeLabel,
    activeFilterCount: live.activeFilterCount,
    filterToggleLabel: copy.discovery.refine,
    mapToggleLabel: copy.discovery.map,
    emptyState: {
      state: live.isLoading ? "loading" : live.isError ? "error" : "empty",
      title: copy.discovery.noPublicTitle,
      message: live.isLoading
        ? copy.discovery.liveLoading
        : live.isError
          ? copy.discovery.liveError
          : copy.discovery.noUpcoming,
      retryAction: {
        id: "reset-filters",
        label: copy.discovery.resetFilters,
      },
    },
  } as const;

  return (
    <div className="space-y-6">
      <Panel tone="white">
        <Badge tone="yellow">{copy.public.discover.included}</Badge>
        <h1 className="headline-lg mt-5">{copy.public.discover.title}</h1>
        <p className="mt-4 max-w-3xl text-lg font-bold leading-relaxed">
          {copy.public.discover.body}
        </p>
      </Panel>

      <DiscoveryShell
        discovery={discovery}
        filterPanel={<DiscoveryFilterPanel />}
        mapPanel={
          <DiscoveryMapPanel
            events={visible}
            surface="public"
            tileUrlTemplate={mapProvider.tileUrlTemplate}
            actionLabel={copy.discovery.viewEvent}
            selectedMarkerIdOverride={selectedPublicEvent?.id ?? null}
            onOpenEvent={(event) => {
              setSelectedPublicEvent(event);
            }}
            onRetry={live.refetchActiveSurface}
          />
        }
        onAction={(actionId) => {
          if (actionId === "toggle-filters") {
            setFiltersOpen((open) => !open);
            setMapOpen(false);
          }
          if (actionId === "toggle-map") {
            setMapOpen((open) => !open);
            setFiltersOpen(false);
          }
          if (actionId === "reset-filters") {
            live.setDiscoveryFilters?.({});
            live.refetchActiveSurface();
          }
        }}
      >
        <div className="space-y-10 py-8">
          <section className="grid gap-5 lg:grid-cols-3">
            {live.events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                compact
                onOpen={() => setSelectedPublicEvent(event)}
                onClick={(event) => {
                  setSelectedPublicEvent(event);
                  setMapOpen(true);
                }}
              />
            ))}
          </section>

          {live.totalCount &&
          live.pageSize &&
          live.totalCount > live.pageSize ? (
            <div className="flex items-center justify-between border-t-2 border-brand-dark pt-6">
              <Button
                type="button"
                variant="secondary"
                disabled={!live.page || live.page <= 1}
                onClick={() => {
                  const prevPage = String(Math.max(1, (live.page ?? 1) - 1));
                  live.setDiscoveryFilters?.({
                    ...live.discoveryFilters,
                    page: prevPage,
                  });
                }}
              >
                <ArrowLeft className="mr-2 size-4" />
                {selectedLanguage === "DE" ? "Zurück" : "Previous"}
              </Button>
              <span className="text-xs font-black uppercase tracking-widest opacity-60">
                {selectedLanguage === "DE" ? "Seite" : "Page"} {live.page} /{" "}
                {Math.ceil(live.totalCount / live.pageSize)}
              </span>
              <Button
                type="button"
                variant="secondary"
                disabled={!live.hasMore}
                onClick={() => {
                  const nextPage = String((live.page ?? 1) + 1);
                  live.setDiscoveryFilters?.({
                    ...live.discoveryFilters,
                    page: nextPage,
                  });
                }}
              >
                {selectedLanguage === "DE" ? "Weiter" : "Next"}
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </div>
          ) : null}

          <section className="grid gap-5 lg:grid-cols-3">
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {live.publicStats.map((stat) => (
                <StatPanel key={stat.label} {...stat} className="h-full" />
              ))}
            </div>
            <Panel tone="white" className="flex flex-col justify-between">
              <div>
                <p className="unveiled-meta opacity-60">
                  {copy.public.discover.activePartners}
                </p>
                <div className="mt-4 grid gap-3">
                  {live.publicPartners.map((partner) => (
                    <div
                      key={partner.id}
                      className="flex items-center gap-3 border-4 border-brand-dark bg-brand-grey p-3"
                    >
                      <span className="grid size-10 place-items-center bg-brand-dark font-display text-lg font-black text-white">
                        {partner.logoInitial}
                      </span>
                      <span>
                        <span className="block text-xs font-black uppercase tracking-widest">
                          {partner.name}
                        </span>
                        <span className="block text-xs font-bold opacity-55">
                          {partner.address}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>
            <Panel tone="dark" className="flex flex-col justify-between">
              <div>
                <p className="unveiled-meta opacity-60">
                  {copy.public.discover.missingVenue}
                </p>
                <p className="headline-md mt-4">
                  {copy.public.discover.wantPartner}
                </p>
              </div>
              <Button
                type="button"
                variant="yellow"
                className="mt-6 w-full justify-center"
              >
                {copy.public.discover.tellSupport}
                <Mail className="ml-2 size-4" />
              </Button>
            </Panel>
          </section>
        </div>
      </DiscoveryShell>
      {selectedPublicEvent ? (
        <BookingModal
          key={selectedPublicEvent.id}
          event={selectedPublicEvent}
          onClose={() => setSelectedPublicEvent(null)}
        />
      ) : null}
    </div>
  );
}

export function HowItWorks() {
  const copy = useCopy().public.how;
  return (
    <div className="space-y-8 py-8">
      <Panel tone="white">
        <Badge tone="yellow">{copy.badge}</Badge>
        <h1 className="headline-lg mt-5 max-w-4xl">{copy.title}</h1>
      </Panel>
      <div className="grid gap-5 md:grid-cols-3">
        {copy.steps.map((title, index) => (
          <Card key={title} className="p-6">
            <p className="font-display text-7xl font-black leading-none">
              0{index + 1}
            </p>
            <h2 className="mt-5 font-display text-3xl font-black uppercase leading-none">
              {title}
            </h2>
            <p className="mt-4 text-sm font-bold uppercase tracking-widest opacity-60">
              {copy.stepBody}
            </p>
          </Card>
        ))}
      </div>
      <Panel
        tone="dark"
        className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center"
      >
        <p className="headline-md">{copy.membership}</p>
        <Badge tone="yellow">{copy.monthlyCredits}</Badge>
      </Panel>
    </div>
  );
}

export function FaqPage() {
  const copy = useCopy().public.faq;
  const selectedLanguage = useContext(LanguageContext);
  return (
    <div className="space-y-8 py-8">
      <Button asChild variant="ghost">
        <a href={`/app/${selectedLanguage.toLowerCase()}/`}>
          <ArrowLeft />
          {copy.back}
        </a>
      </Button>
      <Panel tone="white">
        <Badge tone="yellow">FAQ</Badge>
        <h1 className="headline-lg mt-5">{copy.title}</h1>
      </Panel>
      <div className="grid gap-4">
        {copy.questions.map((question, index) => (
          <details
            key={question}
            className="border-4 border-brand-dark bg-white p-5 open:bg-brand-cream"
            open={index === 0}
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-black uppercase tracking-widest">
              {question}
              <ChevronDown className="size-5" />
            </summary>
            <p className="mt-4 max-w-3xl text-sm font-bold leading-6 opacity-65">
              {copy.answers[index]}
            </p>
          </details>
        ))}
      </div>
    </div>
  );
}
