"use client";

import { Chat } from "stream-chat-react";
import { useChatClient } from "@/components/chat/chat-provider";
import { Loader2 } from "lucide-react";

export function ChatUIWrapper({ children }: { children: React.ReactNode }) {
    const { client, isConnecting } = useChatClient();

    if (isConnecting) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
            </div>
        );
    }

    if (!client) {
        return <div className="flex items-center justify-center h-full text-zinc-500">Failed to connect to chat</div>;
    }

    return (
        <Chat client={client} theme="str-chat__theme-dark">
            {children}
        </Chat>
    );
}
