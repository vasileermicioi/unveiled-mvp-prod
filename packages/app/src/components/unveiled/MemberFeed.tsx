import { actions } from "astro:actions";
import {
  Badge,
  Button,
  Card,
  cn,
  Divider,
  Field,
  MemberFeedGatePresentational,
  MemberFeedHeaderPresentational,
  MemberFeedMessagePresentational,
  SelectInput,
  StatePanel,
  TextInput,
} from "@unveiled/design-system";
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
import { CreditLedgerViewTableSemantics } from "~/components/payments/CreditLedgerViewTableSemantics";
import { StripeCheckoutRedirectButton } from "~/components/payments/StripeCheckoutRedirectButton";
import { SubscriptionPortalLink } from "~/components/payments/SubscriptionPortalLink";
import { DiscoveryShell } from "~/components/unveiled/app-shell";
import { DiscoveryMapPanel } from "~/components/unveiled/discovery-map";
import { demoDiscoveryShell } from "~/lib/app-shell-view-models";
import { readDiscoveryMapProviderConfig } from "~/lib/discovery-map";
import type { EventCardView } from "~/lib/unveiled-view-models";
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
          <div className="form-shell">
            <h3 className="unveiled-meta">{t.ageLabel}</h3>
            <div className="grid-cols-2 ui-b8d98b91">
              {(["18-25", "26-35", "36-50", "50+"] as const).map((age) => (
                <button
                  key={age}
                  type="button"
                  className={cn(
                    "ui-27cfa296",
                    ageGroup === age
                      ? "ui-806c1ffa"
                      : "hover:bg-brand-yellow ui-43236367",
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
          <div className="ui-0dcc1c9a">
            <div>
              <h3 className="unveiled-meta ui-e2be8f63">
                <Heart className="ui-39ebf323" />
                {t.interestLabel}
              </h3>
              <div className="app-page-toolbar">
                {onboardingPreferenceOptions.interests.map((opt) => {
                  const selected = preferences.interests.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      className={cn(
                        "ui-0bfc9c2a",
                        selected
                          ? "ui-339fce45"
                          : "hover:opacity-100 ui-a251db21",
                      )}
                      onClick={() => togglePreference("interests", opt)}
                    >
                      <Heart
                        className={cn(
                          "ui-5e34f531",
                          selected ? "ui-53125860" : "ui-f854ac8d",
                        )}
                      />
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <h3 className="unveiled-meta ui-100ee6f9">{t.moodLabel}</h3>
              <div className="app-page-toolbar">
                {onboardingPreferenceOptions.moods.map((opt) => {
                  const selected = preferences.moods.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      className={cn(
                        "ui-3d234ff4",
                        selected
                          ? "ui-339fce45"
                          : "hover:opacity-100 ui-a251db21",
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
          <div className="ui-0dcc1c9a">
            <div>
              <h3 className="unveiled-meta ui-100ee6f9">{t.districtLabel}</h3>
              <div className="app-page-toolbar">
                {onboardingPreferenceOptions.districts.map((opt) => {
                  const selected = preferences.districts.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      className={cn(
                        "ui-3d234ff4",
                        selected
                          ? "ui-339fce45"
                          : "hover:opacity-100 ui-a251db21",
                      )}
                      onClick={() => togglePreference("districts", opt)}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="ui-332bf778">
              <div className="ui-bfa969af">
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
                className="appearance-none ui-0a6e9a0a"
              />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="ui-0dcc1c9a">
            <div>
              <h3 className="unveiled-meta ui-100ee6f9">{t.timingLabel}</h3>
              <div className="app-page-toolbar">
                {onboardingPreferenceOptions.timing.map((opt) => {
                  const selected = preferences.timing.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      className={cn(
                        "ui-3d234ff4",
                        selected
                          ? "ui-339fce45"
                          : "hover:opacity-100 ui-a251db21",
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
              <h3 className="unveiled-meta ui-100ee6f9">{t.daysLabel}</h3>
              <div className="app-page-toolbar">
                {onboardingPreferenceOptions.preferredDays.map((opt) => {
                  const selected = preferences.preferredDays.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      className={cn(
                        "ui-91da8c5b",
                        selected
                          ? "ui-339fce45"
                          : "hover:opacity-100 ui-a251db21",
                      )}
                      onClick={() => togglePreference("preferredDays", opt)}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="ui-381ac7ab">
              <div className="ui-f446f70f">
                <div className="ui-7bd5bab6">
                  <h3 className="unveiled-meta ui-100ee6f9">
                    {t.languagePrefLabel}
                  </h3>
                  <div className="ui-c354e22d">
                    {onboardingPreferenceOptions.preferredLanguages.map(
                      (opt) => {
                        const selected =
                          preferences.preferredLanguages.includes(opt);
                        return (
                          <button
                            key={opt}
                            type="button"
                            className={cn(
                              "ui-3d234ff4",
                              selected
                                ? "ui-339fce45"
                                : "hover:opacity-100 ui-a251db21",
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

                <div className="ui-8c9b1785">
                  <span className="unveiled-meta ui-8fb8f1e3">
                    {t.accessibilityLabel}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAccessibility(!accessibility)}
                    className={cn(
                      "ui-aa27266c",
                      accessibility ? "ui-4d8a42b1" : "ui-118d27de",
                    )}
                  >
                    <div
                      className={cn(
                        "ui-754fe500",
                        accessibility ? "ui-89d755d9" : "ui-a99fedaa",
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
    <div className="ui-9eecda81">
      <Card tone="white" className="form-shell">
        <Badge tone="yellow">{copy.badge}</Badge>
        <h1 className="headline-lg">{t.title}</h1>
        <p className="ui-6183b14a">{step === 1 ? t.ageSubtitle : t.subtitle}</p>

        {/* Progress Bar */}
        <div className="ui-5ca89c87">
          <div className="ui-d771bb33">
            <span className="ui-51a57728">Step: {step}/4</span>
            <span className="ui-5b44b59f">{Math.round((step / 4) * 100)}%</span>
          </div>
          <div className="ui-bd2df8e4">
            <div
              className="ui-d14b4dea"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {message !== copy.message ? (
          <p className="ui-fc02f185">{message}</p>
        ) : null}
      </Card>

      <Card tone="dark" className="ui-9bebec22">
        <div className="form-shell">
          <p className="unveiled-meta ui-eec042e4">{copy.preview}</p>
          {renderStep()}
        </div>

        <div className="ui-f3f48e34">
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
            className="ui-7bd5bab6"
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
            <ArrowRight className="ui-100c22d5" />
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
      </Card>
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
    <div className="ui-9eecda81">
      <Card tone="white" className="form-shell">
        <Badge tone="yellow">{copy.badge}</Badge>
        <div>
          <h1 className="headline-lg">{copy.plan}</h1>
          <p className="ui-427f05bd">{copy.price}</p>
          <p className="ui-91a6d00c">{copy.body}</p>
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
        <div className="ui-c7f94043">
          {copy.perks.map((perk) => (
            <Badge key={perk} tone="white" className="ui-c62ec162">
              <Check className="ui-5e34f531" />
              {perk}
            </Badge>
          ))}
        </div>
      </Card>

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
    <div className="form-shell">
      <MemberFeedHeaderPresentational
        badge={copy.member.feedBadge}
        title={copy.member.feedTitle}
      />
      {gateBlocked ? (
        <MemberFeedGatePresentational
          membershipGate={copy.member.membershipGate}
          billingGate={copy.member.billingGate}
        />
      ) : null}
      <MemberFeedMessagePresentational message={feedMessage} />
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
        <div className="ui-09729a1a">
          <div className="ui-fde9ee23">
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
            <div className="ui-21e8ca97">
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
                <ArrowLeft className="ui-c9577821" />
                {selectedLanguage === "DE" ? "Zurück" : "Previous"}
              </Button>
              <span className="ui-dd5eece2">
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
                <ArrowRight className="ui-be66dea2" />
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
    <div className="ui-e400b83c">
      <Card tone="white">
        <Badge tone="yellow">{copy.bookingsBadge}</Badge>
        <h1 className="headline-lg ui-71dd032f">{copy.bookingsTitle}</h1>
      </Card>
      <div className="ui-9471e6c9">
        {live.bookings.map((booking) => (
          <Card key={booking.id} className="ui-c4328367">
            <div className="ui-fbec7f22">
              <div>
                <Badge
                  tone={
                    booking.statusLabel === "Confirmed" ? "success" : "yellow"
                  }
                >
                  {booking.statusLabel}
                </Badge>
                <h2 className="ui-9d5b5271">{booking.eventTitle}</h2>
                <p className="unveiled-meta ui-064a4509">
                  {booking.partnerName}
                </p>
              </div>
              <Badge tone="white">
                {booking.ticketCount} {copy.tickets}
              </Badge>
            </div>
            <Divider className="ui-5e36d9e2" />
            <div className="ui-204f9214">
              <div>
                <p className="unveiled-meta ui-378d3a2b">{booking.dateLabel}</p>
                <p className="ui-e844b9ae">{booking.eventAddress}</p>
                <p className="ui-183f0876">{booking.redemptionCode}</p>
                {booking.redemptionUrl ? (
                  <p className="ui-509b567d">{booking.redemptionUrl}</p>
                ) : null}
                <p className="ui-8505a5bf">
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
      <div className="ui-9471e6c9">
        {live.waitlistEntries.map((entry) => (
          <Card key={entry.id} className="ui-c4328367">
            <Badge tone="yellow">{entry.statusLabel}</Badge>
            <p className="headline-md ui-459fecc1">{entry.eventTitle}</p>
            <p className="ui-227e60d5">
              {entry.dateLabel} {" // "} {entry.eventAddress}
            </p>
            <p className="unveiled-meta ui-593a5608">{entry.createdLabel}</p>
          </Card>
        ))}
      </div>
      <Card tone="white">
        <Badge tone="yellow">{copy.creditLedger}</Badge>
        <div className="ui-a752cdc8">
          <CreditLedgerViewTableSemantics
            entries={live.creditLedgerEntries}
            noHistoryLabel={copy.creditLedger}
            emptyLabel={copy.ledgerEmpty}
            memberActorLabel={copy.memberActor}
          />
        </div>
      </Card>
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
      <Card tone="dark" className="ui-55efb4da">
        <span className="unveiled-meta ui-603a84e4">{copy.ticketQuestion}</span>
        <Button type="button" variant="yellow">
          support@unveiled.berlin
          <Mail />
        </Button>
      </Card>
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
    <div className="ui-e400b83c">
      <Card tone="white" className="ui-d79a7edd">
        <div>
          <Badge tone="success">{live.profile.membershipStatus}</Badge>
          <h1 className="headline-lg ui-71dd032f">{live.profile.name}</h1>
          <p className="ui-ea5bc96e">{live.profile.email}</p>
        </div>
        <StatPanel
          label={copy.wallet}
          value={`${live.profile.credits}`}
          caption={`${live.profile.credits} credits`}
        />
      </Card>
      <div className="ui-fde9ee23">
        <Card
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
          <p className="ui-9c3ea6ed">{profileMessage}</p>
          <Field label={copy.name} className="ui-a752cdc8">
            <TextInput name="firstName" defaultValue={live.profile.firstName} />
          </Field>
          <Field label={copy.lastName} className="ui-dc1d1f5a">
            <TextInput name="lastName" defaultValue={live.profile.lastName} />
          </Field>
          <Field label={copy.email} className="ui-dc1d1f5a">
            <TextInput defaultValue={live.profile.email} disabled />
          </Field>
          <Field label={copy.billingAddress} className="ui-dc1d1f5a">
            <TextInput
              name="billingAddress"
              defaultValue={live.profile.billingAddress}
              placeholder="Berlin"
            />
          </Field>
          <Field label={copy.language} className="ui-dc1d1f5a">
            <SelectInput name="language" defaultValue={live.profile.language}>
              <option value="DE">DE</option>
              <option value="EN">EN</option>
            </SelectInput>
          </Field>
          <label className="ui-726f6a6a">
            <input
              name="newsletterOptIn"
              type="checkbox"
              defaultChecked={live.profile.newsletterOptIn}
            />
            {copy.newsletter}
          </label>
          <a className="ui-8595fd7b" href="/api/account/password-recovery">
            {copy.passwordRecovery}
          </a>
          <Button type="submit" className="ui-a752cdc8" variant="secondary">
            {copy.saveProfile}
          </Button>
        </Card>
        <Card
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
          <p className="headline-md ui-54e0c144">
            {live.billingDisplay.planLabel}
          </p>
          <p className="ui-91a6d00c">
            {live.billingDisplay.planPriceLabel} {" // "}
            {live.profile.monthlyCredits} {copy.creditsMonthly}
          </p>
          <p className="ui-9c3ea6ed">
            {live.billingDisplay.subscriptionStatusLabel} {" // "}
            {live.billingDisplay.paymentMethodDisplay} {" // "}
            {copy.renews} {live.billingDisplay.nextBillDateLabel}
          </p>
          <p className="ui-9c3ea6ed">{membershipMessage}</p>
          <div className="ui-594b0628">
            <div>
              <p className="unveiled-meta ui-eec042e4">Express</p>
              <button
                type="button"
                className={cn(
                  "ui-58f6943a",
                  selectedPaymentMethod === "EXPRESS"
                    ? "ui-806c1ffa"
                    : "ui-339fce45",
                )}
                onClick={() => setSelectedPaymentMethod("EXPRESS")}
              >
                <CreditCard className="ui-100c22d5" />
                Apple Pay / Google Pay
              </button>
            </div>
            <div>
              <p className="unveiled-meta ui-eec042e4">PayPal</p>
              <button
                type="button"
                className={cn(
                  "ui-f737047d",
                  selectedPaymentMethod === "PAYPAL"
                    ? "ui-806c1ffa"
                    : "ui-33aa3bf7",
                )}
                onClick={() => setSelectedPaymentMethod("PAYPAL")}
              >
                PayPal
              </button>
            </div>
            <div>
              <p className="unveiled-meta ui-eec042e4">{copy.standard}</p>
              <div className="grid-cols-2 ui-f768e37c">
                {(["CARD", "SEPA"] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    className={cn(
                      "ui-803fe62e",
                      selectedPaymentMethod === method
                        ? "ui-806c1ffa"
                        : "ui-5b1dce35",
                    )}
                    onClick={() => setSelectedPaymentMethod(method)}
                  >
                    {method === "CARD" ? copy.card : copy.sepaDirectDebit}
                  </button>
                ))}
              </div>
              {selectedPaymentMethod === "CARD" ? (
                <Card tone="cream" shadow={false} className="ui-a0bea5c6">
                  <div className="ui-bd0c0617">
                    <span className="ui-b3c584cf">{copy.cardDetails}</span>
                    <div className="ui-3466874b">
                      <span className="ui-b9bb0673">Visa</span>
                      <span className="ui-b9bb0673">MC</span>
                      <span className="ui-b9bb0673">Amex</span>
                    </div>
                  </div>
                  <div className="ui-2bf9952e">
                    <div id="stripe-card-element" className="ui-727a96dd" />
                  </div>
                  <div className="ui-4696c3a8">
                    <input
                      type="checkbox"
                      id="sync-billing-address"
                      name="syncBillingAddress"
                      defaultChecked
                      className="ui-4af27ddf"
                    />
                    <label
                      htmlFor="sync-billing-address"
                      className="ui-404be656"
                    >
                      {copy.billingSync}
                    </label>
                  </div>
                </Card>
              ) : null}
              {selectedPaymentMethod === "SEPA" ? (
                <Card tone="cream" shadow={false} className="ui-a0bea5c6">
                  <div className="ui-bd0c0617">
                    <span className="ui-b3c584cf">{copy.sepaDetails}</span>
                    <div className="ui-3466874b">
                      <span className="ui-b9bb0673">SEPA</span>
                      <span className="ui-b9bb0673">IBAN</span>
                    </div>
                  </div>
                  <div className="ui-2bf9952e">
                    <div id="stripe-sepa-element" className="ui-727a96dd" />
                  </div>
                  <div className="ui-4696c3a8">
                    <input
                      type="checkbox"
                      id="sync-sepa-billing-address"
                      name="syncBillingAddress"
                      defaultChecked
                      className="ui-4af27ddf"
                    />
                    <label
                      htmlFor="sync-sepa-billing-address"
                      className="ui-404be656"
                    >
                      {copy.billingSync}
                    </label>
                  </div>
                </Card>
              ) : null}
            </div>
          </div>
          <Field label={copy.promoCode} className="ui-dc1d1f5a">
            <TextInput name="promoCode" placeholder={copy.optional} />
          </Field>
          <Button type="submit" variant="secondary" className="ui-356df208">
            <CreditCard />
            {copy.startCheckout}
          </Button>
        </Card>
        <Card
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
          <p className="unveiled-meta ui-eec042e4">{copy.vibes}</p>
          <p className="ui-f439dc75">{preferenceMessage}</p>
          <div className="ui-cfd20cc3">
            {live.profile.vibes.map((vibe) => (
              <Badge key={vibe} tone="yellow">
                <Heart className="ui-5e34f531" />
                {vibe}
              </Badge>
            ))}
            {live.profile.vibes.length === 0 ? (
              <Badge tone="white">{copy.noPreferences}</Badge>
            ) : null}
          </div>
          <div className="ui-3b430659">
            <Loader2 className="ui-43705efa" />
            {copy.loadingPreview}
          </div>
          <Button type="submit" variant="yellow" className="ui-356df208">
            {copy.saveOnboarding}
          </Button>
        </Card>
      </div>
    </div>
  );
}
