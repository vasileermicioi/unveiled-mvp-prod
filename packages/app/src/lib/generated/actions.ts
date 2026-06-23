/**
 * AUTO-GENERATED FILE — DO NOT EDIT.
 *
 * Re-exports every TypeSpec model that backs an Astro Action in
 * `src/actions/index.ts` (the `AstroActions` namespace in `typespec/astro-actions.tsp`).
 *
 * NOTE: as of this iteration, `json-schema-to-zod` does not resolve `$ref` to
 * scalar formats, so the generated Zod schemas are strictly weaker than the
 * hand-written ones in `src/lib/forms/schemas.ts`. The runtime action handlers
 * continue to use the hand-written schemas until a future iteration either
 * (a) upgrades the JSON-Schema → Zod build step to resolve `$ref` or (b) uses
 * a TypeSpec-aware Zod emitter. The shim exists so callers can begin importing
 * the generated names today; the hand-written schemas are still authoritative.
 */
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
} from "./request-validators";
