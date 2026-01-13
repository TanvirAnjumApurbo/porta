CREATE TYPE "public"."issue_status" AS ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');--> statement-breakpoint
ALTER TYPE "public"."activity_action" ADD VALUE 'PRODUCT_PURCHASED' BEFORE 'DELIVERY_STARTED';--> statement-breakpoint
ALTER TYPE "public"."activity_action" ADD VALUE 'OTP_GENERATED' BEFORE 'DELIVERY_STARTED';--> statement-breakpoint
ALTER TYPE "public"."delivery_request_status" ADD VALUE 'PURCHASED' BEFORE 'IN_TRANSIT';--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'PRODUCT_PURCHASED' BEFORE 'DELIVERY_STARTED';--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'OTP_GENERATED' BEFORE 'DELIVERY_STARTED';--> statement-breakpoint
CREATE TABLE "issue_reports" (
	"id" text PRIMARY KEY NOT NULL,
	"delivery_request_id" text NOT NULL,
	"reporter_id" text NOT NULL,
	"reporter_role" text NOT NULL,
	"issue_type" text NOT NULL,
	"description" text NOT NULL,
	"status" "issue_status" DEFAULT 'OPEN' NOT NULL,
	"admin_notes" text,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" text PRIMARY KEY NOT NULL,
	"delivery_request_id" text NOT NULL,
	"reviewer_id" text NOT NULL,
	"reviewee_id" text NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "delivery_requests" ADD COLUMN "delivery_proof_otp" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "stripe_payment_intent_id" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "stripe_transfer_id" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "platform_fee" integer;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "traveler_payout" integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "stripe_connect_account_id" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "stripe_connect_onboarding_complete" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "average_rating" real DEFAULT 0;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "total_reviews" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "completed_deliveries_as_traveler" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "total_earnings" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "issue_reports" ADD CONSTRAINT "issue_reports_delivery_request_id_delivery_requests_id_fk" FOREIGN KEY ("delivery_request_id") REFERENCES "public"."delivery_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issue_reports" ADD CONSTRAINT "issue_reports_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_delivery_request_id_delivery_requests_id_fk" FOREIGN KEY ("delivery_request_id") REFERENCES "public"."delivery_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewee_id_users_id_fk" FOREIGN KEY ("reviewee_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;