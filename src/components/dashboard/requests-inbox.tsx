"use client";

import { useEffect, useState } from "react";
import { getIncomingRequests, manageDeliveryRequest } from "@/server/actions/delivery";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, Loader2, Package } from "lucide-react";
import { useRouter } from "next/navigation";

interface Request {
    id: string;
    status: string;
    createdAt: Date;
    travelPost: {
        originAirport: string | null;
        destinationAirport: string | null;
        departureCity: string;
        destinationCity: string;
    };
    customer: {
        firstName: string | null;
        lastName: string | null;
    } | undefined; // customer might be undefined if not found
}

export function RequestsInbox() {
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const router = useRouter();

    const fetchRequests = async () => {
        try {
            const data = await getIncomingRequests();
            // Casting generic JSON/Date issues if any, but server actions handle serialization reasonably well in Next.js 14+
            setRequests(data as any);
        } catch (error) {
            console.error("Failed to fetch requests", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleAction = async (requestId: string, action: "ACCEPT" | "REJECT") => {
        try {
            setActionLoading(requestId);
            const res = await manageDeliveryRequest(requestId, action);

            if (res?.success) {
                if (action === "ACCEPT" && res.channelId) {
                    // Navigate to the new chat
                    router.push(`/messages/${res.channelId}`);
                } else {
                    // Remove from list
                    setRequests(prev => prev.filter(r => r.id !== requestId));
                }
            }
        } catch (error) {
            console.error(`Failed to ${action} request`, error);
            alert(`Failed to ${action} request.`);
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) return null;
    if (requests.length === 0) return null;

    return (
        <div className="mb-6">
            <h2 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wider px-2">
                Trip Requests ({requests.length})
            </h2>
            <div className="space-y-3">
                {requests.map((request) => (
                    <Card key={request.id} className="bg-zinc-900/50 border-zinc-800">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/10 rounded-full text-blue-500">
                                    <Package className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-medium text-zinc-100">
                                        {request.customer?.firstName || "User"} wants to send a package
                                    </p>
                                    <p className="text-xs text-zinc-500">
                                        {request.travelPost.departureCity} → {request.travelPost.destinationCity}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                                    onClick={() => handleAction(request.id, "REJECT")}
                                    disabled={actionLoading === request.id}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                                <Button
                                    size="sm"
                                    className="h-8 px-3 bg-blue-600 hover:bg-blue-500 text-white"
                                    onClick={() => handleAction(request.id, "ACCEPT")}
                                    disabled={actionLoading === request.id}
                                >
                                    {actionLoading === request.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Check className="w-4 h-4 mr-1.5" />
                                            Accept
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
