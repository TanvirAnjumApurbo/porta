"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Package,
    Weight,
    DollarSign,
    MapPin,
    Calendar,
    Check,
    X,
    Loader2,
    MessageSquare,
    User,
} from "lucide-react";
import { acceptRequest, rejectRequest } from "@/server/actions/delivery";
import { formatDistanceToNow } from "date-fns";

interface IncomingRequestCardProps {
    request: {
        id: string;
        packageDescription: string;
        offeredWeight: number;
        offeredPrice: number;
        currency: string;
        message?: string | null;
        createdAt: Date;
        travelPost: {
            departureCity: string;
            destinationCity: string;
            travelDate: string;
        };
        customer: {
            firstName?: string | null;
            lastName?: string | null;
            userPhotoUrl?: string | null;
        } | null;
    };
    onUpdate: () => void;
}

export function IncomingRequestCard({ request, onUpdate }: IncomingRequestCardProps) {
    const [isAccepting, setIsAccepting] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [rejectReason, setRejectReason] = useState("");

    const customerName = request.customer
        ? `${request.customer.firstName || ""} ${request.customer.lastName || ""}`.trim() || "Anonymous"
        : "Anonymous";

    const handleAccept = async () => {
        try {
            setIsAccepting(true);
            const result = await acceptRequest(request.id);
            if (result.success) {
                onUpdate();
            } else {
                alert(result.error || "Failed to accept request");
            }
        } catch (error) {
            console.error("Error accepting request:", error);
            alert("Failed to accept request");
        } finally {
            setIsAccepting(false);
        }
    };

    const handleReject = async () => {
        try {
            setIsRejecting(true);
            const result = await rejectRequest(request.id, rejectReason || undefined);
            if (result.success) {
                setShowRejectDialog(false);
                onUpdate();
            } else {
                alert(result.error || "Failed to reject request");
            }
        } catch (error) {
            console.error("Error rejecting request:", error);
            alert("Failed to reject request");
        } finally {
            setIsRejecting(false);
        }
    };

    return (
        <>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center">
                            {request.customer?.userPhotoUrl ? (
                                <img src={request.customer.userPhotoUrl} alt="Customer" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-5 h-5 text-primary" />
                            )}
                        </div>
                        <div>
                            <h3 className="font-semibold text-zinc-100">{customerName}</h3>
                            <p className="text-xs text-zinc-500">
                                {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-lg font-bold text-green-400">
                            ${(request.offeredPrice / 100).toFixed(2)}
                        </div>
                        <div className="text-xs text-zinc-500">offered</div>
                    </div>
                </div>

                {/* Trip Info */}
                <div className="bg-zinc-800/50 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-zinc-300 mb-1">
                        <MapPin className="w-4 h-4 text-zinc-500" />
                        <span>{request.travelPost.departureCity}</span>
                        <span className="text-zinc-600">→</span>
                        <span>{request.travelPost.destinationCity}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <Calendar className="w-3 h-3" />
                        <span>
                            {new Date(request.travelPost.travelDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                            })}
                        </span>
                    </div>
                </div>

                {/* Package Details */}
                <div className="space-y-3 mb-4">
                    <div className="flex items-start gap-2">
                        <Package className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-xs text-zinc-500 uppercase font-medium">Package</p>
                            <p className="text-sm text-zinc-200">{request.packageDescription}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Weight className="w-4 h-4 text-amber-400" />
                            <span className="text-sm text-zinc-300">
                                {(request.offeredWeight / 1000).toFixed(1)}kg
                            </span>
                        </div>
                    </div>

                    {request.message && (
                        <div className="flex items-start gap-2">
                            <MessageSquare className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-xs text-zinc-500 uppercase font-medium">Message</p>
                                <p className="text-sm text-zinc-400 italic">"{request.message}"</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-zinc-800">
                    <Button
                        variant="outline"
                        className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                        onClick={() => setShowRejectDialog(true)}
                        disabled={isAccepting || isRejecting}
                    >
                        <X className="w-4 h-4 mr-2" />
                        Reject
                    </Button>
                    <Button
                        className="flex-1 bg-green-600 hover:bg-green-500"
                        onClick={handleAccept}
                        disabled={isAccepting || isRejecting}
                    >
                        {isAccepting ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Check className="w-4 h-4 mr-2" />
                        )}
                        Accept
                    </Button>
                </div>
            </div>

            {/* Reject Dialog */}
            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogContent className="sm:max-w-md bg-zinc-950 border-zinc-800">
                    <DialogHeader>
                        <DialogTitle>Reject Request</DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            Let {customerName} know why you're rejecting their request (optional).
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                        <Textarea
                            placeholder="e.g., Weight limit exceeded, not available for this date..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="bg-zinc-900 border-zinc-700 min-h-[100px]"
                        />
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setShowRejectDialog(false)}
                                disabled={isRejecting}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                className="flex-1"
                                onClick={handleReject}
                                disabled={isRejecting}
                            >
                                {isRejecting ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <X className="w-4 h-4 mr-2" />
                                )}
                                Reject Request
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
