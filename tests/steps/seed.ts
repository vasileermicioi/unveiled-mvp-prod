/**
 * Single source of truth for fixture data referenced by Gherkin feature
 * files. Feature files MUST import from here instead of hard-coding
 * fixture emails, names, ids, or routes.
 */

export type Role = "Guest" | "Member" | "Partner" | "Admin";

export const seedEmails = {
  Guest: "guest@example.com",
  Member: "member@example.com",
  Partner: "partner@example.com",
  Admin: "admin@example.com",
} as const satisfies Record<Role, string>;

export const seedNames = {
  member: "Marlene Member",
  partner: "Petra Partner",
  admin: "Adrian Admin",
} as const;

export const seedIds = {
  partner: "seed-partner-1",
  event: "seed-event-1",
  member: "seed-member-1",
  booking: "seed-booking-1",
} as const;

export const seedRoutes = {
  public: {
    home: "/en/",
    discover: "/en/discover",
    howItWorks: "/en/how-it-works",
    membership: "/en/membership",
    faq: "/en/faq",
    login: "/en/login",
    signup: "/en/signup",
  },
  member: {
    app: "/en/app",
    saved: "/en/saved",
    bookings: "/en/bookings",
    profile: "/en/profile",
  },
  partner: {
    home: "/en/partner",
    events: "/en/partner/events",
    guests: "/en/partner/guests",
    checkIn: "/en/partner/check-in",
  },
  admin: {
    home: "/en/admin",
    events: "/en/admin/events",
    partners: "/en/admin/partners",
    members: "/en/admin/members",
    exports: "/en/admin/exports",
  },
} as const;

export const seedLanguages = ["de", "en"] as const;
export type SeedLanguage = (typeof seedLanguages)[number];

/**
 * Email resolution for "the user is logged in as <role>".
 * Centralizing here means the feature files reference `seedEmails[role]`
 * rather than typing the email into the step text.
 */
export function emailForRole(role: Role): string {
  return seedEmails[role];
}

/**
 * Idempotent setup hook. The Playwright runner calls this once per
 * scenario (after the role is set, before the first step). In this
 * iteration the hook is a no-op stub — 09-iteration wires it to the
 * real test database seeder.
 */
export async function seed(role: Role): Promise<void> {
  void role;
}
