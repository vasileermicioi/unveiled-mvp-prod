import { eq } from "drizzle-orm";

import { db, postgresClient } from "@/db/client";
import { user, userProfiles } from "@/db/schema";
import { signUpWithEmail } from "@/lib/auth-account-actions";
import {
  type AuthenticatedViewer,
  createDefaultUserProfile,
  requireAdmin,
  requireMember,
  requireOwnerOrAdmin,
  requirePartnerForResource,
} from "@/lib/auth-profile";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function mockViewer(
  overrides: Partial<AuthenticatedViewer>,
): AuthenticatedViewer {
  return {
    kind: "authenticated",
    viewerContext: "member",
    user: {
      id: "user-smoke",
      email: "smoke@unveiled.local",
      name: "Smoke User",
      emailVerified: false,
      image: null,
    },
    role: "USER",
    partnerId: null,
    language: "DE",
    credits: 0,
    subscriptionStatus: "INACTIVE",
    subscriptionPlan: "BASIC_BERLIN",
    onboardingComplete: false,
    savedCount: 0,
    firstName: "Smoke",
    lastName: "User",
    showProfile: true,
    showLogout: true,
    ...overrides,
  };
}

async function run() {
  const stamp = Date.now();
  const email = `codex-smoke-${stamp}@unveiled.local`;
  const password = `Smoke-${stamp}`;

  const signup = await signUpWithEmail({
    email,
    password,
    firstName: "Smoke",
    lastName: "Tester",
  });

  assert(signup.ok, `signup should succeed: ${JSON.stringify(signup.state)}`);
  assert(signup.userId, "signup should return user id");

  const createdUser = await db.query.user.findFirst({
    where: eq(user.id, signup.userId),
  });
  const createdProfile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, signup.userId),
  });

  assert(createdUser, "Better Auth user row should exist");
  assert(createdProfile, "domain profile row should exist");
  assert(createdProfile.role === "USER", "profile role should default to USER");
  assert(
    createdProfile.subscriptionStatus === "INACTIVE",
    "profile subscription should default to INACTIVE",
  );

  const idempotentProfile = await createDefaultUserProfile({
    userId: signup.userId,
    firstName: "Changed",
    lastName: "Name",
  });
  assert(
    idempotentProfile.firstName === "Smoke",
    "idempotent profile creation should preserve existing profile",
  );

  await requireMember(mockViewer({}));
  await requireAdmin(mockViewer({ role: "ADMIN", viewerContext: "admin" }));
  await requirePartnerForResource(
    mockViewer({
      role: "PARTNER",
      viewerContext: "partner",
      partnerId: "partner-smoke",
      showProfile: false,
    }),
    "partner-smoke",
  );
  await requireOwnerOrAdmin(mockViewer({}), "user-smoke");

  await postgresClient.end();
}

run().catch(async (error) => {
  console.error(error);
  await postgresClient.end();
  process.exit(1);
});
