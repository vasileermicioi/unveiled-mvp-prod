import type { InferSelectModel } from "drizzle-orm";

import type {
  bookings,
  creditLedgerEntries,
  events,
  partners,
  user,
  userProfiles,
  waitlistEntries,
} from "@/db/schema";
import { copyFor, type UiLanguage } from "@/lib/i18n";
import type { CalendarEventMetadata } from "@/lib/unveiled-view-models";

export type EventRow = InferSelectModel<typeof events>;
export type PartnerRow = InferSelectModel<typeof partners>;
export type BookingRow = InferSelectModel<typeof bookings>;
export type UserRow = InferSelectModel<typeof user>;
export type UserProfileRow = InferSelectModel<typeof userProfiles>;
export type CreditLedgerRow = InferSelectModel<typeof creditLedgerEntries>;
export type WaitlistRow = InferSelectModel<typeof waitlistEntries>;

export type DataAccessEventView = {
  language: UiLanguage;
  id: string;
  title: string;
  partnerName: string;
  partnerId: string;
  category: string;
  dateLabel: string;
  neighborhood: string;
  address: string;
  imageUrl: string;
  creditPrice: number;
  remainingCapacity: number;
  capacityLabel: string;
  ticketType: string;
  description: string;
  saved: boolean;
  ctaLabel: string;
  mapLabel: string;
  lat?: number | null;
  lng?: number | null;
  mapReady?: boolean;
  bookingAvailabilityState?: "available" | "frozen";
  membershipCta?: string;
  calendarMetadata?: CalendarEventMetadata;
};

export type DataAccessPartnerView = {
  id: string;
  name: string;
  address: string;
  contactEmail?: string;
  logoUrl?: string | null;
  logoInitial: string;
  venueQrUrl?: string;
  venueQrTokenStatus: "active" | "missing";
  venueQrTokenLabel: string;
  portalUserEmail?: string | null;
};

export type DataAccessBookingView = {
  language: UiLanguage;
  id: string;
  eventId: string;
  partnerId: string;
  eventTitle: string;
  dateLabel: string;
  partnerName: string;
  eventAddress: string;
  ticketCount: number;
  totalCredits: number;
  statusLabel: string;
  redemptionType: "SECRET_CODE" | "VOUCHER";
  redemptionCode: string;
  redemptionUrl?: string;
  checkedInLabel: string;
  copied: false;
  calendarMetadata?: CalendarEventMetadata;
};

export type DataAccessLedgerView = {
  id: string;
  amount: number;
  direction: "credit" | "debit";
  reasonLabel: string;
  relatedLabel?: string;
  actorLabel?: string;
  createdLabel: string;
  resultingBalance: number;
};

export type DataAccessProfileView = {
  userId: string;
  fullName: string;
  email?: string;
  firstName: string | null;
  lastName: string | null;
  credits: number;
  currentPlanLabel: string;
  statusBadgeLabel: string;
  nextBillDate: string;
  billingAddress: string;
  paymentMethod: string;
  language: "DE" | "EN";
  onboardingComplete: boolean;
  subscriptionStatus?: string;
  profileComplete?: boolean;
  newsletterOptIn?: boolean;
};

export type DataAccessPreferencesView = {
  ageGroup: string | null;
  interests: string[];
  moods: string[];
  districts: string[];
  maxDistance: number;
  timing: string[];
  preferredDays: string[];
  preferredLanguages: string[];
  accessibility: boolean;
};

export type DataAccessGuestView = {
  bookingId: string;
  eventId: string;
  partnerId: string;
  userId: string;
  userShortId: string;
  guestName: string;
  guestEmail: string;
  eventTitle: string;
  redemptionCode: string | null;
  statusLabel: string;
  tickets: number;
  createdAt: string;
  checkedInLabel: string;
  checkInAvailableLabel: string;
};

export type DataAccessAdminEventView = {
  id: string;
  title: string;
  partnerId: string;
  partnerName: string;
  dateLabel: string;
  codeStrategyLabel: string;
  ticketAvailabilityLabel: string;
  creditPrice: number;
  imageUrl: string;
  exportAvailable: boolean;
  capacityLabel: string;
  statusLabel: string;
};

export type DataAccessAdminPartnerView = {
  id: string;
  name: string;
  address: string;
  contactEmail: string;
  logoUrl?: string | null;
  logoInitial: string;
  venueQrTokenLabel: string;
  venueQrTokenStatus: "active" | "missing";
  venueQrUrl?: string;
  portalLoginLabel: string;
  portalUserEmail?: string | null;
  portalUserId?: string | null;
};

export type DataAccessAdminMemberView = {
  userId: string;
  fullName: string;
  email: string;
  roleLabel: string;
  subscriptionStatusLabel: string;
  credits: number;
  bookingCount: number;
  eventOpenCount: number;
  savedCount: number;
  waitlistCount: number;
  providerCustomerId?: string | null;
  providerSubscriptionId?: string | null;
  providerStatus?: string | null;
  lastProviderSyncLabel?: string;
  currentPeriodLabel?: string;
  billingOverrideActions: Array<"freeze" | "unfreeze">;
  preferencesSummary: string;
  historySummary: string;
};

export function formatDateLabel(value: Date | string | null | undefined) {
  if (!value) return "Not scheduled";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "Not scheduled";
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function mapCalendarMetadata(input: {
  event: Pick<
    EventRow,
    "id" | "title" | "description" | "address" | "dateTime" | "eventWebsiteUrl"
  >;
  partnerName: string;
}): CalendarEventMetadata | undefined {
  const start =
    input.event.dateTime instanceof Date
      ? input.event.dateTime
      : new Date(input.event.dateTime);

  if (
    Number.isNaN(start.getTime()) ||
    !input.event.title.trim() ||
    !input.event.address.trim()
  ) {
    return undefined;
  }

  return {
    eventId: input.event.id,
    title: input.event.title,
    description: input.event.description,
    partnerName: input.partnerName,
    address: input.event.address,
    startDateTime: start.toISOString(),
    url: input.event.eventWebsiteUrl ?? undefined,
  };
}

export function mapEventView(input: {
  event: EventRow;
  partner?: Pick<PartnerRow, "id" | "name"> | null;
  saved?: boolean;
  bookingAvailabilityState?: "available" | "frozen";
  membershipCta?: string;
  language?: UiLanguage;
}): DataAccessEventView {
  const language = input.language ?? "EN";
  const copy = copyFor(language).event;
  const ticketType =
    input.event.remainingCapacity <= 0
      ? copy.waitlist
      : input.event.ticketType === "VOUCHER"
        ? copy.voucher
        : copy.secretCode;
  const partnerName = input.partner?.name ?? "Partner";

  return {
    id: input.event.id,
    language,
    title: input.event.title,
    partnerName,
    partnerId: input.partner?.id ?? input.event.partnerId,
    category: input.event.category,
    dateLabel: formatDateLabel(input.event.dateTime),
    neighborhood: input.event.neighborhood,
    address: input.event.address,
    imageUrl: input.event.imageUrl,
    creditPrice: input.event.creditPrice,
    remainingCapacity: input.event.remainingCapacity,
    capacityLabel:
      input.event.remainingCapacity <= 0
        ? copy.waitlist
        : `${input.event.remainingCapacity} ${copy.available}`,
    ticketType,
    description: input.event.description,
    saved: input.saved ?? false,
    ctaLabel:
      input.event.remainingCapacity <= 0 ? copy.joinWaitlist : copy.bookNow,
    mapLabel: `${input.event.neighborhood} ${input.event.category}`,
    lat: input.event.lat ?? undefined,
    lng: input.event.lng ?? undefined,
    mapReady:
      typeof input.event.lat === "number" &&
      typeof input.event.lng === "number",
    bookingAvailabilityState: input.bookingAvailabilityState ?? "available",
    membershipCta: input.membershipCta,
    calendarMetadata: mapCalendarMetadata({
      event: input.event,
      partnerName,
    }),
  };
}

export function mapPartnerView(partner: PartnerRow): DataAccessPartnerView {
  return {
    id: partner.id,
    name: partner.name,
    address: partner.address,
    contactEmail: partner.contactEmail,
    logoUrl: partner.logoUrl,
    logoInitial: partner.name.trim().slice(0, 1).toUpperCase() || "U",
    venueQrUrl: partner.venueCheckInToken
      ? `/venue-check-in/${partner.venueCheckInToken}`
      : undefined,
    venueQrTokenStatus: partner.venueCheckInToken ? "active" : "missing",
    venueQrTokenLabel: partner.venueCheckInToken ? "Token active" : "Missing",
    portalUserEmail: partner.portalUserEmail,
  };
}

export function mapBookingView(input: {
  booking: BookingRow;
  event: EventRow;
  partner: PartnerRow;
  language?: UiLanguage;
}): DataAccessBookingView {
  const language = input.language ?? "EN";
  return {
    id: input.booking.id,
    language,
    eventId: input.event.id,
    partnerId: input.partner.id,
    eventTitle: input.event.title,
    dateLabel: formatDateLabel(input.event.dateTime),
    partnerName: input.partner.name,
    eventAddress: input.event.address,
    ticketCount: input.booking.ticketsCount,
    totalCredits: input.booking.totalCredits,
    statusLabel: labelize(input.booking.status),
    redemptionType: input.booking.redemptionType ?? input.event.ticketType,
    redemptionCode: input.booking.redemptionInfo ?? "",
    redemptionUrl: input.booking.redemptionUrl ?? undefined,
    checkedInLabel: input.booking.checkedInAt
      ? `Checked in ${formatDateLabel(input.booking.checkedInAt)}`
      : "Not checked in",
    copied: false,
    calendarMetadata: mapCalendarMetadata({
      event: input.event,
      partnerName: input.partner.name,
    }),
  };
}

export function mapLedgerView(row: CreditLedgerRow): DataAccessLedgerView {
  return {
    id: row.id,
    amount: row.amount,
    direction: row.amount >= 0 ? "credit" : "debit",
    reasonLabel: labelize(row.type),
    relatedLabel: row.relatedEventId ?? row.relatedBookingId ?? undefined,
    actorLabel: row.actorUserId ?? undefined,
    createdLabel: formatDateLabel(row.timestamp),
    resultingBalance: row.balanceAfter,
  };
}

export function mapProfileView(input: {
  profile: UserProfileRow;
  user?: Pick<UserRow, "email" | "name"> | null;
}): DataAccessProfileView {
  const fullName =
    [input.profile.firstName, input.profile.lastName]
      .filter(Boolean)
      .join(" ") ||
    input.user?.name ||
    "Member";

  return {
    userId: input.profile.userId,
    fullName,
    email: input.user?.email,
    firstName: input.profile.firstName,
    lastName: input.profile.lastName,
    credits: input.profile.credits,
    currentPlanLabel: labelize(input.profile.subscriptionPlan),
    statusBadgeLabel: labelize(input.profile.subscriptionStatus),
    nextBillDate: formatDateLabel(input.profile.subscriptionPeriodEnd),
    billingAddress: input.profile.billingAddress ?? "Not set",
    paymentMethod: input.profile.paymentMethod
      ? labelize(input.profile.paymentMethod)
      : "Not set",
    language: input.profile.language,
    onboardingComplete: input.profile.onboardingComplete,
    subscriptionStatus: input.profile.subscriptionStatus,
    profileComplete: Boolean(input.profile.firstName && input.profile.lastName),
    newsletterOptIn: input.profile.newsletterOptIn,
  };
}

export function mapPreferencesView(
  profile: UserProfileRow,
): DataAccessPreferencesView {
  return {
    ageGroup: profile.ageGroup,
    interests: profile.interests,
    moods: profile.moods,
    districts: profile.districts,
    maxDistance: profile.maxDistance,
    timing: profile.timing,
    preferredDays: profile.preferredDays,
    preferredLanguages: profile.preferredLanguages,
    accessibility: profile.accessibility,
  };
}

export function mapGuestView(input: {
  booking: BookingRow;
  event: Pick<EventRow, "title" | "dateTime">;
  user: Pick<UserRow, "name" | "email">;
}): DataAccessGuestView {
  return {
    bookingId: input.booking.id,
    eventId: input.booking.eventId,
    partnerId: input.booking.partnerId,
    userId: input.booking.userId,
    userShortId: input.booking.userId.slice(0, 8),
    guestName: input.user.name,
    guestEmail: input.user.email,
    eventTitle: input.event.title,
    redemptionCode: input.booking.redemptionInfo,
    statusLabel: labelize(input.booking.status),
    tickets: input.booking.ticketsCount,
    createdAt: formatDateLabel(input.booking.createdAt),
    checkedInLabel: input.booking.checkedInAt
      ? `Checked in ${formatDateLabel(input.booking.checkedInAt)}`
      : "Not checked in",
    checkInAvailableLabel:
      input.booking.status === "CONFIRMED" ? "Check-in available" : "Closed",
  };
}

export function mapAdminEventView(input: {
  event: EventRow;
  partner?: Pick<PartnerRow, "name"> | null;
}): DataAccessAdminEventView {
  return {
    id: input.event.id,
    title: input.event.title,
    partnerId: input.event.partnerId,
    partnerName: input.partner?.name ?? "Partner",
    dateLabel: formatDateLabel(input.event.dateTime),
    codeStrategyLabel:
      input.event.ticketType === "VOUCHER"
        ? "Voucher"
        : input.event.secretCodeMode
          ? labelize(input.event.secretCodeMode)
          : "Secret code",
    ticketAvailabilityLabel:
      input.event.remainingCapacity <= 0
        ? "Waitlist"
        : `${input.event.remainingCapacity} tickets`,
    creditPrice: input.event.creditPrice,
    imageUrl: input.event.imageUrl,
    exportAvailable: true,
    capacityLabel: `${input.event.remainingCapacity}/${input.event.totalCapacity}`,
    statusLabel: input.event.remainingCapacity <= 0 ? "Sold out" : "Open",
  };
}

export function mapAdminPartnerView(
  partner: PartnerRow,
): DataAccessAdminPartnerView {
  return {
    id: partner.id,
    name: partner.name,
    address: partner.address,
    contactEmail: partner.contactEmail,
    logoUrl: partner.logoUrl,
    logoInitial: partner.name.trim().slice(0, 1).toUpperCase() || "U",
    venueQrTokenLabel: partner.venueCheckInToken ? "Token active" : "Missing",
    venueQrTokenStatus: partner.venueCheckInToken ? "active" : "missing",
    venueQrUrl: partner.venueCheckInToken
      ? `/venue-check-in/${partner.venueCheckInToken}`
      : undefined,
    portalLoginLabel: partner.portalUserEmail ?? "Not created",
    portalUserEmail: partner.portalUserEmail,
    portalUserId: partner.portalUserId,
  };
}

export function mapAdminMemberView(input: {
  profile: UserProfileRow;
  user?: Pick<UserRow, "name" | "email"> | null;
  providerCustomerId?: string | null;
  providerSubscriptionId?: string | null;
  providerStatus?: string | null;
  lastProviderSyncAt?: Date | null;
  currentPeriodStart?: Date | null;
  currentPeriodEnd?: Date | null;
}): DataAccessAdminMemberView {
  const billingOverrideActions =
    input.profile.subscriptionStatus === "ADMIN_FROZEN" ||
    input.profile.subscriptionStatus === "UNPAID"
      ? (["unfreeze"] as const)
      : (["freeze"] as const);
  const preferenceCount =
    input.profile.interests.length +
    input.profile.moods.length +
    input.profile.districts.length +
    input.profile.timing.length +
    input.profile.preferredDays.length +
    input.profile.preferredLanguages.length;

  return {
    userId: input.profile.userId,
    fullName:
      [input.profile.firstName, input.profile.lastName]
        .filter(Boolean)
        .join(" ") ||
      input.user?.name ||
      "Member",
    email: input.user?.email ?? "",
    roleLabel: labelize(input.profile.role),
    subscriptionStatusLabel: labelize(input.profile.subscriptionStatus),
    credits: input.profile.credits,
    bookingCount: input.profile.bookingCount,
    eventOpenCount: input.profile.eventOpenCount,
    savedCount: input.profile.savedCount,
    waitlistCount: input.profile.waitlistCount,
    providerCustomerId: input.providerCustomerId,
    providerSubscriptionId: input.providerSubscriptionId,
    providerStatus: input.providerStatus,
    lastProviderSyncLabel: input.lastProviderSyncAt
      ? formatDateLabel(input.lastProviderSyncAt)
      : "Not synced",
    currentPeriodLabel:
      input.currentPeriodStart || input.currentPeriodEnd
        ? `${formatDateLabel(input.currentPeriodStart)} - ${formatDateLabel(input.currentPeriodEnd)}`
        : "No active period",
    billingOverrideActions: [...billingOverrideActions],
    preferencesSummary: `${preferenceCount} preferences`,
    historySummary: `${input.profile.bookingCount} bookings // ${input.profile.waitlistCount} waitlist // ${input.profile.savedCount} saved`,
  };
}

function labelize(value: string) {
  return value
    .toLowerCase()
    .split(/[_-]/)
    .filter(Boolean)
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
}
