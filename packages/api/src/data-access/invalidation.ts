import {
  type DiscoveryFilters,
  dataQueryKeys,
  type QueryKey,
} from "./query-keys";

export type QueryInvalidationHint = {
  queryKey: QueryKey;
  exact?: boolean;
};

export type InvalidationScope =
  | { type: "public-discovery"; filters?: DiscoveryFilters }
  | { type: "event"; eventId: string }
  | { type: "member"; userId: string }
  | { type: "member-bookings"; userId: string }
  | { type: "member-profile"; userId: string }
  | { type: "member-preferences"; userId: string }
  | { type: "partner"; partnerId: string }
  | { type: "partner-guests"; partnerId: string }
  | { type: "partner-exports"; partnerId: string }
  | { type: "admin" }
  | { type: "admin-dashboard" }
  | { type: "admin-events" }
  | { type: "admin-partners" }
  | { type: "admin-members"; userId?: string }
  | { type: "admin-exports" }
  | { type: "booking-eligibility"; userId: string };

export function hint(queryKey: QueryKey, exact = false): QueryInvalidationHint {
  return { queryKey, exact };
}

export function invalidationHintsForScopes(
  scopes: InvalidationScope[],
): QueryInvalidationHint[] {
  const hints: QueryInvalidationHint[] = [];

  for (const scope of scopes) {
    if (scope.type === "public-discovery") {
      hints.push(hint(dataQueryKeys.publicDiscovery(scope.filters)));
    }
    if (scope.type === "event") {
      hints.push(hint(dataQueryKeys.publicDiscovery()));
    }
    if (scope.type === "member") {
      hints.push(
        hint(dataQueryKeys.memberDiscovery(scope.userId)),
        hint(dataQueryKeys.memberSavedEvents(scope.userId)),
        hint(dataQueryKeys.memberBookings(scope.userId)),
        hint(dataQueryKeys.memberProfile(scope.userId)),
        hint(dataQueryKeys.memberWallet(scope.userId)),
        hint(dataQueryKeys.memberPreferences(scope.userId)),
        hint(dataQueryKeys.bookingEligibility(scope.userId)),
      );
    }
    if (scope.type === "member-bookings") {
      hints.push(
        hint(dataQueryKeys.memberBookings(scope.userId)),
        hint(dataQueryKeys.memberWallet(scope.userId)),
        hint(dataQueryKeys.memberDiscovery(scope.userId)),
        hint(dataQueryKeys.bookingEligibility(scope.userId)),
      );
    }
    if (scope.type === "member-profile") {
      hints.push(
        hint(dataQueryKeys.memberProfile(scope.userId)),
        hint(dataQueryKeys.memberWallet(scope.userId)),
      );
    }
    if (scope.type === "member-preferences") {
      hints.push(hint(dataQueryKeys.memberPreferences(scope.userId)));
    }
    if (scope.type === "partner") {
      hints.push(
        hint(dataQueryKeys.partnerPortal(scope.partnerId)),
        hint(dataQueryKeys.partnerGuests(scope.partnerId)),
        hint(dataQueryKeys.partnerExports(scope.partnerId)),
        hint(dataQueryKeys.partnerEvents(scope.partnerId)),
      );
    }
    if (scope.type === "partner-guests") {
      hints.push(
        hint(dataQueryKeys.partnerPortal(scope.partnerId)),
        hint(dataQueryKeys.partnerGuests(scope.partnerId)),
      );
    }
    if (scope.type === "partner-exports") {
      hints.push(hint(dataQueryKeys.partnerExports(scope.partnerId)));
    }
    if (scope.type === "admin") {
      hints.push(
        hint(dataQueryKeys.adminDashboard),
        hint(dataQueryKeys.adminEvents()),
        hint(dataQueryKeys.adminPartners()),
        hint(dataQueryKeys.adminMembers()),
        hint(dataQueryKeys.adminExports),
      );
    }
    if (scope.type === "admin-dashboard") {
      hints.push(hint(dataQueryKeys.adminDashboard));
    }
    if (scope.type === "admin-events") {
      hints.push(hint(dataQueryKeys.adminEvents()));
    }
    if (scope.type === "admin-partners") {
      hints.push(hint(dataQueryKeys.adminPartners()));
    }
    if (scope.type === "admin-members") {
      hints.push(hint(dataQueryKeys.adminMembers()));
      if (scope.userId)
        hints.push(hint(dataQueryKeys.adminMember(scope.userId)));
    }
    if (scope.type === "admin-exports") {
      hints.push(hint(dataQueryKeys.adminExports));
    }
    if (scope.type === "booking-eligibility") {
      hints.push(hint(dataQueryKeys.bookingEligibility(scope.userId)));
    }
  }

  return dedupeHints(hints);
}

export function toQueryKeys(hints: QueryInvalidationHint[]): QueryKey[] {
  return hints.map((item) => item.queryKey);
}

function dedupeHints(hints: QueryInvalidationHint[]) {
  const seen = new Set<string>();
  return hints.filter((item) => {
    const key = JSON.stringify(item.queryKey);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
