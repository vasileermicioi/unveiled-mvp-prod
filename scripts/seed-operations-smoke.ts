import "dotenv/config";

import { eq, sql } from "drizzle-orm";

import { db, postgresClient } from "@/db/client";
import { bookings, events, partners, user, userProfiles } from "@/db/schema";
import { signUpWithEmail } from "@/lib/auth-account-actions";
import type { Viewer } from "@/lib/auth-profile";
import { loadAdminData, loadPartnerData } from "@/lib/data-access/loaders";

const smokePassword = "Operations-Smoke-2026!";

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

function eventDate() {
  const date = new Date(Date.now() + 60 * 60 * 1000);
  date.setSeconds(0, 0);
  return date;
}

async function ensureAuthUser(input: {
  email: string;
  firstName: string;
  lastName: string;
}) {
  const existing = await db.query.user.findFirst({
    where: eq(user.email, input.email),
  });
  if (existing) return { id: existing.id, created: false };

  const result = await signUpWithEmail({
    email: input.email,
    password: smokePassword,
    firstName: input.firstName,
    lastName: input.lastName,
    callbackURL: "/",
  });

  assert(result.ok && result.userId, `Could not create ${input.email}`);
  return { id: result.userId, created: true };
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

async function run() {
  const admin = await ensureAuthUser(smokeUsers.admin);
  const partnerUser = await ensureAuthUser(smokeUsers.partner);
  const member = await ensureAuthUser(smokeUsers.member);

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
    adminData.events.some((event) => event.id === eventId),
    "Admin smoke event should be visible.",
  );
  assert(
    adminData.partners.some((partner) => partner.id === smokePartner.id),
    "Admin smoke partner should be visible.",
  );
  assert(
    adminData.members.some((row) => row.userId === member.id),
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

  await postgresClient.end();
}

run().catch(async (error) => {
  console.error(error);
  await postgresClient.end();
  process.exit(1);
});
