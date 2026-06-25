import "dotenv/config";

import { signUpWithEmail } from "@unveiled/api/auth-account-actions";
import type { Viewer } from "@unveiled/api/auth-profile";
import {
  loadAdminData,
  loadPartnerData,
} from "@unveiled/api/data-access/loaders";
import type { Db } from "@unveiled/api/db/client";
import { db, postgresClient } from "@unveiled/app/db/client";
import {
  bookings,
  events,
  partners,
  subscriptions,
  user,
  userProfiles,
} from "@unveiled/app/db/schema";
import { eq, sql } from "drizzle-orm";

type SeedProfile = "smoke" | "pagination" | "full";

type CliOptions = {
  profile: SeedProfile;
  reset: boolean;
  schema: string | null;
};

const smokePassword = "Operations-Smoke-2026!";

const paginationPassword = "Pagination-Smoke-2026!";
const paginationMemberCount = 50;
const paginationPartnerCount = 42;
const paginationEventCount = 65;
const paginationConfirmedBookings = 30;
const paginationCancelledBookings = 10;
const paginationDays = 90;
const paginationEmailDomain = "unveiled.local";

const TRUNCATED_TABLES = [
  "credit_ledger_entries",
  "saved_events",
  "subscriptions",
  "bookings",
  "events",
  "partners",
  "user_profiles",
  "user",
] as const;

const smokePartner = {
  id: "ops-smoke-partner",
  name: "Operations Smoke Venue",
  address: "Smoke Strasse 1, 10115 Berlin",
  contactEmail: "ops-smoke-partner@unveiled.local",
  logoUrl: null,
  venueCheckInToken: "OPS-SMOKE-VENUE-TOKEN",
};

const smokeUsers = {
  admin: {
    email: "ops-smoke-admin@unveiled.local",
    firstName: "Ops",
    lastName: "Admin",
    role: "ADMIN" as const,
    partnerId: null,
  },
  partner: {
    email: "ops-smoke-partner-user@unveiled.local",
    firstName: "Ops",
    lastName: "Partner",
    role: "PARTNER" as const,
    partnerId: smokePartner.id,
  },
  member: {
    email: "ops-smoke-member@unveiled.local",
    firstName: "Ops",
    lastName: "Member",
    role: "USER" as const,
    partnerId: null,
  },
};

const eventId = "ops-smoke-event";
const bookingId = "ops-smoke-booking";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function parseCli(argv: string[]): CliOptions {
  let profile: SeedProfile = "smoke";
  let reset = false;
  let schema: string | null = null;
  for (const arg of argv.slice(2)) {
    if (arg === "--reset") {
      reset = true;
      continue;
    }
    if (arg.startsWith("--profile=")) {
      profile = parseProfile(arg.slice("--profile=".length));
      continue;
    }
    if (arg === "--profile") {
      const next = argv[argv.indexOf(arg) + 1];
      if (next) profile = parseProfile(next);
      continue;
    }
    if (arg.startsWith("--schema=")) {
      schema = arg.slice("--schema=".length);
      continue;
    }
    if (arg === "--schema") {
      const next = argv[argv.indexOf(arg) + 1];
      if (next) schema = next;
      continue;
    }
    if (arg.startsWith("--")) continue;
    if (!arg.includes("=") && !arg.startsWith("-")) {
      profile = parseProfile(arg);
    }
  }
  return { profile, reset, schema };
}

function parseProfile(value: string | undefined): SeedProfile {
  if (value === "smoke" || value === "pagination" || value === "full") {
    return value;
  }
  throw new Error(
    `Unknown seed profile '${value}'. Expected one of: smoke, pagination, full.`,
  );
}

function eventDate() {
  const date = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  date.setSeconds(0, 0);
  return date;
}

async function ensureAuthUser(input: {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}) {
  const existing = await db.query.user.findFirst({
    where: eq(user.email, input.email),
  });
  if (existing) return { id: existing.id, created: false };

  const result = await signUpWithEmail({
    email: input.email,
    password: input.password,
    firstName: input.firstName,
    lastName: input.lastName,
    callbackURL: "/",
  });

  assert(result.ok && result.userId, `Could not create ${input.email}`);
  return { id: result.userId, created: true };
}

async function insertUserRowDirect(input: {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  passwordHash: string;
  database: Db;
}) {
  const { database } = input;
  await database.insert(user).values({
    id: input.userId,
    name: `${input.firstName} ${input.lastName}`,
    email: input.email,
    emailVerified: true,
  });
  await database.execute(sql`
    INSERT INTO "account" (id, account_id, provider_id, user_id, password, created_at, updated_at)
    VALUES (${input.userId}, ${input.email}, 'credential', ${input.userId}, ${input.passwordHash}, NOW(), NOW())
  `);
}

async function upsertSmokeProfile(input: {
  userId: string;
  role: "USER" | "ADMIN" | "PARTNER";
  partnerId: string | null;
  firstName: string;
  lastName: string;
  credits: number;
}) {
  await db
    .insert(userProfiles)
    .values({
      userId: input.userId,
      role: input.role,
      partnerId: input.partnerId,
      firstName: input.firstName,
      lastName: input.lastName,
      credits: input.credits,
      subscriptionStatus: input.role === "USER" ? "ACTIVE" : "INACTIVE",
      subscriptionPlan: "BASIC_BERLIN",
      onboardingComplete: true,
      interests: ["Theater"],
      moods: ["Leicht"],
      districts: ["Mitte"],
      timing: ["After Work"],
      preferredDays: ["Do"],
      preferredLanguages: ["DE"],
      maxDistance: 10,
      bookingCount: input.role === "USER" ? 1 : 0,
      eventOpenCount: input.role === "USER" ? 1 : 0,
      savedCount: 0,
      waitlistCount: 0,
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
        subscriptionStatus: input.role === "USER" ? "ACTIVE" : "INACTIVE",
        onboardingComplete: true,
        bookingCount: input.role === "USER" ? 1 : 0,
        eventOpenCount: input.role === "USER" ? 1 : 0,
        updatedAt: new Date(),
      },
    });
}

function viewer(input: {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "USER" | "ADMIN" | "PARTNER";
  partnerId: string | null;
}): Viewer {
  return {
    kind: "authenticated",
    viewerContext:
      input.role === "ADMIN"
        ? "admin"
        : input.role === "PARTNER"
          ? "partner"
          : "member",
    user: {
      id: input.userId,
      email: input.email,
      name: `${input.firstName} ${input.lastName}`,
      emailVerified: true,
      image: null,
    },
    role: input.role,
    partnerId: input.partnerId,
    language: "DE",
    credits: input.role === "USER" ? 20 : 0,
    subscriptionStatus: input.role === "USER" ? "ACTIVE" : "INACTIVE",
    subscriptionPlan: "BASIC_BERLIN",
    onboardingComplete: true,
    savedCount: 0,
    firstName: input.firstName,
    lastName: input.lastName,
    showProfile: input.role !== "PARTNER",
    showLogout: true,
  };
}

async function resetTables(database: Db, schemaName: string | null) {
  const list = TRUNCATED_TABLES.map((t) => sql.raw(`"${t}"`));
  const statement = sql`TRUNCATE ${sql.join(list, sql.raw(", "))} RESTART IDENTITY CASCADE`;
  if (schemaName) {
    await database.execute(
      sql.raw(`SET LOCAL search_path TO "${schemaName}", public`),
    );
  }
  await database.execute(statement);
}

async function withSchema<T>(
  database: Db,
  schemaName: string | null,
  fn: (db: Db) => Promise<T>,
): Promise<T> {
  if (!schemaName) return fn(database);
  return database.transaction(async (tx) => {
    await tx.execute(
      sql.raw(`SET LOCAL search_path TO "${schemaName}", public`),
    );
    return fn(tx as unknown as Db);
  });
}

async function seedSmoke() {
  const admin = await ensureAuthUser({
    ...smokeUsers.admin,
    password: smokePassword,
  });
  const partnerUser = await ensureAuthUser({
    ...smokeUsers.partner,
    password: smokePassword,
  });
  const member = await ensureAuthUser({
    ...smokeUsers.member,
    password: smokePassword,
  });

  await db
    .insert(partners)
    .values({
      ...smokePartner,
      portalUserId: partnerUser.id,
      portalUserEmail: smokeUsers.partner.email,
    })
    .onConflictDoUpdate({
      target: partners.id,
      set: {
        name: sql`excluded.name`,
        address: sql`excluded.address`,
        contactEmail: sql`excluded.contact_email`,
        logoUrl: sql`excluded.logo_url`,
        venueCheckInToken: sql`excluded.venue_check_in_token`,
        portalUserId: sql`excluded.portal_user_id`,
        portalUserEmail: sql`excluded.portal_user_email`,
        updatedAt: new Date(),
      },
    });

  await Promise.all([
    upsertSmokeProfile({
      userId: admin.id,
      ...smokeUsers.admin,
      credits: 0,
    }),
    upsertSmokeProfile({
      userId: partnerUser.id,
      ...smokeUsers.partner,
      credits: 0,
    }),
    upsertSmokeProfile({
      userId: member.id,
      ...smokeUsers.member,
      credits: 20,
    }),
  ]);

  const startsAt = eventDate();
  await db
    .insert(events)
    .values({
      id: eventId,
      partnerId: smokePartner.id,
      title: "Operations Smoke Event",
      description: "Check-in ready event for admin and partner smoke tests.",
      category: "Theater",
      eventType: "Smoke",
      dateTime: startsAt,
      timingMode: "TIME_SLOT",
      startTimeMinutes: startsAt.getHours() * 60 + startsAt.getMinutes(),
      weekday: startsAt.getDay(),
      address: smokePartner.address,
      neighborhood: "Mitte",
      imageUrl: "",
      tags: ["Smoke"],
      creditPrice: 2,
      totalCapacity: 20,
      remainingCapacity: 18,
      ticketType: "SECRET_CODE",
      secretCodeMode: "MANUAL",
      secretCode: "OPS-SMOKE",
      barrierFree: false,
      languages: ["DE"],
      targetAgeGroups: ["26-35"],
    })
    .onConflictDoUpdate({
      target: events.id,
      set: {
        partnerId: sql`excluded.partner_id`,
        title: sql`excluded.title`,
        description: sql`excluded.description`,
        category: sql`excluded.category`,
        eventType: sql`excluded.event_type`,
        dateTime: sql`excluded.date_time`,
        timingMode: sql`excluded.timing_mode`,
        startTimeMinutes: sql`excluded.start_time_minutes`,
        weekday: sql`excluded.weekday`,
        address: sql`excluded.address`,
        neighborhood: sql`excluded.neighborhood`,
        imageUrl: sql`excluded.image_url`,
        tags: sql`excluded.tags`,
        creditPrice: sql`excluded.credit_price`,
        totalCapacity: sql`excluded.total_capacity`,
        remainingCapacity: sql`excluded.remaining_capacity`,
        ticketType: sql`excluded.ticket_type`,
        secretCodeMode: sql`excluded.secret_code_mode`,
        secretCode: sql`excluded.secret_code`,
        barrierFree: sql`excluded.barrier_free`,
        languages: sql`excluded.languages`,
        targetAgeGroups: sql`excluded.target_age_groups`,
        updatedAt: new Date(),
      },
    });

  await db
    .insert(bookings)
    .values({
      id: bookingId,
      userId: member.id,
      eventId,
      partnerId: smokePartner.id,
      ticketsCount: 2,
      totalCredits: 4,
      status: "CONFIRMED",
      redemptionType: "SECRET_CODE",
      redemptionInfo: "OPS-SMOKE",
      idempotencyKey: "ops-smoke-booking",
      checkedInAt: null,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: bookings.id,
      set: {
        userId: sql`excluded.user_id`,
        eventId: sql`excluded.event_id`,
        partnerId: sql`excluded.partner_id`,
        ticketsCount: sql`excluded.tickets_count`,
        totalCredits: sql`excluded.total_credits`,
        status: "CONFIRMED",
        redemptionType: sql`excluded.redemption_type`,
        redemptionInfo: sql`excluded.redemption_info`,
        checkedInAt: null,
        updatedAt: new Date(),
      },
    });

  const adminData = await loadAdminData(
    viewer({ userId: admin.id, ...smokeUsers.admin }),
  );
  const partnerData = await loadPartnerData(
    viewer({ userId: partnerUser.id, ...smokeUsers.partner }),
    smokePartner.id,
  );

  assert(
    adminData.events.items.some((event) => event.id === eventId),
    "Admin smoke event should be visible.",
  );
  assert(
    adminData.partners.items.some((partner) => partner.id === smokePartner.id),
    "Admin smoke partner should be visible.",
  );
  assert(
    adminData.members.items.some((row) => row.userId === member.id),
    "Admin smoke member should be visible.",
  );
  assert(
    partnerData.guests.some((guest) => guest.bookingId === bookingId),
    "Partner smoke guest should be visible.",
  );

  console.log("Seeded operations smoke data.");
  console.log(`Admin:   ${smokeUsers.admin.email} / ${smokePassword}`);
  console.log(`Partner: ${smokeUsers.partner.email} / ${smokePassword}`);
  console.log(`Member:  ${smokeUsers.member.email} / ${smokePassword}`);
  console.log("Routes: /admin and /partner");
}

type PaginationProfile = {
  memberCount: number;
  partnerCount: number;
  eventCount: number;
  confirmedBookings: number;
  cancelledBookings: number;
  daysAhead: number;
  passwordHash: string;
};

async function seedPagination(database: Db, profile: PaginationProfile) {
  const adminCount = 3;
  const partnerProfileCount = Math.min(
    profile.partnerCount,
    profile.memberCount - adminCount,
  );
  const memberUsers: { userId: string; role: "USER" | "PARTNER" | "ADMIN" }[] =
    [];
  for (let i = 1; i <= profile.memberCount; i++) {
    const padded = i.toString().padStart(3, "0");
    const role: "USER" | "PARTNER" | "ADMIN" =
      i <= adminCount
        ? "ADMIN"
        : i <= adminCount + partnerProfileCount
          ? "PARTNER"
          : "USER";
    const prefix =
      role === "ADMIN"
        ? "smoke-admin"
        : role === "PARTNER"
          ? "smoke-partner"
          : "smoke-member";
    const email = `${prefix}-${padded}@${paginationEmailDomain}`;
    const userId = `pagination-${role.toLowerCase()}-${padded}`;
    await insertUserRowDirect({
      userId,
      email,
      firstName: `Seed${padded}`,
      lastName: role,
      passwordHash: profile.passwordHash,
      database,
    });
    memberUsers.push({ userId, role });
  }

  for (const entry of memberUsers) {
    const padded = entry.userId.slice(-3);
    if (entry.role === "USER") {
      await database
        .insert(userProfiles)
        .values({
          userId: entry.userId,
          role: "USER",
          firstName: `Seed${padded}`,
          lastName: "Member",
          credits: 20,
          subscriptionStatus: "ACTIVE",
          subscriptionPlan: "BASIC_BERLIN",
          onboardingComplete: true,
          partnerId: null,
          interests: ["Theater"],
          moods: ["Leicht"],
          districts: ["Mitte"],
          timing: ["After Work"],
          preferredDays: ["Do"],
          preferredLanguages: ["DE"],
          maxDistance: 10,
          bookingCount: 1,
          eventOpenCount: 1,
          savedCount: 0,
          waitlistCount: 0,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: userProfiles.userId,
          set: {
            role: "USER",
            firstName: `Seed${padded}`,
            lastName: "Member",
            credits: 20,
            subscriptionStatus: "ACTIVE",
            updatedAt: new Date(),
          },
        });
      continue;
    }
    if (entry.role === "PARTNER") {
      await database
        .insert(userProfiles)
        .values({
          userId: entry.userId,
          role: "PARTNER",
          firstName: `Seed${padded}`,
          lastName: "Partner",
          credits: 0,
          subscriptionStatus: "INACTIVE",
          subscriptionPlan: "BASIC_BERLIN",
          onboardingComplete: true,
          partnerId: null,
          interests: [],
          moods: [],
          districts: [],
          timing: [],
          preferredDays: [],
          preferredLanguages: ["DE"],
          maxDistance: 0,
          bookingCount: 0,
          eventOpenCount: 0,
          savedCount: 0,
          waitlistCount: 0,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: userProfiles.userId,
          set: {
            role: "PARTNER",
            firstName: `Seed${padded}`,
            lastName: "Partner",
            subscriptionStatus: "INACTIVE",
            updatedAt: new Date(),
          },
        });
      continue;
    }
    await database
      .insert(userProfiles)
      .values({
        userId: entry.userId,
        role: "ADMIN",
        firstName: `Seed${padded}`,
        lastName: "Admin",
        credits: 0,
        subscriptionStatus: "INACTIVE",
        subscriptionPlan: "BASIC_BERLIN",
        onboardingComplete: true,
        partnerId: null,
        interests: [],
        moods: [],
        districts: [],
        timing: [],
        preferredDays: [],
        preferredLanguages: ["DE"],
        maxDistance: 0,
        bookingCount: 0,
        eventOpenCount: 0,
        savedCount: 0,
        waitlistCount: 0,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: userProfiles.userId,
        set: {
          role: "ADMIN",
          firstName: `Seed${padded}`,
          lastName: "Admin",
          subscriptionStatus: "INACTIVE",
          updatedAt: new Date(),
        },
      });
  }

  const partnerUsers = memberUsers.filter((entry) => entry.role === "PARTNER");
  const memberUsersOnly = memberUsers.filter((entry) => entry.role === "USER");
  const partnerInsertCount = Math.min(
    profile.partnerCount,
    partnerUsers.length,
  );
  const seededPartnerIds: string[] = [];
  for (let i = 0; i < partnerInsertCount; i++) {
    const padded = (i + 1).toString().padStart(3, "0");
    const partnerId = `pagination-partner-${padded}`;
    const portalEntry = partnerUsers[i];
    if (!portalEntry) continue;
    seededPartnerIds.push(partnerId);
    await database
      .insert(partners)
      .values({
        id: partnerId,
        name: `Pagination Venue ${padded}`,
        address: `Pagination Strasse ${padded}, 10115 Berlin`,
        contactEmail: `pagination-venue-${padded}@${paginationEmailDomain}`,
        logoUrl: null,
        venueCheckInToken: `PAG-VENUE-${padded}-TOKEN`,
        portalUserId: portalEntry.userId,
        portalUserEmail: `smoke-partner-${padded}@${paginationEmailDomain}`,
      })
      .onConflictDoUpdate({
        target: partners.id,
        set: {
          name: sql`excluded.name`,
          address: sql`excluded.address`,
          contactEmail: sql`excluded.contact_email`,
          logoUrl: sql`excluded.logo_url`,
          venueCheckInToken: sql`excluded.venue_check_in_token`,
          portalUserId: sql`excluded.portal_user_id`,
          portalUserEmail: sql`excluded.portal_user_email`,
          updatedAt: new Date(),
        },
      });
  }

  const intervalHours = (profile.daysAhead * 24) / profile.eventCount;
  const seededEventIds: string[] = [];
  for (let i = 0; i < profile.eventCount; i++) {
    const padded = (i + 1).toString().padStart(3, "0");
    const partnerId = seededPartnerIds[i % seededPartnerIds.length];
    if (!partnerId) continue;
    const eventIdRow = `pagination-event-${padded}`;
    const startsAt = new Date(Date.now() + i * intervalHours * 60 * 60 * 1000);
    startsAt.setSeconds(0, 0);
    await database
      .insert(events)
      .values({
        id: eventIdRow,
        partnerId,
        title: `Pagination Event ${padded}`,
        description: `Synthetic pagination event ${padded} for admin and discovery pagination tests.`,
        category: i % 2 === 0 ? "Theater" : "Music",
        eventType: "Pagination",
        dateTime: startsAt,
        timingMode: "TIME_SLOT",
        startTimeMinutes: startsAt.getHours() * 60 + startsAt.getMinutes(),
        weekday: startsAt.getDay(),
        address: `Pagination Strasse ${padded}, 10115 Berlin`,
        neighborhood: "Mitte",
        imageUrl: "",
        tags: ["Pagination"],
        creditPrice: 2,
        totalCapacity: 40,
        remainingCapacity: 40,
        ticketType: "SECRET_CODE",
        secretCodeMode: "MANUAL",
        secretCode: `PAG-${padded}`,
        barrierFree: false,
        languages: ["DE"],
        targetAgeGroups: ["26-35"],
      })
      .onConflictDoUpdate({
        target: events.id,
        set: {
          partnerId: sql`excluded.partner_id`,
          title: sql`excluded.title`,
          description: sql`excluded.description`,
          category: sql`excluded.category`,
          eventType: sql`excluded.event_type`,
          dateTime: sql`excluded.date_time`,
          startTimeMinutes: sql`excluded.start_time_minutes`,
          weekday: sql`excluded.weekday`,
          address: sql`excluded.address`,
          neighborhood: sql`excluded.neighborhood`,
          tags: sql`excluded.tags`,
          creditPrice: sql`excluded.credit_price`,
          totalCapacity: sql`excluded.total_capacity`,
          remainingCapacity: sql`excluded.remaining_capacity`,
          ticketType: sql`excluded.ticket_type`,
          secretCodeMode: sql`excluded.secret_code_mode`,
          secretCode: sql`excluded.secret_code`,
          barrierFree: sql`excluded.barrier_free`,
          languages: sql`excluded.languages`,
          targetAgeGroups: sql`excluded.target_age_groups`,
          updatedAt: new Date(),
        },
      });
    seededEventIds.push(eventIdRow);
  }

  const totalBookings = profile.confirmedBookings + profile.cancelledBookings;
  for (let i = 0; i < totalBookings; i++) {
    const padded = (i + 1).toString().padStart(3, "0");
    const eventIdRow = seededEventIds[i % seededEventIds.length];
    const partnerId = seededPartnerIds[i % seededPartnerIds.length];
    const memberEntry = memberUsersOnly[i % memberUsersOnly.length];
    if (!eventIdRow || !partnerId || !memberEntry) continue;
    const status = i < profile.confirmedBookings ? "CONFIRMED" : "CANCELLED";
    await database
      .insert(bookings)
      .values({
        id: `pagination-booking-${padded}`,
        userId: memberEntry.userId,
        eventId: eventIdRow,
        partnerId,
        ticketsCount: 2,
        totalCredits: 4,
        status,
        redemptionType: "SECRET_CODE",
        redemptionInfo: `PAG-${padded}`,
        idempotencyKey: `pagination-booking-${padded}`,
        checkedInAt: null,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: bookings.id,
        set: {
          userId: sql`excluded.user_id`,
          eventId: sql`excluded.event_id`,
          partnerId: sql`excluded.partner_id`,
          ticketsCount: sql`excluded.tickets_count`,
          totalCredits: sql`excluded.total_credits`,
          status: sql`excluded.status`,
          redemptionType: sql`excluded.redemption_type`,
          redemptionInfo: sql`excluded.redemption_info`,
          checkedInAt: null,
          updatedAt: new Date(),
        },
      });
  }

  const subscriptionStatuses: Array<
    "ACTIVE" | "PAUSED" | "INACTIVE" | "ACTION_REQUIRED"
  > = ["ACTIVE", "PAUSED", "INACTIVE", "ACTION_REQUIRED"];
  for (let i = 0; i < memberUsersOnly.length; i++) {
    const member = memberUsersOnly[i];
    if (!member) continue;
    const status = subscriptionStatuses[i % subscriptionStatuses.length];
    if (!status) continue;
    await database
      .insert(subscriptions)
      .values({
        id: `pagination-subscription-${member.userId.slice(-3)}`,
        userId: member.userId,
        provider: "STRIPE",
        providerCustomerId: `cus_pagination_${member.userId.slice(-3)}`,
        providerSubscriptionId: `sub_pagination_${member.userId.slice(-3)}`,
        providerPriceId: "price_pagination_basic_berlin",
        planCode: "BASIC_BERLIN",
        status,
        providerStatus: status === "ACTION_REQUIRED" ? "past_due" : "active",
        billingEmail: `smoke-member-${member.userId.slice(-3)}@${paginationEmailDomain}`,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      })
      .onConflictDoNothing();
  }

  console.log(
    `Seeded pagination dataset (members=${profile.memberCount}, partners=${partnerInsertCount}, events=${profile.eventCount}, bookings=${totalBookings}).`,
  );
}

async function seedFull(database: Db) {
  const passwordHash = await Bun.password.hash(paginationPassword, {
    algorithm: "bcrypt",
    cost: 4,
  });
  await seedPagination(database, {
    memberCount: paginationMemberCount,
    partnerCount: paginationPartnerCount,
    eventCount: paginationEventCount,
    confirmedBookings: paginationConfirmedBookings,
    cancelledBookings: paginationCancelledBookings,
    daysAhead: paginationDays,
    passwordHash,
  });
}

async function run() {
  const options = parseCli(Bun.argv);
  const shouldReset = options.reset || options.profile === "full";

  if (shouldReset) {
    await withSchema(db, options.schema, async (scopedDb) => {
      await resetTables(scopedDb, options.schema);
    });
  }

  if (options.profile === "smoke") {
    await seedSmoke();
  } else if (options.profile === "pagination") {
    const passwordHash = await Bun.password.hash(paginationPassword, {
      algorithm: "bcrypt",
      cost: 4,
    });
    await withSchema(db, options.schema, async (scopedDb) => {
      await seedPagination(scopedDb, {
        memberCount: paginationMemberCount,
        partnerCount: paginationPartnerCount,
        eventCount: paginationEventCount,
        confirmedBookings: paginationConfirmedBookings,
        cancelledBookings: paginationCancelledBookings,
        daysAhead: paginationDays,
        passwordHash,
      });
    });
  } else {
    await withSchema(db, options.schema, async (scopedDb) => {
      await seedFull(scopedDb);
    });
  }

  await postgresClient.end();
}

export {
  paginationCancelledBookings,
  paginationConfirmedBookings,
  paginationEventCount,
  paginationMemberCount,
  paginationPartnerCount,
  resetTables,
  seedFull,
  seedPagination,
  seedSmoke,
  TRUNCATED_TABLES,
  withSchema,
};

if (import.meta.main) {
  run().catch(async (error) => {
    console.error(error);
    await postgresClient.end();
    process.exit(1);
  });
}
