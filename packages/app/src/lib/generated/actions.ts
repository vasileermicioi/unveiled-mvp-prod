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
  SignupInputSchema,
  LoginInputSchema,
  PasswordRecoveryInputSchema,
  LogoutInputSchema,
  SetLanguageInputSchema,
  OnboardingInputSchema,
  PreferencesInputSchema,
  ProfileInputSchema,
  SavedEventActionInputSchema,
  MembershipInputSchema,
  PartnerFormInputSchema,
  EventFormInputSchema,
  DeleteEventInputSchema,
  PartnerTokenInputSchema,
  PartnerPortalAccessInputSchema,
  DeletePartnerInputSchema,
  ListUsersInputSchema,
  MemberAdminInputSchema,
  ToggleUserFreezeInputSchema,
  BookingActionInputSchema,
  WaitlistActionInputSchema,
  AdminTicketInputSchema,
  CreditAdjustmentInputSchema,
  CheckInInputSchema,
  VenueQrCheckInInputSchema,
  GetPartnerBookingExportRowsInputSchema,
  GetAdminExportRowsInputSchema,
  TrackEventOpenInputSchema,
  TrackFilterApplyInputSchema,
} from "./request-validators";
