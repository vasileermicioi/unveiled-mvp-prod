import "@typespec/http";
import "@typespec/json-schema";

using TypeSpec.Http;
using TypeSpec.JsonSchema;
using Unveiled.Api.Common;
using Unveiled.Api.Auth;
using Unveiled.Api.Member;
using Unveiled.Api.Admin;

@jsonSchema
namespace Unveiled.Api.Partner;

@doc("Guest row for the partner portal guest list.")
model PartnerGuestRow {
  bookingId: Id;
  guestShortId: string;
  userShortId: string;
  eventTitle: string;
  redemptionCode?: string;
  status: BookingState;
  ticketQuantity: int32;
  createdAt: Timestamp;
  checkedInAt?: Timestamp;
  checkInAvailable: boolean;
}

@doc("Partner portal home data.")
model PartnerPortal {
  partner: Unveiled.Api.Admin.Partner;
  events: Unveiled.Api.Admin.Event[];
  guestList: PartnerGuestRow[];
  qrPath: string;
  venueToken: string;
  aggregateGuests: int32;
  exportAvailable: boolean;
}

@doc("Partner check-in request.")
model PartnerCheckInRequest {
  @doc("Booking id to check in.")
  bookingId: Id;
}

@doc("Partner check-in result.")
model PartnerCheckInResult {
  @doc("Booking id that was checked in.")
  bookingId: Id;

  @doc("Partner id that owns the check-in.")
  partnerId: Id;

  @doc("Localized success message.")
  message: string;
}

@doc("Venue QR check-in request.")
model VenueQrCheckInRequest {
  partnerId: Id;
  venueToken: string;
}

@doc("Venue QR check-in result.")
model VenueQrCheckInResult {
  bookingId: Id;
  partnerId: Id;
  userId: Id;
  message: string;
}

@doc("Partner export filter input.")
model PartnerExportInput {
  eventId?: Id;
}

@doc("Partner export row.")
model PartnerExportRow {
  bookingId: Id;
  userShortId: string;
  eventTitle: string;
  redemptionCode?: string;
  status: BookingState;
  ticketQuantity: int32;
  createdAt: Timestamp;
  checkedInAt?: Timestamp;
}

@route("/partner")
namespace PartnerRoutes {
  @route("/portal")
  @get
  op getPortal(): PartnerPortal;

  @route("/check-in")
  @post
  op checkIn(@body request: PartnerCheckInRequest): PartnerCheckInResult;

  @route("/venue-qr/check-in")
  @post
  op venueQrCheckIn(@body request: VenueQrCheckInRequest): VenueQrCheckInResult;

  @route("/export/bookings")
  @get
  op exportBookings(@query eventId?: Id): PartnerExportRow[];
}
