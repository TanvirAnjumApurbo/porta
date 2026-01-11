"use client";

import { useEffect, useState } from "react";
import { useChatClient } from "@/components/chat/chat-provider";
import {
    Channel,
    ChannelHeader,
    MessageList,
    MessageInput,
    Thread,
    Window,
} from "stream-chat-react";
import { Channel as StreamChannel } from "stream-chat";
import { useRouter } from "next/navigation";
import { ArrowLeft, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

interface ChatPageProps {
    params: Promise<{
        channelId: string;
    }>;
}

import { DealWidget } from "@/components/chat/deal-widget";
import { getActiveDeal } from "@/server/actions/delivery";

export default function ChatPage({ params }: ChatPageProps) {
    const [channelId, setChannelId] = useState<string | null>(null);
    const [channel, setChannel] = useState<StreamChannel | null>(null);
    const [activeDeal, setActiveDeal] = useState<any>(null); // State for active deal
    const [isLoading, setIsLoading] = useState(true);
    const { client } = useChatClient();
    const { isSignedIn } = useUser();
    const router = useRouter();

    // Unwrap params
    useEffect(() => {
        params.then((p) => setChannelId(p.channelId));
    }, [params]);

    useEffect(() => {
        if (!client || !channelId) return;

        const initChannel = async () => {
            try {
                setIsLoading(true);
                const chatChannel = client.channel("messaging", channelId);
                await chatChannel.watch();
                setChannel(chatChannel);

                // Fetch Active Deal if delivery Request ID exists
                // Cast to any because custom data doesn't auto-type
                const customData = chatChannel.data as any;
                if (customData?.delivery_request_id) {
                    const deal = await getActiveDeal(customData.delivery_request_id);
                    if (deal) setActiveDeal(deal);
                }

            } catch (error) {
                console.error("Error loading channel:", error);
                router.push("/messages");
            } finally {
                setIsLoading(false);
            }
        };

        initChannel();

        return () => {
            channel?.stopWatching();
        };
    }, [client, channelId]);

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

    if (isLoading || !channel) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="animate-pulse text-zinc-500">Loading conversation...</div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Back Button for Mobile */}
            <div className="md:hidden p-3 border-b border-white/5">
                <Link
                    href="/messages"
                    className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to messages
                </Link>
            </div>

            <div className="flex-1 flex">
                {/* Desktop: Show channel list */}
                <div className="hidden md:block w-80 border-r border-white/5 overflow-y-auto">
                    <div className="p-4 border-b border-white/5">
                        <h2 className="font-semibold">Messages</h2>
                    </div>
                    {/* Channel list would go here - simplified for now */}
                    <Link
                        href="/messages"
                        className="block p-3 text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        ← View all conversations
                    </Link>
                </div>

                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col">
                    <Channel channel={channel}>
                        <Window>
                            <ChannelHeader />
                            {/* Deal Widget Area */}
                            <div className="px-4 pt-4">
                                <DealWidget
                                    channel={channel}
                                    travelerId={(channel.data as any)?.created_by?.id as string}
                                    deliveryRequestId={(channel.data as any)?.delivery_request_id as string}
                                    activeDeal={activeDeal}
                                />
                            </div>
                            <MessageList />
                            <MessageInput />
                        </Window>
                        <Thread />
                    </Channel>
                </div>
            </div>
        </div>
    );
}
