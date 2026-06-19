import { and, asc, count, desc, eq, inArray, isNull, sql } from "drizzle-orm";

import { type Db, db } from "@unveiled/api/db/client";
import {
  billingAdminOverrides,
  bookings,
  events,
  partners,
  subscriptions,
  user,
  userProfiles,
  waitlistEntries,
} from "@unveiled/api/db/schema";
import { auth } from "@unveiled/api/middleware/auth";
import type { AuthenticatedViewer } from "@unveiled/api/auth-profile";
import type { EventFormInput, PartnerFormInput } from "@unveiled/api/forms/schemas";

export type OperationFailureState =
  | "validation_error"
  | "unauthorized"
  | "not_found"
  | "conflict"
  | "not_open"
  | "already_used"
  | "no_eligible_booking"
  | "invalid_token";

export type OperationFailure = {
  state: OperationFailureState;
  message: string;
  fieldErrors?: Record<string, string>;
};

export type OperationResult<TData> =
  | ({ state: "success"; message: string } & TData)
  | OperationFailure;

export type CheckInResult = OperationResult<{
  bookingId: string;
  partnerId: string;
  checkedInAt?: Date;
  alreadyCheckedIn?: boolean;
}>;

export type AdminMemberRow = {
  userId: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN" | "PARTNER";
  subscriptionStatus: string;
  credits: number;
  bookingCount: number;
  eventOpenCount: number;
  savedCount: number;
  waitlistCount: number;
  providerCustomerId?: string | null;
  providerSubscriptionId?: string | null;
  providerStatus?: string | null;
  lastProviderSyncAt?: Date | null;
  currentPeriodStart?: Date | null;
  currentPeriodEnd?: Date | null;
  billingOverrideActions: Array<"freeze" | "unfreeze">;
};

export type PartnerGuestExportRow = {
  bookingId: string;
  userId: string;
  event: string;
  code: string | null;
  status: string;
  tickets: number;
  createdAt: Date;
};

export type AdminExportRow = PartnerGuestExportRow & {
  partner: string;
  credits: number;
};

const CHECK_IN_PAST_MS = 24 * 60 * 60 * 1000;
const CHECK_IN_FUTURE_MS = 18 * 60 * 60 * 1000;

function newId() {
  return crypto.randomUUID();
}

function failure(
  state: OperationFailureState,
  message: string,
  fieldErrors?: Record<string, string>,
): OperationFailure {
  return { state, message, fieldErrors };
}

function isFailure<TData>(
  result: OperationResult<TData>,
): result is OperationFailure {
  return result.state !== "success";
}

function startMinutes(date: Date, timingMode: "TIME_SLOT" | "ALL_DAY") {
  return timingMode === "ALL_DAY"
    ? 0
    : date.getHours() * 60 + date.getMinutes();
}

function generatedSharedCode(eventId: string) {
  return `UNV-${eventId
    .replace(/[^a-z0-9]/gi, "")
    .slice(0, 8)
    .toUpperCase()}`;
}

function generateVenueCheckInToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(18));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

function generateTempPassword() {
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  return `Unveiled-${Array.from(bytes, (byte) =>
    byte.toString(36).padStart(2, "0"),
  ).join("")}!`;
}

function isWithinCheckInWindow(eventTime: Date, now = new Date()) {
  const diff = eventTime.getTime() - now.getTime();
  return diff <= CHECK_IN_FUTURE_MS && diff >= -CHECK_IN_PAST_MS;
}

function eventValues(input: EventFormInput, id: string, dateTime: Date) {
  const timingMode = input.timingMode;
  const secretCodeMode =
    input.ticketType === "SECRET_CODE"
      ? (input.secretCodeMode ?? "MANUAL")
      : undefined;

  return {
    partnerId: input.partnerId,
    title: input.title,
    description: input.description,
    category: input.category,
    eventType: input.eventType,
    dateTime,
    timingMode,
    startTimeMinutes: startMinutes(dateTime, timingMode),
    weekday: dateTime.getDay(),
    address: input.address,
    neighborhood: input.neighborhood,
    lat: input.lat,
    lng: input.lng,
    imageUrl: input.imageUrl,
    tags: input.tags,
    creditPrice: input.creditPrice,
    totalCapacity: input.totalCapacity,
    remainingCapacity: input.remainingCapacity ?? input.totalCapacity,
    ticketType: input.ticketType,
    voucherTemplate:
      input.ticketType === "VOUCHER" ? (input.voucherTemplate ?? null) : null,
    secretCodeRules:
      input.ticketType === "SECRET_CODE"
        ? (input.secretCodeRules ?? null)
        : null,
    secretCode:
      input.ticketType === "SECRET_CODE"
        ? secretCodeMode === "SHARED_GENERATED"
          ? (input.secretCode ?? generatedSharedCode(id))
          : secretCodeMode === "UNIQUE_PER_BOOKING"
            ? null
            : (input.secretCode ?? null)
        : null,
    secretCodeMode,
    promoCode:
      input.ticketType === "VOUCHER" ? (input.promoCode ?? null) : null,
    eventWebsiteUrl:
      input.ticketType === "VOUCHER" ? (input.eventWebsiteUrl ?? null) : null,
    barrierFree: input.barrierFree,
    languages: input.languages,
    targetAgeGroups: input.targetAgeGroups,
    updatedAt: new Date(),
  };
}

export async function saveAdminEvent(
  input: EventFormInput,
  database: Db = db,
): Promise<OperationResult<{ eventIds: string[] }>> {
  const partner = await database.query.partners.findFirst({
    where: eq(partners.id, input.partnerId),
  });
  if (!partner) return failure("not_found", "Partner is not available.");

  if (input.id) {
    const eventId = input.id;
    return database.transaction(async (tx) => {
      await tx.execute(
        sql`select id from ${events} where id = ${eventId} for update`,
      );
      const existing = await tx.query.events.findFirst({
        where: eq(events.id, eventId),
      });
      if (!existing) return failure("not_found", "Event is not available.");

      const dateTime = new Date(input.dateTime);
      const usedTickets = Math.max(
        0,
        existing.totalCapacity - existing.remainingCapacity,
      );
      const nextRemaining = Math.max(0, input.totalCapacity - usedTickets);

      await tx
        .update(events)
        .set({
          ...eventValues(input, eventId, dateTime),
          remainingCapacity: nextRemaining,
        })
        .where(eq(events.id, eventId));

      return {
        state: "success",
        message: "Event saved.",
        eventIds: [eventId],
      };
    });
  }

  const firstId = newId();
  const slotDateTimes =
    input.series.enabled && input.series.slotIsoDateTimes.length > 0
      ? Array.from(new Set(input.series.slotIsoDateTimes))
      : [];
  const ids = input.series.enabled
    ? Array.from(
        { length: slotDateTimes.length || input.series.count },
        (_, index) => (index === 0 ? firstId : newId()),
      )
    : [firstId];
  if (ids.length === 0) {
    return failure(
      "validation_error",
      "At least one valid time slot is required.",
    );
  }

  await database.insert(events).values(
    ids.map((id, index) => {
      const dateTime = slotDateTimes[index]
        ? new Date(slotDateTimes[index])
        : new Date(input.dateTime);
      if (!slotDateTimes[index] && index > 0) {
        dateTime.setDate(
          dateTime.getDate() + input.series.intervalDays * index,
        );
      }
      return {
        id,
        ...eventValues(
          {
            ...input,
            title: index > 0 ? `${input.title} ${index + 1}` : input.title,
          },
          id,
          dateTime,
        ),
        createdAt: new Date(),
      };
    }),
  );

  return {
    state: "success",
    message: input.series.enabled ? "Event series created." : "Event saved.",
    eventIds: ids,
  };
}

export async function deleteAdminEvent(
  eventId: string,
  database: Db = db,
): Promise<OperationResult<{ eventId: string }>> {
  return database.transaction(async (tx) => {
    const bookingRows = await tx
      .select({ value: count() })
      .from(bookings)
      .where(eq(bookings.eventId, eventId));
    if ((bookingRows[0]?.value ?? 0) > 0) {
      return failure("conflict", "Events with bookings cannot be deleted.");
    }
    await tx
      .delete(waitlistEntries)
      .where(eq(waitlistEntries.eventId, eventId));
    const [deleted] = await tx
      .delete(events)
      .where(eq(events.id, eventId))
      .returning({ id: events.id });
    if (!deleted) return failure("not_found", "Event is not available.");
    return { state: "success", message: "Event deleted.", eventId };
  });
}

export async function saveAdminPartner(
  input: PartnerFormInput,
  database: Db = db,
): Promise<OperationResult<{ partnerId: string }>> {
  const id = input.id ?? newId();
  const values = {
    name: input.name,
    contactEmail: input.contactEmail,
    address: input.address,
    logoUrl: input.logoUrl ?? null,
    venueCheckInToken: input.venueCheckInToken ?? generateVenueCheckInToken(),
    portalUserEmail: input.portalUserEmail || null,
    updatedAt: new Date(),
  };

  if (input.id) {
    const [updated] = await database
      .update(partners)
      .set(values)
      .where(eq(partners.id, input.id))
      .returning({ id: partners.id });
    if (!updated) return failure("not_found", "Partner is not available.");
  } else {
    await database.insert(partners).values({ id, ...values });
  }

  return { state: "success", message: "Partner saved.", partnerId: id };
}

export async function rotatePartnerVenueToken(
  partnerId: string,
  database: Db = db,
) {
  const token = generateVenueCheckInToken();
  const [updated] = await database
    .update(partners)
    .set({ venueCheckInToken: token, updatedAt: new Date() })
    .where(eq(partners.id, partnerId))
    .returning({
      id: partners.id,
      venueCheckInToken: partners.venueCheckInToken,
    });
  if (!updated) return failure("not_found", "Partner is not available.");
  return {
    state: "success" as const,
    message: "Venue check-in token updated.",
    partnerId,
    venueCheckInToken: token,
    venueQrPath: `/venue-check-in/${partnerId}?token=${token}`,
  };
}

export async function deleteAdminPartner(
  partnerId: string,
  database: Db = db,
): Promise<OperationResult<{ partnerId: string }>> {
  return database.transaction(async (tx) => {
    const [eventCount, bookingCount] = await Promise.all([
      tx
        .select({ value: count() })
        .from(events)
        .where(eq(events.partnerId, partnerId)),
      tx
        .select({ value: count() })
        .from(bookings)
        .where(eq(bookings.partnerId, partnerId)),
    ]);
    if ((eventCount[0]?.value ?? 0) > 0 || (bookingCount[0]?.value ?? 0) > 0) {
      return failure(
        "conflict",
        "Partners with linked events or bookings cannot be deleted.",
      );
    }
    await tx
      .update(userProfiles)
      .set({ role: "USER", partnerId: null, updatedAt: new Date() })
      .where(eq(userProfiles.partnerId, partnerId));
    const [deleted] = await tx
      .delete(partners)
      .where(eq(partners.id, partnerId))
      .returning({ id: partners.id });
    if (!deleted) return failure("not_found", "Partner is not available.");
    return {
      state: "success" as const,
      message: "Partner deleted.",
      partnerId,
    };
  });
}

export async function provisionPartnerPortalAccess(
  input: { partnerId: string; email?: string },
  database: Db = db,
) {
  const partner = await database.query.partners.findFirst({
    where: eq(partners.id, input.partnerId),
  });
  if (!partner) return failure("not_found", "Partner is not available.");
  if (partner.portalUserId) {
    return {
      state: "success" as const,
      message: "Partner portal access already exists.",
      partnerId: input.partnerId,
      userId: partner.portalUserId,
      email: partner.portalUserEmail ?? partner.contactEmail,
      alreadyExists: true,
    };
  }

  const email = (input.email || partner.contactEmail).trim().toLowerCase();
  if (!email) return failure("validation_error", "A valid email is required.");

  let authUser = await database.query.user.findFirst({
    where: eq(user.email, email),
  });
  let tempPassword: string | undefined;

  if (!authUser) {
    tempPassword = generateTempPassword();
    const result = await auth.api.signUpEmail({
      body: {
        email,
        password: tempPassword,
        name: partner.name || email,
      },
      returnHeaders: true,
    });
    authUser = {
      id: result.response.user.id,
      email: result.response.user.email,
      name: result.response.user.name,
      emailVerified: result.response.user.emailVerified,
      image: result.response.user.image ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  if (!authUser) {
    return failure("not_found", "Partner portal user could not be created.");
  }

  await database
    .insert(userProfiles)
    .values({
      userId: authUser.id,
      role: "PARTNER",
      partnerId: input.partnerId,
      firstName: partner.name,
      subscriptionStatus: "INACTIVE",
    })
    .onConflictDoUpdate({
      target: userProfiles.userId,
      set: {
        role: "PARTNER",
        partnerId: input.partnerId,
        updatedAt: new Date(),
      },
    });

  await database
    .update(partners)
    .set({
      portalUserId: authUser.id,
      portalUserEmail: email,
      updatedAt: new Date(),
    })
    .where(eq(partners.id, input.partnerId));

  return {
    state: "success" as const,
    message: "Partner portal access created.",
    partnerId: input.partnerId,
    userId: authUser.id,
    email,
    tempPassword,
    alreadyExists: false,
  };
}

async function eligibleBookingRows(
  input: {
    userId?: string;
    partnerId: string;
    statuses: Array<"CONFIRMED" | "USED">;
  },
  database: Db,
) {
  const conditions = [
    eq(bookings.partnerId, input.partnerId),
    inArray(bookings.status, input.statuses),
  ];
  if (input.userId) conditions.push(eq(bookings.userId, input.userId));

  return database
    .select({
      booking: bookings,
      eventTime: events.dateTime,
    })
    .from(bookings)
    .innerJoin(events, eq(events.id, bookings.eventId))
    .where(and(...conditions))
    .orderBy(asc(events.dateTime));
}

export async function checkInBookingOperation(
  input: { bookingId: string; viewer: AuthenticatedViewer },
  database: Db = db,
): Promise<CheckInResult> {
  return database.transaction(async (tx) => {
    const [row] = await tx
      .select({ booking: bookings, eventTime: events.dateTime })
      .from(bookings)
      .innerJoin(events, eq(events.id, bookings.eventId))
      .where(eq(bookings.id, input.bookingId));
    if (!row) return failure("not_found", "Booking is not available.");

    if (
      input.viewer.role !== "ADMIN" &&
      !(
        input.viewer.role === "PARTNER" &&
        input.viewer.partnerId === row.booking.partnerId
      )
    ) {
      return failure(
        "unauthorized",
        "You do not have access to this resource.",
      );
    }
    if (row.booking.status === "USED") {
      return {
        state: "success",
        message: "Guest was already checked in.",
        bookingId: row.booking.id,
        partnerId: row.booking.partnerId,
        checkedInAt: row.booking.checkedInAt ?? undefined,
        alreadyCheckedIn: true,
      };
    }
    if (row.booking.status !== "CONFIRMED") {
      return failure(
        "no_eligible_booking",
        "Only confirmed bookings can be checked in.",
      );
    }
    if (!isWithinCheckInWindow(row.eventTime)) {
      return failure(
        "not_open",
        "Check-in is only available close to the event time.",
      );
    }

    const checkedInAt = new Date();
    const [updated] = await tx
      .update(bookings)
      .set({ status: "USED", checkedInAt, updatedAt: checkedInAt })
      .where(
        and(eq(bookings.id, row.booking.id), eq(bookings.status, "CONFIRMED")),
      )
      .returning({ id: bookings.id });
    if (!updated)
      return failure("already_used", "Guest was already checked in.");
    return {
      state: "success",
      message: "Guest checked in.",
      bookingId: row.booking.id,
      partnerId: row.booking.partnerId,
      checkedInAt,
      alreadyCheckedIn: false,
    };
  });
}

export async function checkInWithVenueQrOperation(
  input: { userId: string; partnerId: string; venueToken: string },
  database: Db = db,
): Promise<CheckInResult> {
  const partner = await database.query.partners.findFirst({
    where: eq(partners.id, input.partnerId),
  });
  if (
    !partner?.venueCheckInToken ||
    partner.venueCheckInToken !== input.venueToken
  ) {
    return failure("invalid_token", "Invalid venue QR token.");
  }

  const confirmedRows = await eligibleBookingRows(
    {
      userId: input.userId,
      partnerId: input.partnerId,
      statuses: ["CONFIRMED"],
    },
    database,
  );
  const now = new Date();
  const eligible = confirmedRows
    .filter((row) => isWithinCheckInWindow(row.eventTime, now))
    .sort(
      (left, right) =>
        Math.abs(left.eventTime.getTime() - now.getTime()) -
        Math.abs(right.eventTime.getTime() - now.getTime()),
    );

  if (!eligible.length) {
    const usedRows = await eligibleBookingRows(
      { userId: input.userId, partnerId: input.partnerId, statuses: ["USED"] },
      database,
    );
    const alreadyUsed = usedRows
      .filter((row) => isWithinCheckInWindow(row.eventTime, now))
      .sort(
        (left, right) =>
          Math.abs(left.eventTime.getTime() - now.getTime()) -
          Math.abs(right.eventTime.getTime() - now.getTime()),
      )[0];
    if (alreadyUsed) {
      return {
        state: "success",
        message: "Booking was already checked in.",
        bookingId: alreadyUsed.booking.id,
        partnerId: input.partnerId,
        checkedInAt: alreadyUsed.booking.checkedInAt ?? undefined,
        alreadyCheckedIn: true,
      };
    }
    return failure(
      "no_eligible_booking",
      "No booking is eligible for venue check-in right now.",
    );
  }

  const booking = eligible[0].booking;
  const checkedInAt = new Date();
  const [updated] = await database
    .update(bookings)
    .set({ status: "USED", checkedInAt, updatedAt: checkedInAt })
    .where(and(eq(bookings.id, booking.id), eq(bookings.status, "CONFIRMED")))
    .returning({ id: bookings.id });
  if (!updated)
    return failure("already_used", "Booking was already checked in.");

  return {
    state: "success",
    message: "Venue check-in complete.",
    bookingId: booking.id,
    partnerId: input.partnerId,
    checkedInAt,
    alreadyCheckedIn: false,
  };
}

export async function listAdminMembers(
  input?: { page?: number; pageSize?: number },
  database: Db = db,
) {
  const page = input?.page ?? 1;
  const pageSize = input?.pageSize ?? 20;
  const offset = (page - 1) * pageSize;

  const totalCountResult = await database
    .select({ count: count() })
    .from(userProfiles);
  const totalCount = totalCountResult[0]?.count ?? 0;

  const rows = await database
    .select({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: userProfiles.role,
      subscriptionStatus: userProfiles.subscriptionStatus,
      credits: userProfiles.credits,
      bookingCount: userProfiles.bookingCount,
      eventOpenCount: userProfiles.eventOpenCount,
      savedCount: userProfiles.savedCount,
      waitlistCount: userProfiles.waitlistCount,
      providerCustomerId: subscriptions.providerCustomerId,
      providerSubscriptionId: subscriptions.providerSubscriptionId,
      providerStatus: subscriptions.providerStatus,
      lastProviderSyncAt: subscriptions.lastProviderSyncAt,
      currentPeriodStart: subscriptions.currentPeriodStart,
      currentPeriodEnd: subscriptions.currentPeriodEnd,
    })
    .from(user)
    .innerJoin(userProfiles, eq(userProfiles.userId, user.id))
    .leftJoin(subscriptions, eq(subscriptions.userId, user.id))
    .orderBy(asc(user.name), asc(user.email))
    .limit(pageSize)
    .offset(offset);

  const members = rows.map((row) => ({
    ...row,
    billingOverrideActions:
      row.subscriptionStatus === "ADMIN_FROZEN" ||
      row.subscriptionStatus === "UNPAID"
        ? (["unfreeze"] as const)
        : (["freeze"] as const),
  }));

  return {
    members,
    totalCount,
    hasMore: offset + members.length < totalCount,
  };
}

export async function setMemberFreezeStatus(
  input: {
    userId: string;
    frozen: boolean;
    actorUserId: string;
    reason: string;
  },
  database: Db = db,
) {
  if (!input.reason.trim()) {
    return failure("validation_error", "A freeze reason is required.");
  }

  return database.transaction(async (tx) => {
    const profile = await tx.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, input.userId),
    });
    if (!profile) return failure("not_found", "Member is not available.");

    if (input.frozen) {
      await tx.insert(billingAdminOverrides).values({
        id: newId(),
        userId: input.userId,
        actorUserId: input.actorUserId,
        type: "FREEZE",
        reason: input.reason.trim(),
        active: true,
      });
    } else {
      await tx
        .update(billingAdminOverrides)
        .set({ active: false, clearedAt: new Date() })
        .where(
          and(
            eq(billingAdminOverrides.userId, input.userId),
            eq(billingAdminOverrides.active, true),
            isNull(billingAdminOverrides.clearedAt),
          ),
        );
      await tx.insert(billingAdminOverrides).values({
        id: newId(),
        userId: input.userId,
        actorUserId: input.actorUserId,
        type: "UNFREEZE",
        reason: input.reason.trim(),
        active: false,
        clearedAt: new Date(),
      });
    }

    const subscription = await tx.query.subscriptions.findFirst({
      where: eq(subscriptions.userId, input.userId),
    });
    const restoredStatus =
      subscription?.status === "ACTIVE" ? "ACTIVE" : profile.subscriptionStatus;

    const [updated] = await tx
      .update(userProfiles)
      .set({
        subscriptionStatus: input.frozen ? "ADMIN_FROZEN" : restoredStatus,
        updatedAt: new Date(),
      })
      .where(eq(userProfiles.userId, input.userId))
      .returning({
        userId: userProfiles.userId,
        subscriptionStatus: userProfiles.subscriptionStatus,
      });

    return {
      state: "success" as const,
      message: input.frozen ? "Member frozen." : "Member unfrozen.",
      ...updated,
    };
  });
}

export async function getPartnerGuestExportRows(
  partnerId: string,
  eventId?: string,
  database: Db = db,
): Promise<PartnerGuestExportRow[]> {
  const conditions = [eq(bookings.partnerId, partnerId)];
  if (eventId) {
    conditions.push(eq(bookings.eventId, eventId));
  }

  return database
    .select({
      bookingId: bookings.id,
      userId: bookings.userId,
      event: events.title,
      code: bookings.redemptionInfo,
      status: bookings.status,
      tickets: bookings.ticketsCount,
      createdAt: bookings.createdAt,
    })
    .from(bookings)
    .innerJoin(events, eq(events.id, bookings.eventId))
    .where(and(...conditions))
    .orderBy(desc(bookings.createdAt));
}

export async function getAdminExportRows(
  partnerId?: string,
  page?: number,
  pageSize?: number,
  database: Db = db,
): Promise<AdminExportRow[]> {
  const conditions = [];
  if (partnerId) {
    conditions.push(eq(bookings.partnerId, partnerId));
  }

  const query = database
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
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(bookings.createdAt));

  if (page && pageSize) {
    const offset = (page - 1) * pageSize;
    query.limit(pageSize).offset(offset);
  }

  return query;
}

export async function getPartnerGuestRows(
  partnerId: string,
  database: Db = db,
) {
  return database
    .select({
      bookingId: bookings.id,
      userId: bookings.userId,
      eventTitle: events.title,
      eventDateTime: events.dateTime,
      code: bookings.redemptionInfo,
      status: bookings.status,
      tickets: bookings.ticketsCount,
      createdAt: bookings.createdAt,
      checkedInAt: bookings.checkedInAt,
    })
    .from(bookings)
    .innerJoin(events, eq(events.id, bookings.eventId))
    .where(eq(bookings.partnerId, partnerId))
    .orderBy(desc(events.dateTime));
}

export { isFailure as isOperationFailure };
