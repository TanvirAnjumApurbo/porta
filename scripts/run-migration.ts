// Run this script with: npx tsx scripts/run-migration.ts
import { config } from "dotenv";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

config({ path: ".env.local" });

// Enable WebSocket for local Node.js
neonConfig.webSocketConstructor = ws;

async function runMigration() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    console.log("🚀 Running database migration...\n");

    try {
        // 1. Create new ENUM types
        console.log("1️⃣ Creating ENUM types...");
        
        const enumQueries = [
            {
                name: 'activity_action',
                sql: `DO $$ BEGIN CREATE TYPE activity_action AS ENUM('REQUEST_SENT', 'REQUEST_ACCEPTED', 'REQUEST_REJECTED', 'PAYMENT_MADE', 'DELIVERY_STARTED', 'DELIVERY_MARKED', 'DELIVERY_CONFIRMED', 'PAYMENT_RELEASED', 'REQUEST_CANCELLED'); EXCEPTION WHEN duplicate_object THEN null; END $$;`
            },
            {
                name: 'notification_type',
                sql: `DO $$ BEGIN CREATE TYPE notification_type AS ENUM('REQUEST_RECEIVED', 'REQUEST_ACCEPTED', 'REQUEST_REJECTED', 'PAYMENT_RECEIVED', 'DELIVERY_STARTED', 'DELIVERY_MARKED', 'DELIVERY_CONFIRMED', 'PAYMENT_RELEASED', 'NEW_MESSAGE'); EXCEPTION WHEN duplicate_object THEN null; END $$;`
            },
            {
                name: 'transaction_status',
                sql: `DO $$ BEGIN CREATE TYPE transaction_status AS ENUM('PENDING', 'HELD', 'RELEASED', 'REFUNDED'); EXCEPTION WHEN duplicate_object THEN null; END $$;`
            },
            {
                name: 'travel_post_status',
                sql: `DO $$ BEGIN CREATE TYPE travel_post_status AS ENUM('OPEN', 'LOCKED', 'COMPLETED', 'CANCELLED'); EXCEPTION WHEN duplicate_object THEN null; END $$;`
            }
        ];
        
        for (const q of enumQueries) {
            await pool.query(q.sql);
            console.log(`   ✅ Ensured ${q.name} enum exists`);
        }

        // 2. Add columns to delivery_requests
        console.log("\n2️⃣ Adding columns to delivery_requests table...");
        
        const drColumns = [
            `ALTER TABLE delivery_requests ADD COLUMN IF NOT EXISTS package_description text`,
            `ALTER TABLE delivery_requests ADD COLUMN IF NOT EXISTS offered_price integer`,
            `ALTER TABLE delivery_requests ADD COLUMN IF NOT EXISTS offered_weight integer`,
            `ALTER TABLE delivery_requests ADD COLUMN IF NOT EXISTS currency text DEFAULT 'USD'`,
            `ALTER TABLE delivery_requests ADD COLUMN IF NOT EXISTS message text`,
            `ALTER TABLE delivery_requests ADD COLUMN IF NOT EXISTS rejection_reason text`,
        ];
        
        for (const sql of drColumns) {
            await pool.query(sql);
        }
        console.log("   ✅ Added all delivery_requests columns");
        
        // Update existing rows with defaults
        console.log("   📝 Setting defaults for existing rows...");
        await pool.query(`UPDATE delivery_requests SET package_description = 'Package delivery' WHERE package_description IS NULL`);
        await pool.query(`UPDATE delivery_requests SET offered_price = 0 WHERE offered_price IS NULL`);
        await pool.query(`UPDATE delivery_requests SET offered_weight = 0 WHERE offered_weight IS NULL`);
        await pool.query(`UPDATE delivery_requests SET currency = 'USD' WHERE currency IS NULL`);
        console.log("   ✅ Set defaults for existing rows");

        // 3. Add columns to travel_posts
        console.log("\n3️⃣ Adding columns to travel_posts table...");
        
        await pool.query(`ALTER TABLE travel_posts ADD COLUMN IF NOT EXISTS post_status travel_post_status DEFAULT 'OPEN'`);
        await pool.query(`ALTER TABLE travel_posts ADD COLUMN IF NOT EXISTS numeric_weight integer`);
        await pool.query(`ALTER TABLE travel_posts ADD COLUMN IF NOT EXISTS remaining_weight integer`);
        console.log("   ✅ Added all travel_posts columns");

        // 4. Create notifications table
        console.log("\n4️⃣ Creating notifications table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
                user_id text NOT NULL REFERENCES users(id),
                type notification_type NOT NULL,
                title text NOT NULL,
                message text NOT NULL,
                related_request_id text REFERENCES delivery_requests(id),
                is_read boolean DEFAULT false NOT NULL,
                created_at timestamp DEFAULT now() NOT NULL
            )
        `);
        console.log("   ✅ Created/ensured notifications table exists");

        // 5. Create transactions table
        console.log("\n5️⃣ Creating transactions table...");
        await pool.query(`
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
            )
        `);
        console.log("   ✅ Created/ensured transactions table exists");

        // 6. Create activity_logs table
        console.log("\n6️⃣ Creating activity_logs table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS activity_logs (
                id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
                delivery_request_id text NOT NULL REFERENCES delivery_requests(id),
                action activity_action NOT NULL,
                performed_by text NOT NULL REFERENCES users(id),
                metadata jsonb,
                created_at timestamp DEFAULT now() NOT NULL
            )
        `);
        console.log("   ✅ Created/ensured activity_logs table exists");

        console.log("\n✨ Migration completed successfully!");
        console.log("   You can now restart your dev server.");
        
    } catch (error) {
        console.error("\n❌ Migration failed:", error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

runMigration();
