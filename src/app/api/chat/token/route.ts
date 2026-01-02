import { StreamChat } from "stream-chat";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await currentUser();

        const serverClient = new StreamChat(
            process.env.STREAM_API_KEY!,
            process.env.STREAM_SECRET_KEY!
        );

        // Upsert user to Stream with their profile data
        await serverClient.upsertUser({
            id: userId,
            name: `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "User",
            image: user?.imageUrl,
        });

        // Generate token for client-side authentication
        const token = serverClient.createToken(userId);

        return NextResponse.json({ token, userId });
    } catch (error) {
        console.error("Error generating Stream token:", error);
        return NextResponse.json(
            { error: "Failed to generate token" },
            { status: 500 }
        );
    }
}
