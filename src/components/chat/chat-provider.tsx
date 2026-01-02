"use client";

import { useEffect, useState, createContext, useContext, useCallback } from "react";
import { StreamChat, Channel as StreamChannel } from "stream-chat";
import { Chat } from "stream-chat-react";
import { useUser } from "@clerk/nextjs";

import "stream-chat-react/dist/css/v2/index.css";

interface ChatContextType {
    client: StreamChat | null;
    isConnecting: boolean;
}

const ChatContext = createContext<ChatContextType>({
    client: null,
    isConnecting: true,
});

export const useChatClient = () => useContext(ChatContext);

export function ChatProvider({ children }: { children: React.ReactNode }) {
    const [client, setClient] = useState<StreamChat | null>(null);
    const [isConnecting, setIsConnecting] = useState(true);
    const { user, isLoaded, isSignedIn } = useUser();

    const initChat = useCallback(async () => {
        if (!isLoaded || !isSignedIn || !user) {
            setIsConnecting(false);
            return;
        }

        try {
            setIsConnecting(true);

            // Fetch token from our API
            const res = await fetch("/api/chat/token");
            if (!res.ok) {
                throw new Error("Failed to get chat token");
            }

            const { token, userId } = await res.json();

            // Initialize Stream Chat client
            const chatClient = StreamChat.getInstance(
                process.env.NEXT_PUBLIC_STREAM_API_KEY!
            );

            // Connect user
            await chatClient.connectUser(
                {
                    id: userId,
                    name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User",
                    image: user.imageUrl,
                },
                token
            );

            setClient(chatClient);
        } catch (error) {
            console.error("Error initializing chat:", error);
        } finally {
            setIsConnecting(false);
        }
    }, [isLoaded, isSignedIn, user]);

    useEffect(() => {
        initChat();

        return () => {
            if (client) {
                client.disconnectUser().catch(console.error);
            }
        };
    }, [initChat]);

    if (!isSignedIn) {
        return <>{children}</>;
    }

    if (isConnecting) {
        return (
            <div className="flex items-center justify-center min-h-[200px]">
                <div className="animate-pulse text-zinc-500">Connecting to chat...</div>
            </div>
        );
    }

    if (!client) {
        return <>{children}</>;
    }

    return (
        <ChatContext.Provider value={{ client, isConnecting }}>
            <Chat client={client} theme="str-chat__theme-dark">
                {children}
            </Chat>
        </ChatContext.Provider>
    );
}
