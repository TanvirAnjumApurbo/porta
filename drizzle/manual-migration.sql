-- Manual migration script to add missing columns and tables
-- Run this in your Neon database console or via psql

-- ===========================================
-- 1. Create new ENUM types (if they don't exist)
-- ===========================================

DO $$ BEGIN
    CREATE TYPE "activity_action" AS ENUM('REQUEST_SENT', 'REQUEST_ACCEPTED', 'REQUEST_REJECTED', 'PAYMENT_MADE', 'DELIVERY_STARTED', 'DELIVERY_MARKED', 'DELIVERY_CONFIRMED', 'PAYMENT_RELEASED', 'REQUEST_CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "notification_type" AS ENUM('REQUEST_RECEIVED', 'REQUEST_ACCEPTED', 'REQUEST_REJECTED', 'PAYMENT_RECEIVED', 'DELIVERY_STARTED', 'DELIVERY_MARKED', 'DELIVERY_CONFIRMED', 'PAYMENT_RELEASED', 'NEW_MESSAGE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "transaction_status" AS ENUM('PENDING', 'HELD', 'RELEASED', 'REFUNDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "travel_post_status" AS ENUM('OPEN', 'LOCKED', 'COMPLETED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update delivery_request_status enum with new values
DO $$ BEGIN
    -- Drop and recreate with all values (PostgreSQL doesn't easily allow adding enum values)
    -- Check if we need to alter the enum
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'REQUESTED' AND enumtypid = 'delivery_request_status'::regtype) THEN
        ALTER TYPE delivery_request_status ADD VALUE IF NOT EXISTS 'REQUESTED';
    END IF;
EXCEPTION WHEN others THEN null;
END $$;

-- Add new enum values to delivery_request_status if needed
DO $$ BEGIN ALTER TYPE delivery_request_status ADD VALUE IF NOT EXISTS 'REQUESTED'; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TYPE delivery_request_status ADD VALUE IF NOT EXISTS 'ACCEPTED'; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TYPE delivery_request_status ADD VALUE IF NOT EXISTS 'PAID'; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TYPE delivery_request_status ADD VALUE IF NOT EXISTS 'IN_TRANSIT'; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TYPE delivery_request_status ADD VALUE IF NOT EXISTS 'DELIVERED'; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TYPE delivery_request_status ADD VALUE IF NOT EXISTS 'CONFIRMED'; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TYPE delivery_request_status ADD VALUE IF NOT EXISTS 'COMPLETED'; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TYPE delivery_request_status ADD VALUE IF NOT EXISTS 'REJECTED'; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TYPE delivery_request_status ADD VALUE IF NOT EXISTS 'CANCELLED'; EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ===========================================
-- 2. Add new columns to delivery_requests table
-- ===========================================

ALTER TABLE delivery_requests ADD COLUMN IF NOT EXISTS package_description text;
ALTER TABLE delivery_requests ADD COLUMN IF NOT EXISTS offered_price integer;
ALTER TABLE delivery_requests ADD COLUMN IF NOT EXISTS offered_weight integer;
ALTER TABLE delivery_requests ADD COLUMN IF NOT EXISTS currency text DEFAULT 'USD';
ALTER TABLE delivery_requests ADD COLUMN IF NOT EXISTS message text;
ALTER TABLE delivery_requests ADD COLUMN IF NOT EXISTS rejection_reason text;

-- Set defaults for existing rows (if any)
UPDATE delivery_requests SET package_description = 'Package delivery' WHERE package_description IS NULL;
UPDATE delivery_requests SET offered_price = 0 WHERE offered_price IS NULL;
UPDATE delivery_requests SET offered_weight = 0 WHERE offered_weight IS NULL;

-- Now make them NOT NULL
ALTER TABLE delivery_requests ALTER COLUMN package_description SET NOT NULL;
ALTER TABLE delivery_requests ALTER COLUMN offered_price SET NOT NULL;
ALTER TABLE delivery_requests ALTER COLUMN offered_weight SET NOT NULL;
ALTER TABLE delivery_requests ALTER COLUMN currency SET NOT NULL;

-- ===========================================
-- 3. Add new columns to travel_posts table
-- ===========================================

ALTER TABLE travel_posts ADD COLUMN IF NOT EXISTS post_status travel_post_status DEFAULT 'OPEN' NOT NULL;
ALTER TABLE travel_posts ADD COLUMN IF NOT EXISTS numeric_weight integer;
ALTER TABLE travel_posts ADD COLUMN IF NOT EXISTS remaining_weight integer;

-- ===========================================
-- 4. Create notifications table
-- ===========================================

CREATE TABLE IF NOT EXISTS notifications (
    id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id text NOT NULL REFERENCES users(id),
    type notification_type NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    related_request_id text REFERENCES delivery_requests(id),
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp DEFAULT now() NOT NULL
);

-- ===========================================
-- 5. Create transactions table
-- ===========================================

CREATE TABLE IF NOT EXISTS transactions (
    id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    delivery_request_id text NOT NULL REFERENCES delivery_requests(id),
    amount integer NOT NULL,
    currency text DEFAULT 'USD' NOT NULL,
    status transaction_status DEFAULT 'PENDING' NOT NULL,
    paid_at timestamp,
    released_at timestamp,
    refunded_at timestamp,
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp DEFAULT now() NOT NULL
);

-- ===========================================
-- 6. Create activity_logs table
-- ===========================================

CREATE TABLE IF NOT EXISTS activity_logs (
    id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    delivery_request_id text NOT NULL REFERENCES delivery_requests(id),
    action activity_action NOT NULL,
    performed_by text NOT NULL REFERENCES users(id),
    metadata jsonb,
    created_at timestamp DEFAULT now() NOT NULL
);

-- ===========================================
-- Done! Your database should now have all the required tables and columns.
-- ===========================================
