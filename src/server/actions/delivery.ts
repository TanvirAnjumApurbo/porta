"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { deliveryRequests, travelPosts, users, dealTerms } from "@/lib/db/schema";
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

export async function createDeliveryRequest({
    travelPostId,
    travelerId,
}: {
    travelPostId: string;
    travelerId: string;
}) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // 1. Check if Travel Post is OPEN
    const post = await db.query.travelPosts.findFirst({
        where: eq(travelPosts.id, travelPostId),
    });

    if (!post) throw new Error("Trip not found");
    if (post.postStatus !== "OPEN") throw new Error("This trip is no longer accepting requests");
    if (post.userId === userId) throw new Error("You cannot request your own trip");

    // 2. Check for existing request
    const existingRequest = await db.query.deliveryRequests.findFirst({
        where: and(
            eq(deliveryRequests.travelPostId, travelPostId),
            eq(deliveryRequests.customerId, userId)
        ),
    });

    if (existingRequest) {
        if (existingRequest.status === "CANCELLED" || existingRequest.status === "REJECTED") {
            // Revive the request
            await db.update(deliveryRequests)
                .set({
                    status: "REQUESTED",
                    updatedAt: new Date()
                })
                .where(eq(deliveryRequests.id, existingRequest.id));

            revalidatePath("/messages");
            return { success: true, requestId: existingRequest.id, status: "REQUESTED", isExisting: false };
        }
        return { success: true, requestId: existingRequest.id, status: existingRequest.status, isExisting: true };
    }

    // 3. Create Request
    const [newRequest] = await db
        .insert(deliveryRequests)
        .values({
            travelPostId,
            travellerId: travelerId,
            customerId: userId,
            status: "REQUESTED",
        })
        .returning({ id: deliveryRequests.id });

    revalidatePath("/messages");
    return { success: true, requestId: newRequest.id, status: "REQUESTED" };
}

export async function getIncomingRequests() {
    const { userId } = await auth();
    if (!userId) return [];

    // Requests SENT TO me (as traveler)
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

export async function manageDeliveryRequest(requestId: string, action: "ACCEPT" | "REJECT") {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const request = await db.query.deliveryRequests.findFirst({
        where: eq(deliveryRequests.id, requestId),
    });

    if (!request) throw new Error("Request not found");
    if (request.travellerId !== userId) throw new Error("Unauthorized");

    if (action === "REJECT") {
        await db
            .update(deliveryRequests)
            .set({ status: "REJECTED" })
            .where(eq(deliveryRequests.id, requestId));

        revalidatePath("/messages");
        return { success: true };
    }

    if (action === "ACCEPT") {
        // 1. Create Stream Channel
        const serverClient = getStreamClient();

        // Upsert both users to Stream
        await serverClient.upsertUsers([
            { id: userId },
            { id: request.customerId }
        ]);

        const channelId = `delivery_${requestId}`;
        const channel = serverClient.channel("messaging", channelId, {
            created_by_id: userId,
            members: [userId, request.customerId],
            travel_post_id: request.travelPostId,
            delivery_request_id: requestId,
        } as any);

        await channel.create();

        // 2. Update DB Status
        await db
            .update(deliveryRequests)
            .set({ status: "NEGOTIATING" })
            .where(eq(deliveryRequests.id, requestId));

        revalidatePath("/messages");
        return { success: true, channelId };
    }
}

export async function proposeDeal({
    requestId,
    price,
    weight,
    currency = "USD",
}: {
    requestId: string;
    price: number;
    weight: number;
    currency?: string;
}) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // 1. Verify Request Exists & Belongs to User
    const request = await db.query.deliveryRequests.findFirst({
        where: eq(deliveryRequests.id, requestId),
    });

    if (!request) throw new Error("Request not found");
    if (request.travellerId !== userId && request.customerId !== userId) {
        throw new Error("Unauthorized");
    }

    // 2. Insert Deal Terms
    const [deal] = await db.insert(dealTerms).values({
        deliveryRequestId: requestId,
        proposedPrice: price,
        weight: weight,
        currency,
        proposedBy: userId,
        status: "PROPOSED",
    }).returning();

    // 3. Send System Message to Stream
    const serverClient = getStreamClient();
    const channelId = `delivery_${requestId}`;
    const channel = serverClient.channel("messaging", channelId);

    // Ensure channel exists (idempotent)
    await channel.create();

    await channel.addMembers([userId]); // Ensure user is member

    await channel.sendMessage({
        text: `Deal Proposed: ${weight}kg for ${currency} ${price / 100}`,
        user: { id: userId },
        type: "system",
        attachments: [{
            type: "deal_proposal",
            deal_id: deal.id,
            price: price,
            weight: weight,
            currency: currency,
            status: "PROPOSED"
        }] as any
    });

    revalidatePath(`/messages/${channelId}`);
    return { success: true, dealId: deal.id };
}

export async function acceptDeal({ dealId }: { dealId: string }) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // 1. Get Deal
    const deal = await db.query.dealTerms.findFirst({
        where: eq(dealTerms.id, dealId),
        with: {
            deliveryRequest: true
        }
    });

    if (!deal) throw new Error("Deal not found");
    // Verify user is NOT the proposer (you can't accept your own deal)
    if (deal.proposedBy === userId) throw new Error("You cannot accept your own proposal");

    // Verify participant
    const req = deal.deliveryRequest as any;
    if (!req) throw new Error("Request not found for this deal"); // Safety check

    if (req.travellerId !== userId && req.customerId !== userId) throw new Error("Unauthorized");

    // 2. Update Deal Status
    await db.update(dealTerms)
        .set({ status: "ACCEPTED" })
        .where(eq(dealTerms.id, dealId));

    // 3. Update Delivery Request Status -> CONFIRMED
    await db.update(deliveryRequests)
        .set({ status: "CONFIRMED" })
        .where(eq(deliveryRequests.id, req.id));

    // 4. Deduct capacity from travel post
    const travelPost = await db.query.travelPosts.findFirst({
        where: eq(travelPosts.id, req.travelPostId),
    });

    if (travelPost) {
        const currentRemaining = travelPost.remainingWeight || 0;
        const newRemaining = Math.max(0, currentRemaining - deal.weight);
        const newStatus = newRemaining <= 0 ? "LOCKED" : travelPost.postStatus;

        await db.update(travelPosts)
            .set({
                remainingWeight: newRemaining,
                postStatus: newStatus
            })
            .where(eq(travelPosts.id, req.travelPostId));
    }

    // 5. Send System Message
    const serverClient = getStreamClient();
    const channelId = `delivery_${req.id}`;
    const channel = serverClient.channel("messaging", channelId);

    await channel.sendMessage({
        text: `Deal Accepted! Trip is confirmed.`,
        user: { id: userId },
        type: "system",
        ...({ event_type: "deal_accepted" } as any)
    });

    revalidatePath(`/messages/${channelId}`);
    revalidatePath("/travelers"); // Refresh travelers list to show updated capacity
    return { success: true };
}

export async function getActiveDeal(requestId: string) {
    const { userId } = await auth();
    if (!userId) return null; // Safe return for UI

    // Get latest deal
    // Status can be PROPOSED or ACCEPTED
    const deal = await db.query.dealTerms.findFirst({
        where: eq(dealTerms.deliveryRequestId, requestId),
        orderBy: [desc(dealTerms.createdAt)],
    });

    return deal;
}

export async function checkDeliveryRequestStatus(travelPostId: string) {
    const { userId } = await auth();
    if (!userId) return null;

    const request = await db.query.deliveryRequests.findFirst({
        where: and(
            eq(deliveryRequests.travelPostId, travelPostId),
            eq(deliveryRequests.customerId, userId)
        ),
    });

    return request ? request.status : null;
}
