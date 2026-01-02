import { StreamChat } from "stream-chat";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
    try {
        // Validate environment variables first
        const apiKey = process.env.STREAM_API_KEY;
        const apiSecret = process.env.STREAM_SECRET_KEY;

        console.log("[Stream] API Key present:", !!apiKey, "length:", apiKey?.length);
        console.log("[Stream] API Secret present:", !!apiSecret, "length:", apiSecret?.length);

        if (!apiKey || !apiSecret) {
            console.error("[Stream] Missing Stream API credentials");
            return NextResponse.json(
                { error: "Server configuration error: Missing Stream credentials" },
                { status: 500 }
            );
        }

        const { userId } = await auth();
        console.log("[Stream] Auth userId:", userId);

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { travelerId, travelPostId } = body;
        console.log("[Stream] Request body:", { travelerId, travelPostId });

        if (!travelerId) {
            return NextResponse.json(
                { error: "Traveler ID is required" },
                { status: 400 }
            );
        }

        // Prevent messaging yourself
        if (userId === travelerId) {
            return NextResponse.json(
                { error: "Cannot message yourself" },
                { status: 400 }
            );
        }

        // Get current user info
        const user = await currentUser();
        console.log("[Stream] Current user first name:", user?.firstName);

        // Get traveler info from database
        const traveler = await db.query.users.findFirst({
            where: eq(users.id, travelerId),
            columns: {
                id: true,
                firstName: true,
                lastName: true,
            },
        });
        console.log("[Stream] Traveler found:", !!traveler, traveler?.firstName);

        if (!traveler) {
            return NextResponse.json(
                { error: "Traveler not found" },
                { status: 404 }
            );
        }

        // Create a NEW server client instance for this request
        // Using the constructor directly, NOT getInstance() which is a singleton
        console.log("[Stream] Creating Stream server client...");
        const serverClient = new StreamChat(apiKey, apiSecret);
        console.log("[Stream] Stream client created, devToken disabled");

        // Upsert BOTH users to Stream before creating channel
        console.log("[Stream] Upserting users to Stream...");
        const upsertResponse = await serverClient.upsertUsers([
            {
                id: userId,
                name: `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "User",
                image: user?.imageUrl,
            },
            {
                id: travelerId,
                name: `${traveler.firstName || ""} ${traveler.lastName || ""}`.trim() || "Traveler",
            },
        ]);
        console.log("[Stream] Users upserted, response users:", Object.keys(upsertResponse.users));

        // Create a unique channel ID based on participants (sorted to be consistent)
        // Stream has a 64 character limit for channel IDs
        // Clerk IDs can be long, so we create a shorter hash
        const members = [userId, travelerId].sort();
        const idSource = `${members[0]}_${members[1]}`;

        // Create a simple hash to shorten the ID
        const hashCode = (str: string) => {
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                const char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32bit integer
            }
            return Math.abs(hash).toString(36);
        };

        // Channel ID format: chat_{hash}_{optional short post id suffix}
        const postSuffix = travelPostId ? `_${travelPostId.slice(0, 8)}` : "";
        const channelId = `chat_${hashCode(idSource)}${postSuffix}`;
        console.log("[Stream] Channel ID:", channelId, "length:", channelId.length);

        // Create or get existing channel with both users as members
        const channel = serverClient.channel("messaging", channelId, {
            members: members,
            created_by_id: userId,
        });

        console.log("[Stream] Creating channel...");
        await channel.create();
        console.log("[Stream] Channel created successfully:", channel.id);

        return NextResponse.json({ channelId: channel.id });
    } catch (error) {
        console.error("[Stream] Error creating channel:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("[Stream] Error message:", errorMessage);
        return NextResponse.json(
            { error: `Failed to create channel: ${errorMessage}` },
            { status: 500 }
        );
    }
}
