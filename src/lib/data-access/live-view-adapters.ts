import type { DiscoveryFilters } from "@/lib/data-access/query-keys";
import type {
  AdminData,
  MemberData,
  PartnerData,
  PublicDiscoveryData,
} from "@/lib/data-access/repositories";
import { normalizeLanguage } from "@/lib/i18n";
import type {
  EventCardView,
  WaitlistCardView,
} from "@/lib/unveiled-view-models";

export type LiveProfileView = {
  name: string;
  email: string;
  firstName: string;
  lastName: string;
  membershipStatus: string;
  credits: number;
  monthlyCredits: number;
  vibes: string[];
  language: "DE" | "EN";
  billingAddress: string;
  newsletterOptIn: boolean;
  onboardingComplete: boolean;
};

export type LiveBillingView = {
  planLabel: string;
  planPriceLabel: string;
  subscriptionStatusLabel: string;
  nextBillDateLabel: string;
  paymentMethodDisplay: string;
};

export type LiveDataView = {
  events: EventCardView[];
  publicCategories: string[];
  publicPartnerOptions: Array<{ id: string; name: string }>;
  publicPartners: PublicDiscoveryData["activePartners"];
  publicStats: Array<{ label: string; value: string; caption: string }>;
  visibleEventCountLabel: string;
  activeRangeLabel: string;
  activeFilterCount: number;
  discoveryFilters: DiscoveryFilters;
  savedCount: number;
  bookings: MemberData["bookings"];
  creditLedgerEntries: MemberData["wallet"]["ledger"];
  waitlistEntries: WaitlistCardView[];
  profile: LiveProfileView;
  billingDisplay: LiveBillingView;
  partner: PartnerData["partner"] | null;
  partnerEventOptions: PartnerData["eventOptions"];
  partnerGuests: Array<{
    bookingId: string;
    eventId: string;
    partnerId?: string;
    name: string;
    email: string;
    eventTitle: string;
    tickets: number;
    statusLabel: string;
    checkedInLabel: string;
    checkInDisabled: boolean;
    exportCode: string;
  }>;
  partnerGuestTotal: string;
  adminDashboardMetrics: Array<{
    label: string;
    value: string;
    caption: string;
  }>;
  adminEvents: AdminData["events"];
  adminPartners: AdminData["partners"];
  adminMembers: AdminData["members"];
  isLoading: boolean;
  isError: boolean;
  refetchActiveSurface: () => void;
  setDiscoveryFilters?: (filters: DiscoveryFilters) => void;
};

export const emptyPublicData: PublicDiscoveryData = {
  featuredEvents: [],
  activePartners: [],
  categories: [],
  partnerOptions: [],
  stats: {
    upcomingEventCount: 0,
    activePartnerCount: 0,
    membershipCategoryLabels: [],
  },
};

export const emptyLiveDataView: LiveDataView = {
  events: [],
  publicCategories: [],
  publicPartnerOptions: [],
  publicPartners: [],
  publicStats: [
    { label: "Events this week", value: "0", caption: "Curated by the team" },
    { label: "Partner venues", value: "0", caption: "Across Berlin" },
    { label: "Credits included", value: "10", caption: "Every month" },
  ],
  visibleEventCountLabel: "0 visible events",
  activeRangeLabel: "Upcoming",
  activeFilterCount: 0,
  discoveryFilters: {},
  savedCount: 0,
  bookings: [],
  creditLedgerEntries: [],
  waitlistEntries: [],
  profile: {
    name: "Member",
    email: "",
    firstName: "",
    lastName: "",
    membershipStatus: "Inactive",
    credits: 0,
    monthlyCredits: 10,
    vibes: [],
    language: "DE",
    billingAddress: "",
    newsletterOptIn: false,
    onboardingComplete: false,
  },
  billingDisplay: {
    planLabel: "Basic Berlin",
    planPriceLabel: "29€/mo",
    subscriptionStatusLabel: "Inactive",
    nextBillDateLabel: "Not scheduled",
    paymentMethodDisplay: "Not set",
  },
  partner: null,
  partnerEventOptions: [],
  partnerGuests: [],
  partnerGuestTotal: "0 guests",
  adminDashboardMetrics: [
    { label: "Bookings", value: "0", caption: "Confirmed access" },
    { label: "Members", value: "0", caption: "Active accounts" },
    { label: "Partners", value: "0", caption: "Active venues" },
  ],
  adminEvents: [],
  adminPartners: [],
  adminMembers: [],
  isLoading: false,
  isError: false,
  refetchActiveSurface: () => undefined,
};

export function createLiveDataView(input: {
  publicData: PublicDiscoveryData;
  memberData?: MemberData;
  partnerData?: PartnerData;
  adminData?: AdminData;
  isLoading: boolean;
  isError: boolean;
  refetchActiveSurface: () => void;
  setDiscoveryFilters?: (filters: DiscoveryFilters) => void;
  discoveryFilters?: DiscoveryFilters;
}): LiveDataView {
  const memberProfile = input.memberData?.profile;
  const preferences = input.memberData?.preferences;
  const events = (input.memberData?.discovery.featuredEvents ??
    input.publicData.featuredEvents) as EventCardView[];
  const language = normalizeLanguage(
    input.memberData?.profile.language ?? events[0]?.language,
  );
  const credits = memberProfile?.credits ?? 0;
  const vibes = [
    ...(preferences?.interests ?? []),
    ...(preferences?.moods ?? []),
    ...(preferences?.districts ?? []),
  ].slice(0, 6);
  const guests =
    input.partnerData?.guests.map((guest) => ({
      bookingId: guest.bookingId,
      eventId: guest.eventId,
      partnerId: guest.partnerId,
      name: guest.guestName,
      email: guest.guestEmail,
      eventTitle: guest.eventTitle,
      tickets: guest.tickets,
      statusLabel: guest.statusLabel,
      checkedInLabel:
        guest.checkedInLabel === "Not checked in"
          ? guest.checkInAvailableLabel
          : "Checked in",
      checkInDisabled:
        guest.checkedInLabel !== "Not checked in" ||
        guest.checkInAvailableLabel !== "Check-in available",
      exportCode: guest.redemptionCode ?? "",
    })) ?? [];
  const guestCount =
    input.partnerData?.ticketCount ??
    guests.reduce((sum, guest) => sum + guest.tickets, 0);

  return {
    events,
    publicCategories: input.publicData.categories,
    publicPartnerOptions: input.publicData.partnerOptions,
    publicPartners: input.publicData.activePartners,
    publicStats: [
      {
        label: language === "DE" ? "Events diese Woche" : "Events this week",
        value: `${input.publicData.stats.upcomingEventCount}`,
        caption:
          language === "DE" ? "Vom Team kuratiert" : "Curated by the team",
      },
      {
        label: language === "DE" ? "Partner Venues" : "Partner venues",
        value: `${input.publicData.stats.activePartnerCount}`,
        caption: language === "DE" ? "In ganz Berlin" : "Across Berlin",
      },
      {
        label: language === "DE" ? "Credits inklusive" : "Credits included",
        value: "10",
        caption: language === "DE" ? "Jeden Monat" : "Every month",
      },
    ],
    visibleEventCountLabel:
      language === "DE"
        ? `${events.length} sichtbare Events`
        : `${events.length} visible events`,
    activeRangeLabel:
      input.memberData?.discovery.activeRangeLabel ??
      (language === "DE" ? "Kommend" : "Upcoming"),
    activeFilterCount: input.memberData?.discovery.activeFilterCount ?? 0,
    discoveryFilters: input.discoveryFilters ?? {},
    savedCount:
      input.memberData?.discovery.savedEventIds.length ??
      events.filter((event) => event.saved).length,
    bookings: input.memberData?.bookings ?? [],
    creditLedgerEntries: input.memberData?.wallet.ledger ?? [],
    waitlistEntries: [],
    profile: {
      name: memberProfile?.fullName ?? "Member",
      email: memberProfile?.email ?? "",
      firstName: memberProfile?.firstName ?? "",
      lastName: memberProfile?.lastName ?? "",
      membershipStatus: memberProfile?.statusBadgeLabel ?? "Inactive",
      credits,
      monthlyCredits: 10,
      vibes,
      language,
      billingAddress:
        memberProfile?.billingAddress === "Not set"
          ? ""
          : (memberProfile?.billingAddress ?? ""),
      newsletterOptIn: memberProfile?.newsletterOptIn ?? false,
      onboardingComplete: memberProfile?.onboardingComplete ?? false,
    },
    billingDisplay: {
      planLabel: memberProfile?.currentPlanLabel ?? "Basic Berlin",
      planPriceLabel: "29€/mo",
      subscriptionStatusLabel: memberProfile?.statusBadgeLabel ?? "Inactive",
      nextBillDateLabel: memberProfile?.nextBillDate ?? "Not scheduled",
      paymentMethodDisplay: memberProfile?.paymentMethod ?? "Not set",
    },
    partner: input.partnerData?.partner ?? null,
    partnerEventOptions: input.partnerData?.eventOptions ?? [],
    partnerGuests: guests,
    partnerGuestTotal: `${guestCount} guests`,
    adminDashboardMetrics: [
      {
        label: "Bookings",
        value: `${input.adminData?.dashboard.totalBookings ?? input.adminData?.dashboard.confirmedBookingCount ?? 0}`,
        caption: `${input.adminData?.dashboard.confirmedBookingCount ?? 0} confirmed`,
      },
      {
        label: "Credits burned",
        value: `${input.adminData?.dashboard.creditsBurned ?? 0}`,
        caption: "Across bookings",
      },
      {
        label: "Partners",
        value: `${input.adminData?.dashboard.activePartnerCount ?? 0}`,
        caption: "Active venues",
      },
      {
        label: "Guests",
        value: `${input.adminData?.dashboard.totalGuests ?? 0}`,
        caption: `${input.adminData?.dashboard.memberCount ?? 0} members`,
      },
    ],
    adminEvents: input.adminData?.events ?? [],
    adminPartners: input.adminData?.partners ?? [],
    adminMembers: input.adminData?.members ?? [],
    isLoading: input.isLoading,
    isError: input.isError,
    refetchActiveSurface: input.refetchActiveSurface,
    setDiscoveryFilters: input.setDiscoveryFilters,
  };
}
