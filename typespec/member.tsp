import "@typespec/http";
import "@typespec/json-schema";

using TypeSpec.Http;
using TypeSpec.JsonSchema;
using Unveiled.Api.Common;
using Unveiled.Api.Auth;
using Unveiled.Api.Admin;

@jsonSchema
namespace Unveiled.Api.Member;

@doc("Booking record exposed over the wire.")
model Booking {
  id: Id;
  userId: Id;
  eventId: Id;
  eventTitle: string;
  eventStartAt: Timestamp;
  eventAddress?: string;
  ticketQuantity: int32;
  status: BookingState;
  redemptionCode?: string;
  redemptionUrl?: string;
  checkedInAt?: Timestamp;
  createdAt: Timestamp;
  creditsSpent: int32;
}

@doc("Waitlist entry exposed over the wire.")
model WaitlistEntry {
  id: Id;
  userId: Id;
  eventId: Id;
  eventTitle: string;
  eventStartAt: Timestamp;
  ticketQuantity: int32;
  status: WaitlistStatus;
  createdAt: Timestamp;
}

@doc("Saved event reference.")
model SavedEvent {
  userId: Id;
  eventId: Id;
  eventTitle: string;
  savedAt: Timestamp;
}

@doc("Credit ledger entry.")
model CreditLedgerEntry {
  id: Id;
  userId: Id;
  amount: int32;
  type: CreditLedgerEntryType;
  description?: string;
  balanceAfter: int32;
  relatedEventId?: Id;
  relatedBookingId?: Id;
  createdAt: Timestamp;
}

@doc("Public discovery surface result.")
model PublicDiscoverySurface {
  events: Event[];
  categories: string[];
  districts: string[];
  languages: string[];
  totalCount: int64;
  hasMore: boolean;
}

@doc("Member surface result.")
model MemberSurface {
  user: User;
  profile: Profile;
  bookings: Booking[];
  waitlist: WaitlistEntry[];
  savedEvents: SavedEvent[];
  ledger: CreditLedgerEntry[];
}

@doc("Partner surface result.")
model PartnerSurface {
  partner: Unveiled.Api.Admin.Partner;
  events: Unveiled.Api.Admin.Event[];
  guestList: Booking[];
  qrPath: string;
  qrTokenStatus: string;
  exportAvailable: boolean;
}

@doc("Admin surface result.")
model AdminSurface {
  events: Unveiled.Api.Admin.Event[];
  partners: Unveiled.Api.Admin.Partner[];
  members: User[];
  dashboardCounts: {
    bookings: int32;
    waitlist: int32;
    saved: int32;
    activeMembers: int32;
  };
}

@route("/data-access")
namespace DataAccessRoutes {
  @route("/{surface}.json")
  @get
  op querySurface(
    @path surface: string,
    @query page?: int32,
    @query pageSize?: int32,
  ): unknown;
}
