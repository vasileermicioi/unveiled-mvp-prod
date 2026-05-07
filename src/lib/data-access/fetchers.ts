import type { DiscoveryFilters } from "./query-keys";
import type {
  AdminData,
  MemberData,
  PartnerData,
  PublicDiscoveryData,
} from "./repositories";

export type DataAccessSurface =
  | "public-discovery"
  | "member"
  | "partner"
  | "admin";

export type DataAccessResponse =
  | { surface: "public-discovery"; data: PublicDiscoveryData }
  | { surface: "member"; data: MemberData }
  | { surface: "partner"; data: PartnerData }
  | { surface: "admin"; data: AdminData };

export async function fetchDataAccessSurface<T extends DataAccessResponse>(
  surface: DataAccessSurface,
  init?: RequestInit & { filters?: DiscoveryFilters },
): Promise<T["data"]> {
  const params = new URLSearchParams();
  if (init?.filters) {
    for (const [key, value] of Object.entries(init.filters)) {
      if (value) params.set(key, value);
    }
  }
  const query = params.toString();
  const response = await fetch(
    `/api/data-access/${surface}.json${query ? `?${query}` : ""}`,
    init,
  );
  if (!response.ok) {
    const fallback =
      response.status === 401
        ? "Authentication required."
        : "Data request failed.";
    const body = await response.json().catch(() => ({ message: fallback }));
    throw new Error(typeof body.message === "string" ? body.message : fallback);
  }

  const payload = (await response.json()) as T;
  return payload.data as T["data"];
}
