import { sql } from "drizzle-orm";
import {
  boolean,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["USER", "ADMIN", "PARTNER"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "ACTIVE",
  "PAUSED",
  "CANCELLED_PENDING",
  "INACTIVE",
  "PAST_DUE",
  "UNPAID",
]);
export const newsletterStatusEnum = pgEnum("newsletter_status", [
  "NONE",
  "PENDING",
  "CONFIRMED",
  "UNSUBSCRIBED",
]);
export const paymentMethodEnum = pgEnum("payment_method", [
  "CARD",
  "PAYPAL",
  "SEPA",
]);
export const ageGroupEnum = pgEnum("age_group", [
  "18-25",
  "26-35",
  "36-50",
  "50+",
]);
export const languageEnum = pgEnum("language", ["DE", "EN"]);
export const bookingStatusEnum = pgEnum("booking_status", [
  "CONFIRMED",
  "WAITLIST",
  "CANCELLED",
  "USED",
]);
export const waitlistStatusEnum = pgEnum("waitlist_status", [
  "WAITING",
  "PROMOTED",
  "CANCELLED",
]);
export const ticketTypeEnum = pgEnum("ticket_type", ["VOUCHER", "SECRET_CODE"]);
export const secretCodeModeEnum = pgEnum("secret_code_mode", [
  "MANUAL",
  "SHARED_GENERATED",
  "UNIQUE_PER_BOOKING",
]);
export const timingModeEnum = pgEnum("timing_mode", ["TIME_SLOT", "ALL_DAY"]);
export const ledgerTypeEnum = pgEnum("ledger_type", [
  "SUBSCRIPTION_REFILL",
  "PURCHASE",
  "BOOKING",
  "EXPIRY",
  "REFUND",
  "ADMIN_ADJUST",
  "REFERRAL_BONUS",
]);

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_user_id_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [index("account_user_id_idx").on(table.userId)],
);

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const partners = pgTable(
  "partners",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    address: text("address").notNull(),
    contactEmail: text("contact_email").notNull(),
    logoUrl: text("logo_url"),
    venueCheckInToken: text("venue_check_in_token"),
    portalUserId: text("portal_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    portalUserEmail: text("portal_user_email"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("partners_venue_check_in_token_unique").on(
      table.venueCheckInToken,
    ),
    index("partners_portal_user_id_idx").on(table.portalUserId),
    index("partners_contact_email_idx").on(table.contactEmail),
  ],
);

export const userProfiles = pgTable(
  "user_profiles",
  {
    userId: text("user_id")
      .primaryKey()
      .references(() => user.id, { onDelete: "cascade" }),
    role: roleEnum("role").notNull().default("USER"),
    partnerId: text("partner_id").references(() => partners.id, {
      onDelete: "set null",
    }),
    credits: integer("credits").notNull().default(0),
    firstName: text("first_name"),
    lastName: text("last_name"),
    language: languageEnum("language").notNull().default("DE"),
    onboardingComplete: boolean("onboarding_complete").notNull().default(false),
    subscriptionStatus: subscriptionStatusEnum("subscription_status")
      .notNull()
      .default("INACTIVE"),
    subscriptionPlan: text("subscription_plan")
      .notNull()
      .default("BASIC_BERLIN"),
    subscriptionPeriodEnd: timestamp("subscription_period_end"),
    stripeCustomerId: text("stripe_customer_id"),
    stripeSubscriptionId: text("stripe_subscription_id"),
    paymentMethod: paymentMethodEnum("payment_method"),
    billingAddress: text("billing_address"),
    newsletterOptIn: boolean("newsletter_opt_in").notNull().default(false),
    newsletterStatus: newsletterStatusEnum("newsletter_status")
      .notNull()
      .default("NONE"),
    newsletterConfirmedAt: timestamp("newsletter_confirmed_at"),
    newsletterToken: text("newsletter_token"),
    newsletterTokenExpiresAt: timestamp("newsletter_token_expires_at"),
    ageGroup: ageGroupEnum("age_group"),
    interests: jsonb("interests")
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    moods: jsonb("moods").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    districts: jsonb("districts")
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    maxDistance: integer("max_distance").notNull().default(0),
    timing: jsonb("timing")
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    preferredDays: jsonb("preferred_days")
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    preferredLanguages: jsonb("preferred_languages")
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    accessibility: boolean("accessibility").notNull().default(false),
    preferencesUpdatedAt: timestamp("preferences_updated_at"),
    sessionCount: integer("session_count").notNull().default(0),
    eventOpenCount: integer("event_open_count").notNull().default(0),
    bookingCount: integer("booking_count").notNull().default(0),
    waitlistCount: integer("waitlist_count").notNull().default(0),
    savedCount: integer("saved_count").notNull().default(0),
    unsavedCount: integer("unsaved_count").notNull().default(0),
    filterApplyCount: integer("filter_apply_count").notNull().default(0),
    viewCounts: jsonb("view_counts")
      .$type<Record<string, number>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    recentEventIds: jsonb("recent_event_ids")
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    lastSeenAt: timestamp("last_seen_at"),
    lastView: text("last_view"),
    lastOpenedEventId: text("last_opened_event_id"),
    lastBookedEventId: text("last_booked_event_id"),
    lastWaitlistedEventId: text("last_waitlisted_event_id"),
    lastSavedEventId: text("last_saved_event_id"),
    onboardingCompletedAt: timestamp("onboarding_completed_at"),
    lastFilter: jsonb("last_filter").$type<{
      category?: string;
      partnerId?: string;
      startDate?: string;
      endDate?: string;
      resultCount?: number;
      appliedAt?: string;
    }>(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("user_profiles_role_idx").on(table.role),
    index("user_profiles_partner_id_idx").on(table.partnerId),
    index("user_profiles_subscription_status_idx").on(table.subscriptionStatus),
  ],
);

export const events = pgTable(
  "events",
  {
    id: text("id").primaryKey(),
    partnerId: text("partner_id")
      .notNull()
      .references(() => partners.id, { onDelete: "restrict" }),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    category: text("category").notNull(),
    eventType: text("event_type").notNull(),
    dateTime: timestamp("date_time").notNull(),
    timingMode: timingModeEnum("timing_mode").notNull().default("TIME_SLOT"),
    startTimeMinutes: integer("start_time_minutes").notNull().default(0),
    weekday: integer("weekday").notNull().default(0),
    address: text("address").notNull(),
    neighborhood: text("neighborhood").notNull(),
    lat: doublePrecision("lat"),
    lng: doublePrecision("lng"),
    imageUrl: text("image_url").notNull().default(""),
    tags: jsonb("tags").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    creditPrice: integer("credit_price").notNull().default(0),
    totalCapacity: integer("total_capacity").notNull().default(0),
    remainingCapacity: integer("remaining_capacity").notNull().default(0),
    ticketType: ticketTypeEnum("ticket_type").notNull().default("SECRET_CODE"),
    voucherTemplate: text("voucher_template"),
    secretCodeRules: text("secret_code_rules"),
    secretCode: text("secret_code"),
    secretCodeMode: secretCodeModeEnum("secret_code_mode"),
    promoCode: text("promo_code"),
    eventWebsiteUrl: text("event_website_url"),
    barrierFree: boolean("barrier_free").notNull().default(false),
    languages: jsonb("languages")
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    targetAgeGroups: jsonb("target_age_groups")
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("events_date_time_idx").on(table.dateTime),
    index("events_date_time_partner_id_idx").on(
      table.dateTime,
      table.partnerId,
    ),
    index("events_date_time_category_idx").on(table.dateTime, table.category),
    index("events_partner_id_idx").on(table.partnerId),
    index("events_category_idx").on(table.category),
    index("events_event_type_idx").on(table.eventType),
  ],
);

export const bookings = pgTable(
  "bookings",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    eventId: text("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "restrict" }),
    partnerId: text("partner_id")
      .notNull()
      .references(() => partners.id, { onDelete: "restrict" }),
    ticketsCount: integer("tickets_count").notNull().default(1),
    totalCredits: integer("total_credits").notNull().default(0),
    status: bookingStatusEnum("status").notNull().default("CONFIRMED"),
    redemptionType: ticketTypeEnum("redemption_type"),
    redemptionInfo: text("redemption_info"),
    redemptionUrl: text("redemption_url"),
    idempotencyKey: text("idempotency_key"),
    checkedInAt: timestamp("checked_in_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("bookings_user_id_created_at_idx").on(table.userId, table.createdAt),
    index("bookings_partner_id_created_at_idx").on(
      table.partnerId,
      table.createdAt,
    ),
    index("bookings_partner_id_status_idx").on(table.partnerId, table.status),
    index("bookings_event_id_idx").on(table.eventId),
    uniqueIndex("bookings_user_id_idempotency_key_unique").on(
      table.userId,
      table.idempotencyKey,
    ),
  ],
);

export const waitlistEntries = pgTable(
  "waitlist_entries",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    requestedQty: integer("requested_qty").notNull().default(1),
    status: waitlistStatusEnum("status").notNull().default("WAITING"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("waitlist_entries_event_id_created_at_idx").on(
      table.eventId,
      table.createdAt,
    ),
    index("waitlist_entries_user_id_created_at_idx").on(
      table.userId,
      table.createdAt,
    ),
  ],
);

export const creditLedgerEntries = pgTable(
  "credit_ledger_entries",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    amount: integer("amount").notNull(),
    balanceAfter: integer("balance_after").notNull(),
    type: ledgerTypeEnum("type").notNull(),
    description: text("description").notNull(),
    idempotencyKey: text("idempotency_key"),
    timestamp: timestamp("timestamp").notNull().defaultNow(),
  },
  (table) => [
    index("credit_ledger_entries_user_id_timestamp_idx").on(
      table.userId,
      table.timestamp,
    ),
    uniqueIndex("credit_ledger_entries_user_id_idempotency_key_unique").on(
      table.userId,
      table.idempotencyKey,
    ),
  ],
);

export const savedEvents = pgTable(
  "saved_events",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    eventId: text("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.eventId] }),
    index("saved_events_user_id_created_at_idx").on(
      table.userId,
      table.createdAt,
    ),
    index("saved_events_event_id_idx").on(table.eventId),
  ],
);
