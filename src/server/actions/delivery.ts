"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { deliveryRequests, travelPosts, users, notifications, activityLogs, transactions } from "@/lib/db/schema";
import { eq, and, or, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { StreamChat } from "stream-chat";

// Create a fresh Stream Chat Server Client for each action
function getStreamClient() {
    return new StreamChat(
        process.env.STREAM_API_KEY!,
        process.env.STREAM_SECRET_KEY!
    );
}

// Helper to create notification
async function createNotification({
    userId,
    type,
    title,
    message,
    relatedRequestId,
}: {
    userId: string;
    type: "REQUEST_RECEIVED" | "REQUEST_ACCEPTED" | "REQUEST_REJECTED" | "PAYMENT_RECEIVED" | "DELIVERY_STARTED" | "DELIVERY_MARKED" | "DELIVERY_CONFIRMED" | "PAYMENT_RELEASED" | "NEW_MESSAGE";
    title: string;
    message: string;
    relatedRequestId?: string;
}) {
    await db.insert(notifications).values({
        userId,
        type,
        title,
        message,
        relatedRequestId,
    });
}

// Helper to log activity
async function logActivity({
    deliveryRequestId,
    action,
    performedBy,
    metadata,
}: {
    deliveryRequestId: string;
    action: "REQUEST_SENT" | "REQUEST_ACCEPTED" | "REQUEST_REJECTED" | "PAYMENT_MADE" | "DELIVERY_STARTED" | "DELIVERY_MARKED" | "DELIVERY_CONFIRMED" | "PAYMENT_RELEASED" | "REQUEST_CANCELLED";
    performedBy: string;
    metadata?: Record<string, any>;
}) {
    await db.insert(activityLogs).values({
        deliveryRequestId,
        action,
        performedBy,
        metadata,
    });
}

// ============================================
// REQUEST MANAGEMENT
// ============================================

export async function createDeliveryRequest({
    travelPostId,
    travelerId,
    packageDescription,
    offeredWeight,
    offeredPrice,
    message,
}: {
    travelPostId: string;
    travelerId: string;
    packageDescription: string;
    offeredWeight: number; // in grams
    offeredPrice: number; // in cents
    message?: string;
}) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // 1. Check if Travel Post is OPEN and has capacity
    const post = await db.query.travelPosts.findFirst({
        where: eq(travelPosts.id, travelPostId),
    });

    if (!post) return { success: false, error: "Trip not found" };
    if (post.postStatus !== "OPEN") return { success: false, error: "This trip is no longer accepting requests" };
    if (post.userId === userId) return { success: false, error: "You cannot request your own trip" };
    
    // Check weight capacity
    const remainingWeight = post.remainingWeight || 0;
    if (offeredWeight > remainingWeight) {
        return { success: false, error: `Requested weight exceeds available capacity (${(remainingWeight / 1000).toFixed(1)}kg)` };
    }

    // 2. Check for existing active request
    const existingRequest = await db.query.deliveryRequests.findFirst({
        where: and(
            eq(deliveryRequests.travelPostId, travelPostId),
            eq(deliveryRequests.customerId, userId),
            or(
                eq(deliveryRequests.status, "REQUESTED"),
                eq(deliveryRequests.status, "ACCEPTED"),
                eq(deliveryRequests.status, "PAID"),
                eq(deliveryRequests.status, "IN_TRANSIT"),
                eq(deliveryRequests.status, "DELIVERED"),
                eq(deliveryRequests.status, "CONFIRMED")
            )
        ),
    });

    if (existingRequest) {
        return { success: false, error: "You already have an active request for this trip" };
    }

    // 3. Create Request
    const [newRequest] = await db
        .insert(deliveryRequests)
        .values({
            travelPostId,
            travellerId: travelerId,
            customerId: userId,
            status: "REQUESTED",
            packageDescription,
            offeredWeight,
            offeredPrice,
            message,
        })
        .returning({ id: deliveryRequests.id });

    // 4. Create notification for traveler
    const customer = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: { firstName: true, lastName: true },
    });
    const customerName = customer ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Someone' : 'Someone';

    await createNotification({
        userId: travelerId,
        type: "REQUEST_RECEIVED",
        title: "New Delivery Request",
        message: `${customerName} wants you to carry their package for $${(offeredPrice / 100).toFixed(2)}`,
        relatedRequestId: newRequest.id,
    });

    // 5. Log activity
    await logActivity({
        deliveryRequestId: newRequest.id,
        action: "REQUEST_SENT",
        performedBy: userId,
        metadata: { packageDescription, offeredWeight, offeredPrice },
    });

    revalidatePath("/requests");
    revalidatePath("/travelers");
    return { success: true, requestId: newRequest.id };
}

export async function checkDeliveryRequestStatus(travelPostId: string) {
    const { userId } = await auth();
    if (!userId) return null;

    const request = await db.query.deliveryRequests.findFirst({
        where: and(
            eq(deliveryRequests.travelPostId, travelPostId),
            eq(deliveryRequests.customerId, userId)
        ),
        orderBy: [desc(deliveryRequests.createdAt)],
    });

    if (!request) return null;

    return {
        status: request.status,
        requestId: request.id,
    };
}

export async function getIncomingRequests() {
    const { userId } = await auth();
    if (!userId) return [];

    // Requests SENT TO me (as traveler) - only REQUESTED status
    const requests = await db.query.deliveryRequests.findMany({
        where: and(
            eq(deliveryRequests.travellerId, userId),
            eq(deliveryRequests.status, "REQUESTED")
        ),
        with: {
            travelPost: true,
            customer: true
        },
        orderBy: [desc(deliveryRequests.createdAt)],
    });

    return requests;
}

export async function getSentRequests() {
    const { userId } = await auth();
    if (!userId) return [];

    // Requests I sent (as shopper)
    const requests = await db.query.deliveryRequests.findMany({
        where: eq(deliveryRequests.customerId, userId),
        with: {
            travelPost: true,
            traveller: true
        },
        orderBy: [desc(deliveryRequests.createdAt)],
    });

    return requests;
}

export async function acceptRequest(requestId: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const request = await db.query.deliveryRequests.findFirst({
        where: eq(deliveryRequests.id, requestId),
        with: {
            travelPost: true,
        }
    });

    if (!request) return { success: false, error: "Request not found" };
    if (request.travellerId !== userId) return { success: false, error: "Unauthorized" };
    if (request.status !== "REQUESTED") return { success: false, error: "Request is no longer pending" };

    // Check if weight still available
    const post = request.travelPost;
    if (!post) return { success: false, error: "Trip not found" };
    
    const remainingWeight = post.remainingWeight || 0;
    if (request.offeredWeight > remainingWeight) {
        return { success: false, error: "Not enough capacity remaining for this request" };
    }

    // Update request status to ACCEPTED
    await db
        .update(deliveryRequests)
        .set({ status: "ACCEPTED", updatedAt: new Date() })
        .where(eq(deliveryRequests.id, requestId));

    // Create notification for customer
    const traveler = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: { firstName: true, lastName: true },
    });
    const travelerName = traveler ? `${traveler.firstName || ''} ${traveler.lastName || ''}`.trim() || 'The traveler' : 'The traveler';

    await createNotification({
        userId: request.customerId,
        type: "REQUEST_ACCEPTED",
        title: "Request Accepted!",
        message: `${travelerName} accepted your delivery request. Please complete payment to confirm.`,
        relatedRequestId: requestId,
    });

    // Log activity
    await logActivity({
        deliveryRequestId: requestId,
        action: "REQUEST_ACCEPTED",
        performedBy: userId,
    });

    revalidatePath("/requests");
    return { success: true };
}

export async function rejectRequest(requestId: string, reason?: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const request = await db.query.deliveryRequests.findFirst({
        where: eq(deliveryRequests.id, requestId),
    });

    if (!request) return { success: false, error: "Request not found" };
    if (request.travellerId !== userId) return { success: false, error: "Unauthorized" };
    if (request.status !== "REQUESTED") return { success: false, error: "Request is no longer pending" };

    // Update request status
    await db
        .update(deliveryRequests)
        .set({ 
            status: "REJECTED", 
            rejectionReason: reason,
            updatedAt: new Date() 
        })
        .where(eq(deliveryRequests.id, requestId));

    // Create notification for customer
    await createNotification({
        userId: request.customerId,
        type: "REQUEST_REJECTED",
        title: "Request Rejected",
        message: reason ? `Your request was rejected: ${reason}` : "Your delivery request was rejected. You can send a new request with different terms.",
        relatedRequestId: requestId,
    });

    // Log activity
    await logActivity({
        deliveryRequestId: requestId,
        action: "REQUEST_REJECTED",
        performedBy: userId,
        metadata: { reason },
    });

    revalidatePath("/requests");
    return { success: true };
}

// ============================================
// CHAT MANAGEMENT
// ============================================

export async function getOrCreateChatChannel({
    travelPostId,
    travelerId,
}: {
    travelPostId: string;
    travelerId: string;
}) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Create a unique channel ID based on post and users (max 64 chars for Stream)
    // Use shorter IDs: first 8 chars of post ID + sorted user IDs truncated
    const shortPostId = travelPostId.replace(/-/g, '').slice(0, 8);
    const sortedUsers = [userId, travelerId].sort();
    const shortUser1 = sortedUsers[0].replace(/[^a-zA-Z0-9]/g, '').slice(-10);
    const shortUser2 = sortedUsers[1].replace(/[^a-zA-Z0-9]/g, '').slice(-10);
    const channelId = `c_${shortPostId}_${shortUser1}_${shortUser2}`;

    const serverClient = getStreamClient();

    // Upsert both users to Stream
    const currentUserData = await currentUser();
    await serverClient.upsertUsers([
        { 
            id: userId,
            name: currentUserData ? `${currentUserData.firstName || ''} ${currentUserData.lastName || ''}`.trim() || 'User' : 'User',
        },
        { id: travelerId }
    ]);

    // Create or get channel
    const channel = serverClient.channel("messaging", channelId, {
        created_by_id: userId,
        members: [userId, travelerId],
        travel_post_id: travelPostId,
    } as any);

    await channel.create();

    return { success: true, channelId };
}

// ============================================
// PAYMENT (DEMO)
// ============================================

export async function processPayment(requestId: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const request = await db.query.deliveryRequests.findFirst({
        where: eq(deliveryRequests.id, requestId),
        with: {
            travelPost: true,
        }
    });

    if (!request) return { success: false, error: "Request not found" };
    if (request.customerId !== userId) return { success: false, error: "Unauthorized" };
    if (request.status !== "ACCEPTED") return { success: false, error: "Request must be accepted before payment" };

    // Deduct weight from travel post
    const post = request.travelPost;
    if (post) {
        const currentRemaining = post.remainingWeight || 0;
        const newRemaining = Math.max(0, currentRemaining - request.offeredWeight);
        const newStatus = newRemaining <= 0 ? "LOCKED" : post.postStatus;

        await db.update(travelPosts)
            .set({
                remainingWeight: newRemaining,
                postStatus: newStatus,
                updatedAt: new Date(),
            })
            .where(eq(travelPosts.id, post.id));
    }

    // Create transaction record (DEMO - simulating payment)
    await db.insert(transactions).values({
        deliveryRequestId: requestId,
        amount: request.offeredPrice,
        currency: request.currency,
        status: "HELD",
        paidAt: new Date(),
    });

    // Update request status
    await db
        .update(deliveryRequests)
        .set({ status: "PAID", updatedAt: new Date() })
        .where(eq(deliveryRequests.id, requestId));

    // Create notification for traveler
    await createNotification({
        userId: request.travellerId,
        type: "PAYMENT_RECEIVED",
        title: "Payment Secured!",
        message: `$${(request.offeredPrice / 100).toFixed(2)} has been secured in escrow. You'll receive it after delivery confirmation.`,
        relatedRequestId: requestId,
    });

    // Log activity
    await logActivity({
        deliveryRequestId: requestId,
        action: "PAYMENT_MADE",
        performedBy: userId,
        metadata: { amount: request.offeredPrice, currency: request.currency },
    });

    // Create chat channel now that payment is made
    const serverClient = getStreamClient();
    const channelId = `delivery_${requestId}`;
    
    await serverClient.upsertUsers([
        { id: userId },
        { id: request.travellerId }
    ]);

    const channel = serverClient.channel("messaging", channelId, {
        created_by_id: request.travellerId,
        members: [userId, request.travellerId],
        travel_post_id: request.travelPostId,
        delivery_request_id: requestId,
    } as any);

    await channel.create();

    await channel.sendMessage({
        text: `💰 Payment of $${(request.offeredPrice / 100).toFixed(2)} has been secured. The delivery is now confirmed!`,
        user: { id: "system" },
        type: "system",
    });

    revalidatePath("/requests");
    revalidatePath("/travelers");
    return { success: true, channelId };
}

export async function releasePayment(requestId: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const transaction = await db.query.transactions.findFirst({
        where: eq(transactions.deliveryRequestId, requestId),
    });

    if (!transaction) return { success: false, error: "Transaction not found" };
    if (transaction.status !== "HELD") return { success: false, error: "Payment is not in escrow" };

    // Update transaction
    await db.update(transactions)
        .set({ 
            status: "RELEASED", 
            releasedAt: new Date(),
            updatedAt: new Date(),
        })
        .where(eq(transactions.id, transaction.id));

    return { success: true };
}

// ============================================
// DELIVERY MANAGEMENT
// ============================================

export async function startDelivery(requestId: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const request = await db.query.deliveryRequests.findFirst({
        where: eq(deliveryRequests.id, requestId),
    });

    if (!request) return { success: false, error: "Request not found" };
    if (request.travellerId !== userId) return { success: false, error: "Only the traveler can start delivery" };
    if (request.status !== "PAID") return { success: false, error: "Payment must be completed first" };

    // Update status
    await db.update(deliveryRequests)
        .set({ status: "IN_TRANSIT", updatedAt: new Date() })
        .where(eq(deliveryRequests.id, requestId));

    // Notification
    await createNotification({
        userId: request.customerId,
        type: "DELIVERY_STARTED",
        title: "Delivery Started",
        message: "Your package is now in transit!",
        relatedRequestId: requestId,
    });

    // Log activity
    await logActivity({
        deliveryRequestId: requestId,
        action: "DELIVERY_STARTED",
        performedBy: userId,
    });

    // Send message to chat
    const serverClient = getStreamClient();
    const channelId = `delivery_${requestId}`;
    const channel = serverClient.channel("messaging", channelId);

    await channel.sendMessage({
        text: "🚀 Delivery has started! The traveler is now on their way.",
        user: { id: "system" },
        type: "system",
    });

    revalidatePath("/requests");
    revalidatePath(`/messages/${channelId}`);
    return { success: true };
}

export async function markDelivered(requestId: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const request = await db.query.deliveryRequests.findFirst({
        where: eq(deliveryRequests.id, requestId),
    });

    if (!request) return { success: false, error: "Request not found" };
    if (request.travellerId !== userId) return { success: false, error: "Only the traveler can mark as delivered" };
    // Allow marking delivered from PAID status directly (simplified flow - no IN_TRANSIT step)
    if (request.status !== "PAID" && request.status !== "IN_TRANSIT") {
        return { success: false, error: "Payment must be completed first" };
    }

    // Update status directly to DELIVERED
    await db.update(deliveryRequests)
        .set({ status: "DELIVERED", updatedAt: new Date() })
        .where(eq(deliveryRequests.id, requestId));

    // Notification
    await createNotification({
        userId: request.customerId,
        type: "DELIVERY_MARKED",
        title: "Package Delivered",
        message: "The traveler has marked your package as delivered. Please confirm receipt.",
        relatedRequestId: requestId,
    });

    // Log activity
    await logActivity({
        deliveryRequestId: requestId,
        action: "DELIVERY_MARKED",
        performedBy: userId,
    });

    revalidatePath("/requests");
    return { success: true };
}

export async function confirmDelivery(requestId: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const request = await db.query.deliveryRequests.findFirst({
        where: eq(deliveryRequests.id, requestId),
    });

    if (!request) return { success: false, error: "Request not found" };
    if (request.customerId !== userId) return { success: false, error: "Only the customer can confirm delivery" };
    if (request.status !== "DELIVERED") return { success: false, error: "Delivery must be marked as delivered first" };

    // Release payment
    await releasePayment(requestId);

    // Update directly to COMPLETED (skip CONFIRMED intermediate state)
    await db.update(deliveryRequests)
        .set({ status: "COMPLETED", updatedAt: new Date() })
        .where(eq(deliveryRequests.id, requestId));

    // Notification to traveler
    await createNotification({
        userId: request.travellerId,
        type: "PAYMENT_RELEASED",
        title: "Payment Released!",
        message: `You've received $${(request.offeredPrice / 100).toFixed(2)} for your delivery. Thank you!`,
        relatedRequestId: requestId,
    });

    // Log activities
    await logActivity({
        deliveryRequestId: requestId,
        action: "DELIVERY_CONFIRMED",
        performedBy: userId,
    });

    await logActivity({
        deliveryRequestId: requestId,
        action: "PAYMENT_RELEASED",
        performedBy: userId,
    });

    revalidatePath("/requests");
    return { success: true };
}

// ============================================
// DATA FETCHING
// ============================================

export async function getDeliveryRequest(requestId: string) {
    const { userId } = await auth();
    if (!userId) return null;

    const request = await db.query.deliveryRequests.findFirst({
        where: eq(deliveryRequests.id, requestId),
        with: {
            travelPost: true,
            traveller: true,
            customer: true,
            transaction: true,
            activityLogs: {
                orderBy: [desc(activityLogs.createdAt)],
            },
        },
    });

    if (!request) return null;

    // Verify user is part of this request
    if (request.travellerId !== userId && request.customerId !== userId) {
        return null;
    }

    return request;
}

export async function getRequestActivityLogs(requestId: string) {
    const { userId } = await auth();
    if (!userId) return [];

    const request = await db.query.deliveryRequests.findFirst({
        where: eq(deliveryRequests.id, requestId),
    });

    if (!request) return [];
    if (request.travellerId !== userId && request.customerId !== userId) return [];

    const logs = await db.query.activityLogs.findMany({
        where: eq(activityLogs.deliveryRequestId, requestId),
        orderBy: [desc(activityLogs.createdAt)],
        with: {
            performer: {
                columns: {
                    firstName: true,
                    lastName: true,
                }
            }
        }
    });

    return logs;
}
