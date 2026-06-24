import {
  PublicDiscoverCardPresentational,
  PublicDiscoverHeaderPresentational,
  PublicDiscoverLayoutPresentational,
  PublicDiscoverPresentational,
} from "@unveiled/design-system";
import { cn } from "@unveiled/design-system/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Calendar,
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

  const pagination =
    live.totalCount && live.pageSize && live.totalCount > live.pageSize ? (
      <div className="flex items-center justify-between border-t-2 border-brand-dark pt-6">
        <button
          type="button"
          disabled={!live.page || live.page <= 1}
          onClick={() => {
            const prevPage = String(Math.max(1, (live.page ?? 1) - 1));
            live.setDiscoveryFilters?.({
              ...live.discoveryFilters,
              page: prevPage,
            });
          }}
          className={cn(
            "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap border-2 border-brand-dark bg-white px-7 py-4 text-xs font-black uppercase tracking-[0.18em] text-brand-dark outline-none transition-all duration-200 hover:bg-brand-yellow focus-visible:ring-4 focus-visible:ring-brand-dark/25",
            (!live.page || live.page <= 1) && "opacity-40 cursor-not-allowed",
          )}
        >
          <ArrowLeft className="mr-2 size-4" />
          {selectedLanguage === "DE" ? "Zurück" : "Previous"}
        </button>
        <span className="text-xs font-black uppercase tracking-widest opacity-60">
          {selectedLanguage === "DE" ? "Seite" : "Page"} {live.page} /{" "}
          {Math.ceil(live.totalCount / live.pageSize)}
        </span>
        <button
          type="button"
          disabled={!live.hasMore}
          onClick={() => {
            const nextPage = String((live.page ?? 1) + 1);
            live.setDiscoveryFilters?.({
              ...live.discoveryFilters,
              page: nextPage,
            });
          }}
          className={cn(
            "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap border-2 border-brand-dark bg-white px-7 py-4 text-xs font-black uppercase tracking-[0.18em] text-brand-dark outline-none transition-all duration-200 hover:bg-brand-yellow focus-visible:ring-4 focus-visible:ring-brand-dark/25",
            !live.hasMore && "opacity-40 cursor-not-allowed",
          )}
        >
          {selectedLanguage === "DE" ? "Weiter" : "Next"}
          <ArrowRight className="ml-2 size-4" />
        </button>
      </div>
    ) : null;

  return (
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
      <PublicDiscoverPresentational
        header={
          <PublicDiscoverHeaderPresentational
            eyebrow={copy.public.discover.included}
            title={copy.public.discover.title}
            body={copy.public.discover.body}
          />
        }
        cards={live.events.map((event) => (
          <PublicDiscoverCardPresentational
            key={event.id}
            event={{
              id: event.id,
              title: event.title,
              imageUrl: event.imageUrl,
              partnerName: event.partnerName,
              category: event.category,
              capacityLabel: event.capacityLabel,
              ticketType: event.ticketType,
              creditPrice: event.creditPrice,
              dateLabel: event.dateLabel,
              neighborhood: event.neighborhood,
              ctaLabel: event.ctaLabel,
              saved: event.saved,
              remainingCapacity: event.remainingCapacity,
            }}
            compact
            creditsLabel={copy.event.credits}
            savedLabel={copy.event.saved}
            saveLabel={copy.event.save}
            calendarIcon={<Calendar className="size-4" />}
            mapPinIcon={<MapPin className="size-4" />}
            bookmarkIcon={
              <Bookmark fill={event.saved ? "currentColor" : "none"} />
            }
            fallbackImage="/app/logos/unveiled-logo-black.svg"
            onOpen={() => setSelectedPublicEvent(event)}
            onClick={() => {
              setSelectedPublicEvent(event);
              setMapOpen(true);
            }}
            onSave={() => undefined}
          />
        ))}
        pagination={pagination}
        layout={
          <PublicDiscoverLayoutPresentational
            copy={{
              activePartners: copy.public.discover.activePartners,
              missingVenue: copy.public.discover.missingVenue,
              wantPartner: copy.public.discover.wantPartner,
              tellSupport: copy.public.discover.tellSupport,
            }}
            stats={live.publicStats}
            partners={live.publicPartners}
            mailIcon={<Mail className="size-4" />}
            onTellSupport={() => undefined}
          />
        }
      />
      {selectedPublicEvent ? (
        <BookingModal
          key={selectedPublicEvent.id}
          event={selectedPublicEvent}
          onClose={() => setSelectedPublicEvent(null)}
        />
      ) : null}
    </DiscoveryShell>
  );
}

export function EventCard({
  event,
  compact = false,
  onOpen,
  onSave,
  onClick,
}: {
  event: import("~/lib/unveiled-view-models").EventCardView;
  compact?: boolean;
  onOpen: (event: import("~/lib/unveiled-view-models").EventCardView) => void;
  onSave?: (event: import("~/lib/unveiled-view-models").EventCardView) => void;
  onClick?: (event: import("~/lib/unveiled-view-models").EventCardView) => void;
}) {
  const copy = useCopy().event;
  return (
    <PublicDiscoverCardPresentational
      event={{
        id: event.id,
        title: event.title,
        imageUrl: event.imageUrl,
        partnerName: event.partnerName,
        category: event.category,
        capacityLabel: event.capacityLabel,
        ticketType: event.ticketType,
        creditPrice: event.creditPrice,
        dateLabel: event.dateLabel,
        neighborhood: event.neighborhood,
        ctaLabel: event.ctaLabel,
        saved: event.saved,
        remainingCapacity: event.remainingCapacity,
      }}
      compact={compact}
      creditsLabel={copy.credits}
      savedLabel={copy.saved}
      saveLabel={copy.save}
      calendarIcon={<Calendar className="size-4" />}
      mapPinIcon={<MapPin className="size-4" />}
      bookmarkIcon={<Bookmark fill={event.saved ? "currentColor" : "none"} />}
      fallbackImage="/app/logos/unveiled-logo-black.svg"
      onOpen={() => onOpen(event)}
      onClick={() => onClick?.(event)}
      onSave={() => onSave?.(event)}
    />
  );
}

export function HowItWorks() {
  const copy = useCopy().public.how;
  return (
    <div className="space-y-8 py-8">
      <PublicDiscoverHeaderPresentational
        eyebrow={copy.badge}
        title={copy.title}
        body=""
      />
      <div className="grid gap-5 md:grid-cols-3">
        {copy.steps.map((title, index) => (
          <div key={title} className="border-4 border-brand-dark bg-white p-6">
            <p className="font-display text-7xl font-black leading-none">
              0{index + 1}
            </p>
            <h2 className="mt-5 font-display text-3xl font-black uppercase leading-none">
              {title}
            </h2>
            <p className="mt-4 text-sm font-bold uppercase tracking-widest opacity-60">
              {copy.stepBody}
            </p>
          </div>
        ))}
      </div>
      <div className="border-4 border-brand-dark bg-brand-dark p-6 text-white grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
        <p className="headline-md">{copy.membership}</p>
        <span className="inline-flex shrink-0 items-center justify-center border-2 border-brand-yellow bg-brand-yellow px-3 py-2 text-[9px] font-black uppercase tracking-[0.18em] text-brand-dark">
          {copy.monthlyCredits}
        </span>
      </div>
    </div>
  );
}

export function FaqPage() {
  const copy = useCopy().public.faq;
  const selectedLanguage = useContext(LanguageContext);
  return (
    <div className="space-y-8 py-8">
      <a
        href={`/app/${selectedLanguage.toLowerCase()}/`}
        className="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap border-2 border-brand-dark bg-transparent px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-brand-dark outline-none transition-all duration-200 hover:border-brand-dark hover:bg-brand-yellow focus-visible:ring-4 focus-visible:ring-brand-dark/25"
      >
        <ArrowLeft />
        {copy.back}
      </a>
      <PublicDiscoverHeaderPresentational
        eyebrow="FAQ"
        title={copy.title}
        body=""
      />
      <div className="grid gap-4">
        {copy.questions.map((question, index) => (
          <details
            key={question}
            className="border-4 border-brand-dark bg-white p-5 open:bg-brand-cream"
            open={index === 0}
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-black uppercase tracking-widest">
              {question}
              <svg
                aria-hidden="true"
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
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
