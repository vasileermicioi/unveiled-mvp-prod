import { type ActionAPIContext, defineAction } from "astro:actions";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db/client";
import {
  bookings,
  creditLedgerEntries,
  events,
  partners,
  userProfiles,
} from "@/db/schema";
import {
  type AuthActionResult,
  loginWithEmail,
  logout,
  requestPasswordRecovery,
  signUpWithEmail,
} from "@/lib/auth-account-actions";
import {
  AuthAccessError,
  requireAdmin,
  requireOwnerOrAdmin,
  requirePartnerForResource,
  requireUser,
} from "@/lib/auth-profile";
import {
  actionSuccess,
  type FormActionResult,
  formFailure,
  parseFormInput,
  validationFailure,
} from "@/lib/forms/action-result";
import { queryKeys } from "@/lib/forms/query-keys";
import {
  checkInSchema,
  eventFormSchema,
  loginSchema,
  memberAdminSchema,
  membershipSchema,
  onboardingSchema,
  partnerFormSchema,
  passwordRecoverySchema,
  preferenceSchema,
  profileSchema,
  signupSchema,
} from "@/lib/forms/schemas";

const jsonInputSchema = z.record(z.string(), z.unknown());

type ActionContext = ActionAPIContext;

function newId() {
  return crypto.randomUUID();
}

function safeActionError(error: unknown) {
  if (error instanceof AuthAccessError) {
    return formFailure(error.message);
  }
  return formFailure("The request could not be completed.");
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

function authResultToFormAction(
  result: AuthActionResult,
  context: ActionContext,
): FormActionResult<{ nextPath?: string; userId?: string }> {
  applySetCookieHeaders(result.headers, context);

  if (!result.ok) {
    return formFailure(
      result.state.message ?? "The request could not be completed.",
    );
  }

  return actionSuccess({
    data: {
      nextPath: result.nextPath,
      userId: result.userId,
    },
    notice: {
      type: "success",
      message: result.state.message ?? "Done.",
    },
    invalidate: [queryKeys.authViewer],
  });
}

function getEventValues(input: z.infer<typeof eventFormSchema>, index = 0) {
  const dateTime = new Date(input.dateTime);
  if (index > 0) {
    dateTime.setDate(dateTime.getDate() + input.series.intervalDays * index);
  }

  return {
    partnerId: input.partnerId,
    title: index > 0 ? `${input.title} ${index + 1}` : input.title,
    description: input.description,
    category: input.category,
    eventType: input.eventType,
    dateTime,
    timingMode: input.timingMode,
    startTimeMinutes: input.startTimeMinutes,
    weekday: input.weekday,
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
    voucherTemplate: input.voucherTemplate,
    secretCodeRules: input.secretCodeRules,
    secretCode: input.secretCode,
    secretCodeMode: input.secretCodeMode,
    promoCode: input.promoCode,
    eventWebsiteUrl: input.eventWebsiteUrl,
    barrierFree: input.barrierFree,
    languages: input.languages,
    targetAgeGroups: input.targetAgeGroups,
    updatedAt: new Date(),
  };
}

export const server = {
  signup: defineAction({
    accept: "json",
    input: jsonInputSchema,
    handler: async (input, context) => {
      const parsed = parseFormInput(signupSchema, input);
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
      const parsed = parseFormInput(loginSchema, input);
      if (!parsed.ok) return parsed;
      return authResultToFormAction(await loginWithEmail(parsed.data), context);
    },
  }),

  passwordRecovery: defineAction({
    accept: "json",
    input: jsonInputSchema,
    handler: async (input, context) => {
      const parsed = parseFormInput(passwordRecoverySchema, input);
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
      const parsed = parseFormInput(onboardingSchema, input);
      if (!parsed.ok) return parsed;

      try {
        const viewer = await requireUser(context.request.headers);
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
          notice: { type: "success", message: "Preferences saved." },
          invalidate: [
            queryKeys.profile(viewer.user.id),
            queryKeys.preferences(viewer.user.id),
            queryKeys.authViewer,
          ],
        });
      } catch (error) {
        return safeActionError(error);
      }
    },
  }),

  savePreferences: defineAction({
    accept: "json",
    input: jsonInputSchema,
    handler: async (input, context) => {
      const parsed = parseFormInput(preferenceSchema, input);
      if (!parsed.ok) return parsed;

      try {
        const viewer = await requireUser(context.request.headers);
        await db
          .update(userProfiles)
          .set({
            ...parsed.data,
            preferencesUpdatedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(userProfiles.userId, viewer.user.id));

        return actionSuccess({
          notice: { type: "success", message: "Preferences saved." },
          invalidate: [
            queryKeys.profile(viewer.user.id),
            queryKeys.preferences(viewer.user.id),
          ],
        });
      } catch (error) {
        return safeActionError(error);
      }
    },
  }),

  updateProfile: defineAction({
    accept: "json",
    input: jsonInputSchema,
    handler: async (input, context) => {
      const parsed = parseFormInput(profileSchema, input);
      if (!parsed.ok) return parsed;

      try {
        const viewer = await requireUser(context.request.headers);
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
          notice: { type: "success", message: "Profile saved." },
          invalidate: [queryKeys.profile(viewer.user.id), queryKeys.authViewer],
        });
      } catch (error) {
        return safeActionError(error);
      }
    },
  }),

  updateMembership: defineAction({
    accept: "json",
    input: jsonInputSchema,
    handler: async (input, context) => {
      const parsed = membershipSchema.safeParse(input);
      if (!parsed.success) return validationFailure(parsed.error);

      try {
        const viewer = await requireUser(context.request.headers);
        await db
          .update(userProfiles)
          .set({
            paymentMethod: parsed.data.paymentMethod,
            updatedAt: new Date(),
          })
          .where(eq(userProfiles.userId, viewer.user.id));

        return actionSuccess({
          notice: { type: "success", message: "Membership details saved." },
          invalidate: [queryKeys.profile(viewer.user.id), queryKeys.authViewer],
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
      const parsed = parseFormInput(partnerFormSchema, input);
      if (!parsed.ok) return parsed;

      try {
        await requireAdmin(context.request.headers);
        const id = parsed.data.id ?? newId();
        const values = {
          name: parsed.data.name,
          contactEmail: parsed.data.contactEmail,
          address: parsed.data.address,
          logoUrl: parsed.data.logoUrl ?? null,
          venueCheckInToken: parsed.data.venueCheckInToken ?? null,
          portalUserEmail: parsed.data.portalUserEmail || null,
          updatedAt: new Date(),
        };

        if (parsed.data.id) {
          await db
            .update(partners)
            .set(values)
            .where(eq(partners.id, parsed.data.id));
        } else {
          await db.insert(partners).values({
            id,
            ...values,
          });
        }

        return actionSuccess({
          data: { partnerId: id },
          notice: { type: "success", message: "Partner saved." },
          invalidate: [queryKeys.partners, queryKeys.partner(id)],
        });
      } catch (error) {
        return safeActionError(error);
      }
    },
  }),

  saveEvent: defineAction({
    accept: "json",
    input: jsonInputSchema,
    handler: async (input, context) => {
      const parsed = eventFormSchema.safeParse(input);
      if (!parsed.success) return validationFailure(parsed.error);

      try {
        await requireAdmin(context.request.headers);
        const values = getEventValues(parsed.data);
        const id = parsed.data.id ?? newId();

        if (parsed.data.id) {
          await db
            .update(events)
            .set(values)
            .where(eq(events.id, parsed.data.id));
        } else {
          const count = parsed.data.series.enabled
            ? parsed.data.series.count
            : 1;
          await db.insert(events).values(
            Array.from({ length: count }, (_, index) => ({
              id: index === 0 ? id : newId(),
              ...getEventValues(parsed.data, index),
              createdAt: new Date(),
            })),
          );
        }

        return actionSuccess({
          data: { eventId: id },
          notice: { type: "success", message: "Event saved." },
          invalidate: [
            queryKeys.events,
            queryKeys.event(id),
            queryKeys.partners,
          ],
        });
      } catch (error) {
        return safeActionError(error);
      }
    },
  }),

  updateMember: defineAction({
    accept: "json",
    input: jsonInputSchema,
    handler: async (input, context) => {
      const parsed = parseFormInput(memberAdminSchema, input);
      if (!parsed.ok) return parsed;

      try {
        await requireAdmin(context.request.headers);
        await requireOwnerOrAdmin(context.request.headers, parsed.data.userId);

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
          return formFailure("The requested item is not available.");

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
          notice: { type: "success", message: "Member updated." },
          invalidate: [
            queryKeys.adminMembers,
            queryKeys.profile(parsed.data.userId),
            queryKeys.authViewer,
          ],
        });
      } catch (error) {
        return safeActionError(error);
      }
    },
  }),

  checkInBooking: defineAction({
    accept: "json",
    input: jsonInputSchema,
    handler: async (input, context) => {
      const parsed = parseFormInput(checkInSchema, input);
      if (!parsed.ok) return parsed;

      try {
        const booking = await db.query.bookings.findFirst({
          where: eq(bookings.id, parsed.data.bookingId),
        });
        if (!booking)
          return formFailure("The requested item is not available.");

        await requirePartnerForResource(
          context.request.headers,
          booking.partnerId,
        );

        const [updated] = await db
          .update(bookings)
          .set({
            status: "USED",
            checkedInAt: new Date(),
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(bookings.id, parsed.data.bookingId),
              eq(bookings.partnerId, booking.partnerId),
            ),
          )
          .returning({ id: bookings.id });

        if (!updated)
          return formFailure("The requested item is not available.");

        return actionSuccess({
          notice: { type: "success", message: "Guest checked in." },
          invalidate: [
            queryKeys.booking(parsed.data.bookingId),
            queryKeys.bookings,
            queryKeys.checkIns(booking.partnerId),
          ],
        });
      } catch (error) {
        return safeActionError(error);
      }
    },
  }),
};
