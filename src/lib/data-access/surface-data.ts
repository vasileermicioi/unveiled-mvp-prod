import type { Viewer } from "@/lib/auth-profile";
import type { DiscoveryFilters } from "./query-keys";
import type {
  AdminData,
  MemberData,
  PartnerData,
  PublicDiscoveryData,
} from "./repositories";

export type PublicInitialSurfaceData = {
  surface: "public";
  filters?: DiscoveryFilters;
  data: PublicDiscoveryData;
};

export type MemberInitialSurfaceData = {
  surface: "member";
  userId: string;
  filters?: DiscoveryFilters;
  data: MemberData;
};

export type PartnerInitialSurfaceData = {
  surface: "partner";
  partnerId: string;
  data: PartnerData;
};

export type AdminInitialSurfaceData = {
  surface: "admin";
  data: AdminData;
};

export type InitialSurfaceData =
  | PublicInitialSurfaceData
  | MemberInitialSurfaceData
  | PartnerInitialSurfaceData
  | AdminInitialSurfaceData;

export function createPublicInitialSurfaceData(
  data: PublicDiscoveryData,
  filters?: DiscoveryFilters,
): PublicInitialSurfaceData {
  return { surface: "public", filters, data };
}

export function createMemberInitialSurfaceData(
  viewer: Viewer,
  data: MemberData,
  filters?: DiscoveryFilters,
): MemberInitialSurfaceData {
  if (viewer.kind !== "authenticated") {
    throw new Error("Member initial data requires an authenticated viewer.");
  }
  return { surface: "member", userId: viewer.user.id, filters, data };
}

export function createPartnerInitialSurfaceData(
  viewer: Viewer,
  data: PartnerData,
): PartnerInitialSurfaceData {
  if (viewer.kind !== "authenticated" || !viewer.partnerId) {
    throw new Error("Partner initial data requires a partner viewer.");
  }
  return { surface: "partner", partnerId: viewer.partnerId, data };
}

export function createAdminInitialSurfaceData(
  data: AdminData,
): AdminInitialSurfaceData {
  return { surface: "admin", data };
}

export function isInitialSurfaceData(
  value: unknown,
): value is InitialSurfaceData {
  return (
    typeof value === "object" &&
    value !== null &&
    "surface" in value &&
    "data" in value
  );
}
