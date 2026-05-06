import { type UseQueryOptions, useQuery } from "@tanstack/react-query";

import { fetchDataAccessSurface } from "./fetchers";
import {
  type DiscoveryFilters,
  dataQueryKeys,
  queryStaleTimes,
} from "./query-keys";
import type {
  AdminData,
  MemberData,
  PartnerData,
  PublicDiscoveryData,
} from "./repositories";

export function usePublicDiscoveryQuery(
  filters?: DiscoveryFilters,
  options: Partial<UseQueryOptions<PublicDiscoveryData>> = {},
) {
  return useQuery({
    queryKey: dataQueryKeys.publicDiscovery(filters),
    queryFn: () =>
      fetchDataAccessSurface<{
        surface: "public-discovery";
        data: PublicDiscoveryData;
      }>("public-discovery"),
    staleTime: queryStaleTimes.discovery,
    ...options,
  });
}

export function useMemberDataQuery(
  userId: string,
  options: Partial<UseQueryOptions<MemberData>> = {},
) {
  return useQuery({
    queryKey: dataQueryKeys.memberDiscovery(userId),
    queryFn: () =>
      fetchDataAccessSurface<{ surface: "member"; data: MemberData }>("member"),
    staleTime: queryStaleTimes.capacitySensitive,
    ...options,
  });
}

export function usePartnerDataQuery(
  partnerId: string,
  options: Partial<UseQueryOptions<PartnerData>> = {},
) {
  return useQuery({
    queryKey: dataQueryKeys.partnerPortal(partnerId),
    queryFn: () =>
      fetchDataAccessSurface<{ surface: "partner"; data: PartnerData }>(
        "partner",
      ),
    staleTime: queryStaleTimes.partnerGuests,
    ...options,
  });
}

export function useAdminDataQuery(
  options: Partial<UseQueryOptions<AdminData>> = {},
) {
  return useQuery({
    queryKey: dataQueryKeys.adminDashboard,
    queryFn: () =>
      fetchDataAccessSurface<{ surface: "admin"; data: AdminData }>("admin"),
    staleTime: queryStaleTimes.admin,
    ...options,
  });
}
