import "@typespec/http";
import "@typespec/openapi3";
import "@typespec/json-schema";

using TypeSpec.Http;
using TypeSpec.JsonSchema;
using Unveiled.Api.Common;

@jsonSchema
namespace Unveiled.Api.Admin;

@doc("Partner record exposed over the wire.")
model Partner {
  id: Id;
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
  venueToken?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

@doc("Event record exposed over the wire.")
model Event {
  id: Id;
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
  remainingCapacity: int32;
  partnerId?: Id;
  partnerName?: string;
  ageGroups: string[];
  languages: string[];
  promoCode?: string;
  secretCode?: string;
  secretCodeMode?: "PASSWORD" | "CODE";
  eventWebsiteUrl?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

@doc("Asset upload success result.")
model AssetUploadResult {
  @doc("Public URL of the stored asset.")
  url: string;

  @doc("Object key inside the R2 bucket.")
  key: string;

  @doc("Asset kind discriminator.")
  kind: AssetKind;

  @doc("Byte size of the uploaded object.")
  size: int64;

  @doc("Validated content type.")
  contentType: string;
}

@doc("Admin error envelope.")
@error
model AdminError {
  message: string;
  fieldErrors?: Record<string>;
}

@route("/admin")
namespace AdminRoutes {
  @route("/assets/upload")
  @post
  op uploadAsset(
    @header contentType: string,
    @body body: bytes,
  ): AssetUploadResult | AdminError;
}
