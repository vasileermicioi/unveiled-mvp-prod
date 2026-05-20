import { count, eq } from "drizzle-orm";

import { type Db, db } from "@/db/client";
import { savedEvents, userProfiles } from "@/db/schema";
import { auth } from "@/lib/auth";

export type DomainRole = "USER" | "ADMIN" | "PARTNER";
export type DomainLanguage = "DE" | "EN";
export type SubscriptionStatus =
  | "ACTIVE"
  | "PAUSED"
  | "CANCELLED_PENDING"
  | "INACTIVE"
  | "INCOMPLETE"
  | "ACTION_REQUIRED"
  | "PAST_DUE"
  | "UNPAID"
  | "ADMIN_FROZEN";

type BetterAuthSession = typeof auth.$Infer.Session;
type BetterAuthUser = BetterAuthSession["user"];

export type AuthFailureCode =
  | "unauthenticated"
  | "forbidden"
  | "profile_missing";

export type AuthFailure = {
  code: AuthFailureCode;
  status: 401 | 403 | 409;
  message: string;
};

export class AuthAccessError extends Error {
  readonly code: AuthFailureCode;
  readonly status: 401 | 403 | 409;

  constructor(failure: AuthFailure) {
    super(failure.message);
    this.name = "AuthAccessError";
    this.code = failure.code;
    this.status = failure.status;
  }
}

export type GuestViewer = {
  kind: "guest";
  viewerContext: "guest";
  language: DomainLanguage;
};

export type AuthenticatedViewer = {
  kind: "authenticated";
  viewerContext: "member" | "partner" | "admin";
  user: {
    id: string;
    email: string;
    name: string;
    emailVerified: boolean;
    image?: string | null;
  };
  role: DomainRole;
  partnerId: string | null;
  language: DomainLanguage;
  credits: number;
  subscriptionStatus: SubscriptionStatus;
  subscriptionPlan: string;
  onboardingComplete: boolean;
  savedCount: number;
  firstName: string | null;
  lastName: string | null;
  showProfile: boolean;
  showLogout: true;
};

export type Viewer = GuestViewer | AuthenticatedViewer;

export type CreateDefaultProfileInput = {
  userId: string;
  firstName?: string | null;
  lastName?: string | null;
  language?: DomainLanguage;
  credits?: number;
};

const defaultProfileValues = {
  role: "USER" as const,
  credits: 0,
  language: "DE" as const,
  subscriptionStatus: "INACTIVE" as const,
  subscriptionPlan: "BASIC_BERLIN",
  onboardingComplete: false,
};

function getHeaders(input: Request | Headers): Headers {
  return input instanceof Request ? input.headers : input;
}

function roleToViewerContext(
  role: DomainRole,
): AuthenticatedViewer["viewerContext"] {
  if (role === "ADMIN") return "admin";
  if (role === "PARTNER") return "partner";
  return "member";
}

export function authFailure(code: AuthFailureCode): AuthFailure {
  if (code === "unauthenticated") {
    return {
      code,
      status: 401,
      message: "Authentication required.",
    };
  }

  if (code === "profile_missing") {
    return {
      code,
      status: 409,
      message: "Account profile is not ready.",
    };
  }

  return {
    code,
    status: 403,
    message: "You do not have access to this resource.",
  };
}

export function toAuthResponse(failure: AuthFailure): Response {
  return Response.json(
    {
      ok: false,
      error: failure.code,
      message: failure.message,
    },
    { status: failure.status },
  );
}

export async function createDefaultUserProfile(
  input: CreateDefaultProfileInput,
  database: Db = db,
) {
  const existing = await database.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, input.userId),
  });

  if (existing) return existing;

  await database
    .insert(userProfiles)
    .values({
      userId: input.userId,
      role: defaultProfileValues.role,
      credits: input.credits ?? defaultProfileValues.credits,
      firstName: input.firstName?.trim() || null,
      lastName: input.lastName?.trim() || null,
      language: input.language ?? defaultProfileValues.language,
      onboardingComplete: defaultProfileValues.onboardingComplete,
      subscriptionStatus: defaultProfileValues.subscriptionStatus,
      subscriptionPlan: defaultProfileValues.subscriptionPlan,
    })
    .onConflictDoNothing({ target: userProfiles.userId });

  const profile = await database.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, input.userId),
  });

  if (!profile) {
    throw new AuthAccessError(authFailure("profile_missing"));
  }

  return profile;
}

async function getSavedCount(userId: string, database: Db) {
  const [row] = await database
    .select({ value: count() })
    .from(savedEvents)
    .where(eq(savedEvents.userId, userId));

  return row?.value ?? 0;
}

function defaultNamesFromUser(user: BetterAuthUser) {
  const [firstName, ...lastNameParts] = user.name.trim().split(/\s+/);

  return {
    firstName: firstName || null,
    lastName: lastNameParts.join(" ") || null,
  };
}

export async function getViewer(
  input: Request | Headers,
  options: {
    database?: Db;
    repairMissingProfile?: boolean;
    guestLanguage?: DomainLanguage;
  } = {},
): Promise<Viewer> {
  const database = options.database ?? db;
  const session = await auth.api.getSession({
    headers: getHeaders(input),
  });

  if (!session) {
    const cookies = getHeaders(input).get("cookie");
    const langMatch = cookies?.match(/unveiled_lang=(DE|EN)/);
    const language =
      (langMatch?.[1] as DomainLanguage) ??
      options.guestLanguage ??
      defaultProfileValues.language;

    return {
      kind: "guest",
      viewerContext: "guest",
      language,
    };
  }

  let profile = await database.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, session.user.id),
  });

  if (!profile && options.repairMissingProfile !== false) {
    profile = await createDefaultUserProfile(
      {
        userId: session.user.id,
        ...defaultNamesFromUser(session.user),
      },
      database,
    );
  }

  if (!profile) {
    throw new AuthAccessError(authFailure("profile_missing"));
  }

  const role = profile.role as DomainRole;

  return {
    kind: "authenticated",
    viewerContext: roleToViewerContext(role),
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      emailVerified: session.user.emailVerified,
      image: session.user.image,
    },
    role,
    partnerId: profile.partnerId,
    language: profile.language as DomainLanguage,
    credits: profile.credits,
    subscriptionStatus: profile.subscriptionStatus,
    subscriptionPlan: profile.subscriptionPlan,
    onboardingComplete: profile.onboardingComplete,
    savedCount: await getSavedCount(session.user.id, database),
    firstName: profile.firstName,
    lastName: profile.lastName,
    showProfile: role === "USER",
    showLogout: true,
  };
}

export function getAuthRedirectPath(
  viewer: AuthenticatedViewer,
  callbackURL?: string | null,
) {
  // 1. Context-aware continuation (e.g., venue QR check-in)
  if (
    callbackURL &&
    !callbackURL.startsWith("/login") &&
    !callbackURL.startsWith("/signup") &&
    callbackURL !== "/"
  ) {
    return callbackURL;
  }

  // 2. Onboarding enforcement for members
  if (viewer.role === "USER" && !viewer.onboardingComplete) {
    return "/onboarding";
  }

  // 3. Role-based product surface
  if (viewer.role === "ADMIN") return "/admin";
  if (viewer.role === "PARTNER") return "/partner";
  return "/app";
}

async function resolveViewer(input: Viewer | Request | Headers) {
  if ("kind" in input) return input;
  return getViewer(input);
}

export async function requireUser(
  input: Viewer | Request | Headers,
): Promise<AuthenticatedViewer> {
  const viewer = await resolveViewer(input);

  if (viewer.kind === "guest") {
    throw new AuthAccessError(authFailure("unauthenticated"));
  }

  return viewer;
}

export async function requireMember(
  input: Viewer | Request | Headers,
): Promise<AuthenticatedViewer> {
  const viewer = await requireUser(input);

  if (viewer.role !== "USER") {
    throw new AuthAccessError(authFailure("forbidden"));
  }

  return viewer;
}

export async function requireAdmin(
  input: Viewer | Request | Headers,
): Promise<AuthenticatedViewer> {
  const viewer = await requireUser(input);

  if (viewer.role !== "ADMIN") {
    throw new AuthAccessError(authFailure("forbidden"));
  }

  return viewer;
}

export async function requirePartnerForResource(
  input: Viewer | Request | Headers,
  resourcePartnerId: string,
): Promise<AuthenticatedViewer> {
  const viewer = await requireUser(input);

  if (viewer.role === "ADMIN") return viewer;

  if (viewer.role === "PARTNER" && viewer.partnerId === resourcePartnerId) {
    return viewer;
  }

  throw new AuthAccessError(authFailure("forbidden"));
}

export async function requireOwnerOrAdmin(
  input: Viewer | Request | Headers,
  ownerUserId: string,
): Promise<AuthenticatedViewer> {
  const viewer = await requireUser(input);

  if (viewer.role === "ADMIN" || viewer.user.id === ownerUserId) {
    return viewer;
  }

  throw new AuthAccessError(authFailure("forbidden"));
}
