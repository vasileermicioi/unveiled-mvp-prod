import "@typespec/http";
import "@typespec/json-schema";

using TypeSpec.Http;
using TypeSpec.JsonSchema;

@jsonSchema
namespace Unveiled.Api.Common;

@doc("ISO-639-1 language code with custom DE/EN enum.")
enum Language {
  DE,
  EN,
}

@doc("User role within the application.")
enum Role {
  GUEST,
  MEMBER,
  PARTNER,
  ADMIN,
}

@doc("Subscription status reported by the billing provider.")
enum SubscriptionStatus {
  NONE,
  ACTIVE,
  TRIALING,
  PAST_DUE,
  CANCELED,
  INCOMPLETE,
  UNPAID,
}

@doc("Booking confirmation state.")
enum BookingState {
  CONFIRMED,
  WAITLIST,
  REJECTED,
}

@doc("Event ticket type.")
enum TicketType {
  PUBLIC,
  INVITE_ONLY,
  VOUCHER,
  SECRET_CODE,
  FREE,
}

@doc("Waitlist entry status.")
enum WaitlistStatus {
  PENDING,
  PROMOTED,
  EXPIRED,
  CANCELLED,
}

@doc("Credit ledger entry type.")
enum CreditLedgerEntryType {
  PLAN_REFILL,
  BOOKING_DEBIT,
  ADMIN_ADJUST,
  REFUND,
  EXPIRY,
}

@doc("Asset upload kind discriminator.")
enum AssetKind {
  EVENT,
  PARTNER,
  AVATAR,
}

@doc("Generic API error envelope returned for any non-2xx response.")
@error
model ApiError {
  @doc("Top-level error message, safe to display.")
  message: string;

  @doc("Optional field-level error map for form submissions.")
  fieldErrors?: Record<unknown>;
}

@doc("Pagination request parameters for list endpoints.")
model PaginationInput {
  @doc("1-indexed page number.")
  @minValue(1)
  page?: int32 = 1;

  @doc("Page size, capped at 100 by the handler.")
  @minValue(1)
  @maxValue(100)
  pageSize?: int32 = 20;
}

@doc("Pagination metadata returned with paginated responses.")
model PaginationMeta {
  @doc("Total row count matching the query.")
  totalCount: int64;

  @doc("True when more pages are available after the current page.")
  hasMore: boolean;
}

@doc("Localized text values for DE and EN.")
model LocalizedString {
  @doc("German translation.")
  DE: string;

  @doc("English translation.")
  EN: string;
}

@doc("Generic ID type (UUID v4).")
scalar Id extends string;

@doc("ISO-8601 timestamp string.")
scalar Timestamp extends string;

@doc("Email address (RFC 5322).")
@format("email")
scalar Email extends string;

@doc("E.164 phone number or empty string when not provided.")
scalar PhoneNumber extends string;

@doc("Country code (ISO 3166-1 alpha-2).")
scalar CountryCode extends string;
