import { and, asc, count, desc, eq, gte, lte, sql } from "drizzle-orm";

import { type Db, db } from "@/db/client";
import {
  bookings,
  creditLedgerEntries,
  events,
  partners,
  savedEvents,
  user,
  userProfiles,
} from "@/db/schema";
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
};

export type MemberData = {
  discovery: PublicDiscoveryData & { savedEventIds: string[] };
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
};

export type AdminData = {
  dashboard: {
    upcomingEventCount: number;
    activePartnerCount: number;
    memberCount: number;
    confirmedBookingCount: number;
  };
  events: DataAccessAdminEventView[];
  partners: DataAccessAdminPartnerView[];
  members: DataAccessAdminMemberView[];
};

export async function getPublicDiscoveryData(
  filters: DiscoveryFilters = {},
  database: Db = db,
): Promise<PublicDiscoveryData> {
  const eventRows = await findEventRows(filters, database);
  const partnerRows = await database
    .select()
    .from(partners)
    .orderBy(asc(partners.name));
  const partnerById = new Map(
    partnerRows.map((partner) => [partner.id, partner]),
  );
  const categories = Array.from(
    new Set(eventRows.map((row) => row.category)),
  ).sort();

  return {
    featuredEvents: eventRows.map((event) =>
      mapEventView({ event, partner: partnerById.get(event.partnerId) }),
    ),
    activePartners: partnerRows.map(mapPartnerView),
    categories,
    partnerOptions: partnerRows.map((partner) => ({
      id: partner.id,
      name: partner.name,
    })),
    stats: {
      upcomingEventCount: eventRows.length,
      activePartnerCount: partnerRows.length,
      membershipCategoryLabels: categories,
    },
  };
}

export async function getMemberData(
  userId: string,
  filters: DiscoveryFilters = {},
  database: Db = db,
): Promise<MemberData> {
  const [publicData, profileData, savedRows, bookingRows, ledgerRows] =
    await Promise.all([
      getPublicDiscoveryData(filters, database),
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
  const savedSet = new Set(savedEventIds);

  return {
    discovery: {
      ...publicData,
      savedEventIds,
      featuredEvents: publicData.featuredEvents.map((event) => ({
        ...event,
        saved: savedSet.has(event.id),
      })),
    },
    savedEvents: publicData.featuredEvents.filter((event) =>
      savedSet.has(event.id),
    ),
    bookings: bookingRows.map(mapBookingView),
    profile: profileData.profile,
    wallet: {
      credits: profileData.profile.credits,
      ledger: ledgerRows.map(mapLedgerView),
    },
    preferences: profileData.preferences,
  };
}

export async function getPartnerData(
  partnerId: string,
  database: Db = db,
): Promise<PartnerData | null> {
  const partner = await database.query.partners.findFirst({
    where: eq(partners.id, partnerId),
  });
  if (!partner) return null;

  const [eventRows, guestRows] = await Promise.all([
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
      .limit(100),
  ]);

  return {
    partner: mapPartnerView(partner),
    eventOptions: eventRows.map((event) => ({
      id: event.id,
      title: event.title,
      dateLabel: event.dateTime.toISOString(),
    })),
    guests: guestRows.map(mapGuestView),
  };
}

export async function getAdminData(database: Db = db): Promise<AdminData> {
  const [eventRows, partnerRows, memberRows, bookingCountRows] =
    await Promise.all([
      database
        .select({ event: events, partner: partners })
        .from(events)
        .innerJoin(partners, eq(events.partnerId, partners.id))
        .orderBy(desc(events.dateTime))
        .limit(100),
      database.select().from(partners).orderBy(asc(partners.name)).limit(100),
      database
        .select({ profile: userProfiles, user })
        .from(userProfiles)
        .innerJoin(user, eq(userProfiles.userId, user.id))
        .orderBy(asc(user.email))
        .limit(100),
      database
        .select({ value: count() })
        .from(bookings)
        .where(eq(bookings.status, "CONFIRMED")),
    ]);

  const eventsView = eventRows.map(mapAdminEventView);
  const partnersView = partnerRows.map(mapAdminPartnerView);
  const membersView = memberRows.map(mapAdminMemberView);

  return {
    dashboard: {
      upcomingEventCount: eventsView.length,
      activePartnerCount: partnersView.length,
      memberCount: membersView.length,
      confirmedBookingCount: bookingCountRows[0]?.value ?? 0,
    },
    events: eventsView,
    partners: partnersView,
    members: membersView,
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

async function findEventRows(filters: DiscoveryFilters, database: Db) {
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
    .limit(24);
}
