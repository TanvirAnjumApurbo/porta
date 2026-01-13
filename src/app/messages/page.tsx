"use client";

import { useChatClient } from "@/components/chat/chat-provider";
import { ChannelList, ChannelPreviewMessenger } from "stream-chat-react";
import { useRouter } from "next/navigation";
import { MessageSquare, Package, ArrowRight } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
            {/* Channel List Sidebar - full width on mobile, max-w-sm on desktop */}
            <div className="w-full md:w-80 lg:max-w-sm border-r border-white/5 flex flex-col">
                <div className="p-4 border-b border-white/5">
                    <h1 className="text-xl font-bold">Messages</h1>
                    <p className="text-sm text-zinc-500">Your conversations</p>
                </div>

                {/* Quick Link to Requests */}
                <div className="p-4 border-b border-white/5">
                    <Link href="/requests">
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 hover:border-primary/50 transition-colors group cursor-pointer">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Package className="w-4 h-4 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-zinc-200">My Requests</p>
                                        <p className="text-xs text-zinc-500">View incoming & sent requests</p>
                                    </div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-primary transition-colors" />
                            </div>
                        </div>
                    </Link>
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
                                    Conversations will appear here after a request is accepted and paid
                                </p>
                                {/* Mobile-only browse buttons */}
                                <div className="mt-4 flex flex-col gap-2 md:hidden">
                                    <Button variant="outline" asChild className="border-zinc-700 w-full">
                                        <Link href="/travelers">Browse Travelers</Link>
                                    </Button>
                                    <Button asChild className="w-full">
                                        <Link href="/requests">My Requests</Link>
                                    </Button>
                                </div>
                            </div>
                        )}
                    />
                </div>
            </div>

            {/* Empty State - Select a conversation (hidden on mobile) */}
            <div className="hidden md:flex flex-1 items-center justify-center bg-zinc-950/50">
                <div className="text-center max-w-md px-4">
                    <MessageSquare className="w-16 h-16 text-zinc-800 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-zinc-400 mb-2">
                        Select a conversation
                    </h2>
                    <p className="text-zinc-600 text-sm mb-6">
                        Choose from your existing conversations, or start by browsing travelers and sending a request
                    </p>
                    <div className="flex gap-3 justify-center">
                        <Button variant="outline" asChild className="border-zinc-700">
                            <Link href="/travelers">Browse Travelers</Link>
                        </Button>
                        <Button asChild>
                            <Link href="/requests">My Requests</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
