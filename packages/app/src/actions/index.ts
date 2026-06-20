import { type ActionAPIContext, defineAction } from "astro:actions";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "~/db/client";
import { creditLedgerEntries, savedEvents, userProfiles } from "~/db/schema";
import {
  checkInBookingOperation,
  checkInWithVenueQrOperation,
  deleteAdminEvent,
  deleteAdminPartner,
  getAdminExportRows,
  getPartnerGuestExportRows,
  isOperationFailure,
  listAdminMembers,
  provisionPartnerPortalAccess,
  rotatePartnerVenueToken,
  saveAdminEvent,
  saveAdminPartner,
  setMemberFreezeStatus,
} from "~/lib/admin-operations";
import {
  type AuthActionResult,
  headersWithSetCookieAsCookie,
  loginWithEmail,
  logout,
  requestPasswordRecovery,
  signUpWithEmail,
} from "~/lib/auth-account-actions";
import {
  AuthAccessError,
  getViewer,
  requireAdmin,
  requireMember,
  requireUser,
  getAuthRedirectPath as resolveRedirectPath,
} from "~/lib/auth-profile";
import {
  trackEventOpenInDb,
  trackFilterApplyInDb,
} from "~/lib/behavior-tracking";
import {
  adjustUserCredits,
  type BookingTransactionResult,
  bookingFailureMessage,
  bookMemberEvent,
  type CreditAdjustmentResult,
  createAdminTicket,
  isBookingFailure,
  joinEventWaitlist,
} from "~/lib/booking-transactions";
import {
  invalidationHintsForScopes,
  toQueryKeys,
} from "~/lib/data-access/invalidation";
import {
  actionSuccess,
  type FormActionResult,
  formFailure,
  parseFormInput,
  translateMessage,
} from "~/lib/forms/action-result";
import { queryKeys } from "~/lib/forms/query-keys";
import {
  adminTicketSchema,
  bookingActionSchema,
  checkInSchema,
  creditAdjustmentSchema,
  deletePartnerSchema,
  eventFormSchema,
  loginSchema,
  memberAdminSchema,
  membershipSchema,
  onboardingSchema,
  partnerFormSchema,
  partnerPortalAccessSchema,
  partnerTokenSchema,
  passwordRecoverySchema,
  preferenceSchema,
  profileSchema,
  savedEventActionSchema,
  signupSchema,
  trackEventOpenSchema,
  trackFilterApplySchema,
  venueQrCheckInSchema,
  waitlistActionSchema,
} from "~/lib/forms/schemas";
import { copyFor, normalizeLanguage } from "~/lib/i18n";
import { logger } from "~/lib/logger";
import { initializeBasicBerlinCheckout } from "~/lib/payments/subscriptions";

const jsonInputSchema = z.record(z.string(), z.unknown());

type ActionContext = ActionAPIContext;

function getRequestLang(context: ActionContext) {
  return normalizeLanguage(context.cookies.get("unveiled_lang")?.value);
}

function parseInput<TSchema extends z.ZodType>(
  schema: TSchema,
  input: unknown,
  context: ActionContext,
) {
  const lang = getRequestLang(context);
  return parseFormInput(schema, input, lang);
}

function newId() {
  return crypto.randomUUID();
}

function safeActionError(
  error: unknown,
  lang: import("~/lib/i18n").UiLanguage = "EN",
) {
  if (
    error instanceof AuthAccessError ||
    (error &&
      typeof error === "object" &&
      "name" in error &&
      error.name === "AuthAccessError")
  ) {
    return formFailure((error as any).message, lang);
  }
  logger.error("action_unexpected_error", { err: error });
  return formFailure("The request could not be completed.", lang);
}

function dataAccessInvalidationKeys(
  scopes: Parameters<typeof invalidationHintsForScopes>[0],
) {
  return toQueryKeys(invalidationHintsForScopes(scopes));
}

function bookingResultToAction(
  result: BookingTransactionResult,
  lang: import("~/lib/i18n").UiLanguage = "EN",
): FormActionResult<BookingTransactionResult> {
  if (isBookingFailure(result)) {
    return formFailure(
      result.message || bookingFailureMessage(result.state),
      lang,
    );
  }

  return actionSuccess({
    data: result,
    notice: {
      type: "success",
      message:
        result.state === "confirmed"
          ? copyFor(lang).action.bookingConfirmed
          : copyFor(lang).action.waitlistJoined,
    },
    invalidate: [
      queryKeys.bookings,
      queryKeys.event(result.eventId),
      queryKeys.events,
      queryKeys.authViewer,
      result.state === "waitlist" ? queryKeys.waitlist : queryKeys.ledger(),
      ...dataAccessInvalidationKeys([
        { type: "public-discovery" },
        { type: "event", eventId: result.eventId },
        { type: "member-bookings", userId: result.userId },
      ]),
    ],
  });
}

function creditAdjustmentResultToAction(
  result: CreditAdjustmentResult,
  lang: import("~/lib/i18n").UiLanguage = "EN",
): FormActionResult<CreditAdjustmentResult> {
  if (isBookingFailure(result)) {
    return formFailure(
      result.message || bookingFailureMessage(result.state),
      lang,
    );
  }

  return actionSuccess({
    data: result,
    notice: { type: "success", message: copyFor(lang).action.creditsAdjusted },
    invalidate: [
      queryKeys.adminMembers,
      queryKeys.profile(result.userId),
      queryKeys.ledger(result.userId),
      queryKeys.authViewer,
      ...dataAccessInvalidationKeys([
        { type: "member", userId: result.userId },
        { type: "admin-dashboard" },
        { type: "admin-members", userId: result.userId },
        { type: "booking-eligibility", userId: result.userId },
      ]),
    ],
  });
}

function applySetCookieHeaders(
  headers: Headers | undefined,
  context: ActionContext,
) {
  if (!headers) return;

  const getSetCookie = (headers as Headers & { getSetCookie?: () => string[] })
    .getSetCookie;
  const values = getSetCookie ? getSetCookie.call(headers) : [];
  const fallback = headers.get("set-cookie");
  const cookieHeaders = values.length ? values : fallback ? [fallback] : [];

  for (const cookieHeader of cookieHeaders) {
    const [nameValue] = cookieHeader.split(";");
    const separatorIndex = nameValue.indexOf("=");
    if (separatorIndex === -1) continue;
    const name = nameValue.slice(0, separatorIndex).trim();
    const value = nameValue.slice(separatorIndex + 1);
    if (name) context.cookies.set(name, value, { path: "/" });
  }
}

async function authResultToFormAction(
  result: AuthActionResult,
  context: ActionContext,
): Promise<FormActionResult<{ nextPath?: string; userId?: string }>> {
  applySetCookieHeaders(result.headers, context);

  const lang = getRequestLang(context);

  if (!result.ok) {
    return formFailure(
      result.state.message ?? "The request could not be completed.",
      lang,
    );
  }

  const viewer = await getViewer(
    result.headers
      ? headersWithSetCookieAsCookie(result.headers)
      : new Headers(),
  );
  const nextPath =
    viewer.kind === "authenticated"
      ? resolveRedirectPath(viewer, result.nextPath)
      : (result.nextPath ?? undefined);

  return actionSuccess({
    data: {
      nextPath,
      userId: result.userId,
    },
    notice: {
      type: "success",
      message: result.state.message
        ? translateMessage(result.state.message, lang)
        : translateMessage("Done.", lang),
    },
    invalidate: [queryKeys.authViewer],
  });
}

export const server = {
  signup: defineAction({
    accept: "json",
    input: jsonInputSchema,
    handler: async (input, context) => {
      const parsed = parseInput(signupSchema, input, context);
      if (!parsed.ok) return parsed;
      return authResultToFormAction(
        await signUpWithEmail(parsed.data),
        context,
      );
    },
  }),

  login: defineAction({
    accept: "json",
    input: jsonInputSchema,
    handler: async (input, context) => {
      const parsed = parseInput(loginSchema, input, context);
      if (!parsed.ok) return parsed;
      return authResultToFormAction(await loginWithEmail(parsed.data), context);
    },
  }),

  passwordRecovery: defineAction({
    accept: "json",
    input: jsonInputSchema,
    handler: async (input, context) => {
      const parsed = parseInput(passwordRecoverySchema, input, context);
      if (!parsed.ok) return parsed;
      return authResultToFormAction(
        await requestPasswordRecovery(parsed.data),
        context,
      );
    },
  }),

  logout: defineAction({
    accept: "json",
    input: jsonInputSchema,
    handler: async (_input, context) =>
      authResultToFormAction(await logout(context.request.headers), context),
  }),

  saveOnboarding: defineAction({
    accept: "json",
    input: jsonInputSchema,
    handler: async (input, context) => {
      const lang = getRequestLang(context);
      const parsed = parseInput(onboardingSchema, input, context);
      if (!parsed.ok) return parsed;

      try {
        const viewer = await requireMember(context.request.headers);
        await db
          .update(userProfiles)
          .set({
            ...parsed.data,
            preferencesUpdatedAt: new Date(),
            onboardingCompletedAt: parsed.data.onboardingComplete
              ? new Date()
              : null,
            updatedAt: new Date(),
          })
          .where(eq(userProfiles.userId, viewer.user.id));

        return actionSuccess({
          notice: {
            type: "success",
            message: copyFor(lang).action.preferencesSaved,
          },
          invalidate: [
            queryKeys.profile(viewer.user.id),
            queryKeys.preferences(viewer.user.id),
            queryKeys.authViewer,
            ...dataAccessInvalidationKeys([
              { type: "member", userId: viewer.user.id },
              { type: "member-preferences", userId: viewer.user.id },
              { type: "member-profile", userId: viewer.user.id },
            ]),
          ],
        });
      } catch (error) {
        return safeActionError(error, lang);
      }
    },
  }),

  setLanguage: defineAction({
    accept: "json",
    input: z.object({ language: z.enum(["DE", "EN"]) }),
    handler: async (input, context) => {
      const lang = getRequestLang(context);
      try {
        const viewer = await getViewer(context.request.headers);
        if (viewer.kind === "authenticated") {
          await db
            .update(userProfiles)
            .set({ language: input.language, updatedAt: new Date() })
            .where(eq(userProfiles.userId, viewer.user.id));
        } else {
          context.cookies.set("unveiled_lang", input.language, {
            path: "/",
            maxAge: 60 * 60 * 24 * 365,
          });
        }
      } catch (error) {
        return safeActionError(error, lang);
      }

      return actionSuccess({
        notice: {
          type: "success",
          message: copyFor(input.language).action.languageUpdated,
        },
        invalidate: [
          queryKeys.authViewer,
          ...dataAccessInvalidationKeys([{ type: "public-discovery" }]),
        ],
      });
    },
  }),

  savePreferences: defineAction({
    accept: "json",
    input: jsonInputSchema,
    handler: async (input, context) => {
      const lang = getRequestLang(context);
      const parsed = parseInput(preferenceSchema, input, context);
      if (!parsed.ok) return parsed;

      try {
        const viewer = await requireMember(context.request.headers);
        await db
          .update(userProfiles)
          .set({
            ...parsed.data,
            preferencesUpdatedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(userProfiles.userId, viewer.user.id));

        return actionSuccess({
          notice: {
            type: "success",
            message: copyFor(lang).action.preferencesSaved,
          },
          invalidate: [
            queryKeys.profile(viewer.user.id),
            queryKeys.preferences(viewer.user.id),
            ...dataAccessInvalidationKeys([
              { type: "member", userId: viewer.user.id },
              { type: "member-preferences", userId: viewer.user.id },
            ]),
          ],
        });
      } catch (error) {
        return safeActionError(error, lang);
      }
    },
  }),

  updateProfile: defineAction({
    accept: "json",
    input: jsonInputSchema,
    handler: async (input, context) => {
      const lang = getRequestLang(context);
      const parsed = parseInput(profileSchema, input, context);
      if (!parsed.ok) return parsed;

      try {
        const viewer = await requireMember(context.request.headers);
        await db
          .update(userProfiles)
          .set({
            firstName: parsed.data.firstName ?? null,
            lastName: parsed.data.lastName ?? null,
            language: parsed.data.language,
            billingAddress: parsed.data.billingAddress ?? null,
            newsletterOptIn: parsed.data.newsletterOptIn,
            updatedAt: new Date(),
          })
          .where(eq(userProfiles.userId, viewer.user.id));

        return actionSuccess({
          notice: {
            type: "success",
            message: copyFor(lang).action.profileSaved,
          },
          invalidate: [
            queryKeys.profile(viewer.user.id),
            queryKeys.authViewer,
            ...dataAccessInvalidationKeys([
              { type: "member-profile", userId: viewer.user.id },
            ]),
          ],
        });
      } catch (error) {
        return safeActionError(error, lang);
      }
    },
  }),

  saveMemberEvent: defineAction({
    accept: "json",
    input: jsonInputSchema,
    handler: async (input, context) => {
      const lang = getRequestLang(context);
      const parsed = parseInput(savedEventActionSchema, input, context);
      if (!parsed.ok) return parsed;

      try {
        const viewer = await requireMember(context.request.headers);
        const inserted = await db
          .insert(savedEvents)
          .values({
            userId: viewer.user.id,
            eventId: parsed.data.eventId,
          })
          .onConflictDoNothing()
          .returning({ eventId: savedEvents.eventId });

        if (inserted.length > 0) {
          await db
            .update(userProfiles)
            .set({
              savedCount: sql`${userProfiles.savedCount} + 1`,
              lastSavedEventId: parsed.data.eventId,
              updatedAt: new Date(),
            })
            .where(eq(userProfiles.userId, viewer.user.id));
        }

        return actionSuccess({
          notice: { type: "success", message: copyFor(lang).action.eventSaved },
          invalidate: [
            queryKeys.authViewer,
            queryKeys.events,
            queryKeys.event(parsed.data.eventId),
            ...dataAccessInvalidationKeys([
              { type: "public-discovery" },
              { type: "member", userId: viewer.user.id },
              { type: "event", eventId: parsed.data.eventId },
            ]),
          ],
        });
      } catch (error) {
        return safeActionError(error, lang);
      }
    },
  }),

  unsaveMemberEvent: defineAction({
    accept: "json",
    input: jsonInputSchema,
    handler: async (input, context) => {
      const lang = getRequestLang(context);
      const parsed = parseInput(savedEventActionSchema, input, context);
      if (!parsed.ok) return parsed;

      try {
        const viewer = await requireMember(context.request.headers);
        const deleted = await db
          .delete(savedEvents)
          .where(
            and(
              eq(savedEvents.userId, viewer.user.id),
              eq(savedEvents.eventId, parsed.data.eventId),
            ),
          )
          .returning({ eventId: savedEvents.eventId });

        if (deleted.length > 0) {
          await db
            .update(userProfiles)
            .set({
              unsavedCount: sql`${userProfiles.unsavedCount} + 1`,
              updatedAt: new Date(),
            })
            .where(eq(userProfiles.userId, viewer.user.id));
        }

        return actionSuccess({
          notice: {
            type: "success",
            message: copyFor(lang).action.eventRemoved,
          },
          invalidate: [
            queryKeys.authViewer,
            queryKeys.events,
            queryKeys.event(parsed.data.eventId),
            ...dataAccessInvalidationKeys([
              { type: "public-discovery" },
              { type: "member", userId: viewer.user.id },
              { type: "event", eventId: parsed.data.eventId },
            ]),
          ],
        });
      } catch (error) {
        return safeActionError(error, lang);
      }
    },
  }),

  updateMembership: defineAction({
    accept: "json",
    input: jsonInputSchema,
    handler: async (input, context) => {
      const lang = getRequestLang(context);
      const parsed = parseInput(membershipSchema, input, context);
      if (!parsed.ok) return parsed;

      try {
        const viewer = await requireMember(context.request.headers);
        const checkout = await initializeBasicBerlinCheckout({
          userId: viewer.user.id,
          email: viewer.user.email,
          name: viewer.user.name,
          promoCode: parsed.data.promoCode,
        });

        return actionSuccess({
          data: checkout,
          notice: {
            type: "success",
            message: copyFor(lang).action.membershipCheckoutStarted,
          },
          invalidate: [
            queryKeys.profile(viewer.user.id),
            queryKeys.authViewer,
            ...dataAccessInvalidationKeys([
              { type: "member-profile", userId: viewer.user.id },
            ]),
          ],
        });
      } catch (error) {
        return safeActionError(error);
      }
    },
  }),

  savePartner: defineAction({
    accept: "json",
    input: jsonInputSchema,
    handler: async (input, context) => {
      const lang = getRequestLang(context);
      const parsed = parseInput(partnerFormSchema, input, context);
      if (!parsed.ok) return parsed;

      try {
        await requireAdmin(context.request.headers);
        const result = await saveAdminPartner(parsed.data);
        if (isOperationFailure(result)) {
          return result.fieldErrors
            ? {
                ok: false,
                fieldErrors: result.fieldErrors,
                formError: translateMessage(result.message, lang),
              }
            : formFailure(result.message, lang);
        }

        return actionSuccess({
          data: { partnerId: result.partnerId },
          notice: {
            type: "success",
            message: translateMessage(result.message, lang),
          },
          invalidate: [
            queryKeys.partners,
            queryKeys.partner(result.partnerId),
            queryKeys.events,
            ...dataAccessInvalidationKeys([
              { type: "public-discovery" },
              { type: "partner", partnerId: result.partnerId },
              { type: "admin-dashboard" },
              { type: "admin-partners" },
              { type: "admin-events" },
              { type: "admin-exports" },
            ]),
          ],
        });
      } catch (error) {
        return safeActionError(error, lang);
      }
    },
  }),

  saveEvent: defineAction({
    accept: "json",
    input: jsonInputSchema,
    handler: async (input, context) => {
      const lang = getRequestLang(context);
      const parsed = parseInput(eventFormSchema, input, context);
      if (!parsed.ok) return parsed;

      try {
        await requireAdmin(context.request.headers);
        const result = await saveAdminEvent(parsed.data);
        if (isOperationFailure(result)) {
          return result.fieldErrors
            ? {
                ok: false,
                fieldErrors: result.fieldErrors,
                formError: translateMessage(result.message, lang),
              }
            : formFailure(result.message, lang);
        }

        return actionSuccess({
          data: { eventId: result.eventIds[0], eventIds: result.eventIds },
          notice: {
            type: "success",
            message: translateMessage(result.message, lang),
          },
          invalidate: [
            queryKeys.events,
            ...result.eventIds.map((eventId) => queryKeys.event(eventId)),
            queryKeys.partners,
            ...dataAccessInvalidationKeys([
              { type: "public-discovery" },
              { type: "admin-dashboard" },
              { type: "admin-events" },
              { type: "admin-exports" },
            ]),
          ],
        });
      } catch (error) {
        return safeActionError(error, lang);
      }
    },
  }),

  deleteEvent: defineAction({
    accept: "json",
    input: jsonInputSchema,
    handler: async (input, context) => {
      const lang = getRequestLang(context);
      const parsed = parseInput(
        z.object({ eventId: z.string().trim().min(1) }),
        input,
        context,
      );
      if (!parsed.ok) return parsed;

      try {
        await requireAdmin(context.request.headers);
        const result = await deleteAdminEvent(parsed.data.eventId);
        if (isOperationFailure(result))
          return formFailure(result.message, lang);
        return actionSuccess({
          data: { eventId: result.eventId },
          notice: {
            type: "success",
            message: translateMessage(result.message, lang),
          },
          invalidate: [
            queryKeys.events,
            queryKeys.event(result.eventId),
            ...dataAccessInvalidationKeys([
              { type: "public-discovery" },
              { type: "event", eventId: result.eventId },
              { type: "admin-dashboard" },
              { type: "admin-events" },
              { type: "admin-exports" },
            ]),
          ],
        });
      } catch (error) {
        return safeActionError(error, lang);
      }
    },
  }),

  rotatePartnerVenueToken: defineAction({
    accept: "json",
    input: jsonInputSchema,
    handler: async (input, context) => {
      const lang = getRequestLang(context);
      const parsed = parseInput(partnerTokenSchema, input, context);
      if (!parsed.ok) return parsed;

      try {
        await requireAdmin(context.request.headers);
        const result = await rotatePartnerVenueToken(parsed.data.partnerId);
        if (isOperationFailure(result))
          return formFailure(result.message, lang);
        return actionSuccess({
          data: result,
          notice: {
            type: "success",
            message: translateMessage(result.message, lang),
          },
          invalidate: [
            queryKeys.partners,
            queryKeys.partner(parsed.data.partnerId),
            ...dataAccessInvalidationKeys([
              { type: "partner", partnerId: parsed.data.partnerId },
              { type: "admin-partners" },
              { type: "admin-exports" },
            ]),
          ],
        });
      } catch (error) {
        return safeActionError(error, lang);
      }
    },
  }),

  createPartnerPortalAccess: defineAction({
    accept: "json",
    input: jsonInputSchema,
    handler: async (input, context) => {
      const lang = getRequestLang(context);
      const parsed = parseInput(partnerPortalAccessSchema, input, context);
      if (!parsed.ok) return parsed;

      try {
        await requireAdmin(context.request.headers);
        const result = await provisionPartnerPortalAccess(parsed.data);
        if (isOperationFailure(result))
          return formFailure(result.message, lang);
        return actionSuccess({
          data: result,
          notice: {
            type: "success",
            message: translateMessage(result.message, lang),
          },
          invalidate: [
            queryKeys.partners,
            queryKeys.partner(parsed.data.partnerId),
            queryKeys.authViewer,
            ...dataAccessInvalidationKeys([
              { type: "partner", partnerId: parsed.data.partnerId },
              { type: "admin-partners" },
            ]),
          ],
        });
      } catch (error) {
        return safeActionError(error, lang);
      }
    },
  }),

  deletePartner: defineAction({
    accept: "json",
    input: jsonInputSchema,
    handler: async (input, context) => {
      const lang = getRequestLang(context);
      const parsed = parseInput(deletePartnerSchema, input, context);
      if (!parsed.ok) return parsed;

      try {
        await requireAdmin(context.request.headers);
        const result = await deleteAdminPartner(parsed.data.partnerId);
        if (isOperationFailure(result))
          return formFailure(result.message, lang);
        return actionSuccess({
          data: { partnerId: result.partnerId },
          notice: {
            type: "success",
            message: translateMessage(result.message, lang),
          },
          invalidate: [
            queryKeys.partners,
            queryKeys.partner(parsed.data.partnerId),
            queryKeys.events,
            ...dataAccessInvalidationKeys([
              { type: "public-discovery" },
              { type: "partner", partnerId: result.partnerId },
              { type: "admin-dashboard" },
              { type: "admin-partners" },
              { type: "admin-events" },
              { type: "admin-exports" },
            ]),
          ],
        });
      } catch (error) {
        return safeActionError(error, lang);
      }
    },
  }),

  listUsers: defineAction({
    accept: "json",
    input: z.object({
      page: z.number().int().positive().optional(),
      pageSize: z.number().int().positive().optional(),
    }),
    handler: async (input, context) => {
      const lang = getRequestLang(context);
      try {
        await requireAdmin(context.request.headers);
        const { members, totalCount, hasMore } = await listAdminMembers({
          page: input.page,
          pageSize: input.pageSize,
        });
        return actionSuccess({
          data: { members, totalCount, hasMore },
          invalidate: [
            queryKeys.adminMembers,
            ...dataAccessInvalidationKeys([{ type: "admin-members" }]),
          ],
        });
      } catch (error) {
        return safeActionError(error, lang);
      }
    },
  }),

  updateMember: defineAction({
    accept: "json",
    input: jsonInputSchema,
    handler: async (input, context) => {
      const lang = getRequestLang(context);
      const parsed = parseInput(memberAdminSchema, input, context);
      if (!parsed.ok) return parsed;

      try {
        await requireAdmin(context.request.headers);

        const [updated] = await db
          .update(userProfiles)
          .set({
            role: parsed.data.role,
            subscriptionStatus: parsed.data.subscriptionStatus,
            credits:
              parsed.data.creditAdjustment === 0
                ? undefined
                : sql`${userProfiles.credits} + ${parsed.data.creditAdjustment}`,
            updatedAt: new Date(),
          })
          .where(eq(userProfiles.userId, parsed.data.userId))
          .returning({
            userId: userProfiles.userId,
            credits: userProfiles.credits,
          });

        if (!updated)
          return formFailure("The requested item is not available.", lang);

        if (parsed.data.creditAdjustment !== 0) {
          await db.insert(creditLedgerEntries).values({
            id: newId(),
            userId: parsed.data.userId,
            amount: parsed.data.creditAdjustment,
            balanceAfter: updated.credits,
            type: "ADMIN_ADJUST",
            description: parsed.data.reason || "Admin credit adjustment",
            idempotencyKey: newId(),
          });
        }

        return actionSuccess({
          notice: {
            type: "success",
            message: copyFor(lang).action.memberUpdated,
          },
          invalidate: [
            queryKeys.adminMembers,
            queryKeys.profile(parsed.data.userId),
            queryKeys.authViewer,
            ...dataAccessInvalidationKeys([
              { type: "member", userId: parsed.data.userId },
              { type: "admin-dashboard" },
              { type: "admin-members", userId: parsed.data.userId },
              { type: "booking-eligibility", userId: parsed.data.userId },
            ]),
          ],
        });
      } catch (error) {
        return safeActionError(error, lang);
      }
    },
  }),

  toggleUserFreeze: defineAction({
    accept: "json",
    input: jsonInputSchema,
    handler: async (input, context) => {
      const lang = getRequestLang(context);
      const parsed = parseInput(
        z.object({
          userId: z.string().trim().min(1),
          frozen: z.coerce.boolean(),
          reason: z.string().trim().min(1).default("Admin billing override"),
        }),
        input,
        context,
      );
      if (!parsed.ok) return parsed;

      try {
        const viewer = await requireAdmin(context.request.headers);
        const result = await setMemberFreezeStatus({
          ...parsed.data,
          actorUserId: viewer.user.id,
        });
        if (isOperationFailure(result))
          return formFailure(result.message, lang);
        return actionSuccess({
          data: result,
          notice: {
            type: "success",
            message: translateMessage(result.message, lang),
          },
          invalidate: [
            queryKeys.adminMembers,
            queryKeys.profile(parsed.data.userId),
            queryKeys.authViewer,
            ...dataAccessInvalidationKeys([
              { type: "member", userId: parsed.data.userId },
              { type: "admin-dashboard" },
              { type: "admin-members", userId: parsed.data.userId },
              { type: "booking-eligibility", userId: parsed.data.userId },
            ]),
          ],
        });
      } catch (error) {
        return safeActionError(error, lang);
      }
    },
  }),

  bookEvent: defineAction({
    accept: "json",
    input: jsonInputSchema,
    handler: async (input, context) => {
      const lang = getRequestLang(context);
      const parsed = parseInput(bookingActionSchema, input, context);
      if (!parsed.ok) return parsed;

      try {
        const viewer = await requireMember(context.request.headers);
        return bookingResultToAction(
          await bookMemberEvent({
            userId: viewer.user.id,
            eventId: parsed.data.eventId,
            ticketQuantity: parsed.data.ticketQuantity,
            idempotencyKey: parsed.data.idempotencyKey,
          }),
          lang,
        );
      } catch (error) {
        return safeActionError(error, lang);
      }
    },
  }),

  joinWaitlist: defineAction({
    accept: "json",
    input: jsonInputSchema,
    handler: async (input, context) => {
      const lang = getRequestLang(context);
      const parsed = parseInput(waitlistActionSchema, input, context);
      if (!parsed.ok) return parsed;

      try {
        const viewer = await requireMember(context.request.headers);
        return bookingResultToAction(
          await joinEventWaitlist({
            userId: viewer.user.id,
            eventId: parsed.data.eventId,
            ticketQuantity: parsed.data.ticketQuantity,
          }),
          lang,
        );
      } catch (error) {
        return safeActionError(error, lang);
      }
    },
  }),

  createAdminTicket: defineAction({
    accept: "json",
    input: jsonInputSchema,
    handler: async (input, context) => {
      const lang = getRequestLang(context);
      const parsed = parseInput(adminTicketSchema, input, context);
      if (!parsed.ok) return parsed;

      try {
        const admin = await requireAdmin(context.request.headers);
        return bookingResultToAction(
          await createAdminTicket({
            adminUserId: admin.user.id,
            userId: parsed.data.userId,
            eventId: parsed.data.eventId,
            ticketQuantity: parsed.data.ticketQuantity,
            consumeCapacity: parsed.data.consumeCapacity,
            debitCredits: parsed.data.debitCredits,
            idempotencyKey: parsed.data.idempotencyKey,
          }),
          lang,
        );
      } catch (error) {
        return safeActionError(error, lang);
      }
    },
  }),

  adjustMemberCredits: defineAction({
    accept: "json",
    input: jsonInputSchema,
    handler: async (input, context) => {
      const lang = getRequestLang(context);
      const parsed = parseInput(creditAdjustmentSchema, input, context);
      if (!parsed.ok) return parsed;

      try {
        const admin = await requireAdmin(context.request.headers);
        return creditAdjustmentResultToAction(
          await adjustUserCredits({
            adminUserId: admin.user.id,
            userId: parsed.data.userId,
            amount: parsed.data.amount,
            reason: parsed.data.reason,
            idempotencyKey: parsed.data.idempotencyKey,
          }),
          lang,
        );
      } catch (error) {
        return safeActionError(error, lang);
      }
    },
  }),

  checkInBooking: defineAction({
    accept: "json",
    input: jsonInputSchema,
    handler: async (input, context) => {
      const lang = getRequestLang(context);
      const parsed = parseInput(checkInSchema, input, context);
      if (!parsed.ok) return parsed;

      try {
        const viewer = await requireUser(context.request.headers);
        const result = await checkInBookingOperation({
          bookingId: parsed.data.bookingId,
          viewer,
        });
        if (isOperationFailure(result))
          return formFailure(result.message, lang);

        return actionSuccess({
          data: result,
          notice: {
            type: "success",
            message: translateMessage(result.message, lang),
          },
          invalidate: [
            queryKeys.booking(parsed.data.bookingId),
            queryKeys.bookings,
            queryKeys.checkIns(result.partnerId),
            ...dataAccessInvalidationKeys([
              { type: "partner-guests", partnerId: result.partnerId },
              { type: "partner-exports", partnerId: result.partnerId },
              { type: "admin-dashboard" },
              { type: "admin-exports" },
            ]),
          ],
        });
      } catch (error) {
        return safeActionError(error, lang);
      }
    },
  }),

  checkInWithVenueQr: defineAction({
    accept: "json",
    input: jsonInputSchema,
    handler: async (input, context) => {
      const lang = getRequestLang(context);
      const parsed = parseInput(venueQrCheckInSchema, input, context);
      if (!parsed.ok) return parsed;

      try {
        const viewer = await requireUser(context.request.headers);
        const result = await checkInWithVenueQrOperation({
          userId: viewer.user.id,
          partnerId: parsed.data.partnerId,
          venueToken: parsed.data.venueToken,
        });
        if (isOperationFailure(result))
          return formFailure(result.message, lang);
        return actionSuccess({
          data: result,
          notice: {
            type: "success",
            message: translateMessage(result.message, lang),
          },
          invalidate: [
            queryKeys.booking(result.bookingId),
            queryKeys.bookings,
            queryKeys.checkIns(result.partnerId),
            ...dataAccessInvalidationKeys([
              { type: "member-bookings", userId: viewer.user.id },
              { type: "booking-eligibility", userId: viewer.user.id },
              { type: "partner-guests", partnerId: result.partnerId },
              { type: "partner-exports", partnerId: result.partnerId },
            ]),
          ],
        });
      } catch (error) {
        return safeActionError(error, lang);
      }
    },
  }),

  getPartnerBookingExportRows: defineAction({
    accept: "json",
    input: z.object({
      eventId: z.string().trim().optional(),
    }),
    handler: async (input, context) => {
      const lang = getRequestLang(context);
      try {
        const viewer = await requireUser(context.request.headers);
        if (viewer.role !== "PARTNER" || !viewer.partnerId) {
          return formFailure("You do not have access to this resource.", lang);
        }
        const rows = await getPartnerGuestExportRows(
          viewer.partnerId,
          input.eventId,
        );
        return actionSuccess({
          data: { rows },
          invalidate: dataAccessInvalidationKeys([
            { type: "partner-exports", partnerId: viewer.partnerId },
          ]),
        });
      } catch (error) {
        return safeActionError(error, lang);
      }
    },
  }),

  getAdminExportRows: defineAction({
    accept: "json",
    input: z.object({
      partnerId: z.string().trim().optional(),
      page: z.number().int().positive().optional(),
      pageSize: z.number().int().positive().optional(),
    }),
    handler: async (input, context) => {
      const lang = getRequestLang(context);
      try {
        await requireAdmin(context.request.headers);
        const rows = await getAdminExportRows(
          input.partnerId,
          input.page,
          input.pageSize,
        );
        return actionSuccess({
          data: { rows },
          invalidate: dataAccessInvalidationKeys([{ type: "admin-exports" }]),
        });
      } catch (error) {
        return safeActionError(error, lang);
      }
    },
  }),

  trackEventOpen: defineAction({
    accept: "json",
    input: jsonInputSchema,
    handler: async (input, context) => {
      const lang = getRequestLang(context);
      const parsed = parseInput(trackEventOpenSchema, input, context);
      if (!parsed.ok) return parsed;

      try {
        const viewer = await getViewer(context.request.headers);
        if (viewer.kind !== "authenticated") {
          return actionSuccess({ data: { status: "no-op" } });
        }
        await trackEventOpenInDb(
          viewer.user.id,
          parsed.data.eventId,
          parsed.data.viewName,
        );
        return actionSuccess({
          data: { status: "success" },
          invalidate: [
            queryKeys.adminMembers,
            ...dataAccessInvalidationKeys([
              { type: "admin-members", userId: viewer.user.id },
            ]),
          ],
        });
      } catch (error) {
        return safeActionError(error, lang);
      }
    },
  }),

  trackFilterApply: defineAction({
    accept: "json",
    input: jsonInputSchema,
    handler: async (input, context) => {
      const lang = getRequestLang(context);
      const parsed = parseInput(trackFilterApplySchema, input, context);
      if (!parsed.ok) return parsed;

      try {
        const viewer = await getViewer(context.request.headers);
        if (viewer.kind !== "authenticated") {
          return actionSuccess({ data: { status: "no-op" } });
        }
        await trackFilterApplyInDb(
          viewer.user.id,
          parsed.data.filters,
          parsed.data.viewName,
        );
        return actionSuccess({
          data: { status: "success" },
          invalidate: [
            queryKeys.adminMembers,
            ...dataAccessInvalidationKeys([
              { type: "admin-members", userId: viewer.user.id },
            ]),
          ],
        });
      } catch (error) {
        return safeActionError(error, lang);
      }
    },
  }),
};
