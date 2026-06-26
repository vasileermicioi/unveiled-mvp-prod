import type {
  AdminExportRow,
  PartnerGuestExportRow,
} from "@unveiled/api/admin-operations";

import { type Db, db } from "@unveiled/api/db/client";
import {
  bookings,
  creditLedgerEntries,
  events,
  partners,
  savedEvents,
  subscriptions,
  user,
  userProfiles,
} from "@unveiled/api/db/schema";
import { copyFor, type UiLanguage } from "@unveiled/api/i18n";
import { and, asc, count, desc, eq, gte, lte, sql } from "drizzle-orm";
import {
  type DataAccessAdminEventView,
  type DataAccessAdminMemberView,
  type DataAccessAdminPartnerView,
  type DataAccessBookingView,
  type DataAccessEventView,
  type DataAccessGuestView,
  type DataAccessLedgerView,
  type DataAccessPartnerView,
  type DataAccessPreferencesView,
  type DataAccessProfileView,
  mapAdminEventView,
  mapAdminMemberView,
  mapAdminPartnerView,
  mapBookingView,
  mapEventView,
  mapGuestView,
  mapLedgerView,
  mapPartnerView,
  mapPreferencesView,
  mapProfileView,
} from "./mappers";
import type { DiscoveryFilters } from "./query-keys";

export type PublicDiscoveryData = {
  featuredEvents: DataAccessEventView[];
  activePartners: DataAccessPartnerView[];
  categories: string[];
  partnerOptions: Array<{ id: string; name: string }>;
  stats: {
    upcomingEventCount: number;
    activePartnerCount: number;
    membershipCategoryLabels: string[];
  };
  totalCount?: number;
  page?: number;
  pageSize?: number;
  hasMore?: boolean;
};

export type MemberData = {
  discovery: PublicDiscoveryData & {
    savedEventIds: string[];
    activeRangeLabel?: string;
    resultCount?: number;
    activeFilterCount?: number;
  };
  savedEvents: DataAccessEventView[];
  bookings: DataAccessBookingView[];
  profile: DataAccessProfileView;
  wallet: {
    credits: number;
    ledger: DataAccessLedgerView[];
  };
  preferences: DataAccessPreferencesView;
};

export type PartnerData = {
  partner: DataAccessPartnerView;
  eventOptions: Array<{ id: string; title: string; dateLabel: string }>;
  guests: DataAccessGuestView[];
  guestCount: number;
  ticketCount: number;
  exportAvailable: boolean;
  exportRows: PartnerGuestExportRow[];
  guestsPage: number;
  guestsPageSize: number;
  guestsTotalCount: number;
  guestsHasMore: boolean;
};

const PARTNER_GUESTS_DEFAULT_PAGE_SIZE = 20;
const PARTNER_GUESTS_MAX_PAGE_SIZE = 50;

export function partnerGuestsPageSize(value?: string | number) {
  const raw = Number(value ?? PARTNER_GUESTS_DEFAULT_PAGE_SIZE);
  if (!Number.isFinite(raw) || raw <= 0) {
    return PARTNER_GUESTS_DEFAULT_PAGE_SIZE;
  }
  return Math.min(PARTNER_GUESTS_MAX_PAGE_SIZE, Math.max(1, Math.floor(raw)));
}

export function partnerGuestsPage(value?: string | number) {
  const raw = Number(value ?? 1);
  if (!Number.isFinite(raw) || raw <= 0) return 1;
  return Math.max(1, Math.floor(raw));
}

export type AdminData = {
  dashboard: {
    upcomingEventCount: number;
    activePartnerCount: number;
    memberCount: number;
    confirmedBookingCount: number;
    totalBookings: number;
    creditsBurned: number;
    totalGuests: number;
    recentBookings: AdminExportRow[];
    exportPartnerOptions: Array<{ id: string; name: string }>;
    exportAvailable: boolean;
  };
  events: {
    items: DataAccessAdminEventView[];
    totalCount: number;
    hasMore: boolean;
  };
  partners: {
    items: DataAccessAdminPartnerView[];
    totalCount: number;
    hasMore: boolean;
  };
  members: {
    items: DataAccessAdminMemberView[];
    totalCount: number;
    hasMore: boolean;
  };
  exportRows: AdminExportRow[];
};

export async function getPublicDiscoveryData(
  filters: DiscoveryFilters & { pageSize?: string } = {},
  database: Db = db,
  language: UiLanguage = "EN",
): Promise<PublicDiscoveryData> {
  const page = Math.max(1, Number(filters.page ?? "1"));
  const requestedPageSize = Number(filters.pageSize ?? "6");
  const pageSize = Math.min(48, Math.max(1, requestedPageSize || 6));
  const offset = (page - 1) * pageSize;

  const [totalCount, eventRows, partnerRows, allUpcomingEvents] =
    await Promise.all([
      countEventRows(filters, database),
      findEventRows(filters, database, pageSize, offset),
      database.select().from(partners).orderBy(asc(partners.name)),
      database
        .select({ category: events.category })
        .from(events)
        .where(gte(events.dateTime, new Date())),
    ]);

  const partnerById = new Map(
    partnerRows.map((partner) => [partner.id, partner]),
  );
  const categories = Array.from(
    new Set(allUpcomingEvents.map((row) => row.category)),
  ).sort();

  return {
    featuredEvents: eventRows.map((event) =>
      mapEventView({
        event,
        partner: partnerById.get(event.partnerId),
        language,
      }),
    ),
    activePartners: partnerRows.map(mapPartnerView),
    categories,
    partnerOptions: partnerRows.map((partner) => ({
      id: partner.id,
      name: partner.name,
    })),
    stats: {
      upcomingEventCount: totalCount,
      activePartnerCount: partnerRows.length,
      membershipCategoryLabels: categories,
    },
    totalCount,
    page,
    pageSize,
    hasMore: offset + eventRows.length < totalCount,
  };
}

export async function getMemberData(
  userId: string,
  filters: DiscoveryFilters = {},
  database: Db = db,
): Promise<MemberData> {
  const savedOnly = filters.savedOnly === "true";
  const publicFilters = { ...filters, savedOnly: undefined };
  const [basePublicData, profileData, savedRows, bookingRows, ledgerRows] =
    await Promise.all([
      getPublicDiscoveryData(publicFilters, database),
      getProfileData(userId, database),
      database.select().from(savedEvents).where(eq(savedEvents.userId, userId)),
      getBookingRowsForUser(userId, database),
      database
        .select()
        .from(creditLedgerEntries)
        .where(eq(creditLedgerEntries.userId, userId))
        .orderBy(desc(creditLedgerEntries.timestamp))
        .limit(25),
    ]);

  const savedEventIds = savedRows.map((row) => row.eventId);
  const language = profileData.profile.language;
  const copy = copyFor(language);
  const publicData: PublicDiscoveryData = {
    ...basePublicData,
    featuredEvents: basePublicData.featuredEvents.map((event) => ({
      ...event,
      language,
      capacityLabel:
        event.remainingCapacity <= 0
          ? copy.event.waitlist
          : `${event.remainingCapacity} ${copy.event.available}`,
      ticketType:
        event.remainingCapacity <= 0
          ? copy.event.waitlist
          : event.ticketType === "Voucher"
            ? copy.event.voucher
            : copy.event.secretCode,
      ctaLabel:
        event.remainingCapacity <= 0
          ? copy.event.joinWaitlist
          : copy.event.bookNow,
    })),
  };
  const savedSet = new Set(savedEventIds);
  const bookingAvailable: "available" | "frozen" =
    profileData.profile.subscriptionStatus === "ACTIVE"
      ? "available"
      : "frozen";
  const filteredEvents = publicData.featuredEvents
    .map((event) => ({
      ...event,
      saved: savedSet.has(event.id),
      bookingAvailabilityState: bookingAvailable,
      membershipCta:
        bookingAvailable === "frozen" ? copy.event.updateMembership : undefined,
    }))
    .filter((event) => !savedOnly || event.saved);

  return {
    discovery: {
      ...publicData,
      savedEventIds,
      featuredEvents: filteredEvents,
      activeRangeLabel: activeRangeLabel(filters, language),
      resultCount: filteredEvents.length,
      activeFilterCount: activeFilterCount(filters),
    },
    savedEvents: filteredEvents.filter((event) => event.saved),
    bookings: bookingRows.map((row) =>
      mapBookingView({ ...row, language: profileData.profile.language }),
    ),
    profile: profileData.profile,
    wallet: {
      credits: profileData.profile.credits,
      ledger: ledgerRows.map(mapLedgerView),
    },
    preferences: profileData.preferences,
  };
}

function activeFilterCount(filters: DiscoveryFilters) {
  return [
    filters.category,
    filters.partnerId,
    filters.startDate,
    filters.endDate,
    filters.savedOnly === "true" ? "saved" : undefined,
  ].filter(Boolean).length;
}

function activeRangeLabel(
  filters: DiscoveryFilters,
  language: UiLanguage = "EN",
) {
  if (filters.startDate && filters.endDate)
    return `${filters.startDate} - ${filters.endDate}`;
  if (filters.startDate)
    return `${language === "DE" ? "Ab" : "From"} ${filters.startDate}`;
  if (filters.endDate)
    return `${language === "DE" ? "Bis" : "Until"} ${filters.endDate}`;
  return language === "DE" ? "Kommend" : "Upcoming";
}

export async function getPartnerData(
  partnerId: string,
  options: {
    partnerGuestsPage?: string | number;
    partnerGuestsPageSize?: string | number;
  } = {},
  database: Db = db,
): Promise<PartnerData | null> {
  const partner = await database.query.partners.findFirst({
    where: eq(partners.id, partnerId),
  });
  if (!partner) return null;

  const guestsPage = partnerGuestsPage(options.partnerGuestsPage);
  const guestsPageSize = partnerGuestsPageSize(options.partnerGuestsPageSize);
  const guestsOffset = (guestsPage - 1) * guestsPageSize;

  const [eventRows, guestRows, totalGuestRows, ticketAggregateRows] =
    await Promise.all([
      database
        .select()
        .from(events)
        .where(eq(events.partnerId, partnerId))
        .orderBy(asc(events.dateTime))
        .limit(100),
      database
        .select({
          booking: bookings,
          event: events,
          user,
        })
        .from(bookings)
        .innerJoin(events, eq(bookings.eventId, events.id))
        .innerJoin(user, eq(bookings.userId, user.id))
        .where(eq(bookings.partnerId, partnerId))
        .orderBy(desc(bookings.createdAt))
        .limit(guestsPageSize)
        .offset(guestsOffset),
      database
        .select({ count: count() })
        .from(bookings)
        .where(eq(bookings.partnerId, partnerId)),
      database
        .select({
          totalTickets: sql<number>`coalesce(sum(${bookings.ticketsCount}), 0)`,
        })
        .from(bookings)
        .where(eq(bookings.partnerId, partnerId)),
    ]);

  const guestsTotalCount = totalGuestRows[0]?.count ?? 0;
  const ticketCount = Number(ticketAggregateRows[0]?.totalTickets ?? 0);

  return {
    partner: mapPartnerView(partner),
    eventOptions: eventRows.map((event) => ({
      id: event.id,
      title: event.title,
      dateLabel: event.dateTime.toISOString(),
    })),
    guests: guestRows.map(mapGuestView),
    guestCount: guestRows.length,
    ticketCount,
    exportAvailable: guestsTotalCount > 0,
    exportRows: guestRows.map((row) => ({
      bookingId: row.booking.id,
      userId: row.booking.userId,
      event: row.event.title,
      code: row.booking.redemptionInfo,
      status: row.booking.status,
      tickets: row.booking.ticketsCount,
      createdAt: row.booking.createdAt,
    })),
    guestsPage,
    guestsPageSize,
    guestsTotalCount,
    guestsHasMore: guestsOffset + guestRows.length < guestsTotalCount,
  };
}

export async function getAdminData(
  filters?: DiscoveryFilters & {
    membersPage?: string;
    membersPageSize?: string;
    partnersPage?: string;
    partnersPageSize?: string;
    eventsPage?: string;
    eventsPageSize?: string;
  },
  database: Db = db,
): Promise<AdminData> {
  const mPage = Math.max(1, Number(filters?.membersPage ?? "1"));
  const mPageSize = Math.max(1, Number(filters?.membersPageSize ?? "20"));
  const pPage = Math.max(1, Number(filters?.partnersPage ?? "1"));
  const pPageSize = Math.max(1, Number(filters?.partnersPageSize ?? "20"));
  const ePage = Math.max(1, Number(filters?.eventsPage ?? "1"));
  const ePageSize = Math.max(1, Number(filters?.eventsPageSize ?? "20"));

  const mOffset = (mPage - 1) * mPageSize;
  const pOffset = (pPage - 1) * pPageSize;
  const eOffset = (ePage - 1) * ePageSize;

  const [
    totalEventsCount,
    totalPartnersCount,
    totalMembersCount,
    eventRows,
    partnerRows,
    memberRows,
    confirmedBookingCountRows,
    totalBookingCountRows,
    bookingAggregateRows,
    recentBookingRows,
  ] = await Promise.all([
    database.select({ count: count() }).from(events),
    database.select({ count: count() }).from(partners),
    database.select({ count: count() }).from(userProfiles),
    database
      .select({ event: events, partner: partners })
      .from(events)
      .innerJoin(partners, eq(events.partnerId, partners.id))
      .orderBy(desc(events.dateTime))
      .limit(ePageSize)
      .offset(eOffset),
    database
      .select()
      .from(partners)
      .orderBy(asc(partners.name))
      .limit(pPageSize)
      .offset(pOffset),
    database
      .select({
        profile: userProfiles,
        user,
        providerCustomerId: subscriptions.providerCustomerId,
        providerSubscriptionId: subscriptions.providerSubscriptionId,
        providerStatus: subscriptions.providerStatus,
        lastProviderSyncAt: subscriptions.lastProviderSyncAt,
        currentPeriodStart: subscriptions.currentPeriodStart,
        currentPeriodEnd: subscriptions.currentPeriodEnd,
      })
      .from(userProfiles)
      .innerJoin(user, eq(userProfiles.userId, user.id))
      .leftJoin(subscriptions, eq(subscriptions.userId, user.id))
      .orderBy(asc(user.email))
      .limit(mPageSize)
      .offset(mOffset),
    database
      .select({ value: count() })
      .from(bookings)
      .where(eq(bookings.status, "CONFIRMED")),
    database.select({ value: count() }).from(bookings),
    database
      .select({
        totalCredits: sql<number>`coalesce(sum(${bookings.totalCredits}), 0)`,
        totalGuests: sql<number>`coalesce(sum(${bookings.ticketsCount}), 0)`,
      })
      .from(bookings),
    database
      .select({
        bookingId: bookings.id,
        userId: bookings.userId,
        event: events.title,
        partner: partners.name,
        code: bookings.redemptionInfo,
        status: bookings.status,
        tickets: bookings.ticketsCount,
        credits: bookings.totalCredits,
        createdAt: bookings.createdAt,
      })
      .from(bookings)
      .innerJoin(events, eq(events.id, bookings.eventId))
      .innerJoin(partners, eq(partners.id, bookings.partnerId))
      .orderBy(desc(bookings.createdAt))
      .limit(100),
  ]);

  const eventsTotal = totalEventsCount[0]?.count ?? 0;
  const partnersTotal = totalPartnersCount[0]?.count ?? 0;
  const membersTotal = totalMembersCount[0]?.count ?? 0;

  const eventsView = eventRows.map(mapAdminEventView);
  const partnersView = partnerRows.map(mapAdminPartnerView);
  const membersView = memberRows.map((row) =>
    mapAdminMemberView({
      profile: row.profile,
      user: row.user,
      providerCustomerId: row.providerCustomerId,
      providerSubscriptionId: row.providerSubscriptionId,
      providerStatus: row.providerStatus,
      lastProviderSyncAt: row.lastProviderSyncAt,
      currentPeriodStart: row.currentPeriodStart,
      currentPeriodEnd: row.currentPeriodEnd,
    }),
  );
  const recentBookings = recentBookingRows.map((row) => ({
    ...row,
    code: row.code ?? null,
  }));
  const bookingAggregate = bookingAggregateRows[0];

  return {
    dashboard: {
      upcomingEventCount: eventsTotal,
      activePartnerCount: partnersTotal,
      memberCount: membersTotal,
      confirmedBookingCount: confirmedBookingCountRows[0]?.value ?? 0,
      totalBookings: totalBookingCountRows[0]?.value ?? 0,
      creditsBurned: Number(bookingAggregate?.totalCredits ?? 0),
      totalGuests: Number(bookingAggregate?.totalGuests ?? 0),
      recentBookings,
      exportPartnerOptions: partnersView.map((partner) => ({
        id: partner.id,
        name: partner.name,
      })),
      exportAvailable: recentBookings.length > 0,
    },
    events: {
      items: eventsView,
      totalCount: eventsTotal,
      hasMore: eOffset + eventsView.length < eventsTotal,
    },
    partners: {
      items: partnersView,
      totalCount: partnersTotal,
      hasMore: pOffset + partnersView.length < partnersTotal,
    },
    members: {
      items: membersView,
      totalCount: membersTotal,
      hasMore: mOffset + membersView.length < membersTotal,
    },
    exportRows: recentBookings,
  };
}

async function getProfileData(userId: string, database: Db) {
  const row = await database
    .select({ profile: userProfiles, user })
    .from(userProfiles)
    .innerJoin(user, eq(userProfiles.userId, user.id))
    .where(eq(userProfiles.userId, userId))
    .limit(1);

  const first = row[0];
  if (!first) {
    throw new Error("Profile is not available.");
  }

  return {
    profile: mapProfileView(first),
    preferences: mapPreferencesView(first.profile),
  };
}

async function getBookingRowsForUser(userId: string, database: Db) {
  return database
    .select({
      booking: bookings,
      event: events,
      partner: partners,
    })
    .from(bookings)
    .innerJoin(events, eq(bookings.eventId, events.id))
    .innerJoin(partners, eq(bookings.partnerId, partners.id))
    .where(eq(bookings.userId, userId))
    .orderBy(desc(bookings.createdAt))
    .limit(50);
}

async function findEventRows(
  filters: DiscoveryFilters,
  database: Db,
  limit = 24,
  offset = 0,
) {
  const conditions = [gte(events.dateTime, new Date())];
  if (filters.category) conditions.push(eq(events.category, filters.category));
  if (filters.partnerId)
    conditions.push(eq(events.partnerId, filters.partnerId));
  if (filters.startDate)
    conditions.push(gte(events.dateTime, new Date(filters.startDate)));
  if (filters.endDate)
    conditions.push(lte(events.dateTime, new Date(filters.endDate)));

  return database
    .select()
    .from(events)
    .where(and(...conditions))
    .orderBy(asc(events.dateTime), sql`${events.remainingCapacity} desc`)
    .limit(limit)
    .offset(offset);
}

async function countEventRows(filters: DiscoveryFilters, database: Db) {
  const conditions = [gte(events.dateTime, new Date())];
  if (filters.category) conditions.push(eq(events.category, filters.category));
  if (filters.partnerId)
    conditions.push(eq(events.partnerId, filters.partnerId));
  if (filters.startDate)
    conditions.push(gte(events.dateTime, new Date(filters.startDate)));
  if (filters.endDate)
    conditions.push(lte(events.dateTime, new Date(filters.endDate)));

  const result = await database
    .select({ count: count() })
    .from(events)
    .where(and(...conditions));
  return result[0]?.count ?? 0;
}
