"use client";

import { useEffect, useState, createContext, useContext, useCallback } from "react";
import { StreamChat, Channel as StreamChannel } from "stream-chat";
import { Chat } from "stream-chat-react";
import { useUser } from "@clerk/nextjs";

import "stream-chat-react/dist/css/v2/index.css";

interface ChatContextType {
    client: StreamChat | null;
    isConnecting: boolean;
    unreadCount: number;
}

const ChatContext = createContext<ChatContextType>({
    client: null,
    isConnecting: true,
    unreadCount: 0,
});

export const useChatClient = () => useContext(ChatContext);

export function ChatProvider({ children }: { children: React.ReactNode }) {
    const [client, setClient] = useState<StreamChat | null>(null);
    const [isConnecting, setIsConnecting] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
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

            const count = (chatClient.user as any)?.total_unread_count || 0;
            setUnreadCount(count);

            chatClient.on("notification.message_new", (event) => {
                setUnreadCount((chatClient.user as any)?.total_unread_count || 0);
            });

            chatClient.on("notification.mark_read", (event) => {
                setUnreadCount((chatClient.user as any)?.total_unread_count || 0);
            });
            
            // Also listen for general message events if needed, but notifications usually cover it for "me"
            chatClient.on("message.new", () => {
                 setUnreadCount((chatClient.user as any)?.total_unread_count || 0);
            });

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
                setClient(null);
            }
        };
    }, [initChat]);

    return (
        <ChatContext.Provider value={{ client, isConnecting, unreadCount }}>
            {children}
        </ChatContext.Provider>
    );
}
