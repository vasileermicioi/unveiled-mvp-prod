import { actions } from "astro:actions";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  CreditCard,
  Heart,
  Loader2,
  Mail,
} from "lucide-react";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Badge,
  Card,
  Divider,
  Field,
  Panel,
  SelectInput,
  StatePanel,
  TableRow,
  TextInput,
} from "@/components/ui/unveiled-primitives";
import { StripeCheckoutRedirectButton } from "@/components/payments/StripeCheckoutRedirectButton";
import { CreditLedgerViewTableSemantics } from "@/components/payments/CreditLedgerViewTableSemantics";
import { SubscriptionPortalLink } from "@/components/payments/SubscriptionPortalLink";
import { DiscoveryShell } from "@/components/unveiled/app-shell";
import { DiscoveryMapPanel } from "@/components/unveiled/discovery-map";
import { demoDiscoveryShell } from "@/lib/app-shell-view-models";
import { readDiscoveryMapProviderConfig } from "@/lib/discovery-map";
import type { EventCardView } from "@/lib/unveiled-view-models";
import { cn } from "@/lib/utils";
import { BookingModal } from "./BookingModal";
import {
  defaultOnboardingPreferences,
  LanguageContext,
  type OnboardingPreferenceGroup,
  type OnboardingPreferenceSelections,
  onboardingPreferenceOptions,
  runServerAction,
  StatPanel,
  useCopy,
  useLiveData,
} from "./context";
import { DiscoveryFilterPanel } from "./DiscoveryFilterPanel";
import { EventCard } from "./PublicDiscover";

const onboardingTranslations = {
  DE: {
    title: "DEIN KULTUR-PROFIL",
    subtitle: "Wir finden die Events, die wirklich zu dir passen.",
    ageLabel: "WIE ALT BIST DU?",
    ageSubtitle:
      "Keine Sorge, nur für die Statistik (und Altersbeschränkungen).",
    interestLabel: "WAS INTERESSIERT DICH?",
    moodLabel: "WELCHE VIBES SUCHST DU?",
    districtLabel: "WO BIST DU UNTERWEGS?",
    radiusLabel: "WIE WEIT WÜRDEST DU FAHREN?",
    timingLabel: "WANN HAST DU ZEIT?",
    daysLabel: "WELCHE TAGE?",
    languagePrefLabel: "SPRACHEN?",
    accessibilityLabel: "BARRIEREFREIHEIT ERFORDERLICH?",
    finish: "FERTIG",
    next: "WEITER",
    back: "ZURÜCK",
    skip: "ÜBERSPRINGEN",
    km: "km",
  },
  EN: {
    title: "YOUR CULTURE PROFILE",
    subtitle: "Let's find the events that actually vibe with you.",
    ageLabel: "HOW OLD ARE YOU?",
    ageSubtitle: "Don't worry, just for stats (and age restrictions).",
    interestLabel: "WHAT INTERESTS YOU?",
    moodLabel: "WHAT VIBES ARE YOU AFTER?",
    districtLabel: "WHERE DO YOU HANG OUT?",
    radiusLabel: "HOW FAR WOULD YOU TRAVEL?",
    timingLabel: "WHEN DO YOU HAVE TIME?",
    daysLabel: "WHICH DAYS?",
    languagePrefLabel: "LANGUAGES?",
    accessibilityLabel: "ACCESSIBILITY REQUIRED?",
    finish: "FINISH",
    next: "NEXT",
    back: "BACK",
    skip: "SKIP",
    km: "km",
  },
};

export function OnboardingPage() {
  const copy = useCopy().onboarding;
  const live = useLiveData();
  const language = useContext(LanguageContext);
  const t = onboardingTranslations[language];

  const [step, setStep] = useState(1);
  const [message, setMessage] = useState<string>(copy.message);
  const [submitting, setSubmitting] = useState(false);
  const [preferences, setPreferences] =
    useState<OnboardingPreferenceSelections>(defaultOnboardingPreferences);

  const [ageGroup, setAgeGroup] = useState<
    "18-25" | "26-35" | "36-50" | "50+" | ""
  >("");
  const [maxDistance, setMaxDistance] = useState(10);
  const [accessibility, setAccessibility] = useState(false);

  function togglePreference<Group extends OnboardingPreferenceGroup>(
    group: Group,
    value: (typeof onboardingPreferenceOptions)[Group][number],
  ) {
    setPreferences((current) => {
      const selected = current[group];
      const nextValues = selected.includes(value)
        ? selected.filter((entry: string) => entry !== value)
        : [...selected, value];

      return {
        ...current,
        [group]: nextValues,
      };
    });
  }

  async function submit(onboardingComplete: boolean) {
    setSubmitting(true);
    await runServerAction(
      () =>
        actions.saveOnboarding({
          ageGroup: ageGroup || undefined,
          interests: preferences.interests,
          moods: preferences.moods,
          districts: preferences.districts,
          maxDistance,
          timing: preferences.timing,
          preferredDays: preferences.preferredDays,
          preferredLanguages: preferences.preferredLanguages,
          accessibility,
          onboardingComplete,
        }),
      setMessage,
      () => {
        live.refetchActiveSurface();
        window.location.assign(`/${language.toLowerCase()}/app`);
      },
    );
    setSubmitting(false);
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="unveiled-meta">{t.ageLabel}</h3>
            <div className="grid grid-cols-2 gap-4">
              {(["18-25", "26-35", "36-50", "50+"] as const).map((age) => (
                <button
                  key={age}
                  type="button"
                  className={cn(
                    "border-4 border-brand-dark p-6 font-black text-sm transition-all uppercase tracking-widest",
                    ageGroup === age
                      ? "bg-brand-dark text-white"
                      : "bg-white border-brand-dark text-brand-dark hover:bg-brand-yellow",
                  )}
                  onClick={() => setAgeGroup(age)}
                >
                  {age}
                </button>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-8">
            <div>
              <h3 className="unveiled-meta mb-3 flex items-center gap-2">
                <Heart className="size-4 fill-brand-dark text-brand-dark" />
                {t.interestLabel}
              </h3>
              <div className="flex flex-wrap gap-2">
                {onboardingPreferenceOptions.interests.map((opt) => {
                  const selected = preferences.interests.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      className={cn(
                        "inline-flex items-center gap-1 border-2 border-brand-dark px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] transition-colors",
                        selected
                          ? "bg-brand-yellow text-brand-dark"
                          : "bg-white text-brand-dark opacity-65 hover:opacity-100",
                      )}
                      onClick={() => togglePreference("interests", opt)}
                    >
                      <Heart
                        className={cn(
                          "size-3",
                          selected ? "fill-brand-dark" : "fill-transparent",
                        )}
                      />
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <h3 className="unveiled-meta mb-3">{t.moodLabel}</h3>
              <div className="flex flex-wrap gap-2">
                {onboardingPreferenceOptions.moods.map((opt) => {
                  const selected = preferences.moods.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      className={cn(
                        "inline-flex items-center border-2 border-brand-dark px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] transition-colors",
                        selected
                          ? "bg-brand-yellow text-brand-dark"
                          : "bg-white text-brand-dark opacity-65 hover:opacity-100",
                      )}
                      onClick={() => togglePreference("moods", opt)}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-8">
            <div>
              <h3 className="unveiled-meta mb-3">{t.districtLabel}</h3>
              <div className="flex flex-wrap gap-2">
                {onboardingPreferenceOptions.districts.map((opt) => {
                  const selected = preferences.districts.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      className={cn(
                        "inline-flex items-center border-2 border-brand-dark px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] transition-colors",
                        selected
                          ? "bg-brand-yellow text-brand-dark"
                          : "bg-white text-brand-dark opacity-65 hover:opacity-100",
                      )}
                      onClick={() => togglePreference("districts", opt)}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="border-4 border-brand-dark bg-brand-cream p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="unveiled-meta">{t.radiusLabel}</h3>
                <Badge tone="yellow">
                  {maxDistance} {t.km}
                </Badge>
              </div>
              <input
                type="range"
                min="1"
                max="25"
                value={maxDistance}
                onChange={(e) => setMaxDistance(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-brand-grey border-2 border-brand-dark rounded-lg appearance-none cursor-pointer accent-brand-dark"
              />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-8">
            <div>
              <h3 className="unveiled-meta mb-3">{t.timingLabel}</h3>
              <div className="flex flex-wrap gap-2">
                {onboardingPreferenceOptions.timing.map((opt) => {
                  const selected = preferences.timing.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      className={cn(
                        "inline-flex items-center border-2 border-brand-dark px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] transition-colors",
                        selected
                          ? "bg-brand-yellow text-brand-dark"
                          : "bg-white text-brand-dark opacity-65 hover:opacity-100",
                      )}
                      onClick={() => togglePreference("timing", opt)}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="unveiled-meta mb-3">{t.daysLabel}</h3>
              <div className="flex flex-wrap gap-2">
                {onboardingPreferenceOptions.preferredDays.map((opt) => {
                  const selected = preferences.preferredDays.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      className={cn(
                        "w-10 h-10 border-2 border-brand-dark flex items-center justify-center text-[9px] font-black uppercase tracking-[0.18em] transition-colors",
                        selected
                          ? "bg-brand-yellow text-brand-dark"
                          : "bg-white text-brand-dark opacity-65 hover:opacity-100",
                      )}
                      onClick={() => togglePreference("preferredDays", opt)}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t-2 border-brand-dark/20 pt-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-1">
                  <h3 className="unveiled-meta mb-3">{t.languagePrefLabel}</h3>
                  <div className="flex gap-2">
                    {onboardingPreferenceOptions.preferredLanguages.map(
                      (opt) => {
                        const selected =
                          preferences.preferredLanguages.includes(opt);
                        return (
                          <button
                            key={opt}
                            type="button"
                            className={cn(
                              "inline-flex items-center border-2 border-brand-dark px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] transition-colors",
                              selected
                                ? "bg-brand-yellow text-brand-dark"
                                : "bg-white text-brand-dark opacity-65 hover:opacity-100",
                            )}
                            onClick={() =>
                              togglePreference("preferredLanguages", opt)
                            }
                          >
                            {opt}
                          </button>
                        );
                      },
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-brand-cream border-2 border-brand-dark">
                  <span className="unveiled-meta mr-4">
                    {t.accessibilityLabel}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAccessibility(!accessibility)}
                    className={cn(
                      "w-12 h-6 rounded-full p-1 transition-all border-2 border-brand-dark relative",
                      accessibility ? "bg-brand-yellow" : "bg-brand-grey",
                    )}
                  >
                    <div
                      className={cn(
                        "w-3 h-3 bg-brand-dark rounded-full transition-all absolute top-1",
                        accessibility ? "right-1.5" : "left-1.5",
                      )}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="grid gap-6 py-8 lg:grid-cols-[0.9fr_1.1fr]">
      <Panel tone="white" className="space-y-6">
        <Badge tone="yellow">{copy.badge}</Badge>
        <h1 className="headline-lg">{t.title}</h1>
        <p className="text-sm font-bold uppercase tracking-widest opacity-55">
          {step === 1 ? t.ageSubtitle : t.subtitle}
        </p>

        {/* Progress Bar */}
        <div className="pt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-55">
              Step: {step}/4
            </span>
            <span className="text-[10px] font-black opacity-40">
              {Math.round((step / 4) * 100)}%
            </span>
          </div>
          <div className="h-2 w-full bg-brand-grey border border-brand-dark overflow-hidden">
            <div
              className="h-full bg-brand-yellow transition-all duration-500"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {message !== copy.message ? (
          <p className="mt-4 text-xs font-bold uppercase tracking-widest text-[#b21d17]">
            {message}
          </p>
        ) : null}
      </Panel>

      <Panel tone="dark" className="space-y-6 flex flex-col justify-between">
        <div className="space-y-6">
          <p className="unveiled-meta opacity-55">{copy.preview}</p>
          {renderStep()}
        </div>

        <div className="mt-8 flex gap-3">
          {step > 1 && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => setStep(step - 1)}
            >
              {t.back}
            </Button>
          )}
          <Button
            type="button"
            variant="yellow"
            className="flex-1"
            loading={submitting}
            onClick={() => {
              if (step < 4) {
                setStep(step + 1);
              } else {
                void submit(true);
              }
            }}
          >
            {step === 4
              ? t.finish
              : step === 1 && ageGroup === ""
                ? t.skip
                : t.next}
            <ArrowRight className="size-4" />
          </Button>

          {step < 4 && (
            <Button
              type="button"
              variant="secondary"
              disabled={submitting}
              onClick={() => void submit(true)}
            >
              {t.skip}
            </Button>
          )}
        </div>
      </Panel>
    </div>
  );
}

export function MembershipPage() {
  const copy = useCopy().public.membership;
  const live = useLiveData();
  const [message, setMessage] = useState<string>(copy.defaultMessage);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "EXPRESS" | "PAYPAL" | "CARD" | "SEPA" | undefined
  >();
  const [checkoutPromoCode, setCheckoutPromoCode] = useState("");

  return (
    <div className="grid gap-6 py-8 lg:grid-cols-[0.9fr_1.1fr]">
      <Panel tone="white" className="space-y-6">
        <Badge tone="yellow">{copy.badge}</Badge>
        <div>
          <h1 className="headline-lg">{copy.plan}</h1>
          <p className="mt-3 text-4xl font-black">{copy.price}</p>
          <p className="mt-3 text-sm font-bold uppercase tracking-widest opacity-55">
            {copy.body}
          </p>
        </div>
        <Badge
          tone={
            live.billingDisplay.subscriptionStatusLabel === "Active"
              ? "success"
              : "yellow"
          }
        >
          {live.billingDisplay.subscriptionStatusLabel}
        </Badge>
        <Divider />
        <div className="grid gap-3">
          {copy.perks.map((perk) => (
            <Badge key={perk} tone="white" className="justify-start">
              <Check className="size-3" />
              {perk}
            </Badge>
          ))}
        </div>
      </Panel>

      <StripeCheckoutRedirectButton
        selectedPaymentMethod={selectedPaymentMethod}
        onPaymentMethodChange={setSelectedPaymentMethod}
        promoCode={checkoutPromoCode}
        onPromoCodeChange={setCheckoutPromoCode}
        message={message}
        onSubmit={() =>
          runServerAction(
            () =>
              actions.updateMembership({
                paymentMethod: selectedPaymentMethod,
                promoCode: checkoutPromoCode,
                isFrozen: false,
                isActive:
                  live.billingDisplay.subscriptionStatusLabel === "Active",
              }),
            setMessage,
            live.refetchActiveSurface,
          )
        }
      />
      <SubscriptionPortalLink
        active={live.billingDisplay.subscriptionStatusLabel === "Active"}
        url={
          live.billingDisplay.subscriptionStatusLabel === "Active"
            ? "https://billing.stripe.com/p/login/test_customer_portal"
            : null
        }
      />
    </div>
  );
}

export function MemberFeed({
  selectedEvent,
  setSelectedEvent,
  bookingEvent,
  setBookingEvent,
}: {
  selectedEvent: EventCardView | null;
  setSelectedEvent: (event: EventCardView | null) => void;
  bookingEvent: EventCardView | null;
  setBookingEvent: (event: EventCardView | null) => void;
}) {
  const copy = useCopy();
  const live = useLiveData();
  const selectedLanguage = useContext(LanguageContext);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [mapOpen, setMapOpen] = useState(false);
  const visible = useMemo(() => live.events, [live.events]);
  const mapProvider = readDiscoveryMapProviderConfig(
    import.meta.env as { PUBLIC_MAP_TILE_URL?: string },
  );
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
      title: live.isLoading
        ? copy.discovery.loadingEvents
        : copy.discovery.noMatchingEvents,
      message: live.isError
        ? copy.discovery.liveError
        : copy.discovery.noMatches,
      retryAction: {
        id: "reset-all",
        label: copy.discovery.resetAll,
      },
    },
  } as const;
  const gateBlocked = visible.some(
    (event) => event.bookingAvailabilityState === "frozen",
  );
  const [feedMessage, setFeedMessage] = useState("");

  useEffect(() => {
    if (selectedEvent && !mapOpen) {
      setMapOpen(true);
    }
  }, [mapOpen, selectedEvent]);

  return (
    <div className="space-y-6">
      <Panel tone="white">
        <Badge tone="yellow">{copy.member.feedBadge}</Badge>
        <h1 className="headline-lg mt-5">{copy.member.feedTitle}</h1>
      </Panel>
      {gateBlocked ? (
        <Panel tone="cream" shadow={false} className="p-4">
          <p className="unveiled-meta">{copy.member.membershipGate}</p>
          <p className="mt-2 text-sm font-bold uppercase tracking-widest">
            {copy.member.billingGate}
          </p>
        </Panel>
      ) : null}
      {feedMessage ? (
        <Panel tone="white" shadow={false} className="p-4">
          <p className="text-sm font-bold uppercase tracking-widest">
            {feedMessage}
          </p>
        </Panel>
      ) : null}
      <DiscoveryShell
        discovery={discovery}
        filterPanel={<DiscoveryFilterPanel />}
        mapPanel={
          <DiscoveryMapPanel
            events={visible}
            surface="member"
            tileUrlTemplate={mapProvider.tileUrlTemplate}
            actionLabel={copy.discovery.continueBooking}
            selectedMarkerIdOverride={selectedEvent?.id ?? null}
            onOpenEvent={(event) => {
              setSelectedEvent(event);
              setBookingEvent(event);
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
          if (actionId === "reset-all") {
            live.setDiscoveryFilters?.({});
            live.refetchActiveSurface();
          }
        }}
      >
        <div className="space-y-10 py-8">
          <div className="grid gap-5 lg:grid-cols-3">
            {visible.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onOpen={(event) => {
                  setSelectedEvent(event);
                  setBookingEvent(event);
                }}
                onSave={(selectedEvent) =>
                  void runServerAction(
                    () =>
                      selectedEvent.saved
                        ? actions.unsaveMemberEvent({
                            eventId: selectedEvent.id,
                          })
                        : actions.saveMemberEvent({
                            eventId: selectedEvent.id,
                          }),
                    setFeedMessage,
                    live.refetchActiveSurface,
                  )
                }
                onClick={(event) => {
                  setSelectedEvent(event);
                  setMapOpen(true);
                }}
              />
            ))}
            {visible.length === 0 ? (
              <StatePanel
                title={
                  live.isLoading
                    ? copy.discovery.loadingEvents
                    : copy.discovery.noMatchingEvents
                }
                text={
                  live.isError
                    ? copy.discovery.liveError
                    : copy.discovery.noMatches
                }
                state={
                  live.isLoading ? "loading" : live.isError ? "error" : "empty"
                }
                action={
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={live.refetchActiveSurface}
                  >
                    {copy.discovery.resetAll}
                  </Button>
                }
              />
            ) : null}
          </div>

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
        </div>
      </DiscoveryShell>
      {bookingEvent ? (
        <BookingModal
          key={bookingEvent.id}
          event={bookingEvent}
          onClose={() => setBookingEvent(null)}
        />
      ) : null}
    </div>
  );
}

export function BookingsPage() {
  const allCopy = useCopy();
  const copy = allCopy.member;
  const bookingCopy = allCopy.booking;
  const live = useLiveData();

  return (
    <div className="space-y-8 py-8">
      <Panel tone="white">
        <Badge tone="yellow">{copy.bookingsBadge}</Badge>
        <h1 className="headline-lg mt-5">{copy.bookingsTitle}</h1>
      </Panel>
      <div className="grid gap-5 lg:grid-cols-2">
        {live.bookings.map((booking) => (
          <Card key={booking.id} className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <Badge
                  tone={
                    booking.statusLabel === "Confirmed" ? "success" : "yellow"
                  }
                >
                  {booking.statusLabel}
                </Badge>
                <h2 className="mt-4 font-display text-4xl font-black uppercase leading-none">
                  {booking.eventTitle}
                </h2>
                <p className="mt-2 unveiled-meta opacity-45">
                  {booking.partnerName}
                </p>
              </div>
              <Badge tone="white">
                {booking.ticketCount} {copy.tickets}
              </Badge>
            </div>
            <Divider className="my-6" />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="unveiled-meta opacity-45">{booking.dateLabel}</p>
                <p className="mt-1 text-xs font-bold uppercase opacity-45">
                  {booking.eventAddress}
                </p>
                <p className="font-display text-3xl font-black uppercase">
                  {booking.redemptionCode}
                </p>
                {booking.redemptionUrl ? (
                  <p className="mt-2 break-all text-xs font-bold uppercase opacity-45">
                    {booking.redemptionUrl}
                  </p>
                ) : null}
                <p className="mt-2 text-xs font-bold uppercase opacity-45">
                  {booking.totalCredits} {copy.creditsSpent}
                </p>
              </div>
              <Button
                type="button"
                variant={booking.copied ? "copied" : "secondary"}
              >
                {booking.copied ? <Check /> : <Copy />}
                {booking.copied ? bookingCopy.copied : bookingCopy.copyCode}
              </Button>
            </div>
          </Card>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        {live.waitlistEntries.map((entry) => (
          <Card key={entry.id} className="p-6">
            <Badge tone="yellow">{entry.statusLabel}</Badge>
            <p className="headline-md mt-4">{entry.eventTitle}</p>
            <p className="mt-2 text-sm font-bold opacity-60">
              {entry.dateLabel} {" // "} {entry.eventAddress}
            </p>
            <p className="unveiled-meta mt-5 opacity-45">
              {entry.createdLabel}
            </p>
          </Card>
        ))}
      </div>
      <Panel tone="white">
        <Badge tone="yellow">{copy.creditLedger}</Badge>
        <div className="mt-5">
          <CreditLedgerViewTableSemantics
            entries={live.creditLedgerEntries}
            noHistoryLabel={copy.creditLedger}
            emptyLabel={copy.ledgerEmpty}
            memberActorLabel={copy.memberActor}
          />
        </div>
      </Panel>
      {live.bookings.length === 0 ? (
        <StatePanel
          title={live.isLoading ? copy.loadingBookings : copy.noBookings}
          text={live.isError ? copy.bookingsError : copy.bookingsEmpty}
          state={live.isLoading ? "loading" : live.isError ? "error" : "empty"}
          action={
            <Button type="button" variant="primary">
              {copy.browseEvents}
            </Button>
          }
        />
      ) : null}
      <Panel
        tone="dark"
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <span className="unveiled-meta opacity-60">{copy.ticketQuestion}</span>
        <Button type="button" variant="yellow">
          support@unveiled.berlin
          <Mail />
        </Button>
      </Panel>
    </div>
  );
}

export function ProfilePage() {
  const copy = useCopy().profile;
  const live = useLiveData();
  const [profileMessage, setProfileMessage] = useState<string>(
    copy.profileMessage,
  );
  const [membershipMessage, setMembershipMessage] = useState<string>(
    copy.membershipMessage,
  );
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "EXPRESS" | "PAYPAL" | "CARD" | "SEPA" | undefined
  >();
  const [preferenceMessage, setPreferenceMessage] = useState<string>(
    copy.preferenceMessage,
  );

  const [stripeInstance, setStripeInstance] = useState<
    import("@stripe/stripe-js").Stripe | null
  >(null);
  const cardElementRef = useRef<
    import("@stripe/stripe-js").StripeCardElement | null
  >(null);
  const sepaElementRef = useRef<
    import("@stripe/stripe-js").StripeIbanElement | null
  >(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    import("@stripe/stripe-js")
      .then(({ loadStripe }) => {
        const pubKey =
          import.meta.env.PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_mock";
        return loadStripe(pubKey);
      })
      .then((stripe) => {
        setStripeInstance(stripe);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!stripeInstance) return;

    if (selectedPaymentMethod === "CARD") {
      const el = document.getElementById("stripe-card-element");
      if (el) {
        if (cardElementRef.current) {
          cardElementRef.current.destroy();
        }
        const elements = stripeInstance.elements();
        const card = elements.create("card", {
          style: {
            base: {
              fontSize: "14px",
              color: "#202621",
              fontFamily: "monospace",
            },
          },
        });
        card.mount("#stripe-card-element");
        cardElementRef.current = card;
      }
    } else {
      if (cardElementRef.current) {
        cardElementRef.current.destroy();
        cardElementRef.current = null;
      }
    }

    if (selectedPaymentMethod === "SEPA") {
      const el = document.getElementById("stripe-sepa-element");
      if (el) {
        if (sepaElementRef.current) {
          sepaElementRef.current.destroy();
        }
        const elements = stripeInstance.elements();
        const iban = elements.create("iban", {
          supportedCountries: ["SEPA"],
          placeholderCountry: "DE",
          style: {
            base: {
              fontSize: "14px",
              color: "#202621",
              fontFamily: "monospace",
            },
          },
        });
        iban.mount("#stripe-sepa-element");
        sepaElementRef.current = iban;
      }
    } else {
      if (sepaElementRef.current) {
        sepaElementRef.current.destroy();
        sepaElementRef.current = null;
      }
    }
  }, [stripeInstance, selectedPaymentMethod]);

  return (
    <div className="space-y-8 py-8">
      <Panel
        tone="white"
        className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end"
      >
        <div>
          <Badge tone="success">{live.profile.membershipStatus}</Badge>
          <h1 className="headline-lg mt-5">{live.profile.name}</h1>
          <p className="mt-2 text-sm font-black uppercase tracking-widest opacity-55">
            {live.profile.email}
          </p>
        </div>
        <StatPanel
          label={copy.wallet}
          value={`${live.profile.credits}`}
          caption={`${live.profile.credits} credits`}
        />
      </Panel>
      <div className="grid gap-5 lg:grid-cols-3">
        <Panel
          tone="cream"
          shadow={false}
          as="form"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(
              event.currentTarget as HTMLFormElement,
            );
            void runServerAction(
              () =>
                actions.updateProfile({
                  firstName: String(formData.get("firstName") || ""),
                  lastName: String(formData.get("lastName") || ""),
                  language: String(formData.get("language") || "DE"),
                  billingAddress: String(formData.get("billingAddress") || ""),
                  newsletterOptIn: formData.get("newsletterOptIn") === "on",
                }),
              setProfileMessage,
              live.refetchActiveSurface,
            );
          }}
        >
          <p className="unveiled-meta">{copy.identity}</p>
          <p className="mt-3 text-xs font-bold uppercase tracking-widest opacity-55">
            {profileMessage}
          </p>
          <Field label={copy.name} className="mt-5">
            <TextInput name="firstName" defaultValue={live.profile.firstName} />
          </Field>
          <Field label={copy.lastName} className="mt-4">
            <TextInput name="lastName" defaultValue={live.profile.lastName} />
          </Field>
          <Field label={copy.email} className="mt-4">
            <TextInput defaultValue={live.profile.email} disabled />
          </Field>
          <Field label={copy.billingAddress} className="mt-4">
            <TextInput
              name="billingAddress"
              defaultValue={live.profile.billingAddress}
              placeholder="Berlin"
            />
          </Field>
          <Field label={copy.language} className="mt-4">
            <SelectInput name="language" defaultValue={live.profile.language}>
              <option value="DE">DE</option>
              <option value="EN">EN</option>
            </SelectInput>
          </Field>
          <label className="mt-4 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest">
            <input
              name="newsletterOptIn"
              type="checkbox"
              defaultChecked={live.profile.newsletterOptIn}
            />
            {copy.newsletter}
          </label>
          <a
            className="mt-4 block text-[10px] font-black uppercase tracking-widest underline"
            href="/api/account/password-recovery"
          >
            {copy.passwordRecovery}
          </a>
          <Button type="submit" className="mt-5" variant="secondary">
            {copy.saveProfile}
          </Button>
        </Panel>
        <Panel
          tone="white"
          shadow={false}
          as="form"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(
              event.currentTarget as HTMLFormElement,
            );
            void runServerAction(
              () =>
                actions.updateMembership({
                  paymentMethod: selectedPaymentMethod,
                  promoCode: String(formData.get("promoCode") || ""),
                  isFrozen: false,
                  isActive: false,
                }),
              setMembershipMessage,
              live.refetchActiveSurface,
            );
          }}
        >
          <p className="unveiled-meta">{copy.billing}</p>
          <p className="headline-md mt-5">{live.billingDisplay.planLabel}</p>
          <p className="mt-3 text-sm font-bold uppercase tracking-widest opacity-55">
            {live.billingDisplay.planPriceLabel} {" // "}
            {live.profile.monthlyCredits} {copy.creditsMonthly}
          </p>
          <p className="mt-3 text-xs font-bold uppercase tracking-widest opacity-55">
            {live.billingDisplay.subscriptionStatusLabel} {" // "}
            {live.billingDisplay.paymentMethodDisplay} {" // "}
            {copy.renews} {live.billingDisplay.nextBillDateLabel}
          </p>
          <p className="mt-3 text-xs font-bold uppercase tracking-widest opacity-55">
            {membershipMessage}
          </p>
          <div className="mt-5 space-y-4">
            <div>
              <p className="unveiled-meta opacity-55">Express</p>
              <button
                type="button"
                className={cn(
                  "mt-2 flex w-full items-center justify-center gap-2 border-4 border-brand-dark px-4 py-4 text-sm font-black uppercase tracking-widest",
                  selectedPaymentMethod === "EXPRESS"
                    ? "bg-brand-dark text-white"
                    : "bg-brand-yellow text-brand-dark",
                )}
                onClick={() => setSelectedPaymentMethod("EXPRESS")}
              >
                <CreditCard className="size-4" />
                Apple Pay / Google Pay
              </button>
            </div>
            <div>
              <p className="unveiled-meta opacity-55">PayPal</p>
              <button
                type="button"
                className={cn(
                  "mt-2 flex w-full items-center justify-center gap-2 border-4 border-brand-dark px-4 py-3 text-sm font-black uppercase tracking-widest",
                  selectedPaymentMethod === "PAYPAL"
                    ? "bg-brand-dark text-white"
                    : "bg-white text-brand-dark",
                )}
                onClick={() => setSelectedPaymentMethod("PAYPAL")}
              >
                PayPal
              </button>
            </div>
            <div>
              <p className="unveiled-meta opacity-55">{copy.standard}</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(["CARD", "SEPA"] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    className={cn(
                      "border-4 border-brand-dark px-3 py-3 text-[10px] font-black uppercase tracking-widest",
                      selectedPaymentMethod === method
                        ? "bg-brand-dark text-white"
                        : "bg-brand-grey text-brand-dark",
                    )}
                    onClick={() => setSelectedPaymentMethod(method)}
                  >
                    {method === "CARD" ? copy.card : copy.sepaDirectDebit}
                  </button>
                ))}
              </div>
              {selectedPaymentMethod === "CARD" ? (
                <Panel
                  tone="cream"
                  shadow={false}
                  className="mt-3 p-4 space-y-4 border-4 border-brand-dark shadow-[4px_4px_0_0_#202621]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {copy.cardDetails}
                    </span>
                    <div className="flex gap-1.5">
                      <span className="px-1.5 py-0.5 border-2 border-brand-dark bg-white text-[8px] font-black uppercase">
                        Visa
                      </span>
                      <span className="px-1.5 py-0.5 border-2 border-brand-dark bg-white text-[8px] font-black uppercase">
                        MC
                      </span>
                      <span className="px-1.5 py-0.5 border-2 border-brand-dark bg-white text-[8px] font-black uppercase">
                        Amex
                      </span>
                    </div>
                  </div>
                  <div className="border-4 border-brand-dark bg-white p-3 shadow-[4px_4px_0_0_#202621]">
                    <div
                      id="stripe-card-element"
                      className="min-h-[40px] w-full"
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      id="sync-billing-address"
                      name="syncBillingAddress"
                      defaultChecked
                      className="size-4 accent-brand-dark"
                    />
                    <label
                      htmlFor="sync-billing-address"
                      className="text-[9px] font-black uppercase tracking-widest cursor-pointer opacity-75"
                    >
                      {copy.billingSync}
                    </label>
                  </div>
                </Panel>
              ) : null}
              {selectedPaymentMethod === "SEPA" ? (
                <Panel
                  tone="cream"
                  shadow={false}
                  className="mt-3 p-4 space-y-4 border-4 border-brand-dark shadow-[4px_4px_0_0_#202621]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {copy.sepaDetails}
                    </span>
                    <div className="flex gap-1.5">
                      <span className="px-1.5 py-0.5 border-2 border-brand-dark bg-white text-[8px] font-black uppercase">
                        SEPA
                      </span>
                      <span className="px-1.5 py-0.5 border-2 border-brand-dark bg-white text-[8px] font-black uppercase">
                        IBAN
                      </span>
                    </div>
                  </div>
                  <div className="border-4 border-brand-dark bg-white p-3 shadow-[4px_4px_0_0_#202621]">
                    <div
                      id="stripe-sepa-element"
                      className="min-h-[40px] w-full"
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      id="sync-sepa-billing-address"
                      name="syncBillingAddress"
                      defaultChecked
                      className="size-4 accent-brand-dark"
                    />
                    <label
                      htmlFor="sync-sepa-billing-address"
                      className="text-[9px] font-black uppercase tracking-widest cursor-pointer opacity-75"
                    >
                      {copy.billingSync}
                    </label>
                  </div>
                </Panel>
              ) : null}
            </div>
          </div>
          <Field label={copy.promoCode} className="mt-4">
            <TextInput name="promoCode" placeholder={copy.optional} />
          </Field>
          <Button type="submit" variant="secondary" className="mt-6">
            <CreditCard />
            {copy.startCheckout}
          </Button>
        </Panel>
        <Panel
          tone="dark"
          shadow={false}
          as="form"
          onSubmit={(event) => {
            event.preventDefault();
            void runServerAction(
              () =>
                actions.saveOnboarding({
                  ageGroup: "26-35",
                  interests: ["Theater", "Kino"],
                  moods: ["Leicht"],
                  districts: ["Mitte"],
                  maxDistance: 10,
                  timing: ["After Work"],
                  preferredDays: ["Fr"],
                  preferredLanguages: ["DE"],
                  accessibility: false,
                  onboardingComplete: true,
                }),
              setPreferenceMessage,
              live.refetchActiveSurface,
            );
          }}
        >
          <p className="unveiled-meta opacity-55">{copy.vibes}</p>
          <p className="mt-3 text-xs font-bold uppercase tracking-widest opacity-60">
            {preferenceMessage}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {live.profile.vibes.map((vibe) => (
              <Badge key={vibe} tone="yellow">
                <Heart className="size-3" />
                {vibe}
              </Badge>
            ))}
            {live.profile.vibes.length === 0 ? (
              <Badge tone="white">{copy.noPreferences}</Badge>
            ) : null}
          </div>
          <div className="mt-8 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest opacity-60">
            <Loader2 className="size-4 animate-spin" />
            {copy.loadingPreview}
          </div>
          <Button type="submit" variant="yellow" className="mt-6">
            {copy.saveOnboarding}
          </Button>
        </Panel>
      </div>
    </div>
  );
}
