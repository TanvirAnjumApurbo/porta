"use client";

import { useChatClient } from "@/components/chat/chat-provider";
import { ChannelList, ChannelPreviewMessenger } from "stream-chat-react";
import { useRouter } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { RequestsInbox } from "@/components/dashboard/requests-inbox";

export default function MessagesPage() {
    const { client, isConnecting } = useChatClient();
    const { user, isSignedIn } = useUser();
    const router = useRouter();

    if (!isSignedIn) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center glass-card p-8 rounded-xl max-w-md">
                    <MessageSquare className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Sign in to view messages</h2>
                    <p className="text-zinc-500">
                        You need to be signed in to access your conversations.
                    </p>
                </div>
            </div>
        );
    }

    if (isConnecting || !client) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="animate-pulse text-zinc-500">Loading conversations...</div>
            </div>
        );
    }

    const filters = { members: { $in: [user?.id || ""] }, type: "messaging" };
    const sort = { last_message_at: -1 as const };

    return (
        <div className="h-full flex">
            {/* Channel List Sidebar */}
            <div className="w-full max-w-sm border-r border-white/5 flex flex-col">
                <div className="p-4 border-b border-white/5">
                    <h1 className="text-xl font-bold">Messages</h1>
                    <p className="text-sm text-zinc-500">Your conversations with travelers</p>
                </div>

                {/* Inbox for pending requests */}
                <div className="p-4">
                    <RequestsInbox />
                </div>

                <div className="flex-1 overflow-y-auto">
                    <ChannelList
                        filters={filters}
                        sort={sort}
                        Preview={(props) => (
                            <ChannelPreviewMessenger
                                {...props}
                                onSelect={() => {
                                    if (props.channel?.id) {
                                        router.push(`/messages/${props.channel.id}`);
                                    }
                                }}
                            />
                        )}
                        EmptyStateIndicator={() => (
                            <div className="p-6 text-center">
                                <MessageSquare className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                                <p className="text-zinc-500 text-sm">No active conversations</p>
                                <p className="text-zinc-600 text-xs mt-1">
                                    Check requests above or contact a traveler
                                </p>
                            </div>
                        )}
                    />
                </div>
            </div>

            {/* Empty State - Select a conversation */}
            <div className="flex-1 flex items-center justify-center bg-zinc-950/50">
                <div className="text-center">
                    <MessageSquare className="w-16 h-16 text-zinc-800 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-zinc-400 mb-2">
                        Select a conversation
                    </h2>
                    <p className="text-zinc-600 text-sm">
                        Choose from your existing conversations or contact a traveler
                    </p>
                </div>
            </div>
        </div>
    );
}
