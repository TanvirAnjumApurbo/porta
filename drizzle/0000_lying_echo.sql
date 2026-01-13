CREATE TYPE "public"."activity_action" AS ENUM('REQUEST_SENT', 'REQUEST_ACCEPTED', 'REQUEST_REJECTED', 'PAYMENT_MADE', 'DELIVERY_STARTED', 'DELIVERY_MARKED', 'DELIVERY_CONFIRMED', 'PAYMENT_RELEASED', 'REQUEST_CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."delivery_request_status" AS ENUM('REQUESTED', 'ACCEPTED', 'PAID', 'IN_TRANSIT', 'DELIVERED', 'CONFIRMED', 'COMPLETED', 'REJECTED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."id_type" AS ENUM('PASSPORT', 'NID', 'DRIVING_LICENSE');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('REQUEST_RECEIVED', 'REQUEST_ACCEPTED', 'REQUEST_REJECTED', 'PAYMENT_RECEIVED', 'DELIVERY_STARTED', 'DELIVERY_MARKED', 'DELIVERY_CONFIRMED', 'PAYMENT_RELEASED', 'NEW_MESSAGE');--> statement-breakpoint
CREATE TYPE "public"."transaction_status" AS ENUM('PENDING', 'HELD', 'RELEASED', 'REFUNDED');--> statement-breakpoint
CREATE TYPE "public"."travel_post_status" AS ENUM('OPEN', 'LOCKED', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."verification_status" AS ENUM('IDLE', 'PENDING', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TABLE "activity_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"delivery_request_id" text NOT NULL,
	"action" "activity_action" NOT NULL,
	"performed_by" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "delivery_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"travel_post_id" text NOT NULL,
	"traveller_id" text NOT NULL,
	"customer_id" text NOT NULL,
	"status" "delivery_request_status" DEFAULT 'REQUESTED' NOT NULL,
	"package_description" text NOT NULL,
	"offered_price" integer NOT NULL,
	"offered_weight" integer NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"message" text,
	"rejection_reason" text,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"related_request_id" text,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"delivery_request_id" text NOT NULL,
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"status" "transaction_status" DEFAULT 'PENDING' NOT NULL,
	"paid_at" timestamp,
	"released_at" timestamp,
	"refunded_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "travel_posts" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"travel_type" text NOT NULL,
	"transport_mode" text NOT NULL,
	"airline_name" text,
	"flight_number" text,
	"seat_class" text,
	"departure_time" text,
	"arrival_time" text,
	"departure_gate" text,
	"arrival_gate" text,
	"departure_terminal" text,
	"arrival_terminal" text,
	"departure_timezone" text,
	"arrival_timezone" text,
	"origin_airport" text,
	"destination_airport" text,
	"departure_station" text,
	"destination_station" text,
	"departure_state" text,
	"destination_state" text,
	"departure_city" text NOT NULL,
	"departure_country" text NOT NULL,
	"destination_city" text NOT NULL,
	"destination_country" text NOT NULL,
	"travel_date" date NOT NULL,
	"arrival_date" date,
	"available_weight" text,
	"available_space" text,
	"ticket_image_url" text NOT NULL,
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"post_status" "travel_post_status" DEFAULT 'OPEN' NOT NULL,
	"numeric_weight" integer,
	"remaining_weight" integer
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"clerk_id" text NOT NULL,
	"email" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"legal_name" text,
	"is_verified" boolean DEFAULT false NOT NULL,
	"verification_status" "verification_status" DEFAULT 'IDLE' NOT NULL,
	"phone" text,
	"nationality" text,
	"permanent_address" text,
	"gender" text,
	"dob" date,
	"emergency_contact_name" text,
	"emergency_contact_phone" text,
	"id_type" "id_type",
	"id_number" text,
	"issuing_country" text,
	"id_image_url" text,
	"user_photo_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_clerk_id_unique" UNIQUE("clerk_id")
);
--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_delivery_request_id_delivery_requests_id_fk" FOREIGN KEY ("delivery_request_id") REFERENCES "public"."delivery_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_performed_by_users_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_requests" ADD CONSTRAINT "delivery_requests_travel_post_id_travel_posts_id_fk" FOREIGN KEY ("travel_post_id") REFERENCES "public"."travel_posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_requests" ADD CONSTRAINT "delivery_requests_traveller_id_users_id_fk" FOREIGN KEY ("traveller_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_requests" ADD CONSTRAINT "delivery_requests_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_related_request_id_delivery_requests_id_fk" FOREIGN KEY ("related_request_id") REFERENCES "public"."delivery_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_delivery_request_id_delivery_requests_id_fk" FOREIGN KEY ("delivery_request_id") REFERENCES "public"."delivery_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "travel_posts" ADD CONSTRAINT "travel_posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;