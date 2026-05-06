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
  init?: RequestInit,
): Promise<T["data"]> {
  const response = await fetch(`/api/data-access/${surface}.json`, init);
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
