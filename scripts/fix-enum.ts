// Run this script with: npx tsx scripts/fix-enum.ts
import { config } from "dotenv";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

config({ path: ".env.local" });
neonConfig.webSocketConstructor = ws;

async function fixEnum() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    console.log("🔧 Fixing delivery_request_status enum...\n");

    try {
        // Get current enum values
        const currentValues = await pool.query(`
            SELECT enumlabel 
            FROM pg_enum 
            WHERE enumtypid = 'delivery_request_status'::regtype
            ORDER BY enumsortorder
        `);
        
        console.log("Current enum values:", currentValues.rows.map(r => r.enumlabel));
        
        // Add missing enum values - PostgreSQL allows adding values to existing enums
        const requiredValues = [
            'REQUESTED',
            'ACCEPTED', 
            'PAID',
            'IN_TRANSIT',
            'DELIVERED',
            'CONFIRMED',
            'COMPLETED',
            'REJECTED',
            'CANCELLED'
        ];
        
        const existingValues = currentValues.rows.map(r => r.enumlabel);
        
        for (const value of requiredValues) {
            if (!existingValues.includes(value)) {
                try {
                    await pool.query(`ALTER TYPE delivery_request_status ADD VALUE IF NOT EXISTS '${value}'`);
                    console.log(`   ✅ Added '${value}' to enum`);
                } catch (e: any) {
                    console.log(`   ⏭️ '${value}': ${e.message}`);
                }
            } else {
                console.log(`   ⏭️ '${value}' already exists`);
            }
        }
        
        console.log("\n✨ Enum fix completed!");
        console.log("   Restart your dev server to apply changes.");
        
    } catch (error) {
        console.error("\n❌ Fix failed:", error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

fixEnum();
