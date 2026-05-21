import { eq, sql } from "drizzle-orm";
import { type Db, db } from "@/db/client";
import { userProfiles } from "@/db/schema";

export async function trackEventOpenInDb(
  userId: string,
  eventId: string,
  viewName: string,
  database: Db = db,
) {
  return database.transaction(async (tx) => {
    const profile = await tx.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, userId),
    });
    if (!profile) return;

    const viewCounts = profile.viewCounts || {};
    const nextCount = (viewCounts[eventId] || 0) + 1;
    const nextViewCounts = { ...viewCounts, [eventId]: nextCount };

    const recent = profile.recentEventIds || [];
    const filteredRecent = recent.filter((id) => id !== eventId);
    const nextRecent = [eventId, ...filteredRecent].slice(0, 5);

    await tx
      .update(userProfiles)
      .set({
        eventOpenCount: sql`${userProfiles.eventOpenCount} + 1`,
        viewCounts: nextViewCounts,
        lastOpenedEventId: eventId,
        recentEventIds: nextRecent,
        lastSeenAt: new Date(),
        lastView: viewName,
        updatedAt: new Date(),
      })
      .where(eq(userProfiles.userId, userId));
  });
}

export async function trackFilterApplyInDb(
  userId: string,
  filters: {
    category?: string;
    partnerId?: string;
    startDate?: string;
    endDate?: string;
    resultCount?: number;
    appliedAt?: string;
  },
  viewName: string,
  database: Db = db,
) {
  await database
    .update(userProfiles)
    .set({
      filterApplyCount: sql`${userProfiles.filterApplyCount} + 1`,
      lastFilter: {
        ...filters,
        appliedAt: filters.appliedAt || new Date().toISOString(),
      },
      lastSeenAt: new Date(),
      lastView: viewName,
      updatedAt: new Date(),
    })
    .where(eq(userProfiles.userId, userId));
}

export async function trackSessionInDb(userId: string, database: Db = db) {
  const profile = await database.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, userId),
  });
  if (!profile) return;

  const now = new Date();
  const lastSeen = profile.lastSeenAt;
  const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);

  if (!lastSeen || lastSeen < fifteenMinutesAgo) {
    await database
      .update(userProfiles)
      .set({
        sessionCount: sql`${userProfiles.sessionCount} + 1`,
        lastSeenAt: now,
        updatedAt: now,
      })
      .where(eq(userProfiles.userId, userId));
  }
}
