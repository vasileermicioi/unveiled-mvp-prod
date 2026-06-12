import "@typespec/http";
import "@typespec/json-schema";

using TypeSpec.Http;
using TypeSpec.JsonSchema;
using Unveiled.Api.Common;
using Unveiled.Api.Auth;
using Unveiled.Api.Admin;
using Unveiled.Api.Partner;
using Unveiled.Api.Member;
using Unveiled.Api.Webhooks;

@doc("""
Virtual namespace mirroring every Astro Action exported from `src/actions/index.ts`.
Excluded from the OpenAPI emitter (operations live here purely to keep the input shape
in a single source of truth; the JSON Schema emitter emits the input models for
the runtime Zod validators).
""")
@jsonSchema
namespace Unveiled.Api.AstroActions {

  // ---- Auth ----
  model SignupInput {
    email: Email;
    password: string;
    firstName: string;
    lastName: string;
    callbackURL?: string;
  }

  model LoginInput {
    email: Email;
    password: string;
    callbackURL?: string;
  }

  model PasswordRecoveryInput {
    email: Email;
    redirectTo?: string;
  }

  model LogoutInput {
    _placeholder?: string;
  }

  // ---- Onboarding / preferences / profile ----
  model SetLanguageInput {
    language: Language;
  }

  model OnboardingInput {
    interests: string[];
    moods: string[];
    districts: string[];
    maxDistance: int32;
    timing: string;
    days: string[];
    preferredLanguages: string[];
    ageGroup: string;
    accessibility: string[];
    onboardingComplete: boolean;
  }

  model PreferencesInput {
    interests: string[];
    moods: string[];
    districts: string[];
    maxDistance: int32;
    timing: string;
    days: string[];
    preferredLanguages: string[];
    ageGroup: string;
    accessibility: string[];
  }

  model ProfileInput {
    firstName?: string;
    lastName?: string;
    language: Language;
    billingAddress?: BillingAddress;
    newsletterOptIn: boolean;
  }

  // ---- Member event actions ----
  model SavedEventActionInput {
    eventId: Id;
  }

  model MembershipInput {
    promoCode?: string;
  }

  // ---- Admin partner / event actions ----
  model PartnerFormInput {
    id?: Id;
    name: string;
    contactEmail: Email;
    contactPhone?: PhoneNumber;
    websiteUrl?: string;
    logoUrl?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    postalCode?: string;
    country?: CountryCode;
    description?: string;
    portalAccessEnabled: boolean;
  }

  model EventFormInput {
    id?: Id;
    title: string;
    description?: string;
    category: string;
    ticketType: TicketType;
    startAt: Timestamp;
    endAt?: Timestamp;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    postalCode?: string;
    country?: CountryCode;
    neighborhood?: string;
    imageUrl?: string;
    capacity: int32;
    partnerId?: Id;
    ageGroups: string[];
    languages: string[];
    promoCode?: string;
    secretCode?: string;
    secretCodeMode?: string;
    eventWebsiteUrl?: string;
    seriesLength?: int32;
    seriesIntervalDays?: int32;
  }

  model DeleteEventInput {
    eventId: Id;
  }

  model PartnerTokenInput {
    partnerId: Id;
  }

  model PartnerPortalAccessInput {
    partnerId: Id;
    email: Email;
    name: string;
  }

  model DeletePartnerInput {
    partnerId: Id;
  }

  model ListUsersInput {
    page?: int32;
    pageSize?: int32;
  }

  model MemberAdminInput {
    userId: Id;
    role: Role;
    subscriptionStatus: SubscriptionStatus;
    creditAdjustment: int32;
    reason?: string;
  }

  model ToggleUserFreezeInput {
    userId: Id;
    frozen: boolean;
    reason?: string;
  }

  // ---- Bookings / credits ----
  model BookingActionInput {
    eventId: Id;
    ticketQuantity: int32;
    idempotencyKey: string;
  }

  model WaitlistActionInput {
    eventId: Id;
    ticketQuantity: int32;
  }

  model AdminTicketInput {
    userId: Id;
    eventId: Id;
    ticketQuantity: int32;
    consumeCapacity: boolean;
    debitCredits: boolean;
    idempotencyKey: string;
  }

  model CreditAdjustmentInput {
    userId: Id;
    amount: int32;
    reason: string;
    idempotencyKey: string;
  }

  // ---- Check-ins ----
  model CheckInInput {
    bookingId: Id;
  }

  model VenueQrCheckInInput {
    partnerId: Id;
    venueToken: string;
  }

  // ---- Exports ----
  model GetPartnerBookingExportRowsInput {
    eventId?: Id;
  }

  model GetAdminExportRowsInput {
    partnerId?: Id;
    page?: int32;
    pageSize?: int32;
  }

  // ---- Tracking ----
  model TrackEventOpenInput {
    eventId: Id;
    viewName: string;
  }

  model TrackFilterApplyInput {
    filters: Record<string>;
    viewName: string;
  }
}
