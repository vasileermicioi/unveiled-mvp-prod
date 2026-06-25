import {
  cn,
  PublicDiscoverCardPresentational,
  PublicDiscoverHeaderPresentational,
  PublicDiscoverLayoutPresentational,
  PublicDiscoverPresentational,
} from "@unveiled/design-system";
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
      <div className="ui-21e8ca97">
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
            "hover:bg-brand-yellow focus-visible:ring-4 focus-visible:ring-brand-dark/25 ui-b6198e56",
            (!live.page || live.page <= 1) && "ui-4b97c56d",
          )}
        >
          <ArrowLeft className="ui-c9577821" />
          {selectedLanguage === "DE" ? "Zurück" : "Previous"}
        </button>
        <span className="ui-dd5eece2">
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
            "hover:bg-brand-yellow focus-visible:ring-4 focus-visible:ring-brand-dark/25 ui-b6198e56",
            !live.hasMore && "ui-4b97c56d",
          )}
        >
          {selectedLanguage === "DE" ? "Weiter" : "Next"}
          <ArrowRight className="ui-be66dea2" />
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
            calendarIcon={<Calendar className="ui-100c22d5" />}
            mapPinIcon={<MapPin className="ui-100c22d5" />}
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
            mailIcon={<Mail className="ui-100c22d5" />}
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
      calendarIcon={<Calendar className="ui-100c22d5" />}
      mapPinIcon={<MapPin className="ui-100c22d5" />}
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
    <div className="ui-e400b83c">
      <PublicDiscoverHeaderPresentational
        eyebrow={copy.badge}
        title={copy.title}
        body=""
      />
      <div className="ui-ea1055c7">
        {copy.steps.map((title, index) => (
          <div key={title} className="ui-448ee40e">
            <p className="ui-a7925baf">0{index + 1}</p>
            <h2 className="ui-f7f447d2">{title}</h2>
            <p className="ui-60727724">{copy.stepBody}</p>
          </div>
        ))}
      </div>
      <div className="ui-5ede1b0d">
        <p className="headline-md">{copy.membership}</p>
        <span className="ui-2924126d">{copy.monthlyCredits}</span>
      </div>
    </div>
  );
}

export function FaqPage() {
  const copy = useCopy().public.faq;
  const selectedLanguage = useContext(LanguageContext);
  return (
    <div className="ui-e400b83c">
      <a
        href={`/app/${selectedLanguage.toLowerCase()}/`}
        className="hover:border-brand-dark hover:bg-brand-yellow focus-visible:ring-4 focus-visible:ring-brand-dark/25 ui-53b1892d"
      >
        <ArrowLeft />
        {copy.back}
      </a>
      <PublicDiscoverHeaderPresentational
        eyebrow="FAQ"
        title={copy.title}
        body=""
      />
      <div className="ui-038d1550">
        {copy.questions.map((question, index) => (
          <details
            key={question}
            className="open:bg-brand-cream ui-4260bd5c"
            open={index === 0}
          >
            <summary className="ui-e499601d">
              {question}
              <svg
                aria-hidden="true"
                className="ui-2bd43fb5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </summary>
            <p className="ui-b65cf314">{copy.answers[index]}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
