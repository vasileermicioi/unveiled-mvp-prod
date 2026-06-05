export type QueryKey = readonly unknown[];

export type DiscoveryFilters = {
  category?: string;
  partnerId?: string;
  startDate?: string;
  endDate?: string;
  savedOnly?: string;
  page?: string;
};

export type AdminFilters = {
  search?: string;
  status?: string;
};

export type NormalizedDiscoveryFilters = Required<
  Omit<DiscoveryFilters, "savedOnly" | "page">
> & {
  savedOnly?: string;
  page?: string;
};

function cleanFilterValue(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

export function normalizeDiscoveryFilters(
  filters: DiscoveryFilters = {},
): NormalizedDiscoveryFilters {
  const normalized: NormalizedDiscoveryFilters = {
    category: cleanFilterValue(filters.category) ?? "all",
    partnerId: cleanFilterValue(filters.partnerId) ?? "all",
    startDate: cleanFilterValue(filters.startDate) ?? "any",
    endDate: cleanFilterValue(filters.endDate) ?? "any",
  };
  if (cleanFilterValue(filters.savedOnly)) {
    normalized.savedOnly = cleanFilterValue(filters.savedOnly);
  }
  if (cleanFilterValue(filters.page)) {
    normalized.page = cleanFilterValue(filters.page);
  }
  return normalized;
}

export function normalizeAdminFilters(
  filters: AdminFilters = {},
): Required<AdminFilters> {
  return {
    search: cleanFilterValue(filters.search) ?? "all",
    status: cleanFilterValue(filters.status) ?? "all",
  };
}

export const dataQueryKeys = {
  publicDiscovery: (filters?: DiscoveryFilters) =>
    [
      "data-access",
      "public",
      "discovery",
      normalizeDiscoveryFilters(filters),
    ] as const,
  publicPartners: ["data-access", "public", "partners"] as const,
  publicStats: ["data-access", "public", "stats"] as const,
  memberDiscovery: (userId: string, filters?: DiscoveryFilters) =>
    [
      "data-access",
      "member",
      userId,
      "discovery",
      normalizeDiscoveryFilters(filters),
    ] as const,
  memberSavedEvents: (userId: string) =>
    ["data-access", "member", userId, "saved-events"] as const,
  memberBookings: (userId: string) =>
    ["data-access", "member", userId, "bookings"] as const,
  memberProfile: (userId: string) =>
    ["data-access", "member", userId, "profile"] as const,
  memberWallet: (userId: string) =>
    ["data-access", "member", userId, "wallet"] as const,
  memberPreferences: (userId: string) =>
    ["data-access", "member", userId, "preferences"] as const,
  partnerGuests: (partnerId: string) =>
    ["data-access", "partner", partnerId, "guests"] as const,
  partnerExports: (partnerId: string) =>
    ["data-access", "partner", partnerId, "exports"] as const,
  partnerEvents: (partnerId: string) =>
    ["data-access", "partner", partnerId, "events"] as const,
  partnerPortal: (partnerId: string) =>
    ["data-access", "partner", partnerId, "portal"] as const,
  adminDashboard: ["data-access", "admin", "dashboard"] as const,
  adminEvents: (filters?: AdminFilters) =>
    ["data-access", "admin", "events", normalizeAdminFilters(filters)] as const,
  adminPartners: (filters?: AdminFilters) =>
    [
      "data-access",
      "admin",
      "partners",
      normalizeAdminFilters(filters),
    ] as const,
  adminMembers: (filters?: AdminFilters) =>
    [
      "data-access",
      "admin",
      "members",
      normalizeAdminFilters(filters),
    ] as const,
  adminMember: (userId: string) =>
    ["data-access", "admin", "members", userId] as const,
  adminExports: ["data-access", "admin", "exports"] as const,
  bookingEligibility: (userId: string) =>
    ["data-access", "member", userId, "booking-eligibility"] as const,
};

export const queryStaleTimes = {
  publicMetadata: 5 * 60 * 1000,
  discovery: 60 * 1000,
  capacitySensitive: 15 * 1000,
  credits: 10 * 1000,
  bookings: 15 * 1000,
  partnerGuests: 10 * 1000,
  admin: 10 * 1000,
} as const;
