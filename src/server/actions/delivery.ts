"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { deliveryRequests, travelPosts, users } from "@/lib/db/schema";
import { eq, and, or, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { StreamChat } from "stream-chat";

// Initialize Stream Chat Server Client
const serverClient = StreamChat.getInstance(
    process.env.NEXT_PUBLIC_STREAM_KEY!,
    process.env.STREAM_SECRET!
);

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
        if (existingRequest.status === "CANCELLED") {
            // Optionally allow re-requesting
            return { success: true, requestId: existingRequest.id, status: existingRequest.status, isExisting: true };
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
            .set({ status: "CANCELLED" })
            .where(eq(deliveryRequests.id, requestId));

        revalidatePath("/messages");
        return { success: true };
    }

    if (action === "ACCEPT") {
        // 1. Create Stream Channel
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
