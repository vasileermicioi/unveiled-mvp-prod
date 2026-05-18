import type {
  AuthenticatedViewer,
  DomainRole,
  Viewer,
} from "@/lib/auth-profile";

export const parityPassword = "Parity-Regression-2026!";

export const parityFixtureEmails = {
  admin: "parity.admin@example.test",
  partner: "parity.partner@example.test",
  activeMember: "parity.member.active@example.test",
  frozenMember: "parity.member.frozen@example.test",
} as const;

export const parityFixtureIds = {
  partner: "parity-partner-venue",
  users: {
    admin: "parity-user-admin",
    partner: "parity-user-partner",
    activeMember: "parity-user-member-active",
    frozenMember: "parity-user-member-frozen",
  },
  events: {
    public: "parity-event-public",
    secret: "parity-event-secret",
    voucher: "parity-event-voucher",
    soldOut: "parity-event-sold-out",
    checkIn: "parity-event-check-in",
  },
  bookings: {
    used: "parity-booking-used",
    confirmed: "parity-booking-confirmed",
  },
  waitlist: {
    soldOut: "parity-waitlist-sold-out",
  },
  ledger: {
    used: "parity-ledger-used",
    confirmed: "parity-ledger-confirmed",
    adminAdjust: "parity-ledger-admin-adjust",
  },
  subscriptions: {
    activeMember: "parity-subscription-active",
    frozenMember: "parity-subscription-frozen",
  },
  overrides: {
    frozenMember: "parity-override-frozen",
  },
} as const;

export const parityDemoOnlyLabels = [
  "Chef Counter Preview",
  "Table 17",
  "Alex Morgan",
  "support@unveiled.example",
  "cus_demo",
  "sub_demo",
] as const;

export type ParitySeedSummary = {
  password: string;
  partnerId: string;
  venueToken: string;
  users: {
    admin: { id: string; email: string };
    partner: { id: string; email: string };
    activeMember: { id: string; email: string };
    frozenMember: { id: string; email: string };
  };
  events: typeof parityFixtureIds.events;
  bookings: typeof parityFixtureIds.bookings;
  waitlist: typeof parityFixtureIds.waitlist;
};

export function assertNoDemoFixtureLabels(text: string) {
  for (const label of parityDemoOnlyLabels) {
    if (text.includes(label)) {
      throw new Error(`Unexpected demo fixture label found: ${label}`);
    }
  }
}

export function createParityViewer(input: {
  userId: string;
  email: string;
  role: DomainRole;
  partnerId?: string | null;
  firstName?: string;
  lastName?: string;
  credits?: number;
  onboardingComplete?: boolean;
  subscriptionStatus?: AuthenticatedViewer["subscriptionStatus"];
  savedCount?: number;
}): AuthenticatedViewer {
  const firstName = input.firstName ?? "Parity";
  const lastName = input.lastName ?? "User";

  return {
    kind: "authenticated",
    viewerContext:
      input.role === "ADMIN"
        ? "admin"
        : input.role === "PARTNER"
          ? "partner"
          : "member",
    user: {
      id: input.userId,
      email: input.email,
      name: `${firstName} ${lastName}`,
      emailVerified: true,
      image: null,
    },
    role: input.role,
    partnerId: input.partnerId ?? null,
    language: "DE",
    credits: input.credits ?? (input.role === "USER" ? 12 : 0),
    subscriptionStatus: input.subscriptionStatus ?? "ACTIVE",
    subscriptionPlan: "BASIC_BERLIN",
    onboardingComplete: input.onboardingComplete ?? true,
    savedCount: input.savedCount ?? 1,
    firstName,
    lastName,
    showProfile: input.role === "USER",
    showLogout: true,
  };
}

export function createGuestViewer(): Viewer {
  return {
    kind: "guest",
    viewerContext: "guest",
    language: "DE",
  };
}
