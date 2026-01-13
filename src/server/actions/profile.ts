"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users, deliveryRequests, transactions, travelPosts } from "@/lib/db/schema";
import { eq, and, or, desc, sql } from "drizzle-orm";

/**
 * Get public profile data for a user
 */
export async function getUserProfile(userId: string) {
    const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: {
            id: true,
            firstName: true,
            lastName: true,
            isVerified: true,
            userPhotoUrl: true,
            averageRating: true,
            totalReviews: true,
            completedDeliveriesAsTraveler: true,
            createdAt: true,
            // Sensitive data excluded from public profile
        },
    });

    if (!user) return null;

    return user;
}

/**
 * Get full profile with private data (for profile owner only)
 */
export async function getMyProfile() {
    const { userId } = await auth();
    if (!userId) return null;

    const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            isVerified: true,
            verificationStatus: true,
            userPhotoUrl: true,
            nationality: true,
            averageRating: true,
            totalReviews: true,
            completedDeliveriesAsTraveler: true,
            totalEarnings: true,
            stripeConnectAccountId: true,
            stripeConnectOnboardingComplete: true,
            createdAt: true,
        },
    });

    return user;
}

/**
 * Get delivery history for a user (as traveler)
 */
export async function getDeliveryHistoryAsTraveler(userId: string, limit = 10) {
    const { userId: currentUserId } = await auth();
    const isOwner = currentUserId === userId;

    const deliveries = await db.query.deliveryRequests.findMany({
        where: eq(deliveryRequests.travellerId, userId),
        orderBy: [desc(deliveryRequests.updatedAt)],
        limit,
        with: {
            travelPost: {
                columns: {
                    departureCity: true,
                    destinationCity: true,
                    departureCountry: true,
                    destinationCountry: true,
                    travelDate: true,
                },
            },
            customer: {
                columns: {
                    firstName: true,
                    lastName: true,
                    userPhotoUrl: true,
                },
            },
            transaction: isOwner ? {
                columns: {
                    travelerPayout: true,
                    status: true,
                },
            } : undefined,
        },
    });

    return deliveries;
}

/**
 * Get delivery history as customer
 */
export async function getDeliveryHistoryAsCustomer(limit = 10) {
    const { userId } = await auth();
    if (!userId) return [];

    const deliveries = await db.query.deliveryRequests.findMany({
        where: eq(deliveryRequests.customerId, userId),
        orderBy: [desc(deliveryRequests.updatedAt)],
        limit,
        with: {
            travelPost: {
                columns: {
                    departureCity: true,
                    destinationCity: true,
                    travelDate: true,
                },
            },
            traveller: {
                columns: {
                    firstName: true,
                    lastName: true,
                    userPhotoUrl: true,
                    averageRating: true,
                },
            },
        },
    });

    return deliveries;
}

/**
 * Get financial summary (earnings, pending) - owner only
 */
export async function getFinancialSummary() {
    const { userId } = await auth();
    if (!userId) return null;

    // Get all transactions for this traveler
    const userTransactions = await db.query.transactions.findMany({
        where: sql`${transactions.deliveryRequestId} IN (
            SELECT id FROM delivery_requests WHERE traveller_id = ${userId}
        )`,
    });

    let totalEarned = 0;
    let pendingPayout = 0;

    for (const tx of userTransactions) {
        if (tx.status === "RELEASED" && tx.travelerPayout) {
            totalEarned += tx.travelerPayout;
        } else if (tx.status === "HELD" && tx.travelerPayout) {
            pendingPayout += tx.travelerPayout;
        }
    }

    // Update cached total earnings
    await db.update(users)
        .set({ 
            totalEarnings: totalEarned,
            updatedAt: new Date(),
        })
        .where(eq(users.id, userId));

    return {
        totalEarned,
        pendingPayout,
        totalTransactions: userTransactions.length,
    };
}

/**
 * Get stats for a user profile
 */
export async function getUserStats(userId: string) {
    // Count completed deliveries as traveler
    const completedDeliveries = await db.query.deliveryRequests.findMany({
        where: and(
            eq(deliveryRequests.travellerId, userId),
            eq(deliveryRequests.status, "COMPLETED")
        ),
    });

    // Count active deliveries
    const activeDeliveries = await db.query.deliveryRequests.findMany({
        where: and(
            eq(deliveryRequests.travellerId, userId),
            or(
                eq(deliveryRequests.status, "PAID"),
                eq(deliveryRequests.status, "IN_TRANSIT"),
                eq(deliveryRequests.status, "DELIVERED")
            )
        ),
    });

    // Update cached count
    await db.update(users)
        .set({ 
            completedDeliveriesAsTraveler: completedDeliveries.length,
            updatedAt: new Date(),
        })
        .where(eq(users.id, userId));

    return {
        completedDeliveries: completedDeliveries.length,
        activeDeliveries: activeDeliveries.length,
    };
}
