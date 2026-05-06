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
  "INCOMPLETE",
  "ACTION_REQUIRED",
  "PAST_DUE",
  "UNPAID",
  "ADMIN_FROZEN",
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
export const billingProviderEnum = pgEnum("billing_provider", ["STRIPE"]);
export const jobSendStatusEnum = pgEnum("job_send_status", [
  "CLAIMED",
  "SENT",
  "FAILED",
  "SKIPPED",
]);
export const billingOverrideTypeEnum = pgEnum("billing_override_type", [
  "FREEZE",
  "UNFREEZE",
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
    adminActorId: text("admin_actor_id").references(() => user.id, {
      onDelete: "set null",
    }),
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
    index("bookings_admin_actor_id_idx").on(table.adminActorId),
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
    uniqueIndex("waitlist_entries_event_id_user_id_unique").on(
      table.eventId,
      table.userId,
    ),
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
    provider: billingProviderEnum("provider"),
    providerInvoiceId: text("provider_invoice_id"),
    providerSubscriptionId: text("provider_subscription_id"),
    providerEventId: text("provider_event_id"),
    refillIdempotencyKey: text("refill_idempotency_key"),
    relatedBookingId: text("related_booking_id").references(() => bookings.id, {
      onDelete: "set null",
    }),
    relatedEventId: text("related_event_id").references(() => events.id, {
      onDelete: "set null",
    }),
    actorUserId: text("actor_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
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
    index("credit_ledger_entries_related_booking_id_idx").on(
      table.relatedBookingId,
    ),
    index("credit_ledger_entries_related_event_id_idx").on(
      table.relatedEventId,
    ),
    index("credit_ledger_entries_actor_user_id_idx").on(table.actorUserId),
    uniqueIndex("credit_ledger_entries_refill_idempotency_key_unique").on(
      table.refillIdempotencyKey,
    ),
    index("credit_ledger_entries_provider_invoice_id_idx").on(
      table.providerInvoiceId,
    ),
    index("credit_ledger_entries_provider_subscription_id_idx").on(
      table.providerSubscriptionId,
    ),
  ],
);

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    provider: billingProviderEnum("provider").notNull().default("STRIPE"),
    providerCustomerId: text("provider_customer_id").notNull(),
    providerSubscriptionId: text("provider_subscription_id").notNull(),
    providerPriceId: text("provider_price_id").notNull(),
    planCode: text("plan_code").notNull().default("BASIC_BERLIN"),
    status: subscriptionStatusEnum("status").notNull().default("INCOMPLETE"),
    providerStatus: text("provider_status").notNull().default("incomplete"),
    billingEmail: text("billing_email"),
    currentPeriodStart: timestamp("current_period_start"),
    currentPeriodEnd: timestamp("current_period_end"),
    cancelAt: timestamp("cancel_at"),
    canceledAt: timestamp("canceled_at"),
    lastInvoiceId: text("last_invoice_id"),
    defaultPaymentMethodId: text("default_payment_method_id"),
    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    lastProviderSyncAt: timestamp("last_provider_sync_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("subscriptions_user_id_idx").on(table.userId),
    uniqueIndex("subscriptions_provider_subscription_id_unique").on(
      table.provider,
      table.providerSubscriptionId,
    ),
    index("subscriptions_provider_customer_id_idx").on(
      table.provider,
      table.providerCustomerId,
    ),
    index("subscriptions_status_idx").on(table.status),
  ],
);

export const providerEvents = pgTable(
  "provider_events",
  {
    id: text("id").primaryKey(),
    provider: billingProviderEnum("provider").notNull().default("STRIPE"),
    providerEventId: text("provider_event_id").notNull(),
    eventType: text("event_type").notNull(),
    providerCreatedAt: timestamp("provider_created_at"),
    processedAt: timestamp("processed_at"),
    processingStatus: text("processing_status").notNull().default("received"),
    errorMessage: text("error_message"),
    payload: jsonb("payload").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("provider_events_provider_event_id_unique").on(
      table.provider,
      table.providerEventId,
    ),
    index("provider_events_event_type_idx").on(table.eventType),
    index("provider_events_processing_status_idx").on(table.processingStatus),
  ],
);

export const jobSendLogs = pgTable(
  "job_send_logs",
  {
    id: text("id").primaryKey(),
    jobName: text("job_name").notNull(),
    partnerId: text("partner_id").references(() => partners.id, {
      onDelete: "set null",
    }),
    windowStart: timestamp("window_start").notNull(),
    windowEnd: timestamp("window_end").notNull(),
    status: jobSendStatusEnum("status").notNull().default("CLAIMED"),
    provider: text("provider"),
    providerMessageId: text("provider_message_id"),
    safeError: text("safe_error"),
    details: jsonb("details")
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    claimedAt: timestamp("claimed_at").notNull().defaultNow(),
    sentAt: timestamp("sent_at"),
    failedAt: timestamp("failed_at"),
    skippedAt: timestamp("skipped_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("job_send_logs_job_partner_window_unique").on(
      table.jobName,
      table.partnerId,
      table.windowStart,
      table.windowEnd,
    ),
    index("job_send_logs_job_status_idx").on(table.jobName, table.status),
    index("job_send_logs_partner_id_idx").on(table.partnerId),
    index("job_send_logs_window_start_idx").on(table.windowStart),
  ],
);

export const paymentMethods = pgTable(
  "payment_methods",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    subscriptionId: text("subscription_id").references(() => subscriptions.id, {
      onDelete: "set null",
    }),
    provider: billingProviderEnum("provider").notNull().default("STRIPE"),
    providerPaymentMethodId: text("provider_payment_method_id").notNull(),
    type: paymentMethodEnum("type").notNull(),
    brand: text("brand"),
    last4: text("last4"),
    expMonth: integer("exp_month"),
    expYear: integer("exp_year"),
    bankName: text("bank_name"),
    walletType: text("wallet_type"),
    displayLabel: text("display_label").notNull(),
    isDefault: boolean("is_default").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("payment_methods_user_id_idx").on(table.userId),
    uniqueIndex("payment_methods_provider_payment_method_unique").on(
      table.provider,
      table.providerPaymentMethodId,
    ),
    index("payment_methods_subscription_id_idx").on(table.subscriptionId),
  ],
);

export const billingAddresses = pgTable(
  "billing_addresses",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    provider: billingProviderEnum("provider").notNull().default("STRIPE"),
    providerCustomerId: text("provider_customer_id").notNull(),
    name: text("name"),
    country: text("country"),
    postalCode: text("postal_code"),
    city: text("city"),
    line1: text("line_1"),
    line2: text("line_2"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("billing_addresses_user_id_idx").on(table.userId),
    uniqueIndex("billing_addresses_provider_customer_unique").on(
      table.provider,
      table.providerCustomerId,
    ),
  ],
);

export const billingAdminOverrides = pgTable(
  "billing_admin_overrides",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    actorUserId: text("actor_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    type: billingOverrideTypeEnum("type").notNull(),
    reason: text("reason").notNull(),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    clearedAt: timestamp("cleared_at"),
  },
  (table) => [
    index("billing_admin_overrides_user_id_active_idx").on(
      table.userId,
      table.active,
    ),
    index("billing_admin_overrides_actor_user_id_idx").on(table.actorUserId),
  ],
);

export const bookingIdempotencyRecords = pgTable(
  "booking_idempotency_records",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    idempotencyKey: text("idempotency_key").notNull(),
    requestFingerprint: text("request_fingerprint").notNull(),
    bookingId: text("booking_id").references(() => bookings.id, {
      onDelete: "set null",
    }),
    result: jsonb("result").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("booking_idempotency_records_user_id_key_unique").on(
      table.userId,
      table.idempotencyKey,
    ),
    index("booking_idempotency_records_booking_id_idx").on(table.bookingId),
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
