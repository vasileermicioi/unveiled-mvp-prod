CREATE TYPE "public"."age_group" AS ENUM('18-25', '26-35', '36-50', '50+');--> statement-breakpoint
CREATE TYPE "public"."booking_status" AS ENUM('CONFIRMED', 'WAITLIST', 'CANCELLED', 'USED');--> statement-breakpoint
CREATE TYPE "public"."language" AS ENUM('DE', 'EN');--> statement-breakpoint
CREATE TYPE "public"."ledger_type" AS ENUM('SUBSCRIPTION_REFILL', 'PURCHASE', 'BOOKING', 'EXPIRY', 'REFUND', 'ADMIN_ADJUST', 'REFERRAL_BONUS');--> statement-breakpoint
CREATE TYPE "public"."newsletter_status" AS ENUM('NONE', 'PENDING', 'CONFIRMED', 'UNSUBSCRIBED');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('CARD', 'PAYPAL', 'SEPA');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('USER', 'ADMIN', 'PARTNER');--> statement-breakpoint
CREATE TYPE "public"."secret_code_mode" AS ENUM('MANUAL', 'SHARED_GENERATED', 'UNIQUE_PER_BOOKING');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('ACTIVE', 'PAUSED', 'CANCELLED_PENDING', 'INACTIVE', 'PAST_DUE', 'UNPAID');--> statement-breakpoint
CREATE TYPE "public"."ticket_type" AS ENUM('VOUCHER', 'SECRET_CODE');--> statement-breakpoint
CREATE TYPE "public"."timing_mode" AS ENUM('TIME_SLOT', 'ALL_DAY');--> statement-breakpoint
CREATE TYPE "public"."waitlist_status" AS ENUM('WAITING', 'PROMOTED', 'CANCELLED');--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"event_id" text NOT NULL,
	"partner_id" text NOT NULL,
	"tickets_count" integer DEFAULT 1 NOT NULL,
	"total_credits" integer DEFAULT 0 NOT NULL,
	"status" "booking_status" DEFAULT 'CONFIRMED' NOT NULL,
	"redemption_type" "ticket_type",
	"redemption_info" text,
	"redemption_url" text,
	"idempotency_key" text,
	"checked_in_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "credit_ledger_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"amount" integer NOT NULL,
	"balance_after" integer NOT NULL,
	"type" "ledger_type" NOT NULL,
	"description" text NOT NULL,
	"idempotency_key" text,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" text PRIMARY KEY NOT NULL,
	"partner_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"category" text NOT NULL,
	"event_type" text NOT NULL,
	"date_time" timestamp NOT NULL,
	"timing_mode" "timing_mode" DEFAULT 'TIME_SLOT' NOT NULL,
	"start_time_minutes" integer DEFAULT 0 NOT NULL,
	"weekday" integer DEFAULT 0 NOT NULL,
	"address" text NOT NULL,
	"neighborhood" text NOT NULL,
	"lat" double precision,
	"lng" double precision,
	"image_url" text DEFAULT '' NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"credit_price" integer DEFAULT 0 NOT NULL,
	"total_capacity" integer DEFAULT 0 NOT NULL,
	"remaining_capacity" integer DEFAULT 0 NOT NULL,
	"ticket_type" "ticket_type" DEFAULT 'SECRET_CODE' NOT NULL,
	"voucher_template" text,
	"secret_code_rules" text,
	"secret_code" text,
	"secret_code_mode" "secret_code_mode",
	"promo_code" text,
	"event_website_url" text,
	"barrier_free" boolean DEFAULT false NOT NULL,
	"languages" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"target_age_groups" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partners" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"address" text NOT NULL,
	"contact_email" text NOT NULL,
	"logo_url" text,
	"venue_check_in_token" text,
	"portal_user_id" text,
	"portal_user_email" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_events" (
	"user_id" text NOT NULL,
	"event_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "saved_events_user_id_event_id_pk" PRIMARY KEY("user_id","event_id")
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"user_id" text PRIMARY KEY NOT NULL,
	"role" "role" DEFAULT 'USER' NOT NULL,
	"partner_id" text,
	"credits" integer DEFAULT 0 NOT NULL,
	"first_name" text,
	"last_name" text,
	"language" "language" DEFAULT 'DE' NOT NULL,
	"onboarding_complete" boolean DEFAULT false NOT NULL,
	"subscription_status" "subscription_status" DEFAULT 'INACTIVE' NOT NULL,
	"subscription_plan" text DEFAULT 'BASIC_BERLIN' NOT NULL,
	"subscription_period_end" timestamp,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"payment_method" "payment_method",
	"billing_address" text,
	"newsletter_opt_in" boolean DEFAULT false NOT NULL,
	"newsletter_status" "newsletter_status" DEFAULT 'NONE' NOT NULL,
	"newsletter_confirmed_at" timestamp,
	"newsletter_token" text,
	"newsletter_token_expires_at" timestamp,
	"age_group" "age_group",
	"interests" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"moods" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"districts" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"max_distance" integer DEFAULT 0 NOT NULL,
	"timing" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"preferred_days" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"preferred_languages" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"accessibility" boolean DEFAULT false NOT NULL,
	"preferences_updated_at" timestamp,
	"session_count" integer DEFAULT 0 NOT NULL,
	"event_open_count" integer DEFAULT 0 NOT NULL,
	"booking_count" integer DEFAULT 0 NOT NULL,
	"waitlist_count" integer DEFAULT 0 NOT NULL,
	"saved_count" integer DEFAULT 0 NOT NULL,
	"unsaved_count" integer DEFAULT 0 NOT NULL,
	"filter_apply_count" integer DEFAULT 0 NOT NULL,
	"view_counts" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"recent_event_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"last_seen_at" timestamp,
	"last_view" text,
	"last_opened_event_id" text,
	"last_booked_event_id" text,
	"last_waitlisted_event_id" text,
	"last_saved_event_id" text,
	"onboarding_completed_at" timestamp,
	"last_filter" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "waitlist_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"user_id" text NOT NULL,
	"requested_qty" integer DEFAULT 1 NOT NULL,
	"status" "waitlist_status" DEFAULT 'WAITING' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_ledger_entries" ADD CONSTRAINT "credit_ledger_entries_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partners" ADD CONSTRAINT "partners_portal_user_id_user_id_fk" FOREIGN KEY ("portal_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_events" ADD CONSTRAINT "saved_events_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_events" ADD CONSTRAINT "saved_events_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "waitlist_entries" ADD CONSTRAINT "waitlist_entries_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "waitlist_entries" ADD CONSTRAINT "waitlist_entries_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bookings_user_id_created_at_idx" ON "bookings" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "bookings_partner_id_created_at_idx" ON "bookings" USING btree ("partner_id","created_at");--> statement-breakpoint
CREATE INDEX "bookings_partner_id_status_idx" ON "bookings" USING btree ("partner_id","status");--> statement-breakpoint
CREATE INDEX "bookings_event_id_idx" ON "bookings" USING btree ("event_id");--> statement-breakpoint
CREATE UNIQUE INDEX "bookings_user_id_idempotency_key_unique" ON "bookings" USING btree ("user_id","idempotency_key");--> statement-breakpoint
CREATE INDEX "credit_ledger_entries_user_id_timestamp_idx" ON "credit_ledger_entries" USING btree ("user_id","timestamp");--> statement-breakpoint
CREATE UNIQUE INDEX "credit_ledger_entries_user_id_idempotency_key_unique" ON "credit_ledger_entries" USING btree ("user_id","idempotency_key");--> statement-breakpoint
CREATE INDEX "events_date_time_idx" ON "events" USING btree ("date_time");--> statement-breakpoint
CREATE INDEX "events_date_time_partner_id_idx" ON "events" USING btree ("date_time","partner_id");--> statement-breakpoint
CREATE INDEX "events_date_time_category_idx" ON "events" USING btree ("date_time","category");--> statement-breakpoint
CREATE INDEX "events_partner_id_idx" ON "events" USING btree ("partner_id");--> statement-breakpoint
CREATE INDEX "events_category_idx" ON "events" USING btree ("category");--> statement-breakpoint
CREATE INDEX "events_event_type_idx" ON "events" USING btree ("event_type");--> statement-breakpoint
CREATE UNIQUE INDEX "partners_venue_check_in_token_unique" ON "partners" USING btree ("venue_check_in_token");--> statement-breakpoint
CREATE INDEX "partners_portal_user_id_idx" ON "partners" USING btree ("portal_user_id");--> statement-breakpoint
CREATE INDEX "partners_contact_email_idx" ON "partners" USING btree ("contact_email");--> statement-breakpoint
CREATE INDEX "saved_events_user_id_created_at_idx" ON "saved_events" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "saved_events_event_id_idx" ON "saved_events" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "user_profiles_role_idx" ON "user_profiles" USING btree ("role");--> statement-breakpoint
CREATE INDEX "user_profiles_partner_id_idx" ON "user_profiles" USING btree ("partner_id");--> statement-breakpoint
CREATE INDEX "user_profiles_subscription_status_idx" ON "user_profiles" USING btree ("subscription_status");--> statement-breakpoint
CREATE INDEX "waitlist_entries_event_id_created_at_idx" ON "waitlist_entries" USING btree ("event_id","created_at");--> statement-breakpoint
CREATE INDEX "waitlist_entries_user_id_created_at_idx" ON "waitlist_entries" USING btree ("user_id","created_at");