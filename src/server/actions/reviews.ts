"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { reviews, users, deliveryRequests } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Submit a review for a traveler after delivery is completed
 */
export async function submitReview({
    deliveryRequestId,
    rating,
    comment,
}: {
    deliveryRequestId: string;
    rating: number; // 1-5
    comment?: string;
}) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Validate rating
    if (rating < 1 || rating > 5) {
        return { success: false, error: "Rating must be between 1 and 5" };
    }

    // Get the delivery request
    const request = await db.query.deliveryRequests.findFirst({
        where: eq(deliveryRequests.id, deliveryRequestId),
    });

    if (!request) {
        return { success: false, error: "Delivery request not found" };
    }

    // Verify user is the customer
    if (request.customerId !== userId) {
        return { success: false, error: "Only the customer can leave a review" };
    }

    // Verify delivery is completed
    if (request.status !== "COMPLETED") {
        return { success: false, error: "Delivery must be completed before reviewing" };
    }

    // Check if review already exists
    const existingReview = await db.query.reviews.findFirst({
        where: eq(reviews.deliveryRequestId, deliveryRequestId),
    });

    if (existingReview) {
        return { success: false, error: "You have already reviewed this delivery" };
    }

    // Create the review
    await db.insert(reviews).values({
        deliveryRequestId,
        reviewerId: userId,
        revieweeId: request.travellerId,
        rating,
        comment: comment?.trim() || null,
    });

    // Update traveler's rating stats
    await updateUserRating(request.travellerId);

    revalidatePath(`/profile/${request.travellerId}`);
    revalidatePath(`/requests/${deliveryRequestId}`);

    return { success: true };
}

/**
 * Recalculate and update a user's average rating
 */
export async function updateUserRating(userId: string) {
    const userReviews = await db.query.reviews.findMany({
        where: eq(reviews.revieweeId, userId),
    });

    const totalReviews = userReviews.length;
    const averageRating = totalReviews > 0
        ? userReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

    await db.update(users)
        .set({
            averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
            totalReviews,
            updatedAt: new Date(),
        })
        .where(eq(users.id, userId));

    return { averageRating, totalReviews };
}

/**
 * Get all reviews for a user
 */
export async function getReviewsForUser(userId: string) {
    const userReviews = await db.query.reviews.findMany({
        where: eq(reviews.revieweeId, userId),
        orderBy: [desc(reviews.createdAt)],
        with: {
            reviewer: {
                columns: {
                    firstName: true,
                    lastName: true,
                    userPhotoUrl: true,
                },
            },
            deliveryRequest: {
                with: {
                    travelPost: {
                        columns: {
                            departureCity: true,
                            destinationCity: true,
                        },
                    },
                },
            },
        },
    });

    return userReviews;
}

/**
 * Check if a review exists for a delivery request
 */
export async function checkReviewExists(deliveryRequestId: string) {
    const { userId } = await auth();
    if (!userId) return false;

    const existingReview = await db.query.reviews.findFirst({
        where: and(
            eq(reviews.deliveryRequestId, deliveryRequestId),
            eq(reviews.reviewerId, userId)
        ),
    });

    return !!existingReview;
}
