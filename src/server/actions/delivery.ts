"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { deliveryRequests, travelPosts, users, notifications, activityLogs, transactions } from "@/lib/db/schema";
import { eq, and, or, desc, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { StreamChat } from "stream-chat";
import { sendProductPurchasedEmail, sendDeliveryOTPEmail } from "@/lib/email";

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
    type: "REQUEST_RECEIVED" | "REQUEST_ACCEPTED" | "REQUEST_REJECTED" | "PAYMENT_RECEIVED" | "DELIVERY_STARTED" | "DELIVERY_MARKED" | "DELIVERY_CONFIRMED" | "PAYMENT_RELEASED" | "NEW_MESSAGE" | "PRODUCT_PURCHASED" | "OTP_GENERATED";
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
    action: "REQUEST_SENT" | "REQUEST_ACCEPTED" | "REQUEST_REJECTED" | "PAYMENT_MADE" | "DELIVERY_STARTED" | "DELIVERY_MARKED" | "DELIVERY_CONFIRMED" | "PAYMENT_RELEASED" | "REQUEST_CANCELLED" | "PRODUCT_PURCHASED" | "OTP_GENERATED";
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

    // Check time: reject if arrival is within 1 hour
    if (post.arrivalTime) {
        try {
            let arrivalDateTime: Date;
            if (post.arrivalTime.includes('T')) {
                arrivalDateTime = new Date(post.arrivalTime);
            } else {
                const dateStr = post.arrivalDate || post.travelDate;
                arrivalDateTime = new Date(`${dateStr}T${post.arrivalTime}:00`);
            }
            const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
            if (!isNaN(arrivalDateTime.getTime()) && arrivalDateTime <= oneHourFromNow) {
                return { success: false, error: "This trip is no longer accepting requests (departing soon)" };
            }
        } catch (e) {
            // If parsing fails, allow the request
        }
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

    // Requests SENT TO me (as traveler) - Include active states
    const requests = await db.query.deliveryRequests.findMany({
        where: and(
            eq(deliveryRequests.travellerId, userId),
            inArray(deliveryRequests.status, [
                "REQUESTED", 
                "ACCEPTED", 
                "PAID", 
                "PURCHASED",
                "IN_TRANSIT", 
                "DELIVERED", 
                "CONFIRMED"
            ])
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
// PAYMENT (STRIPE INTEGRATION)
// ============================================

import { capturePayment } from "@/lib/stripe";

// Legacy processPayment - now redirects to Stripe
// This function is kept for backwards compatibility but will redirect to checkout
export async function processPayment(requestId: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const request = await db.query.deliveryRequests.findFirst({
        where: eq(deliveryRequests.id, requestId),
        with: {
            traveller: true,
        }
    });

    if (!request) return { success: false, error: "Request not found" };
    if (request.customerId !== userId) return { success: false, error: "Unauthorized" };
    if (request.status !== "ACCEPTED") return { success: false, error: "Request must be accepted before payment" };

    // Check if traveler has completed Stripe Connect onboarding
    const traveler = request.traveller;
    if (!traveler?.stripeConnectAccountId || !traveler?.stripeConnectOnboardingComplete) {
        return { 
            success: false, 
            error: "The traveler has not set up payment receiving yet. Please wait or contact them.",
            code: "TRAVELER_NOT_SETUP"
        };
    }

    // Return the checkout URL for redirect
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return { 
        success: true, 
        redirectToStripe: true,
        checkoutUrl: `/api/stripe/checkout`,
        requestId,
    };
}

// Create chat channel after successful payment (called from webhook or success page)
export async function createDeliveryChatChannel(requestId: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const request = await db.query.deliveryRequests.findFirst({
        where: eq(deliveryRequests.id, requestId),
    });

    if (!request) return { success: false, error: "Request not found" };
    
    // Verify user is part of this request
    if (request.customerId !== userId && request.travellerId !== userId) {
        return { success: false, error: "Unauthorized" };
    }

    // Only create channel if request is paid
    if (!["PAID", "PURCHASED", "IN_TRANSIT", "DELIVERED", "CONFIRMED", "COMPLETED"].includes(request.status)) {
        return { success: false, error: "Payment must be completed first" };
    }

    const serverClient = getStreamClient();
    const channelId = `delivery_${requestId}`;
    
    await serverClient.upsertUsers([
        { id: request.customerId },
        { id: request.travellerId }
    ]);

    const channel = serverClient.channel("messaging", channelId, {
        created_by_id: request.travellerId,
        members: [request.customerId, request.travellerId],
        travel_post_id: request.travelPostId,
        delivery_request_id: requestId,
    } as any);

    await channel.create();

    // Only send system message if it's a new channel
    try {
        await channel.sendMessage({
            text: `💰 Payment has been secured in escrow. The delivery is now confirmed!`,
            user: { id: "system" },
            type: "system",
        });
    } catch (e) {
        // Channel message already exists, ignore
    }

    revalidatePath("/requests");
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

    // Capture the payment via Stripe if we have a payment intent
    if (transaction.stripePaymentIntentId) {
        try {
            await capturePayment(transaction.stripePaymentIntentId);
        } catch (error) {
            console.error("Failed to capture payment:", error);
            return { success: false, error: "Failed to release payment" };
        }
    }

    // Update transaction
    await db.update(transactions)
        .set({ 
            status: "RELEASED", 
            releasedAt: new Date(),
            updatedAt: new Date(),
        })
        .where(eq(transactions.id, transaction.id));

    return { success: true, travelerPayout: transaction.travelerPayout };
}

// ============================================
// DELIVERY MANAGEMENT
// ============================================

export async function markProductPurchased(requestId: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const request = await db.query.deliveryRequests.findFirst({
        where: eq(deliveryRequests.id, requestId),
        with: {
            customer: true
        }
    });

    if (!request) return { success: false, error: "Request not found" };
    if (request.travellerId !== userId) return { success: false, error: "Only the traveler can mark product as purchased" };
    if (request.status !== "PAID") return { success: false, error: "Payment must be completed first" };

    // Update status
    await db.update(deliveryRequests)
        .set({ status: "PURCHASED", updatedAt: new Date() })
        .where(eq(deliveryRequests.id, requestId));

    // Notification
    await createNotification({
        userId: request.customerId,
        type: "PRODUCT_PURCHASED",
        title: "Product Purchased!",
        message: "The traveler has purchased your item.",
        relatedRequestId: requestId,
    });

    // Log activity
    await logActivity({
        deliveryRequestId: requestId,
        action: "PRODUCT_PURCHASED",
        performedBy: userId,
    });

    // Send Email
    if (request.customer?.email) {
        const traveler = await db.query.users.findFirst({
            where: eq(users.id, userId),
            columns: { firstName: true, lastName: true },
        });
        const travelerName = traveler ? `${traveler.firstName || ''} ${traveler.lastName || ''}`.trim() || 'Traveler' : 'Traveler';
        const customerName = `${request.customer.firstName || ''} ${request.customer.lastName || ''}`.trim() || 'Customer';

        const emailResult = await sendProductPurchasedEmail(
            request.customer.email,
            customerName,
            travelerName,
            request.packageDescription,
            requestId
        );
        console.log("Email send result:", JSON.stringify(emailResult, null, 2));
    }

    // Send message to chat
    const serverClient = getStreamClient();
    const channelId = `delivery_${requestId}`;
    const channel = serverClient.channel("messaging", channelId);

    await channel.sendMessage({
        text: "🛍️ I have purchased the item!",
        user: { id: userId }, 
    });

    revalidatePath("/requests");
    return { success: true };
}

export async function startDelivery(requestId: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const request = await db.query.deliveryRequests.findFirst({
        where: eq(deliveryRequests.id, requestId),
    });

    if (!request) return { success: false, error: "Request not found" };
    if (request.travellerId !== userId) return { success: false, error: "Only the traveler can start delivery" };
    // Allow starting delivery from PAID or PURCHASED status
    if (request.status !== "PAID" && request.status !== "PURCHASED") return { success: false, error: "Payment must be completed first" };

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
    // Allow marking delivered from PAID, PURCHASED, or IN_TRANSIT status
    if (["PAID", "PURCHASED", "IN_TRANSIT"].indexOf(request.status) === -1) {
        return { success: false, error: "Invalid status for delivery" };
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

// ============================================
// OTP VERIFICATION
// ============================================

export async function generateDeliveryOTP(requestId: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const request = await db.query.deliveryRequests.findFirst({
        where: eq(deliveryRequests.id, requestId),
        with: {
            customer: true,
            traveller: true,
        }
    });

    if (!request) return { success: false, error: "Request not found" };
    if (request.travellerId !== userId) return { success: false, error: "Only traveler can generate OTP" };
    
    // Allow generating OTP if purchased or in transit
    if (request.status !== "PURCHASED" && request.status !== "IN_TRANSIT" && request.status !== "PAID") {
         return { success: false, error: "Must be in purchased or transit phase" };
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save to DB
    await db.update(deliveryRequests)
        .set({ deliveryProofOtp: otp, updatedAt: new Date() })
        .where(eq(deliveryRequests.id, requestId));

    // Send email to customer
    const customerName = `${request.customer.firstName || ''} ${request.customer.lastName || ''}`.trim() || 'Customer';
    
    await sendDeliveryOTPEmail(
        request.customer.email,
        customerName,
        otp,
        requestId
    );

    await createNotification({
        userId: request.customerId,
        type: "OTP_GENERATED",
        title: "Delivery Code",
        message: `Your delivery confirmation code is ${otp}. Share this with the traveler ONLY when you receive the item.`,
        relatedRequestId: requestId,
    });

    await logActivity({
        deliveryRequestId: requestId,
        action: "OTP_GENERATED",
        performedBy: userId,
        metadata: { otp: "******" } // Don't log actual OTP
    });

    revalidatePath("/requests");
    return { success: true };
}

export async function verifyDeliveryOTP(requestId: string, otp: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const request = await db.query.deliveryRequests.findFirst({
        where: eq(deliveryRequests.id, requestId),
        with: {
            transaction: true,
            customer: true, // Need to notify customer
        }
    });

    if (!request) return { success: false, error: "Request not found" };
    if (request.travellerId !== userId) return { success: false, error: "Only traveler can verify OTP" };
    
    if (!request.deliveryProofOtp) return { success: false, error: "No OTP generated for this request" };
    
    if (request.deliveryProofOtp !== otp) {
        return { success: false, error: "Invalid OTP Code" };
    }

    // 1. Update Request Status to COMPLETED
    await db.update(deliveryRequests)
        .set({ 
            status: "COMPLETED", 
            deliveryProofOtp: null, 
            updatedAt: new Date() 
        })
        .where(eq(deliveryRequests.id, requestId));

    // 2. Release Funds - Query transaction directly to ensure we find it
    const transaction = await db.query.transactions.findFirst({
        where: eq(transactions.deliveryRequestId, requestId),
    });
    
    if (transaction) {
        await db.update(transactions)
            .set({ 
                status: "RELEASED", 
                releasedAt: new Date(),
                updatedAt: new Date()
            })
            .where(eq(transactions.id, transaction.id));
    }

    // 3. Log and Notify
    await createNotification({
        userId: request.customerId,
        type: "DELIVERY_CONFIRMED",
        title: "Delivery Completed",
        message: "Delivery verified via OTP. Payment released.",
        relatedRequestId: requestId,
    });

    await logActivity({
        deliveryRequestId: requestId,
        action: "DELIVERY_CONFIRMED",
        performedBy: userId,
        metadata: { method: "otp" }
    });

    revalidatePath("/requests");
    return { success: true };
}
