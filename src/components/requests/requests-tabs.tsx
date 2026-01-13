"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Inbox, Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getIncomingRequests, getSentRequests } from "@/server/actions/delivery";
import { IncomingRequestCard } from "./incoming-request-card";
import { SentRequestCard } from "./sent-request-card";

interface RequestsTabsProps {
    defaultTab: "incoming" | "sent";
}

export function RequestsTabs({ defaultTab }: RequestsTabsProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState<"incoming" | "sent">(defaultTab);
    const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
    const [sentRequests, setSentRequests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRequests = async () => {
            setIsLoading(true);
            try {
                const [incoming, sent] = await Promise.all([
                    getIncomingRequests(),
                    getSentRequests(),
                ]);
                setIncomingRequests(incoming);
                setSentRequests(sent);

                // Auto-switch tab if Incoming is empty but Sent has data (and user didn't explicitly select Incoming)
                if (incoming.length === 0 && sent.length > 0 && defaultTab === "incoming") {
                    setActiveTab("sent");
                    router.replace("/requests?tab=sent", { scroll: false });
                }
            } catch (error) {
                console.error("Error fetching requests:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRequests();
    }, []);

    const handleTabChange = (tab: "incoming" | "sent") => {
        setActiveTab(tab);
        router.push(`/requests?tab=${tab}`, { scroll: false });
    };

    const handleRequestUpdate = async () => {
        // Refresh requests after an action
        const [incoming, sent] = await Promise.all([
            getIncomingRequests(),
            getSentRequests(),
        ]);
        setIncomingRequests(incoming);
        setSentRequests(sent);
    };

    return (
        <div className="space-y-6">
            {/* Tab Buttons */}
            <div className="flex gap-2 p-1 bg-zinc-900/50 rounded-lg w-fit">
                <button
                    onClick={() => handleTabChange("incoming")}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                        activeTab === "incoming"
                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                            : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                    )}
                >
                    <Inbox className="w-4 h-4" />
                    Delivery Jobs
                    {incomingRequests.length > 0 && (
                        <span className={cn(
                            "px-1.5 py-0.5 text-xs rounded-full",
                            activeTab === "incoming"
                                ? "bg-white/20 text-white"
                                : "bg-primary/20 text-primary"
                        )}>
                            {incomingRequests.length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => handleTabChange("sent")}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                        activeTab === "sent"
                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                            : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                    )}
                >
                    <Send className="w-4 h-4" />
                    My Orders
                    {sentRequests.length > 0 && (
                        <span className={cn(
                            "px-1.5 py-0.5 text-xs rounded-full",
                            activeTab === "sent"
                                ? "bg-white/20 text-white"
                                : "bg-zinc-700 text-zinc-300"
                        )}>
                            {sentRequests.length}
                        </span>
                    )}
                </button>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-zinc-600" />
                </div>
            ) : activeTab === "incoming" ? (
                <IncomingRequestsList
                    requests={incomingRequests}
                    onUpdate={handleRequestUpdate}
                />
            ) : (
                <SentRequestsList requests={sentRequests} />
            )}
        </div>
    );
}

function IncomingRequestsList({
    requests,
    onUpdate,
}: {
    requests: any[];
    onUpdate: () => void;
}) {
    if (requests.length === 0) {
        return (
            <div className="text-center py-16 px-4">
                <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Inbox className="w-8 h-8 text-zinc-600" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-300 mb-2">No incoming requests</h3>
                <p className="text-zinc-500 text-sm max-w-sm mx-auto">
                    When shoppers request your services, they'll appear here. Post a trip to start receiving requests!
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {requests.map((request) => (
                <IncomingRequestCard
                    key={request.id}
                    request={request}
                    onUpdate={onUpdate}
                />
            ))}
        </div>
    );
}

function SentRequestsList({ requests }: { requests: any[] }) {
    if (requests.length === 0) {
        return (
            <div className="text-center py-16 px-4">
                <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-zinc-600" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-300 mb-2">No sent requests</h3>
                <p className="text-zinc-500 text-sm max-w-sm mx-auto">
                    Browse travelers and send requests to get your packages delivered.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {requests.map((request) => (
                <SentRequestCard key={request.id} request={request} />
            ))}
        </div>
    );
}
