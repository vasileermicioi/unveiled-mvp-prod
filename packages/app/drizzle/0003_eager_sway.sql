CREATE TYPE "public"."billing_override_type" AS ENUM('FREEZE', 'UNFREEZE');--> statement-breakpoint
CREATE TYPE "public"."billing_provider" AS ENUM('STRIPE');--> statement-breakpoint
ALTER TYPE "public"."subscription_status" ADD VALUE 'INCOMPLETE' BEFORE 'PAST_DUE';--> statement-breakpoint
ALTER TYPE "public"."subscription_status" ADD VALUE 'ACTION_REQUIRED' BEFORE 'PAST_DUE';--> statement-breakpoint
ALTER TYPE "public"."subscription_status" ADD VALUE 'ADMIN_FROZEN';--> statement-breakpoint
CREATE TABLE "billing_addresses" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"provider" "billing_provider" DEFAULT 'STRIPE' NOT NULL,
	"provider_customer_id" text NOT NULL,
	"name" text,
	"country" text,
	"postal_code" text,
	"city" text,
	"line_1" text,
	"line_2" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "billing_admin_overrides" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"actor_user_id" text NOT NULL,
	"type" "billing_override_type" NOT NULL,
	"reason" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"cleared_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "booking_idempotency_records" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"idempotency_key" text NOT NULL,
	"request_fingerprint" text NOT NULL,
	"booking_id" text,
	"result" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_methods" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"subscription_id" text,
	"provider" "billing_provider" DEFAULT 'STRIPE' NOT NULL,
	"provider_payment_method_id" text NOT NULL,
	"type" "payment_method" NOT NULL,
	"brand" text,
	"last4" text,
	"exp_month" integer,
	"exp_year" integer,
	"bank_name" text,
	"wallet_type" text,
	"display_label" text NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "provider_events" (
	"id" text PRIMARY KEY NOT NULL,
	"provider" "billing_provider" DEFAULT 'STRIPE' NOT NULL,
	"provider_event_id" text NOT NULL,
	"event_type" text NOT NULL,
	"provider_created_at" timestamp,
	"processed_at" timestamp,
	"processing_status" text DEFAULT 'received' NOT NULL,
	"error_message" text,
	"payload" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"provider" "billing_provider" DEFAULT 'STRIPE' NOT NULL,
	"provider_customer_id" text NOT NULL,
	"provider_subscription_id" text NOT NULL,
	"provider_price_id" text NOT NULL,
	"plan_code" text DEFAULT 'BASIC_BERLIN' NOT NULL,
	"status" "subscription_status" DEFAULT 'INCOMPLETE' NOT NULL,
	"provider_status" text DEFAULT 'incomplete' NOT NULL,
	"billing_email" text,
	"current_period_start" timestamp,
	"current_period_end" timestamp,
	"cancel_at" timestamp,
	"canceled_at" timestamp,
	"last_invoice_id" text,
	"default_payment_method_id" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"last_provider_sync_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "admin_actor_id" text;--> statement-breakpoint
ALTER TABLE "credit_ledger_entries" ADD COLUMN "provider" "billing_provider";--> statement-breakpoint
ALTER TABLE "credit_ledger_entries" ADD COLUMN "provider_invoice_id" text;--> statement-breakpoint
ALTER TABLE "credit_ledger_entries" ADD COLUMN "provider_subscription_id" text;--> statement-breakpoint
ALTER TABLE "credit_ledger_entries" ADD COLUMN "provider_event_id" text;--> statement-breakpoint
ALTER TABLE "credit_ledger_entries" ADD COLUMN "refill_idempotency_key" text;--> statement-breakpoint
ALTER TABLE "credit_ledger_entries" ADD COLUMN "related_booking_id" text;--> statement-breakpoint
ALTER TABLE "credit_ledger_entries" ADD COLUMN "related_event_id" text;--> statement-breakpoint
ALTER TABLE "credit_ledger_entries" ADD COLUMN "actor_user_id" text;--> statement-breakpoint
ALTER TABLE "billing_addresses" ADD CONSTRAINT "billing_addresses_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_admin_overrides" ADD CONSTRAINT "billing_admin_overrides_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_admin_overrides" ADD CONSTRAINT "billing_admin_overrides_actor_user_id_user_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_idempotency_records" ADD CONSTRAINT "booking_idempotency_records_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_idempotency_records" ADD CONSTRAINT "booking_idempotency_records_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "billing_addresses_user_id_idx" ON "billing_addresses" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "billing_addresses_provider_customer_unique" ON "billing_addresses" USING btree ("provider","provider_customer_id");--> statement-breakpoint
CREATE INDEX "billing_admin_overrides_user_id_active_idx" ON "billing_admin_overrides" USING btree ("user_id","active");--> statement-breakpoint
CREATE INDEX "billing_admin_overrides_actor_user_id_idx" ON "billing_admin_overrides" USING btree ("actor_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "booking_idempotency_records_user_id_key_unique" ON "booking_idempotency_records" USING btree ("user_id","idempotency_key");--> statement-breakpoint
CREATE INDEX "booking_idempotency_records_booking_id_idx" ON "booking_idempotency_records" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "payment_methods_user_id_idx" ON "payment_methods" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "payment_methods_provider_payment_method_unique" ON "payment_methods" USING btree ("provider","provider_payment_method_id");--> statement-breakpoint
CREATE INDEX "payment_methods_subscription_id_idx" ON "payment_methods" USING btree ("subscription_id");--> statement-breakpoint
CREATE UNIQUE INDEX "provider_events_provider_event_id_unique" ON "provider_events" USING btree ("provider","provider_event_id");--> statement-breakpoint
CREATE INDEX "provider_events_event_type_idx" ON "provider_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "provider_events_processing_status_idx" ON "provider_events" USING btree ("processing_status");--> statement-breakpoint
CREATE INDEX "subscriptions_user_id_idx" ON "subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "subscriptions_provider_subscription_id_unique" ON "subscriptions" USING btree ("provider","provider_subscription_id");--> statement-breakpoint
CREATE INDEX "subscriptions_provider_customer_id_idx" ON "subscriptions" USING btree ("provider","provider_customer_id");--> statement-breakpoint
CREATE INDEX "subscriptions_status_idx" ON "subscriptions" USING btree ("status");--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_admin_actor_id_user_id_fk" FOREIGN KEY ("admin_actor_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_ledger_entries" ADD CONSTRAINT "credit_ledger_entries_related_booking_id_bookings_id_fk" FOREIGN KEY ("related_booking_id") REFERENCES "public"."bookings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_ledger_entries" ADD CONSTRAINT "credit_ledger_entries_related_event_id_events_id_fk" FOREIGN KEY ("related_event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_ledger_entries" ADD CONSTRAINT "credit_ledger_entries_actor_user_id_user_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bookings_admin_actor_id_idx" ON "bookings" USING btree ("admin_actor_id");--> statement-breakpoint
CREATE INDEX "credit_ledger_entries_related_booking_id_idx" ON "credit_ledger_entries" USING btree ("related_booking_id");--> statement-breakpoint
CREATE INDEX "credit_ledger_entries_related_event_id_idx" ON "credit_ledger_entries" USING btree ("related_event_id");--> statement-breakpoint
CREATE INDEX "credit_ledger_entries_actor_user_id_idx" ON "credit_ledger_entries" USING btree ("actor_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "credit_ledger_entries_refill_idempotency_key_unique" ON "credit_ledger_entries" USING btree ("refill_idempotency_key");--> statement-breakpoint
CREATE INDEX "credit_ledger_entries_provider_invoice_id_idx" ON "credit_ledger_entries" USING btree ("provider_invoice_id");--> statement-breakpoint
CREATE INDEX "credit_ledger_entries_provider_subscription_id_idx" ON "credit_ledger_entries" USING btree ("provider_subscription_id");--> statement-breakpoint
CREATE UNIQUE INDEX "waitlist_entries_event_id_user_id_unique" ON "waitlist_entries" USING btree ("event_id","user_id");