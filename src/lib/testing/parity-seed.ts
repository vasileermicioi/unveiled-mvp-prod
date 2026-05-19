import { eq, inArray, sql } from "drizzle-orm";

import { createDb, type Db } from "@/db/client";
import {
  billingAdminOverrides,
  bookingIdempotencyRecords,
  bookings,
  creditLedgerEntries,
  events,
  partners,
  savedEvents,
  subscriptions,
  user,
  userProfiles,
  waitlistEntries,
} from "@/db/schema";
import { signUpWithEmail } from "@/lib/auth-account-actions";
import {
  type ParitySeedSummary,
  parityFixtureEmails,
  parityFixtureIds,
  parityPassword,
} from "@/lib/testing/parity-fixtures";

function requiredParityDatabaseUrl() {
  const databaseUrl =
    process.env.PARITY_TEST_DATABASE_URL ?? process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      "PARITY_TEST_DATABASE_URL or DATABASE_URL is required for parity tests.",
    );
  }
  return databaseUrl;
}

export function configureParityDatabaseEnv() {
  process.env.DATABASE_URL = requiredParityDatabaseUrl();
  return process.env.DATABASE_URL;
}

export function createParityDb() {
  configureParityDatabaseEnv();
  return createDb();
}

async function ensureAuthUser(
  database: Db,
  input: {
    email: string;
    firstName: string;
    lastName: string;
  },
) {
  const existing = await database.query.user.findFirst({
    where: eq(user.email, input.email),
  });
  if (existing) return existing.id;

  const result = await signUpWithEmail({
    email: input.email,
    password: parityPassword,
    firstName: input.firstName,
    lastName: input.lastName,
    callbackURL: "/",
  });

  if (!result.ok || !result.userId) {
    throw new Error(`Could not create auth user for ${input.email}`);
  }

  return result.userId;
}

async function upsertProfile(
  database: Db,
  input: {
    userId: string;
    role: "USER" | "ADMIN" | "PARTNER";
    partnerId: string | null;
    firstName: string;
    lastName: string;
    credits: number;
    subscriptionStatus: typeof userProfiles.$inferInsert.subscriptionStatus;
    savedCount?: number;
    waitlistCount?: number;
    bookingCount?: number;
    eventOpenCount?: number;
  },
) {
  await database
    .insert(userProfiles)
    .values({
      userId: input.userId,
      role: input.role,
      partnerId: input.partnerId,
      firstName: input.firstName,
      lastName: input.lastName,
      credits: input.credits,
      language: "DE",
      onboardingComplete: true,
      subscriptionStatus: input.subscriptionStatus,
      subscriptionPlan: "BASIC_BERLIN",
      billingAddress: "Parity Strasse 1, Berlin",
      newsletterOptIn: true,
      interests: ["Theater", "Art"],
      moods: ["Leicht"],
      districts: ["Mitte"],
      maxDistance: 8,
      timing: ["After Work"],
      preferredDays: ["Fr"],
      preferredLanguages: ["DE"],
      bookingCount: input.bookingCount ?? 0,
      eventOpenCount: input.eventOpenCount ?? 0,
      savedCount: input.savedCount ?? 0,
      waitlistCount: input.waitlistCount ?? 0,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: userProfiles.userId,
      set: {
        role: input.role,
        partnerId: input.partnerId,
        firstName: input.firstName,
        lastName: input.lastName,
        credits: input.credits,
        onboardingComplete: true,
        subscriptionStatus: input.subscriptionStatus,
        billingAddress: "Parity Strasse 1, Berlin",
        newsletterOptIn: true,
        bookingCount: input.bookingCount ?? 0,
        eventOpenCount: input.eventOpenCount ?? 0,
        savedCount: input.savedCount ?? 0,
        waitlistCount: input.waitlistCount ?? 0,
        updatedAt: new Date(),
      },
    });
}

function eventDate(offsetDays: number, hour: number) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  date.setHours(hour, 0, 0, 0);
  return date;
}

async function upsertEvent(
  database: Db,
  input: {
    id: string;
    partnerId: string;
    title: string;
    description: string;
    category: string;
    eventType: string;
    dateTime: Date;
    creditPrice: number;
    totalCapacity: number;
    remainingCapacity: number;
    ticketType: "SECRET_CODE" | "VOUCHER";
    secretCode?: string | null;
    secretCodeMode?:
      | "MANUAL"
      | "SHARED_GENERATED"
      | "UNIQUE_PER_BOOKING"
      | null;
    promoCode?: string | null;
    eventWebsiteUrl?: string | null;
    lat?: number | null;
    lng?: number | null;
  },
) {
  await database
    .insert(events)
    .values({
      id: input.id,
      partnerId: input.partnerId,
      title: input.title,
      description: input.description,
      category: input.category,
      eventType: input.eventType,
      dateTime: input.dateTime,
      timingMode: "TIME_SLOT",
      startTimeMinutes: input.dateTime.getHours() * 60,
      weekday: input.dateTime.getDay(),
      address: "Parity Strasse 1, Berlin",
      neighborhood: "Mitte",
      lat: input.lat ?? 52.5195,
      lng: input.lng ?? 13.3922,
      imageUrl: "https://images.example.test/parity-event.jpg",
      tags: ["Parity"],
      creditPrice: input.creditPrice,
      totalCapacity: input.totalCapacity,
      remainingCapacity: input.remainingCapacity,
      ticketType: input.ticketType,
      secretCodeMode:
        input.ticketType === "SECRET_CODE"
          ? (input.secretCodeMode ?? "MANUAL")
          : null,
      secretCode: input.ticketType === "SECRET_CODE" ? input.secretCode : null,
      promoCode: input.ticketType === "VOUCHER" ? input.promoCode : null,
      eventWebsiteUrl:
        input.ticketType === "VOUCHER" ? input.eventWebsiteUrl : null,
      voucherTemplate:
        input.ticketType === "VOUCHER" ? "Show this voucher at entry." : null,
      barrierFree: false,
      languages: ["DE"],
      targetAgeGroups: ["26-35"],
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: events.id,
      set: {
        title: sql`excluded.title`,
        description: sql`excluded.description`,
        category: sql`excluded.category`,
        eventType: sql`excluded.event_type`,
        dateTime: sql`excluded.date_time`,
        startTimeMinutes: sql`excluded.start_time_minutes`,
        weekday: sql`excluded.weekday`,
        creditPrice: sql`excluded.credit_price`,
        totalCapacity: sql`excluded.total_capacity`,
        remainingCapacity: sql`excluded.remaining_capacity`,
        ticketType: sql`excluded.ticket_type`,
        secretCodeMode: sql`excluded.secret_code_mode`,
        secretCode: sql`excluded.secret_code`,
        promoCode: sql`excluded.promo_code`,
        eventWebsiteUrl: sql`excluded.event_website_url`,
        voucherTemplate: sql`excluded.voucher_template`,
        updatedAt: new Date(),
      },
    });
}

async function upsertBooking(
  database: Db,
  input: {
    id: string;
    userId: string;
    eventId: string;
    partnerId: string;
    ticketsCount: number;
    totalCredits: number;
    status: "CONFIRMED" | "USED";
    redemptionType: "SECRET_CODE" | "VOUCHER";
    redemptionInfo: string;
    redemptionUrl?: string | null;
    checkedInAt?: Date | null;
  },
) {
  await database
    .insert(bookings)
    .values({
      id: input.id,
      userId: input.userId,
      eventId: input.eventId,
      partnerId: input.partnerId,
      ticketsCount: input.ticketsCount,
      totalCredits: input.totalCredits,
      status: input.status,
      redemptionType: input.redemptionType,
      redemptionInfo: input.redemptionInfo,
      redemptionUrl: input.redemptionUrl ?? null,
      checkedInAt: input.checkedInAt ?? null,
      idempotencyKey: `${input.id}-seed`,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: bookings.id,
      set: {
        userId: input.userId,
        eventId: input.eventId,
        partnerId: input.partnerId,
        status: input.status,
        ticketsCount: input.ticketsCount,
        totalCredits: input.totalCredits,
        redemptionType: input.redemptionType,
        redemptionInfo: input.redemptionInfo,
        redemptionUrl: input.redemptionUrl ?? null,
        checkedInAt: input.checkedInAt ?? null,
        updatedAt: new Date(),
      },
    });
}

async function upsertWaitlist(
  database: Db,
  input: {
    id: string;
    eventId: string;
    userId: string;
    requestedQty: number;
  },
) {
  await database
    .insert(waitlistEntries)
    .values({
      id: input.id,
      eventId: input.eventId,
      userId: input.userId,
      requestedQty: input.requestedQty,
      status: "WAITING",
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: waitlistEntries.id,
      set: {
        eventId: input.eventId,
        userId: input.userId,
        requestedQty: input.requestedQty,
        status: "WAITING",
        updatedAt: new Date(),
      },
    });
}

async function upsertLedger(
  database: Db,
  input: {
    id: string;
    userId: string;
    amount: number;
    balanceAfter: number;
    type: "BOOKING" | "ADMIN_ADJUST";
    description: string;
    relatedBookingId?: string;
    relatedEventId?: string;
    actorUserId?: string;
  },
) {
  await database
    .insert(creditLedgerEntries)
    .values({
      id: input.id,
      userId: input.userId,
      amount: input.amount,
      balanceAfter: input.balanceAfter,
      type: input.type,
      description: input.description,
      relatedBookingId: input.relatedBookingId ?? null,
      relatedEventId: input.relatedEventId ?? null,
      actorUserId: input.actorUserId ?? null,
      idempotencyKey: `${input.id}-seed`,
    })
    .onConflictDoUpdate({
      target: creditLedgerEntries.id,
      set: {
        userId: input.userId,
        amount: input.amount,
        balanceAfter: input.balanceAfter,
        type: input.type,
        description: input.description,
        relatedBookingId: input.relatedBookingId ?? null,
        relatedEventId: input.relatedEventId ?? null,
        actorUserId: input.actorUserId ?? null,
      },
    });
}

async function upsertSubscription(
  database: Db,
  input: {
    id: string;
    userId: string;
    status: "ACTIVE" | "UNPAID";
    providerStatus: string;
    providerCustomerId: string;
    providerSubscriptionId: string;
  },
) {
  await database
    .insert(subscriptions)
    .values({
      id: input.id,
      userId: input.userId,
      providerCustomerId: input.providerCustomerId,
      providerSubscriptionId: input.providerSubscriptionId,
      providerPriceId: "price_parity_basic_berlin",
      status: input.status,
      providerStatus: input.providerStatus,
      billingEmail:
        input.userId === parityFixtureIds.users.frozenMember
          ? parityFixtureEmails.frozenMember
          : parityFixtureEmails.activeMember,
      currentPeriodStart: eventDate(-10, 8),
      currentPeriodEnd: eventDate(20, 8),
      lastProviderSyncAt: new Date(),
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: subscriptions.id,
      set: {
        status: input.status,
        providerStatus: input.providerStatus,
        currentPeriodStart: eventDate(-10, 8),
        currentPeriodEnd: eventDate(20, 8),
        lastProviderSyncAt: new Date(),
        updatedAt: new Date(),
      },
    });
}

async function upsertFreezeOverride(
  database: Db,
  userId: string,
  actorUserId: string,
) {
  await database
    .insert(billingAdminOverrides)
    .values({
      id: parityFixtureIds.overrides.frozenMember,
      userId,
      actorUserId,
      type: "FREEZE",
      reason: "Parity suite freeze fixture",
      active: true,
    })
    .onConflictDoUpdate({
      target: billingAdminOverrides.id,
      set: {
        active: true,
        reason: "Parity suite freeze fixture",
        clearedAt: null,
      },
    });
}

async function upsertSavedEvent(database: Db, userId: string, eventId: string) {
  await database
    .insert(savedEvents)
    .values({ userId, eventId })
    .onConflictDoNothing();
}

export async function resetParityWorld(database: Db = createParityDb()) {
  const userIds = Object.values(parityFixtureIds.users);
  const eventIds = Object.values(parityFixtureIds.events);

  await database
    .delete(savedEvents)
    .where(inArray(savedEvents.userId, userIds));
  await database
    .delete(billingAdminOverrides)
    .where(inArray(billingAdminOverrides.userId, userIds));
  await database
    .delete(bookingIdempotencyRecords)
    .where(inArray(bookingIdempotencyRecords.userId, userIds));
  await database
    .delete(creditLedgerEntries)
    .where(inArray(creditLedgerEntries.userId, userIds));
  await database
    .delete(waitlistEntries)
    .where(inArray(waitlistEntries.userId, userIds));
  await database.delete(bookings).where(inArray(bookings.userId, userIds));
  await database.delete(bookings).where(inArray(bookings.eventId, eventIds));
  await database
    .delete(subscriptions)
    .where(inArray(subscriptions.userId, userIds));
  await database.delete(events).where(inArray(events.id, eventIds));
  await database
    .delete(userProfiles)
    .where(inArray(userProfiles.userId, userIds));
  await database
    .delete(partners)
    .where(eq(partners.id, parityFixtureIds.partner));
  await database
    .delete(user)
    .where(inArray(user.email, Object.values(parityFixtureEmails)));
}

export async function seedParityWorld(
  database: Db = createParityDb(),
): Promise<ParitySeedSummary> {
  configureParityDatabaseEnv();

  const adminUserId = await ensureAuthUser(database, {
    email: parityFixtureEmails.admin,
    firstName: "Parity",
    lastName: "Admin",
  });
  const partnerUserId = await ensureAuthUser(database, {
    email: parityFixtureEmails.partner,
    firstName: "Parity",
    lastName: "Partner",
  });
  const activeMemberUserId = await ensureAuthUser(database, {
    email: parityFixtureEmails.activeMember,
    firstName: "Active",
    lastName: "Member",
  });
  const frozenMemberUserId = await ensureAuthUser(database, {
    email: parityFixtureEmails.frozenMember,
    firstName: "Frozen",
    lastName: "Member",
  });

  const venueToken = "PARITY-VENUE-CHECK-IN";

  await database
    .insert(partners)
    .values({
      id: parityFixtureIds.partner,
      name: "Parity Partner Venue",
      address: "Parity Strasse 1, 10115 Berlin",
      contactEmail: "partner-venue@example.test",
      logoUrl: null,
      portalUserId: partnerUserId,
      portalUserEmail: parityFixtureEmails.partner,
      venueCheckInToken: venueToken,
    })
    .onConflictDoUpdate({
      target: partners.id,
      set: {
        name: "Parity Partner Venue",
        address: "Parity Strasse 1, 10115 Berlin",
        contactEmail: "partner-venue@example.test",
        portalUserId: partnerUserId,
        portalUserEmail: parityFixtureEmails.partner,
        venueCheckInToken: venueToken,
        updatedAt: new Date(),
      },
    });

  await Promise.all([
    upsertProfile(database, {
      userId: adminUserId,
      role: "ADMIN",
      partnerId: null,
      firstName: "Parity",
      lastName: "Admin",
      credits: 0,
      subscriptionStatus: "INACTIVE",
    }),
    upsertProfile(database, {
      userId: partnerUserId,
      role: "PARTNER",
      partnerId: parityFixtureIds.partner,
      firstName: "Parity",
      lastName: "Partner",
      credits: 0,
      subscriptionStatus: "INACTIVE",
    }),
    upsertProfile(database, {
      userId: activeMemberUserId,
      role: "USER",
      partnerId: null,
      firstName: "Active",
      lastName: "Member",
      credits: 12,
      subscriptionStatus: "ACTIVE",
      savedCount: 1,
      waitlistCount: 1,
      bookingCount: 2,
      eventOpenCount: 3,
    }),
    upsertProfile(database, {
      userId: frozenMemberUserId,
      role: "USER",
      partnerId: null,
      firstName: "Frozen",
      lastName: "Member",
      credits: 4,
      subscriptionStatus: "UNPAID",
      savedCount: 0,
      waitlistCount: 0,
      bookingCount: 0,
      eventOpenCount: 1,
    }),
  ]);

  await Promise.all([
    upsertSubscription(database, {
      id: parityFixtureIds.subscriptions.activeMember,
      userId: activeMemberUserId,
      status: "ACTIVE",
      providerStatus: "active",
      providerCustomerId: "cus_parity_active",
      providerSubscriptionId: "sub_parity_active",
    }),
    upsertSubscription(database, {
      id: parityFixtureIds.subscriptions.frozenMember,
      userId: frozenMemberUserId,
      status: "UNPAID",
      providerStatus: "past_due",
      providerCustomerId: "cus_parity_frozen",
      providerSubscriptionId: "sub_parity_frozen",
    }),
  ]);

  await upsertFreezeOverride(database, frozenMemberUserId, adminUserId);

  await Promise.all([
    upsertEvent(database, {
      id: parityFixtureIds.events.public,
      partnerId: parityFixtureIds.partner,
      title: "Parity Public Opening",
      description: "Seeded public discovery event.",
      category: "Art",
      eventType: "Preview",
      dateTime: eventDate(3, 18),
      creditPrice: 2,
      totalCapacity: 24,
      remainingCapacity: 9,
      ticketType: "SECRET_CODE",
      secretCodeMode: "MANUAL",
      secretCode: "PARITY-PUBLIC",
      lat: 52.5208,
      lng: 13.3924,
    }),
    upsertEvent(database, {
      id: parityFixtureIds.events.secret,
      partnerId: parityFixtureIds.partner,
      title: "Parity Secret Access",
      description: "Seeded member booking event.",
      category: "Theater",
      eventType: "Members",
      dateTime: eventDate(4, 20),
      creditPrice: 3,
      totalCapacity: 8,
      remainingCapacity: 4,
      ticketType: "SECRET_CODE",
      secretCodeMode: "MANUAL",
      secretCode: "PARITY-SECRET",
      lat: 52.5191,
      lng: 13.4013,
    }),
    upsertEvent(database, {
      id: parityFixtureIds.events.voucher,
      partnerId: parityFixtureIds.partner,
      title: "Parity Voucher Night",
      description: "Voucher redemption mode fixture.",
      category: "Food",
      eventType: "Voucher",
      dateTime: eventDate(5, 19),
      creditPrice: 2,
      totalCapacity: 10,
      remainingCapacity: 5,
      ticketType: "VOUCHER",
      promoCode: "PARITY-VOUCHER",
      eventWebsiteUrl: "https://partner.example.test/redeem/parity-voucher",
      lat: 52.4987,
      lng: 13.4184,
    }),
    upsertEvent(database, {
      id: parityFixtureIds.events.soldOut,
      partnerId: parityFixtureIds.partner,
      title: "Parity Sold Out Session",
      description: "Sold-out waitlist fixture.",
      category: "Cinema",
      eventType: "Waitlist",
      dateTime: eventDate(6, 21),
      creditPrice: 1,
      totalCapacity: 4,
      remainingCapacity: 0,
      ticketType: "SECRET_CODE",
      secretCodeMode: "MANUAL",
      secretCode: "PARITY-SOLDOUT",
      lat: 52.5337,
      lng: 13.4557,
    }),
    upsertEvent(database, {
      id: parityFixtureIds.events.checkIn,
      partnerId: parityFixtureIds.partner,
      title: "Parity Check-In Session",
      description: "Partner and venue check-in fixture.",
      category: "Music",
      eventType: "Check-In",
      dateTime: eventDate(1, 20),
      creditPrice: 2,
      totalCapacity: 6,
      remainingCapacity: 4,
      ticketType: "SECRET_CODE",
      secretCodeMode: "MANUAL",
      secretCode: "PARITY-CHECKIN",
      lat: 52.4859,
      lng: 13.4376,
    }),
  ]);

  await Promise.all([
    upsertBooking(database, {
      id: parityFixtureIds.bookings.used,
      userId: activeMemberUserId,
      eventId: parityFixtureIds.events.voucher,
      partnerId: parityFixtureIds.partner,
      ticketsCount: 1,
      totalCredits: 2,
      status: "USED",
      redemptionType: "VOUCHER",
      redemptionInfo: "PARITY-VOUCHER",
      redemptionUrl: "https://partner.example.test/redeem/parity-voucher",
      checkedInAt: eventDate(-1, 21),
    }),
    upsertBooking(database, {
      id: parityFixtureIds.bookings.confirmed,
      userId: activeMemberUserId,
      eventId: parityFixtureIds.events.checkIn,
      partnerId: parityFixtureIds.partner,
      ticketsCount: 2,
      totalCredits: 4,
      status: "CONFIRMED",
      redemptionType: "SECRET_CODE",
      redemptionInfo: "PARITY-CHECKIN",
    }),
  ]);

  await Promise.all([
    upsertWaitlist(database, {
      id: parityFixtureIds.waitlist.soldOut,
      eventId: parityFixtureIds.events.soldOut,
      userId: activeMemberUserId,
      requestedQty: 1,
    }),
    upsertSavedEvent(
      database,
      activeMemberUserId,
      parityFixtureIds.events.voucher,
    ),
    upsertLedger(database, {
      id: parityFixtureIds.ledger.used,
      userId: activeMemberUserId,
      amount: -2,
      balanceAfter: 10,
      type: "BOOKING",
      description: "Used booking fixture",
      relatedBookingId: parityFixtureIds.bookings.used,
      relatedEventId: parityFixtureIds.events.voucher,
    }),
    upsertLedger(database, {
      id: parityFixtureIds.ledger.confirmed,
      userId: activeMemberUserId,
      amount: -4,
      balanceAfter: 8,
      type: "BOOKING",
      description: "Confirmed booking fixture",
      relatedBookingId: parityFixtureIds.bookings.confirmed,
      relatedEventId: parityFixtureIds.events.checkIn,
    }),
    upsertLedger(database, {
      id: parityFixtureIds.ledger.adminAdjust,
      userId: activeMemberUserId,
      amount: 1,
      balanceAfter: 9,
      type: "ADMIN_ADJUST",
      description: "Parity admin adjustment",
      actorUserId: adminUserId,
    }),
  ]);

  return {
    password: parityPassword,
    partnerId: parityFixtureIds.partner,
    venueToken,
    users: {
      admin: { id: adminUserId, email: parityFixtureEmails.admin },
      partner: { id: partnerUserId, email: parityFixtureEmails.partner },
      activeMember: {
        id: activeMemberUserId,
        email: parityFixtureEmails.activeMember,
      },
      frozenMember: {
        id: frozenMemberUserId,
        email: parityFixtureEmails.frozenMember,
      },
    },
    events: parityFixtureIds.events,
    bookings: parityFixtureIds.bookings,
    waitlist: parityFixtureIds.waitlist,
  };
}
