import type { QueryInvalidationKey } from "@/lib/forms/action-result";

export const queryKeys = {
  authViewer: ["auth", "viewer"] as const,
  profile: (userId?: string) => ["profile", userId ?? "current"] as const,
  preferences: (userId?: string) =>
    ["preferences", userId ?? "current"] as const,
  events: ["events"] as const,
  event: (eventId: string) => ["events", eventId] as const,
  partners: ["partners"] as const,
  partner: (partnerId: string) => ["partners", partnerId] as const,
  bookings: ["bookings"] as const,
  booking: (bookingId: string) => ["bookings", bookingId] as const,
  adminMembers: ["admin", "members"] as const,
  checkIns: (partnerId?: string) => ["check-ins", partnerId ?? "all"] as const,
} satisfies Record<
  string,
  QueryInvalidationKey | ((...args: never[]) => QueryInvalidationKey)
>;

export type QueryKeyFactory = typeof queryKeys;
