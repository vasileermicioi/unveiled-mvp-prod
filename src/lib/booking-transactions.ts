import { and, eq, gte, sql } from "drizzle-orm";

import { type Db, db } from "@/db/client";
import {
  bookingIdempotencyRecords,
  bookings,
  creditLedgerEntries,
  events,
  userProfiles,
  waitlistEntries,
} from "@/db/schema";
import { isBookingAvailableForStatus } from "@/lib/payments/subscriptions";

export type BookingFailureState =
  | "sold_out"
  | "insufficient_credits"
  | "inactive_subscription"
  | "duplicate_idempotency_key"
  | "invalid_event"
  | "invalid_quantity"
  | "unsupported_redemption_setup"
  | "unauthorized"
  | "invalid_adjustment";

export type RedemptionResult = {
  type: "SECRET_CODE" | "VOUCHER";
  code: string;
  url?: string;
};

export type ConfirmedBookingResult = {
  state: "confirmed";
  bookingId: string;
  eventId: string;
  userId: string;
  ticketQuantity: number;
  totalCredits: number;
  redemption: RedemptionResult;
  idempotencyKey?: string;
};

export type WaitlistBookingResult = {
  state: "waitlist";
  waitlistEntryId: string;
  eventId: string;
  userId: string;
  ticketQuantity: number;
  status: "WAITING" | "PROMOTED" | "CANCELLED";
};

export type BookingFailureResult = {
  state: BookingFailureState;
  message: string;
  creditBalance?: number;
  requiredCredits?: number;
  waitlistAvailable?: boolean;
};

export type BookingTransactionResult =
  | ConfirmedBookingResult
  | WaitlistBookingResult
  | BookingFailureResult;

export type CreditAdjustmentResult =
  | {
      state: "adjusted";
      userId: string;
      amount: number;
      balanceAfter: number;
      ledgerEntryId: string;
    }
  | BookingFailureResult;

export type BookMemberEventInput = {
  userId: string;
  eventId: string;
  ticketQuantity: number;
  idempotencyKey: string;
};

export type JoinWaitlistInput = {
  userId: string;
  eventId: string;
  ticketQuantity?: number;
};

export type CreateAdminTicketInput = {
  adminUserId: string;
  userId: string;
  eventId: string;
  ticketQuantity: number;
  consumeCapacity?: boolean;
  debitCredits?: boolean;
  idempotencyKey?: string;
};

export type AdjustUserCreditsInput = {
  adminUserId: string;
  userId: string;
  amount: number;
  reason: string;
  idempotencyKey?: string;
};

function newId() {
  return crypto.randomUUID();
}

function failure(
  state: BookingFailureState,
  message: string,
  extra: Omit<BookingFailureResult, "state" | "message"> = {},
): BookingFailureResult {
  return { state, message, ...extra };
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableJson).join(",")}]`;
  }

  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, child]) => `${JSON.stringify(key)}:${stableJson(child)}`)
      .join(",")}}`;
  }

  return JSON.stringify(value);
}

export function bookingRequestFingerprint(input: {
  eventId: string;
  ticketQuantity: number;
}) {
  return stableJson({
    eventId: input.eventId,
    ticketQuantity: input.ticketQuantity,
  });
}

function generatedSharedCode(eventId: string) {
  return `UNV-${eventId
    .replace(/[^a-z0-9]/gi, "")
    .slice(0, 8)
    .toUpperCase()}`;
}

function generatedUniqueCode(bookingId: string) {
  return `UNV-${bookingId
    .replace(/[^a-z0-9]/gi, "")
    .slice(0, 10)
    .toUpperCase()}`;
}

export function resolveRedemption(
  event: Pick<
    typeof events.$inferSelect,
    | "id"
    | "ticketType"
    | "secretCodeMode"
    | "secretCode"
    | "promoCode"
    | "eventWebsiteUrl"
  >,
  bookingId: string,
): RedemptionResult | BookingFailureResult {
  if (event.ticketType === "VOUCHER") {
    if (!event.promoCode?.trim()) {
      return failure(
        "unsupported_redemption_setup",
        "Voucher code is not configured for this event.",
      );
    }

    return {
      type: "VOUCHER",
      code: event.promoCode.trim(),
      url: event.eventWebsiteUrl?.trim() || undefined,
    };
  }

  const mode = event.secretCodeMode ?? "MANUAL";
  if (mode === "MANUAL") {
    if (!event.secretCode?.trim()) {
      return failure(
        "unsupported_redemption_setup",
        "Secret code is not configured for this event.",
      );
    }
    return { type: "SECRET_CODE", code: event.secretCode.trim() };
  }

  if (mode === "SHARED_GENERATED") {
    return {
      type: "SECRET_CODE",
      code: event.secretCode?.trim() || generatedSharedCode(event.id),
    };
  }

  return { type: "SECRET_CODE", code: generatedUniqueCode(bookingId) };
}

function asStoredResult(result: ConfirmedBookingResult) {
  return result as unknown as Record<string, unknown>;
}

function isStoredConfirmedResult(
  result: Record<string, unknown> | null | undefined,
): result is ConfirmedBookingResult & Record<string, unknown> {
  return result?.state === "confirmed" && typeof result.bookingId === "string";
}

async function lockUserAndEvent(
  tx: Parameters<Parameters<Db["transaction"]>[0]>[0],
  input: { userId: string; eventId: string },
) {
  await tx.execute(
    sql`select user_id from ${userProfiles} where user_id = ${input.userId} for update`,
  );
  await tx.execute(
    sql`select id from ${events} where id = ${input.eventId} for update`,
  );
}

export async function bookMemberEvent(
  input: BookMemberEventInput,
  database: Db = db,
): Promise<BookingTransactionResult> {
  if (!input.idempotencyKey.trim()) {
    return failure("duplicate_idempotency_key", "Idempotency key is required.");
  }
  if (input.ticketQuantity < 1 || input.ticketQuantity > 3) {
    return failure(
      "invalid_quantity",
      "Ticket quantity must be between 1 and 3.",
    );
  }

  const fingerprint = bookingRequestFingerprint(input);

  return database.transaction(async (tx) => {
    const [insertedIdempotency] = await tx
      .insert(bookingIdempotencyRecords)
      .values({
        id: newId(),
        userId: input.userId,
        idempotencyKey: input.idempotencyKey,
        requestFingerprint: fingerprint,
      })
      .onConflictDoNothing()
      .returning();

    if (!insertedIdempotency) {
      const existing = await tx.query.bookingIdempotencyRecords.findFirst({
        where: and(
          eq(bookingIdempotencyRecords.userId, input.userId),
          eq(bookingIdempotencyRecords.idempotencyKey, input.idempotencyKey),
        ),
      });

      if (!existing || existing.requestFingerprint !== fingerprint) {
        return failure(
          "duplicate_idempotency_key",
          "Idempotency key was already used for different booking parameters.",
        );
      }

      if (isStoredConfirmedResult(existing.result)) {
        return existing.result;
      }

      return failure(
        "duplicate_idempotency_key",
        "Idempotency key is already being processed.",
      );
    }

    await lockUserAndEvent(tx, input);

    const [profile, event] = await Promise.all([
      tx.query.userProfiles.findFirst({
        where: eq(userProfiles.userId, input.userId),
      }),
      tx.query.events.findFirst({ where: eq(events.id, input.eventId) }),
    ]);

    if (!profile) {
      return failure("unauthorized", "Member profile is not available.");
    }
    if (!isBookingAvailableForStatus(profile.subscriptionStatus)) {
      return failure(
        "inactive_subscription",
        "Your credits are frozen. Update billing to book again.",
      );
    }
    if (!event) {
      return failure("invalid_event", "Event is not available.");
    }
    if (event.remainingCapacity < input.ticketQuantity) {
      return failure("sold_out", "This event is sold out.", {
        waitlistAvailable: true,
      });
    }

    const totalCredits = event.creditPrice * input.ticketQuantity;
    if (profile.credits < totalCredits) {
      return failure("insufficient_credits", "Not enough credits.", {
        creditBalance: profile.credits,
        requiredCredits: totalCredits,
      });
    }

    const bookingId = newId();
    const redemption = resolveRedemption(event, bookingId);
    if ("state" in redemption) return redemption;

    const [capacityUpdate] = await tx
      .update(events)
      .set({
        remainingCapacity: sql`${events.remainingCapacity} - ${input.ticketQuantity}`,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(events.id, input.eventId),
          gte(events.remainingCapacity, input.ticketQuantity),
        ),
      )
      .returning({ id: events.id });

    if (!capacityUpdate) {
      return failure("sold_out", "This event is sold out.", {
        waitlistAvailable: true,
      });
    }

    const nextCredits = profile.credits - totalCredits;
    await tx
      .update(userProfiles)
      .set({
        credits: nextCredits,
        bookingCount: sql`${userProfiles.bookingCount} + 1`,
        lastBookedEventId: event.id,
        updatedAt: new Date(),
      })
      .where(eq(userProfiles.userId, input.userId));

    await tx.insert(bookings).values({
      id: bookingId,
      userId: input.userId,
      eventId: event.id,
      partnerId: event.partnerId,
      ticketsCount: input.ticketQuantity,
      totalCredits,
      status: "CONFIRMED",
      redemptionType: redemption.type,
      redemptionInfo: redemption.code,
      redemptionUrl: redemption.url ?? null,
      idempotencyKey: input.idempotencyKey,
    });

    await tx.insert(creditLedgerEntries).values({
      id: `book_${bookingId}`,
      userId: input.userId,
      amount: -totalCredits,
      balanceAfter: nextCredits,
      type: "BOOKING",
      description: `Booked ${event.title}`,
      idempotencyKey: `book_${input.idempotencyKey}`,
      relatedBookingId: bookingId,
      relatedEventId: event.id,
    });

    const result: ConfirmedBookingResult = {
      state: "confirmed",
      bookingId,
      eventId: event.id,
      userId: input.userId,
      ticketQuantity: input.ticketQuantity,
      totalCredits,
      redemption,
      idempotencyKey: input.idempotencyKey,
    };

    await tx
      .update(bookingIdempotencyRecords)
      .set({
        bookingId,
        result: asStoredResult(result),
        updatedAt: new Date(),
      })
      .where(eq(bookingIdempotencyRecords.id, insertedIdempotency.id));

    return result;
  });
}

export async function joinEventWaitlist(
  input: JoinWaitlistInput,
  database: Db = db,
): Promise<BookingTransactionResult> {
  const ticketQuantity = input.ticketQuantity ?? 1;
  if (ticketQuantity < 1 || ticketQuantity > 3) {
    return failure(
      "invalid_quantity",
      "Ticket quantity must be between 1 and 3.",
    );
  }

  return database.transaction(async (tx) => {
    await lockUserAndEvent(tx, input);
    const [profile, event] = await Promise.all([
      tx.query.userProfiles.findFirst({
        where: eq(userProfiles.userId, input.userId),
      }),
      tx.query.events.findFirst({ where: eq(events.id, input.eventId) }),
    ]);

    if (!profile)
      return failure("unauthorized", "Member profile is not available.");
    if (!isBookingAvailableForStatus(profile.subscriptionStatus)) {
      return failure(
        "inactive_subscription",
        "Your credits are frozen. Update billing to join the waitlist.",
      );
    }
    if (!event) return failure("invalid_event", "Event is not available.");

    const [inserted] = await tx
      .insert(waitlistEntries)
      .values({
        id: newId(),
        eventId: event.id,
        userId: input.userId,
        requestedQty: ticketQuantity,
      })
      .onConflictDoNothing()
      .returning();

    const entry =
      inserted ??
      (await tx.query.waitlistEntries.findFirst({
        where: and(
          eq(waitlistEntries.eventId, event.id),
          eq(waitlistEntries.userId, input.userId),
        ),
      }));

    if (!entry) {
      return failure("invalid_event", "Waitlist entry could not be created.");
    }

    if (inserted) {
      await tx
        .update(userProfiles)
        .set({
          waitlistCount: sql`${userProfiles.waitlistCount} + 1`,
          lastWaitlistedEventId: event.id,
          updatedAt: new Date(),
        })
        .where(eq(userProfiles.userId, input.userId));
    }

    return {
      state: "waitlist",
      waitlistEntryId: entry.id,
      eventId: event.id,
      userId: input.userId,
      ticketQuantity: entry.requestedQty,
      status: entry.status,
    };
  });
}

export async function createAdminTicket(
  input: CreateAdminTicketInput,
  database: Db = db,
): Promise<BookingTransactionResult> {
  if (input.ticketQuantity < 1 || input.ticketQuantity > 3) {
    return failure(
      "invalid_quantity",
      "Ticket quantity must be between 1 and 3.",
    );
  }

  return database.transaction(async (tx) => {
    await lockUserAndEvent(tx, input);
    const [profile, event] = await Promise.all([
      tx.query.userProfiles.findFirst({
        where: eq(userProfiles.userId, input.userId),
      }),
      tx.query.events.findFirst({ where: eq(events.id, input.eventId) }),
    ]);

    if (!profile)
      return failure("invalid_event", "Member profile is not available.");
    if (!event) return failure("invalid_event", "Event is not available.");
    if (
      input.consumeCapacity !== false &&
      event.remainingCapacity < input.ticketQuantity
    ) {
      return failure("sold_out", "This event is sold out.");
    }

    const totalCredits = input.debitCredits
      ? event.creditPrice * input.ticketQuantity
      : 0;
    if (input.debitCredits && profile.credits < totalCredits) {
      return failure("insufficient_credits", "Not enough credits.", {
        creditBalance: profile.credits,
        requiredCredits: totalCredits,
      });
    }

    const bookingId = newId();
    const redemption = resolveRedemption(event, bookingId);
    if ("state" in redemption) return redemption;

    if (input.consumeCapacity !== false) {
      const [capacityUpdate] = await tx
        .update(events)
        .set({
          remainingCapacity: sql`${events.remainingCapacity} - ${input.ticketQuantity}`,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(events.id, input.eventId),
            gte(events.remainingCapacity, input.ticketQuantity),
          ),
        )
        .returning({ id: events.id });

      if (!capacityUpdate)
        return failure("sold_out", "This event is sold out.");
    }

    const nextCredits = profile.credits - totalCredits;
    if (input.debitCredits) {
      await tx
        .update(userProfiles)
        .set({
          credits: nextCredits,
          bookingCount: sql`${userProfiles.bookingCount} + 1`,
          lastBookedEventId: event.id,
          updatedAt: new Date(),
        })
        .where(eq(userProfiles.userId, input.userId));
    } else {
      await tx
        .update(userProfiles)
        .set({
          bookingCount: sql`${userProfiles.bookingCount} + 1`,
          lastBookedEventId: event.id,
          updatedAt: new Date(),
        })
        .where(eq(userProfiles.userId, input.userId));
    }

    await tx.insert(bookings).values({
      id: bookingId,
      userId: input.userId,
      eventId: event.id,
      partnerId: event.partnerId,
      ticketsCount: input.ticketQuantity,
      totalCredits,
      status: "CONFIRMED",
      redemptionType: redemption.type,
      redemptionInfo: redemption.code,
      redemptionUrl: redemption.url ?? null,
      idempotencyKey: input.idempotencyKey ?? null,
      adminActorId: input.adminUserId,
    });

    if (input.debitCredits) {
      await tx.insert(creditLedgerEntries).values({
        id: `admin_ticket_${bookingId}`,
        userId: input.userId,
        amount: -totalCredits,
        balanceAfter: nextCredits,
        type: "BOOKING",
        description: `Admin ticket for ${event.title}`,
        idempotencyKey: input.idempotencyKey
          ? `admin_ticket_${input.idempotencyKey}`
          : `admin_ticket_${bookingId}`,
        relatedBookingId: bookingId,
        relatedEventId: event.id,
        actorUserId: input.adminUserId,
      });
    }

    return {
      state: "confirmed",
      bookingId,
      eventId: event.id,
      userId: input.userId,
      ticketQuantity: input.ticketQuantity,
      totalCredits,
      redemption,
      idempotencyKey: input.idempotencyKey,
    };
  });
}

export async function adjustUserCredits(
  input: AdjustUserCreditsInput,
  database: Db = db,
): Promise<CreditAdjustmentResult> {
  if (!input.reason.trim() || input.amount === 0) {
    return failure(
      "invalid_adjustment",
      "Credit adjustment requires a non-zero amount and reason.",
    );
  }

  return database.transaction(async (tx) => {
    await tx.execute(
      sql`select user_id from ${userProfiles} where user_id = ${input.userId} for update`,
    );

    const profile = await tx.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, input.userId),
    });
    if (!profile)
      return failure("invalid_event", "Member profile is not available.");

    const balanceAfter = profile.credits + input.amount;
    if (balanceAfter < 0) {
      return failure(
        "invalid_adjustment",
        "Credit balance cannot become negative.",
      );
    }

    await tx
      .update(userProfiles)
      .set({
        credits: balanceAfter,
        updatedAt: new Date(),
      })
      .where(eq(userProfiles.userId, input.userId));

    const ledgerEntryId = newId();
    await tx.insert(creditLedgerEntries).values({
      id: ledgerEntryId,
      userId: input.userId,
      amount: input.amount,
      balanceAfter,
      type: "ADMIN_ADJUST",
      description: input.reason.trim(),
      idempotencyKey: input.idempotencyKey ?? ledgerEntryId,
      actorUserId: input.adminUserId,
    });

    return {
      state: "adjusted",
      userId: input.userId,
      amount: input.amount,
      balanceAfter,
      ledgerEntryId,
    };
  });
}

export function bookingFailureMessage(state: BookingFailureState) {
  const messages: Record<BookingFailureState, string> = {
    sold_out: "This event is sold out.",
    insufficient_credits: "You do not have enough credits for this booking.",
    inactive_subscription: "An active membership is required.",
    duplicate_idempotency_key: "This booking request was already used.",
    invalid_event: "The requested event is not available.",
    invalid_quantity: "Select between 1 and 3 tickets.",
    unsupported_redemption_setup: "This event is missing redemption setup.",
    unauthorized: "You do not have access to this action.",
    invalid_adjustment: "The credit adjustment is invalid.",
  };

  return messages[state];
}

export function isBookingFailure(
  result: BookingTransactionResult | CreditAdjustmentResult,
): result is BookingFailureResult {
  return [
    "sold_out",
    "insufficient_credits",
    "inactive_subscription",
    "duplicate_idempotency_key",
    "invalid_event",
    "invalid_quantity",
    "unsupported_redemption_setup",
    "unauthorized",
    "invalid_adjustment",
  ].includes(result.state);
}
