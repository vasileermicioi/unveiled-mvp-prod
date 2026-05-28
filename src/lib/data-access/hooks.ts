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
      }>("public-discovery", { filters }),
    staleTime: queryStaleTimes.discovery,
    ...options,
  });
}

export function useMemberDataQuery(
  userId: string,
  filters?: DiscoveryFilters,
  options: Partial<UseQueryOptions<MemberData>> = {},
) {
  return useQuery({
    queryKey: dataQueryKeys.memberDiscovery(userId, filters),
    queryFn: () =>
      fetchDataAccessSurface<{ surface: "member"; data: MemberData }>(
        "member",
        { filters },
      ),
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
  filters?: DiscoveryFilters & {
    membersPage?: string;
    membersPageSize?: string;
    partnersPage?: string;
    partnersPageSize?: string;
    eventsPage?: string;
    eventsPageSize?: string;
  },
  options: Partial<UseQueryOptions<AdminData>> = {},
) {
  return useQuery({
    queryKey: [...dataQueryKeys.adminDashboard, filters],
    queryFn: () =>
      fetchDataAccessSurface<{ surface: "admin"; data: AdminData }>("admin", {
        filters,
      }),
    staleTime: queryStaleTimes.admin,
    ...options,
  });
}
