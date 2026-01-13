"use server";

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * Syncs the current Clerk user data to the local database.
 * ensuring the avatar, name, and email are up to date.
 */
export async function syncUser() {
    try {
        const user = await currentUser();
        if (!user) return { success: false, error: "Unauthorized" };

        const existingUser = await db.query.users.findFirst({
            where: eq(users.id, user.id),
        });

        const userData = {
            email: user.emailAddresses[0]?.emailAddress || "",
            firstName: user.firstName,
            lastName: user.lastName,
            userPhotoUrl: user.imageUrl,
            updatedAt: new Date(),
        };

        if (existingUser) {
            await db.update(users)
                .set(userData)
                .where(eq(users.id, user.id));
        } else {
            // Create user if not exists (fallback, though usually handled by webhook)
            await db.insert(users).values({
                id: user.id,
                clerkId: user.id,
                ...userData,
                createdAt: new Date(),
            });
        }

        return { success: true };
    } catch (error) {
        console.error("Error syncing user:", error);
        return { success: false, error: "Failed to sync user" };
    }
}
