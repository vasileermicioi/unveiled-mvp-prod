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
ALTER TABLE "bookings" ADD COLUMN "admin_actor_id" text;
--> statement-breakpoint
ALTER TABLE "credit_ledger_entries" ADD COLUMN "related_booking_id" text;
--> statement-breakpoint
ALTER TABLE "credit_ledger_entries" ADD COLUMN "related_event_id" text;
--> statement-breakpoint
ALTER TABLE "credit_ledger_entries" ADD COLUMN "actor_user_id" text;
--> statement-breakpoint
ALTER TABLE "booking_idempotency_records" ADD CONSTRAINT "booking_idempotency_records_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "booking_idempotency_records" ADD CONSTRAINT "booking_idempotency_records_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_admin_actor_id_user_id_fk" FOREIGN KEY ("admin_actor_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "credit_ledger_entries" ADD CONSTRAINT "credit_ledger_entries_related_booking_id_bookings_id_fk" FOREIGN KEY ("related_booking_id") REFERENCES "public"."bookings"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "credit_ledger_entries" ADD CONSTRAINT "credit_ledger_entries_related_event_id_events_id_fk" FOREIGN KEY ("related_event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "credit_ledger_entries" ADD CONSTRAINT "credit_ledger_entries_actor_user_id_user_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "booking_idempotency_records_user_id_key_unique" ON "booking_idempotency_records" USING btree ("user_id","idempotency_key");
--> statement-breakpoint
CREATE INDEX "booking_idempotency_records_booking_id_idx" ON "booking_idempotency_records" USING btree ("booking_id");
--> statement-breakpoint
CREATE INDEX "bookings_admin_actor_id_idx" ON "bookings" USING btree ("admin_actor_id");
--> statement-breakpoint
CREATE UNIQUE INDEX "waitlist_entries_event_id_user_id_unique" ON "waitlist_entries" USING btree ("event_id","user_id");
--> statement-breakpoint
CREATE INDEX "credit_ledger_entries_related_booking_id_idx" ON "credit_ledger_entries" USING btree ("related_booking_id");
--> statement-breakpoint
CREATE INDEX "credit_ledger_entries_related_event_id_idx" ON "credit_ledger_entries" USING btree ("related_event_id");
--> statement-breakpoint
CREATE INDEX "credit_ledger_entries_actor_user_id_idx" ON "credit_ledger_entries" USING btree ("actor_user_id");
