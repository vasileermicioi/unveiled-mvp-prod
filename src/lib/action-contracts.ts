/**
 * Hand-written Zod fall-back for the action request/response envelope builders.
 *
 * NOTE: as of the `typespec-openapi-contract` change (openspec/changes/typespec-openapi-contract),
 * the canonical source of truth for every action's input shape is `typespec/astro-actions.tsp`
 * and the generated validators live in `@/lib/generated/actions` (re-exported from
 * `request-validators.ts`). The generated Zod validators are currently *weaker* than the
 * hand-written ones in `src/lib/forms/schemas.ts` because `json-schema-to-zod` does not
 * resolve `$ref` to scalar formats (e.g. an `Email` field becomes `z.any()`).
 *
 * This file remains the source of truth for:
 *   - The result envelope builders (`bookingActionResult`, `creditAdjustmentActionSuccess`, ...)
 *     used by the Astro Action handlers.
 *   - The hand-written input schemas re-exported by `@/lib/forms/schemas.ts`.
 *
 * The migration to the generated validators will land incrementally: once a
 * future iteration upgrades the JSON-Schema → Zod build step to resolve `$ref`,
 * the hand-written schemas in `forms/schemas.ts` will be replaced one by one
 * with `import { XxxInputSchema } from "@/lib/generated/actions"`.
 */
import type { AuthAccessError } from "@/lib/auth-profile";
import {
  type BookingTransactionResult,
  bookingFailureMessage,
  type CreditAdjustmentResult,
  isBookingFailure,
} from "@/lib/booking-transactions";
import {
  invalidationHintsForScopes,
  toQueryKeys,
} from "@/lib/data-access/invalidation";
import type { QueryInvalidationKey } from "@/lib/forms/action-result";
import {
  actionSuccess,
  type FormActionResult,
  formFailure,
} from "@/lib/forms/action-result";
import { queryKeys } from "@/lib/forms/query-keys";

export {
  AdminTicketInputSchema,
  BookingActionInputSchema,
  CheckInInputSchema,
  CreditAdjustmentInputSchema,
  DeleteEventInputSchema,
  DeletePartnerInputSchema,
  EventFormInputSchema,
  GetAdminExportRowsInputSchema,
  GetPartnerBookingExportRowsInputSchema,
  ListUsersInputSchema,
  LoginInputSchema,
  LogoutInputSchema,
  MemberAdminInputSchema,
  MembershipInputSchema,
  OnboardingInputSchema,
  PartnerFormInputSchema,
  PartnerPortalAccessInputSchema,
  PartnerTokenInputSchema,
  PasswordRecoveryInputSchema,
  PreferencesInputSchema,
  ProfileInputSchema,
  SavedEventActionInputSchema,
  SetLanguageInputSchema,
  SignupInputSchema,
  ToggleUserFreezeInputSchema,
  TrackEventOpenInputSchema,
  TrackFilterApplyInputSchema,
  VenueQrCheckInInputSchema,
  WaitlistActionInputSchema,
} from "@/lib/generated/actions";

function dataAccessInvalidationKeys(
  scopes: Parameters<typeof invalidationHintsForScopes>[0],
) {
  return toQueryKeys(invalidationHintsForScopes(scopes));
}

export function safeActionFailure(error: unknown) {
  if (
    error &&
    typeof error === "object" &&
    "name" in error &&
    (error as AuthAccessError).name === "AuthAccessError" &&
    "message" in error
  ) {
    return formFailure(String((error as { message: string }).message));
  }
  return formFailure("The request could not be completed.");
}

export function bookingActionResult(
  result: BookingTransactionResult,
): FormActionResult<BookingTransactionResult> {
  if (isBookingFailure(result)) {
    return formFailure(result.message || bookingFailureMessage(result.state));
  }

  return actionSuccess({
    data: result,
    notice: {
      type: "success",
      message:
        result.state === "confirmed"
          ? "Booking confirmed."
          : "Waitlist joined.",
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

export function creditAdjustmentActionResult(
  result: CreditAdjustmentResult,
): FormActionResult<CreditAdjustmentResult> {
  if (isBookingFailure(result)) {
    return formFailure(result.message || bookingFailureMessage(result.state));
  }

  return actionSuccess({
    data: result,
    notice: { type: "success", message: "Credits adjusted." },
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

export function onboardingActionSuccess(userId: string) {
  return actionSuccess({
    notice: { type: "success", message: "Preferences saved." },
    invalidate: [
      queryKeys.profile(userId),
      queryKeys.preferences(userId),
      queryKeys.authViewer,
      ...dataAccessInvalidationKeys([
        { type: "member", userId },
        { type: "member-preferences", userId },
        { type: "member-profile", userId },
      ]),
    ],
  });
}

export function preferencesActionSuccess(userId: string) {
  return actionSuccess({
    notice: { type: "success", message: "Preferences saved." },
    invalidate: [
      queryKeys.profile(userId),
      queryKeys.preferences(userId),
      ...dataAccessInvalidationKeys([
        { type: "member", userId },
        { type: "member-preferences", userId },
      ]),
    ],
  });
}

export function profileActionSuccess(userId: string) {
  return actionSuccess({
    notice: { type: "success", message: "Profile saved." },
    invalidate: [
      queryKeys.profile(userId),
      queryKeys.authViewer,
      ...dataAccessInvalidationKeys([{ type: "member-profile", userId }]),
    ],
  });
}

export function saveMemberEventActionSuccess(userId: string, eventId: string) {
  return actionSuccess({
    notice: { type: "success", message: "Event saved." },
    invalidate: [
      queryKeys.authViewer,
      queryKeys.events,
      queryKeys.event(eventId),
      ...dataAccessInvalidationKeys([
        { type: "public-discovery" },
        { type: "member", userId },
        { type: "event", eventId },
      ]),
    ],
  });
}

export function unsaveMemberEventActionSuccess(
  userId: string,
  eventId: string,
) {
  return actionSuccess({
    notice: { type: "success", message: "Event removed." },
    invalidate: [
      queryKeys.authViewer,
      queryKeys.events,
      queryKeys.event(eventId),
      ...dataAccessInvalidationKeys([
        { type: "public-discovery" },
        { type: "member", userId },
        { type: "event", eventId },
      ]),
    ],
  });
}

export function savePartnerActionSuccess(partnerId: string, message: string) {
  return actionSuccess({
    data: { partnerId },
    notice: { type: "success", message },
    invalidate: [
      queryKeys.partners,
      queryKeys.partner(partnerId),
      queryKeys.events,
      ...dataAccessInvalidationKeys([
        { type: "public-discovery" },
        { type: "partner", partnerId },
        { type: "admin-dashboard" },
        { type: "admin-partners" },
        { type: "admin-events" },
        { type: "admin-exports" },
      ]),
    ],
  });
}

export function saveEventActionSuccess(eventIds: string[], message: string) {
  return actionSuccess({
    data: { eventId: eventIds[0], eventIds },
    notice: { type: "success", message },
    invalidate: [
      queryKeys.events,
      ...eventIds.map((eventId) => queryKeys.event(eventId)),
      queryKeys.partners,
      ...dataAccessInvalidationKeys([
        { type: "public-discovery" },
        { type: "admin-dashboard" },
        { type: "admin-events" },
        { type: "admin-exports" },
      ]),
    ],
  });
}

export function toggleUserFreezeActionSuccess<
  TData extends {
    userId: string;
  },
>(data: TData, message: string): FormActionResult<TData> {
  return actionSuccess({
    data,
    notice: { type: "success", message },
    invalidate: [
      queryKeys.adminMembers,
      queryKeys.profile(data.userId),
      queryKeys.authViewer,
      ...dataAccessInvalidationKeys([
        { type: "member", userId: data.userId },
        { type: "admin-dashboard" },
        { type: "admin-members", userId: data.userId },
        { type: "booking-eligibility", userId: data.userId },
      ]),
    ],
  });
}

export function checkInBookingActionSuccess(
  bookingId: string,
  partnerId: string,
  message: string,
) {
  return actionSuccess({
    data: { bookingId, partnerId },
    notice: { type: "success", message },
    invalidate: [
      queryKeys.booking(bookingId),
      queryKeys.bookings,
      queryKeys.checkIns(partnerId),
      ...dataAccessInvalidationKeys([
        { type: "partner-guests", partnerId },
        { type: "partner-exports", partnerId },
        { type: "admin-dashboard" },
        { type: "admin-exports" },
      ]),
    ],
  });
}

export function venueQrCheckInActionSuccess(
  bookingId: string,
  partnerId: string,
  userId: string,
  message: string,
) {
  return actionSuccess({
    data: { bookingId, partnerId, userId },
    notice: { type: "success", message },
    invalidate: [
      queryKeys.booking(bookingId),
      queryKeys.bookings,
      queryKeys.checkIns(partnerId),
      ...dataAccessInvalidationKeys([
        { type: "member-bookings", userId },
        { type: "booking-eligibility", userId },
        { type: "partner-guests", partnerId },
        { type: "partner-exports", partnerId },
      ]),
    ],
  });
}

export function invalidateKeys(
  result: FormActionResult<unknown>,
): QueryInvalidationKey[] {
  return result.ok ? ((result.invalidate ?? []) as QueryInvalidationKey[]) : [];
}
