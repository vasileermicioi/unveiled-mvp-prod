import "@typespec/http";
import "@typespec/json-schema";

using TypeSpec.Http;
using TypeSpec.JsonSchema;
using Unveiled.Api.Common;
using Unveiled.Api.Member;
using Unveiled.Api.Admin;
using Unveiled.Api.Auth;

@jsonSchema
namespace Unveiled.Api.Surfaces;

@doc("Closed union of registered data-access surfaces (one per loader in `src/lib/data-access/loaders.ts`).")
union Surface {
  @doc("Public discovery surface (anonymous).")
  publicDiscovery: PublicDiscoveryInput,
  @doc("Member home surface (requires authenticated member).")
  member: MemberInput,
  @doc("Partner portal surface (requires partner role).")
  partner: PartnerInput,
  @doc("Admin operations surface (requires admin role).")
  admin: AdminInput,
}

@doc("Public discovery surface input.")
model PublicDiscoveryInput {
  @doc("Search query string.")
  q?: string;

  @doc("Category filter.")
  category?: string;

  @doc("District filter.")
  district?: string;

  @doc("Date filter (ISO-8601).")
  date?: string;

  @doc("Page number (1-indexed).")
  @minValue(1)
  page?: int32 = 1;

  @doc("Page size (1..48, default 6).")
  @minValue(1)
  @maxValue(48)
  pageSize?: int32 = 6;
}

@doc("Member surface input.")
model MemberInput {
  page?: int32;
  pageSize?: int32;
}

@doc("Partner surface input.")
model PartnerInput {
  partnerId: Id;
}

@doc("Admin surface input.")
model AdminInput {
  membersPage?: int32;
  membersPageSize?: int32;
  partnersPage?: int32;
  partnersPageSize?: int32;
  eventsPage?: int32;
  eventsPageSize?: int32;
}

@route("/surface")
namespace SurfaceRoutes {
  @route("/public-discovery")
  @post
  op publicDiscovery(@body input: PublicDiscoveryInput): PublicDiscoverySurface;

  @route("/member")
  @post
  op member(@body input: MemberInput): MemberSurface;

  @route("/partner")
  @post
  op partner(@body input: PartnerInput): PartnerSurface;

  @route("/admin")
  @post
  op admin(@body input: AdminInput): AdminSurface;
}
