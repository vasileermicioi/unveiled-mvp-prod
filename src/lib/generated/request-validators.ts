/**
 * AUTO-GENERATED FILE — DO NOT EDIT.
 *
 * Zod validators for every TypeSpec model under typespec/. Regenerate via
 * `bun run specs:gen`. Drift detection: `bun run specs:check`.
 *
 * Source: typespec/output/openapi.yaml (the canonical OpenAPI 3.1 document).
 * The 92 inlined schemas in `components.schemas` are converted 1:1 to Zod
 * validators below.
 */
import { z } from "zod";

// Auto-generated from OpenAPI schema Admin.AdminError. Do not edit.

export const AdminErrorSchema = z.object({ "message": z.string(), "fieldErrors": z.record(z.string(), z.any()).optional() }).describe("Admin error envelope.");

// Auto-generated from OpenAPI schema Admin.AssetUploadResult. Do not edit.

export const AssetUploadResultSchema = z.object({ "url": z.string().describe("Public URL of the stored asset."), "key": z.string().describe("Object key inside the R2 bucket."), "kind": z.any().describe("Asset kind discriminator."), "size": z.number().int().describe("Byte size of the uploaded object."), "contentType": z.string().describe("Validated content type.") }).describe("Asset upload success result.");

// Auto-generated from OpenAPI schema Admin.Event. Do not edit.

export const EventSchema = z.object({ "id": z.any(), "title": z.string(), "description": z.string().optional(), "category": z.string(), "ticketType": z.any(), "startAt": z.any(), "endAt": z.any().optional(), "addressLine1": z.string().optional(), "addressLine2": z.string().optional(), "city": z.string().optional(), "postalCode": z.string().optional(), "country": z.any().optional(), "neighborhood": z.string().optional(), "imageUrl": z.string().optional(), "capacity": z.number().int(), "remainingCapacity": z.number().int(), "partnerId": z.any().optional(), "partnerName": z.string().optional(), "ageGroups": z.array(z.string()), "languages": z.array(z.string()), "promoCode": z.string().optional(), "secretCode": z.string().optional(), "secretCodeMode": z.enum(["PASSWORD","CODE"]).optional(), "eventWebsiteUrl": z.string().optional(), "createdAt": z.any(), "updatedAt": z.any() }).describe("Event record exposed over the wire.");

// Auto-generated from OpenAPI schema Admin.Partner. Do not edit.

export const PartnerSchema = z.object({ "id": z.any(), "name": z.string(), "contactEmail": z.any(), "contactPhone": z.any().optional(), "websiteUrl": z.string().optional(), "logoUrl": z.string().optional(), "addressLine1": z.string().optional(), "addressLine2": z.string().optional(), "city": z.string().optional(), "postalCode": z.string().optional(), "country": z.any().optional(), "description": z.string().optional(), "portalAccessEnabled": z.boolean(), "venueToken": z.string().optional(), "createdAt": z.any(), "updatedAt": z.any() }).describe("Partner record exposed over the wire.");

// Auto-generated from OpenAPI schema AstroActions.AdminTicketInput. Do not edit.

export const AdminTicketInputSchema = z.object({ "userId": z.any(), "eventId": z.any(), "ticketQuantity": z.number().int(), "consumeCapacity": z.boolean(), "debitCredits": z.boolean(), "idempotencyKey": z.string() });

// Auto-generated from OpenAPI schema AstroActions.BookingActionInput. Do not edit.

export const BookingActionInputSchema = z.object({ "eventId": z.any(), "ticketQuantity": z.number().int(), "idempotencyKey": z.string() });

// Auto-generated from OpenAPI schema AstroActions.CheckInInput. Do not edit.

export const CheckInInputSchema = z.object({ "bookingId": z.any() });

// Auto-generated from OpenAPI schema AstroActions.CreditAdjustmentInput. Do not edit.

export const CreditAdjustmentInputSchema = z.object({ "userId": z.any(), "amount": z.number().int(), "reason": z.string(), "idempotencyKey": z.string() });

// Auto-generated from OpenAPI schema AstroActions.DeleteEventInput. Do not edit.

export const DeleteEventInputSchema = z.object({ "eventId": z.any() });

// Auto-generated from OpenAPI schema AstroActions.DeletePartnerInput. Do not edit.

export const DeletePartnerInputSchema = z.object({ "partnerId": z.any() });

// Auto-generated from OpenAPI schema AstroActions.EventFormInput. Do not edit.

export const EventFormInputSchema = z.object({ "id": z.any().optional(), "title": z.string(), "description": z.string().optional(), "category": z.string(), "ticketType": z.any(), "startAt": z.any(), "endAt": z.any().optional(), "addressLine1": z.string().optional(), "addressLine2": z.string().optional(), "city": z.string().optional(), "postalCode": z.string().optional(), "country": z.any().optional(), "neighborhood": z.string().optional(), "imageUrl": z.string().optional(), "capacity": z.number().int(), "partnerId": z.any().optional(), "ageGroups": z.array(z.string()), "languages": z.array(z.string()), "promoCode": z.string().optional(), "secretCode": z.string().optional(), "secretCodeMode": z.string().optional(), "eventWebsiteUrl": z.string().optional(), "seriesLength": z.number().int().optional(), "seriesIntervalDays": z.number().int().optional() });

// Auto-generated from OpenAPI schema AstroActions.GetAdminExportRowsInput. Do not edit.

export const GetAdminExportRowsInputSchema = z.object({ "partnerId": z.any().optional(), "page": z.number().int().optional(), "pageSize": z.number().int().optional() });

// Auto-generated from OpenAPI schema AstroActions.GetPartnerBookingExportRowsInput. Do not edit.

export const GetPartnerBookingExportRowsInputSchema = z.object({ "eventId": z.any().optional() });

// Auto-generated from OpenAPI schema AstroActions.ListUsersInput. Do not edit.

export const ListUsersInputSchema = z.object({ "page": z.number().int().optional(), "pageSize": z.number().int().optional() });

// Auto-generated from OpenAPI schema AstroActions.LoginInput. Do not edit.

export const LoginInputSchema = z.object({ "email": z.any(), "password": z.string(), "callbackURL": z.string().optional() });

// Auto-generated from OpenAPI schema AstroActions.LogoutInput. Do not edit.

export const LogoutInputSchema = z.object({ "_placeholder": z.string().optional() });

// Auto-generated from OpenAPI schema AstroActions.MemberAdminInput. Do not edit.

export const MemberAdminInputSchema = z.object({ "userId": z.any(), "role": z.any(), "subscriptionStatus": z.any(), "creditAdjustment": z.number().int(), "reason": z.string().optional() });

// Auto-generated from OpenAPI schema AstroActions.MembershipInput. Do not edit.

export const MembershipInputSchema = z.object({ "promoCode": z.string().optional() });

// Auto-generated from OpenAPI schema AstroActions.OnboardingInput. Do not edit.

export const OnboardingInputSchema = z.object({ "interests": z.array(z.string()), "moods": z.array(z.string()), "districts": z.array(z.string()), "maxDistance": z.number().int(), "timing": z.string(), "days": z.array(z.string()), "preferredLanguages": z.array(z.string()), "ageGroup": z.string(), "accessibility": z.array(z.string()), "onboardingComplete": z.boolean() });

// Auto-generated from OpenAPI schema AstroActions.PartnerFormInput. Do not edit.

export const PartnerFormInputSchema = z.object({ "id": z.any().optional(), "name": z.string(), "contactEmail": z.any(), "contactPhone": z.any().optional(), "websiteUrl": z.string().optional(), "logoUrl": z.string().optional(), "addressLine1": z.string().optional(), "addressLine2": z.string().optional(), "city": z.string().optional(), "postalCode": z.string().optional(), "country": z.any().optional(), "description": z.string().optional(), "portalAccessEnabled": z.boolean() });

// Auto-generated from OpenAPI schema AstroActions.PartnerPortalAccessInput. Do not edit.

export const PartnerPortalAccessInputSchema = z.object({ "partnerId": z.any(), "email": z.any(), "name": z.string() });

// Auto-generated from OpenAPI schema AstroActions.PartnerTokenInput. Do not edit.

export const PartnerTokenInputSchema = z.object({ "partnerId": z.any() });

// Auto-generated from OpenAPI schema AstroActions.PasswordRecoveryInput. Do not edit.

export const PasswordRecoveryInputSchema = z.object({ "email": z.any(), "redirectTo": z.string().optional() });

// Auto-generated from OpenAPI schema AstroActions.PreferencesInput. Do not edit.

export const PreferencesInputSchema = z.object({ "interests": z.array(z.string()), "moods": z.array(z.string()), "districts": z.array(z.string()), "maxDistance": z.number().int(), "timing": z.string(), "days": z.array(z.string()), "preferredLanguages": z.array(z.string()), "ageGroup": z.string(), "accessibility": z.array(z.string()) });

// Auto-generated from OpenAPI schema AstroActions.ProfileInput. Do not edit.

export const ProfileInputSchema = z.object({ "firstName": z.string().optional(), "lastName": z.string().optional(), "language": z.any(), "billingAddress": z.any().optional(), "newsletterOptIn": z.boolean() });

// Auto-generated from OpenAPI schema AstroActions.SavedEventActionInput. Do not edit.

export const SavedEventActionInputSchema = z.object({ "eventId": z.any() });

// Auto-generated from OpenAPI schema AstroActions.SetLanguageInput. Do not edit.

export const SetLanguageInputSchema = z.object({ "language": z.any() });

// Auto-generated from OpenAPI schema AstroActions.SignupInput. Do not edit.

export const SignupInputSchema = z.object({ "email": z.any(), "password": z.string(), "firstName": z.string(), "lastName": z.string(), "callbackURL": z.string().optional() });

// Auto-generated from OpenAPI schema AstroActions.ToggleUserFreezeInput. Do not edit.

export const ToggleUserFreezeInputSchema = z.object({ "userId": z.any(), "frozen": z.boolean(), "reason": z.string().optional() });

// Auto-generated from OpenAPI schema AstroActions.TrackEventOpenInput. Do not edit.

export const TrackEventOpenInputSchema = z.object({ "eventId": z.any(), "viewName": z.string() });

// Auto-generated from OpenAPI schema AstroActions.TrackFilterApplyInput. Do not edit.

export const TrackFilterApplyInputSchema = z.object({ "filters": z.record(z.string(), z.any()), "viewName": z.string() });

// Auto-generated from OpenAPI schema AstroActions.VenueQrCheckInInput. Do not edit.

export const VenueQrCheckInInputSchema = z.object({ "partnerId": z.any(), "venueToken": z.string() });

// Auto-generated from OpenAPI schema AstroActions.WaitlistActionInput. Do not edit.

export const WaitlistActionInputSchema = z.object({ "eventId": z.any(), "ticketQuantity": z.number().int() });

// Auto-generated from OpenAPI schema Auth.AccountMe. Do not edit.

export const AccountMeSchema = z.object({ "user": z.any().describe("The authenticated user."), "profile": z.any().describe("The user's profile.") }).describe("Account me response (placeholder for 09-iteration).");

// Auto-generated from OpenAPI schema Auth.AuthResult. Do not edit.

export const AuthResultSchema = z.object({ "state": z.any().describe("Auth state envelope."), "user": z.any().describe("Authenticated user, when login/signup succeeded.").optional(), "session": z.any().describe("Newly created session, when login/signup succeeded.").optional(), "nextPath": z.string().describe("Path to navigate to after success.").optional() }).describe("Generic auth result with optional user/session and next path.");

// Auto-generated from OpenAPI schema Auth.AuthState. Do not edit.

export const AuthStateSchema = z.object({ "ok": z.boolean().describe("True when authentication succeeded."), "status": z.enum(["idle","loading","success","error","unauthenticated","forbidden"]).describe("State discriminator."), "message": z.string().describe("Top-level error message.").optional(), "fieldErrors": z.record(z.string(), z.any()).describe("Optional field-level error map.").optional(), "nextPath": z.string().describe("Redirect target after success.").optional() }).describe("Auth state used in API responses.");

// Auto-generated from OpenAPI schema Auth.BillingAddress. Do not edit.

export const BillingAddressSchema = z.object({ "name": z.string().optional(), "country": z.any().optional(), "postalCode": z.string().optional(), "city": z.string().optional(), "line1": z.string().optional(), "line2": z.string().optional() }).describe("Billing address fields stored on the profile.");

// Auto-generated from OpenAPI schema Auth.LoginRequest. Do not edit.

export const LoginRequestSchema = z.object({ "email": z.any().describe("User email."), "password": z.string().describe("User password (min 8 characters)."), "callbackURL": z.string().describe("Optional URL to redirect to after success.").optional() }).describe("Login request body.");

// Auto-generated from OpenAPI schema Auth.LogoutRequest. Do not edit.

export const LogoutRequestSchema = z.object({ "_placeholder": z.string().describe("Empty marker for the logout endpoint.").optional() }).describe("Logout request body (empty).");

// Auto-generated from OpenAPI schema Auth.PasswordRecoveryRequest. Do not edit.

export const PasswordRecoveryRequestSchema = z.object({ "email": z.any().describe("Email address to send the recovery link to."), "redirectTo": z.string().describe("Optional URL the recovery link redirects to.").optional() }).describe("Password recovery request body.");

// Auto-generated from OpenAPI schema Auth.Profile. Do not edit.

export const ProfileSchema = z.object({ "userId": z.any().describe("Profile id (matches user id)."), "firstName": z.string().describe("First name, may be empty.").optional(), "lastName": z.string().describe("Last name, may be empty.").optional(), "language": z.any().describe("Preferred UI language."), "avatarUrl": z.string().describe("Optional display avatar URL.").optional(), "newsletterOptIn": z.boolean().describe("Whether the user opted into the newsletter."), "credits": z.number().int().describe("Available booking credits, may be negative when frozen.") }).describe("Localized user-facing profile fields.");

// Auto-generated from OpenAPI schema Auth.Session. Do not edit.

export const SessionSchema = z.object({ "id": z.any().describe("Session id."), "userId": z.any().describe("Session owner user id."), "createdAt": z.any().describe("Session creation timestamp."), "expiresAt": z.any().describe("Session expiry timestamp.") }).describe("Active session summary.");

// Auto-generated from OpenAPI schema Auth.SignupRequest. Do not edit.

export const SignupRequestSchema = z.object({ "email": z.any().describe("User email."), "password": z.string().describe("User password (min 8 characters)."), "firstName": z.string().describe("User first name."), "lastName": z.string().describe("User last name."), "callbackURL": z.string().describe("Optional URL to redirect to after success.").optional() }).describe("Signup request body.");

// Auto-generated from OpenAPI schema Auth.UpdateProfileRequest. Do not edit.

export const UpdateProfileRequestSchema = z.object({ "firstName": z.string().optional(), "lastName": z.string().optional(), "language": z.any(), "newsletterOptIn": z.boolean(), "billingAddress": z.any().optional() }).describe("Profile update request (placeholder for 09-iteration).");

// Auto-generated from OpenAPI schema Auth.User. Do not edit.

export const UserSchema = z.object({ "id": z.any().describe("Stable user identifier."), "email": z.any().describe("Primary email address."), "name": z.string().describe("Display name derived from the user profile."), "role": z.any().describe("Account role."), "frozen": z.boolean().describe("True when the account is frozen by an admin override.") }).describe("Account identity record exposed over the wire.");

// Auto-generated from OpenAPI schema Common.ApiError. Do not edit.

export const ApiErrorSchema = z.object({ "message": z.string().describe("Top-level error message, safe to display."), "fieldErrors": z.record(z.string(), z.any()).describe("Optional field-level error map for form submissions.").optional() }).describe("Generic API error envelope returned for any non-2xx response.");

// Auto-generated from OpenAPI schema Common.AssetKind. Do not edit.

export const AssetKindSchema = z.enum(["EVENT","PARTNER","AVATAR"]).describe("Asset upload kind discriminator.");

// Auto-generated from OpenAPI schema Common.BookingState. Do not edit.

export const BookingStateSchema = z.enum(["CONFIRMED","WAITLIST","REJECTED"]).describe("Booking confirmation state.");

// Auto-generated from OpenAPI schema Common.CountryCode. Do not edit.

export const CountryCodeSchema = z.string().describe("Country code (ISO 3166-1 alpha-2).");

// Auto-generated from OpenAPI schema Common.CreditLedgerEntryType. Do not edit.

export const CreditLedgerEntryTypeSchema = z.enum(["PLAN_REFILL","BOOKING_DEBIT","ADMIN_ADJUST","REFUND","EXPIRY"]).describe("Credit ledger entry type.");

// Auto-generated from OpenAPI schema Common.Email. Do not edit.

export const EmailSchema = z.string().email().describe("Email address (RFC 5322).");

// Auto-generated from OpenAPI schema Common.Id. Do not edit.

export const IdSchema = z.string().describe("Generic ID type (UUID v4).");

// Auto-generated from OpenAPI schema Common.Language. Do not edit.

export const LanguageSchema = z.enum(["DE","EN"]).describe("ISO-639-1 language code with custom DE/EN enum.");

// Auto-generated from OpenAPI schema Common.LocalizedString. Do not edit.

export const LocalizedStringSchema = z.object({ "DE": z.string().describe("German translation."), "EN": z.string().describe("English translation.") }).describe("Localized text values for DE and EN.");

// Auto-generated from OpenAPI schema Common.PaginationInput. Do not edit.

export const PaginationInputSchema = z.object({ "page": z.number().int().gte(1).describe("1-indexed page number.").default(1), "pageSize": z.number().int().gte(1).lte(100).describe("Page size, capped at 100 by the handler.").default(20) }).describe("Pagination request parameters for list endpoints.");

// Auto-generated from OpenAPI schema Common.PaginationMeta. Do not edit.

export const PaginationMetaSchema = z.object({ "totalCount": z.number().int().describe("Total row count matching the query."), "hasMore": z.boolean().describe("True when more pages are available after the current page.") }).describe("Pagination metadata returned with paginated responses.");

// Auto-generated from OpenAPI schema Common.PhoneNumber. Do not edit.

export const PhoneNumberSchema = z.string().describe("E.164 phone number or empty string when not provided.");

// Auto-generated from OpenAPI schema Common.Role. Do not edit.

export const RoleSchema = z.enum(["GUEST","MEMBER","PARTNER","ADMIN"]).describe("User role within the application.");

// Auto-generated from OpenAPI schema Common.SubscriptionStatus. Do not edit.

export const SubscriptionStatusSchema = z.enum(["NONE","ACTIVE","TRIALING","PAST_DUE","CANCELED","INCOMPLETE","UNPAID"]).describe("Subscription status reported by the billing provider.");

// Auto-generated from OpenAPI schema Common.TicketType. Do not edit.

export const TicketTypeSchema = z.enum(["PUBLIC","INVITE_ONLY","VOUCHER","SECRET_CODE","FREE"]).describe("Event ticket type.");

// Auto-generated from OpenAPI schema Common.Timestamp. Do not edit.

export const TimestampSchema = z.string().describe("ISO-8601 timestamp string.");

// Auto-generated from OpenAPI schema Common.WaitlistStatus. Do not edit.

export const WaitlistStatusSchema = z.enum(["PENDING","PROMOTED","EXPIRED","CANCELLED"]).describe("Waitlist entry status.");

// Auto-generated from OpenAPI schema Member.AdminSurface. Do not edit.

export const AdminSurfaceSchema = z.object({ "events": z.array(z.any()), "partners": z.array(z.any()), "members": z.array(z.any()), "dashboardCounts": z.object({ "bookings": z.number().int(), "waitlist": z.number().int(), "saved": z.number().int(), "activeMembers": z.number().int() }) }).describe("Admin surface result.");

// Auto-generated from OpenAPI schema Member.Booking. Do not edit.

export const BookingSchema = z.object({ "id": z.any(), "userId": z.any(), "eventId": z.any(), "eventTitle": z.string(), "eventStartAt": z.any(), "eventAddress": z.string().optional(), "ticketQuantity": z.number().int(), "status": z.any(), "redemptionCode": z.string().optional(), "redemptionUrl": z.string().optional(), "checkedInAt": z.any().optional(), "createdAt": z.any(), "creditsSpent": z.number().int() }).describe("Booking record exposed over the wire.");

// Auto-generated from OpenAPI schema Member.CreditLedgerEntry. Do not edit.

export const CreditLedgerEntrySchema = z.object({ "id": z.any(), "userId": z.any(), "amount": z.number().int(), "type": z.any(), "description": z.string().optional(), "balanceAfter": z.number().int(), "relatedEventId": z.any().optional(), "relatedBookingId": z.any().optional(), "createdAt": z.any() }).describe("Credit ledger entry.");

// Auto-generated from OpenAPI schema Member.MemberSurface. Do not edit.

export const MemberSurfaceSchema = z.object({ "user": z.any(), "profile": z.any(), "bookings": z.array(z.any()), "waitlist": z.array(z.any()), "savedEvents": z.array(z.any()), "ledger": z.array(z.any()) }).describe("Member surface result.");

// Auto-generated from OpenAPI schema Member.PartnerSurface. Do not edit.

export const PartnerSurfaceSchema = z.object({ "partner": z.any(), "events": z.array(z.any()), "guestList": z.array(z.any()), "qrPath": z.string(), "qrTokenStatus": z.string(), "exportAvailable": z.boolean() }).describe("Partner surface result.");

// Auto-generated from OpenAPI schema Member.PublicDiscoverySurface. Do not edit.

export const PublicDiscoverySurfaceSchema = z.object({ "events": z.array(z.any()), "categories": z.array(z.string()), "districts": z.array(z.string()), "languages": z.array(z.string()), "totalCount": z.number().int(), "hasMore": z.boolean() }).describe("Public discovery surface result.");

// Auto-generated from OpenAPI schema Member.SavedEvent. Do not edit.

export const SavedEventSchema = z.object({ "userId": z.any(), "eventId": z.any(), "eventTitle": z.string(), "savedAt": z.any() }).describe("Saved event reference.");

// Auto-generated from OpenAPI schema Member.WaitlistEntry. Do not edit.

export const WaitlistEntrySchema = z.object({ "id": z.any(), "userId": z.any(), "eventId": z.any(), "eventTitle": z.string(), "eventStartAt": z.any(), "ticketQuantity": z.number().int(), "status": z.any(), "createdAt": z.any() }).describe("Waitlist entry exposed over the wire.");

// Auto-generated from OpenAPI schema Partner.PartnerCheckInRequest. Do not edit.

export const PartnerCheckInRequestSchema = z.object({ "bookingId": z.any().describe("Booking id to check in.") }).describe("Partner check-in request.");

// Auto-generated from OpenAPI schema Partner.PartnerCheckInResult. Do not edit.

export const PartnerCheckInResultSchema = z.object({ "bookingId": z.any().describe("Booking id that was checked in."), "partnerId": z.any().describe("Partner id that owns the check-in."), "message": z.string().describe("Localized success message.") }).describe("Partner check-in result.");

// Auto-generated from OpenAPI schema Partner.PartnerExportInput. Do not edit.

export const PartnerExportInputSchema = z.object({ "eventId": z.any().optional() }).describe("Partner export filter input.");

// Auto-generated from OpenAPI schema Partner.PartnerExportRow. Do not edit.

export const PartnerExportRowSchema = z.object({ "bookingId": z.any(), "userShortId": z.string(), "eventTitle": z.string(), "redemptionCode": z.string().optional(), "status": z.any(), "ticketQuantity": z.number().int(), "createdAt": z.any(), "checkedInAt": z.any().optional() }).describe("Partner export row.");

// Auto-generated from OpenAPI schema Partner.PartnerGuestRow. Do not edit.

export const PartnerGuestRowSchema = z.object({ "bookingId": z.any(), "guestShortId": z.string(), "userShortId": z.string(), "eventTitle": z.string(), "redemptionCode": z.string().optional(), "status": z.any(), "ticketQuantity": z.number().int(), "createdAt": z.any(), "checkedInAt": z.any().optional(), "checkInAvailable": z.boolean() }).describe("Guest row for the partner portal guest list.");

// Auto-generated from OpenAPI schema Partner.PartnerPortal. Do not edit.

export const PartnerPortalSchema = z.object({ "partner": z.any(), "events": z.array(z.any()), "guestList": z.array(z.any()), "qrPath": z.string(), "venueToken": z.string(), "aggregateGuests": z.number().int(), "exportAvailable": z.boolean() }).describe("Partner portal home data.");

// Auto-generated from OpenAPI schema Partner.VenueQrCheckInRequest. Do not edit.

export const VenueQrCheckInRequestSchema = z.object({ "partnerId": z.any(), "venueToken": z.string() }).describe("Venue QR check-in request.");

// Auto-generated from OpenAPI schema Partner.VenueQrCheckInResult. Do not edit.

export const VenueQrCheckInResultSchema = z.object({ "bookingId": z.any(), "partnerId": z.any(), "userId": z.any(), "message": z.string() }).describe("Venue QR check-in result.");

// Auto-generated from OpenAPI schema Surfaces.AdminInput. Do not edit.

export const AdminInputSchema = z.object({ "membersPage": z.number().int().optional(), "membersPageSize": z.number().int().optional(), "partnersPage": z.number().int().optional(), "partnersPageSize": z.number().int().optional(), "eventsPage": z.number().int().optional(), "eventsPageSize": z.number().int().optional() }).describe("Admin surface input.");

// Auto-generated from OpenAPI schema Surfaces.MemberInput. Do not edit.

export const MemberInputSchema = z.object({ "page": z.number().int().optional(), "pageSize": z.number().int().optional() }).describe("Member surface input.");

// Auto-generated from OpenAPI schema Surfaces.PartnerInput. Do not edit.

export const PartnerInputSchema = z.object({ "partnerId": z.any() }).describe("Partner surface input.");

// Auto-generated from OpenAPI schema Surfaces.PublicDiscoveryInput. Do not edit.

export const PublicDiscoveryInputSchema = z.object({ "q": z.string().describe("Search query string.").optional(), "category": z.string().describe("Category filter.").optional(), "district": z.string().describe("District filter.").optional(), "date": z.string().describe("Date filter (ISO-8601).").optional(), "page": z.number().int().describe("Page number (1-indexed).").optional(), "pageSize": z.number().int().describe("Page size.").optional() }).describe("Public discovery surface input.");

// Auto-generated from OpenAPI schema Surfaces.Surface. Do not edit.

export const SurfaceSchema = z.union([z.any(), z.any(), z.any(), z.any()]).describe("Closed union of registered data-access surfaces (one per loader in `src/lib/data-access/loaders.ts`).");

// Auto-generated from OpenAPI schema System.HealthResult. Do not edit.

export const HealthResultSchema = z.object({ "status": z.literal("ok").describe("`ok` when the worker is responsive."), "now": z.any().describe("Server timestamp.") }).describe("Liveness probe result.");

// Auto-generated from OpenAPI schema System.ReadinessResult. Do not edit.

export const ReadinessResultSchema = z.object({ "status": z.enum(["ready","degraded"]).describe("`ready` when dependencies are reachable."), "checks": z.record(z.string(), z.any()).describe("Per-dependency status map.") }).describe("Readiness probe result.");

// Auto-generated from OpenAPI schema Webhooks.ProviderEvent. Do not edit.

export const ProviderEventSchema = z.object({ "provider": z.string().describe("Provider identifier (e.g. `stripe`)."), "eventId": z.string().describe("Provider event id (e.g. `evt_...`)."), "type": z.string().describe("Event type reported by the provider."), "payload": z.any().describe("Raw event payload as received from the provider."), "receivedAt": z.any().describe("Receipt timestamp."), "processed": z.boolean().describe("True once the event has been processed.") }).describe("Provider event record persisted for idempotency.");

// Auto-generated from OpenAPI schema Webhooks.StripeCustomer. Do not edit.

export const StripeCustomerSchema = z.object({ "id": z.string(), "email": z.any().optional(), "name": z.string().optional(), "address": z.object({ "country": z.any().optional(), "postal_code": z.string().optional(), "city": z.string().optional(), "line1": z.string().optional(), "line2": z.string().optional() }).optional(), "default_payment_method": z.string().optional(), "invoice_settings": z.object({ "default_payment_method": z.string().optional() }).optional() }).describe("Stripe customer (subset of Stripe API response).");

// Auto-generated from OpenAPI schema Webhooks.StripeEvent. Do not edit.

export const StripeEventSchema = z.union([z.object({ "type": z.enum(["invoice.payment_succeeded","invoice.payment_failed"]), "data": z.object({ "object": z.any() }) }), z.object({ "type": z.enum(["customer.subscription.created","customer.subscription.updated","customer.subscription.deleted"]), "data": z.object({ "object": z.any() }) }), z.object({ "type": z.enum(["payment_method.attached","payment_method.detached"]), "data": z.object({ "object": z.any() }) }), z.object({ "type": z.literal("customer.updated"), "data": z.object({ "object": z.any() }) })]).describe("Discriminated union of supported Stripe event types.");

// Auto-generated from OpenAPI schema Webhooks.StripeInvoice. Do not edit.

export const StripeInvoiceSchema = z.object({ "id": z.string(), "customer": z.string(), "subscription": z.string(), "amount_paid": z.number().int(), "status": z.string(), "metadata": z.record(z.string(), z.any()) }).describe("Stripe invoice record (subset of Stripe API response).");

// Auto-generated from OpenAPI schema Webhooks.StripePaymentMethod. Do not edit.

export const StripePaymentMethodSchema = z.object({ "id": z.string(), "type": z.string(), "card": z.object({ "brand": z.string(), "last4": z.string(), "exp_month": z.number().int(), "exp_year": z.number().int() }).optional(), "sepa_debit": z.object({ "last4": z.string(), "bank_code": z.string().optional() }).optional() }).describe("Stripe payment method (subset of Stripe API response).");

// Auto-generated from OpenAPI schema Webhooks.StripeSubscription. Do not edit.

export const StripeSubscriptionSchema = z.object({ "id": z.string(), "customer": z.string(), "status": z.string(), "current_period_start": z.number().int(), "current_period_end": z.number().int(), "cancel_at_period_end": z.boolean(), "canceled_at": z.number().int().optional(), "items": z.object({ "data": z.array(z.object({ "id": z.string(), "price": z.object({ "id": z.string() }) })) }) }).describe("Stripe subscription record (subset of Stripe API response).");

// Auto-generated from OpenAPI schema Webhooks.WebhookError. Do not edit.

export const WebhookErrorSchema = z.object({ "message": z.string() }).describe("Webhook error envelope.");

export const GeneratedSchemas = {
  AdminError: AdminErrorSchema,
  AssetUploadResult: AssetUploadResultSchema,
  Event: EventSchema,
  Partner: PartnerSchema,
  AdminTicketInput: AdminTicketInputSchema,
  BookingActionInput: BookingActionInputSchema,
  CheckInInput: CheckInInputSchema,
  CreditAdjustmentInput: CreditAdjustmentInputSchema,
  DeleteEventInput: DeleteEventInputSchema,
  DeletePartnerInput: DeletePartnerInputSchema,
  EventFormInput: EventFormInputSchema,
  GetAdminExportRowsInput: GetAdminExportRowsInputSchema,
  GetPartnerBookingExportRowsInput: GetPartnerBookingExportRowsInputSchema,
  ListUsersInput: ListUsersInputSchema,
  LoginInput: LoginInputSchema,
  LogoutInput: LogoutInputSchema,
  MemberAdminInput: MemberAdminInputSchema,
  MembershipInput: MembershipInputSchema,
  OnboardingInput: OnboardingInputSchema,
  PartnerFormInput: PartnerFormInputSchema,
  PartnerPortalAccessInput: PartnerPortalAccessInputSchema,
  PartnerTokenInput: PartnerTokenInputSchema,
  PasswordRecoveryInput: PasswordRecoveryInputSchema,
  PreferencesInput: PreferencesInputSchema,
  ProfileInput: ProfileInputSchema,
  SavedEventActionInput: SavedEventActionInputSchema,
  SetLanguageInput: SetLanguageInputSchema,
  SignupInput: SignupInputSchema,
  ToggleUserFreezeInput: ToggleUserFreezeInputSchema,
  TrackEventOpenInput: TrackEventOpenInputSchema,
  TrackFilterApplyInput: TrackFilterApplyInputSchema,
  VenueQrCheckInInput: VenueQrCheckInInputSchema,
  WaitlistActionInput: WaitlistActionInputSchema,
  AccountMe: AccountMeSchema,
  AuthResult: AuthResultSchema,
  AuthState: AuthStateSchema,
  BillingAddress: BillingAddressSchema,
  LoginRequest: LoginRequestSchema,
  LogoutRequest: LogoutRequestSchema,
  PasswordRecoveryRequest: PasswordRecoveryRequestSchema,
  Profile: ProfileSchema,
  Session: SessionSchema,
  SignupRequest: SignupRequestSchema,
  UpdateProfileRequest: UpdateProfileRequestSchema,
  User: UserSchema,
  ApiError: ApiErrorSchema,
  AssetKind: AssetKindSchema,
  BookingState: BookingStateSchema,
  CountryCode: CountryCodeSchema,
  CreditLedgerEntryType: CreditLedgerEntryTypeSchema,
  Email: EmailSchema,
  Id: IdSchema,
  Language: LanguageSchema,
  LocalizedString: LocalizedStringSchema,
  PaginationInput: PaginationInputSchema,
  PaginationMeta: PaginationMetaSchema,
  PhoneNumber: PhoneNumberSchema,
  Role: RoleSchema,
  SubscriptionStatus: SubscriptionStatusSchema,
  TicketType: TicketTypeSchema,
  Timestamp: TimestampSchema,
  WaitlistStatus: WaitlistStatusSchema,
  AdminSurface: AdminSurfaceSchema,
  Booking: BookingSchema,
  CreditLedgerEntry: CreditLedgerEntrySchema,
  MemberSurface: MemberSurfaceSchema,
  PartnerSurface: PartnerSurfaceSchema,
  PublicDiscoverySurface: PublicDiscoverySurfaceSchema,
  SavedEvent: SavedEventSchema,
  WaitlistEntry: WaitlistEntrySchema,
  PartnerCheckInRequest: PartnerCheckInRequestSchema,
  PartnerCheckInResult: PartnerCheckInResultSchema,
  PartnerExportInput: PartnerExportInputSchema,
  PartnerExportRow: PartnerExportRowSchema,
  PartnerGuestRow: PartnerGuestRowSchema,
  PartnerPortal: PartnerPortalSchema,
  VenueQrCheckInRequest: VenueQrCheckInRequestSchema,
  VenueQrCheckInResult: VenueQrCheckInResultSchema,
  AdminInput: AdminInputSchema,
  MemberInput: MemberInputSchema,
  PartnerInput: PartnerInputSchema,
  PublicDiscoveryInput: PublicDiscoveryInputSchema,
  Surface: SurfaceSchema,
  HealthResult: HealthResultSchema,
  ReadinessResult: ReadinessResultSchema,
  ProviderEvent: ProviderEventSchema,
  StripeCustomer: StripeCustomerSchema,
  StripeEvent: StripeEventSchema,
  StripeInvoice: StripeInvoiceSchema,
  StripePaymentMethod: StripePaymentMethodSchema,
  StripeSubscription: StripeSubscriptionSchema,
  WebhookError: WebhookErrorSchema,
} as const;

export type GeneratedSchemaName = keyof typeof GeneratedSchemas;
