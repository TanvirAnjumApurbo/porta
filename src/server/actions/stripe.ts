"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createConnectAccount, createAccountSession } from "@/lib/stripe";

/**
 * Get or create a Stripe Connect account and return the onboarding session client secret
 */
export async function getOnboardingSession() {
    try {
        const { userId } = await auth();
        if (!userId) throw new Error("Unauthorized");

        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
        });

        if (!user) throw new Error("User not found");

        let accountId = user.stripeConnectAccountId;

        // Create Connect account if doesn't exist
        if (!accountId) {
            const account = await createConnectAccount({
                email: user.email,
                userId,
            });
            accountId = account.id;

            // Save account ID to user
            await db.update(users)
                .set({ 
                    stripeConnectAccountId: accountId,
                    updatedAt: new Date(),
                })
                .where(eq(users.id, userId));
        }

        // Create Account Session
        const accountSession = await createAccountSession(accountId);

        return { success: true, clientSecret: accountSession.client_secret };
    } catch (error) {
        console.error("Error creating onboarding session:", error);
        return { success: false, error: "Failed to start onboarding" };
    }
}
