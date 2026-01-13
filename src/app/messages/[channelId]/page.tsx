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
import { ArrowLeft, MessageSquare, Package, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

import { DeliveryStatusWidget } from "@/components/chat/delivery-status-widget";
import { getDeliveryRequest } from "@/server/actions/delivery";

interface ChatPageProps {
    params: Promise<{
        channelId: string;
    }>;
}

export default function ChatPage({ params }: ChatPageProps) {
    const [channelId, setChannelId] = useState<string | null>(null);
    const [channel, setChannel] = useState<StreamChannel | null>(null);
    const [deliveryRequest, setDeliveryRequest] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { client } = useChatClient();
    const { isSignedIn, user } = useUser();
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

                // Fetch Delivery Request if ID exists (for delivery channels)
                const customData = chatChannel.data as any;
                if (customData?.delivery_request_id) {
                    const request = await getDeliveryRequest(customData.delivery_request_id);
                    if (request) setDeliveryRequest(request);
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

    const isDeliveryChannel = channelId?.startsWith("delivery_");
    const isTraveler = deliveryRequest && user?.id === deliveryRequest.travellerId;
    const isCustomer = deliveryRequest && user?.id === deliveryRequest.customerId;

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
                            
                            {/* Delivery Request Info Banner */}
                            {isDeliveryChannel && deliveryRequest && (
                                <div className="px-4 pt-4 space-y-3">
                                    {/* Request Summary Banner */}
                                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-primary/10 rounded-lg">
                                                    <Package className="w-5 h-5 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-zinc-200">
                                                        {deliveryRequest.travelPost?.departureCity} → {deliveryRequest.travelPost?.destinationCity}
                                                    </p>
                                                    <p className="text-xs text-zinc-500">
                                                        {(deliveryRequest.offeredWeight / 1000).toFixed(1)}kg • ${(deliveryRequest.offeredPrice / 100).toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="border-zinc-700 text-zinc-400 hover:text-white"
                                                onClick={() => router.push(`/requests/${deliveryRequest.id}`)}
                                            >
                                                <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                                                Details
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Delivery Status Widget */}
                                    {["PAID", "IN_TRANSIT", "DELIVERED", "CONFIRMED", "COMPLETED"].includes(deliveryRequest.status) && (
                                        <DeliveryStatusWidget
                                            requestId={deliveryRequest.id}
                                            status={deliveryRequest.status}
                                            isTraveler={isTraveler}
                                            isCustomer={isCustomer}
                                        />
                                    )}
                                </div>
                            )}

                            <MessageList />
                            {deliveryRequest?.status === "COMPLETED" ? (
                                <div className="p-4 text-center text-zinc-500 text-sm border-t border-zinc-800">
                                    This conversation has been closed.
                                </div>
                            ) : (
                                <MessageInput />
                            )}
                        </Window>
                        <Thread />
                    </Channel>
                </div>
            </div>
        </div>
    );
}
