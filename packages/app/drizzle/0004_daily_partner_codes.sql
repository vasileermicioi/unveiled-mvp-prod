CREATE TYPE "public"."job_send_status" AS ENUM('CLAIMED', 'SENT', 'FAILED', 'SKIPPED');--> statement-breakpoint
CREATE TABLE "job_send_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"job_name" text NOT NULL,
	"partner_id" text,
	"window_start" timestamp NOT NULL,
	"window_end" timestamp NOT NULL,
	"status" "job_send_status" DEFAULT 'CLAIMED' NOT NULL,
	"provider" text,
	"provider_message_id" text,
	"safe_error" text,
	"details" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"claimed_at" timestamp DEFAULT now() NOT NULL,
	"sent_at" timestamp,
	"failed_at" timestamp,
	"skipped_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "job_send_logs" ADD CONSTRAINT "job_send_logs_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "job_send_logs_job_partner_window_unique" ON "job_send_logs" USING btree ("job_name","partner_id","window_start","window_end");--> statement-breakpoint
CREATE INDEX "job_send_logs_job_status_idx" ON "job_send_logs" USING btree ("job_name","status");--> statement-breakpoint
CREATE INDEX "job_send_logs_partner_id_idx" ON "job_send_logs" USING btree ("partner_id");--> statement-breakpoint
CREATE INDEX "job_send_logs_window_start_idx" ON "job_send_logs" USING btree ("window_start");--> statement-breakpoint
