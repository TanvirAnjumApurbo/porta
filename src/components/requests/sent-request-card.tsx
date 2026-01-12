"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Package,
    Weight,
    DollarSign,
    MapPin,
    Calendar,
    Clock,
    CheckCircle,
    XCircle,
    CreditCard,
    PackageCheck,
    PartyPopper,
    User,
    ArrowRight,
    MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface SentRequestCardProps {
    request: {
        id: string;
        status: string;
        packageDescription: string;
        offeredWeight: number;
        offeredPrice: number;
        currency: string;
        message?: string | null;
        rejectionReason?: string | null;
        createdAt: Date;
        travelPost: {
            departureCity: string;
            destinationCity: string;
            travelDate: string;
        };
        traveller: {
            firstName?: string | null;
            lastName?: string | null;
        } | null;
    };
}

const statusConfig: Record<string, {
    label: string;
    icon: typeof Clock;
    color: string;
    bgColor: string;
    borderColor: string;
}> = {
    REQUESTED: {
        label: "Pending",
        icon: Clock,
        color: "text-amber-400",
        bgColor: "bg-amber-500/10",
        borderColor: "border-amber-500/30",
    },
    ACCEPTED: {
        label: "Accepted - Pay Now",
        icon: CreditCard,
        color: "text-green-400",
        bgColor: "bg-green-500/10",
        borderColor: "border-green-500/30",
    },
    PAID: {
        label: "Paid - Awaiting Delivery",
        icon: Package,
        color: "text-blue-400",
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/30",
    },
    IN_TRANSIT: {
        label: "Awaiting Delivery",
        icon: Package,
        color: "text-blue-400",
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/30",
    },
    DELIVERED: {
        label: "Delivered - Confirm Receipt",
        icon: PackageCheck,
        color: "text-cyan-400",
        bgColor: "bg-cyan-500/10",
        borderColor: "border-cyan-500/30",
    },
    CONFIRMED: {
        label: "Confirmed",
        icon: CheckCircle,
        color: "text-green-400",
        bgColor: "bg-green-500/10",
        borderColor: "border-green-500/30",
    },
    COMPLETED: {
        label: "Completed",
        icon: PartyPopper,
        color: "text-emerald-400",
        bgColor: "bg-emerald-500/10",
        borderColor: "border-emerald-500/30",
    },
    REJECTED: {
        label: "Rejected",
        icon: XCircle,
        color: "text-red-400",
        bgColor: "bg-red-500/10",
        borderColor: "border-red-500/30",
    },
    CANCELLED: {
        label: "Cancelled",
        icon: XCircle,
        color: "text-zinc-400",
        bgColor: "bg-zinc-500/10",
        borderColor: "border-zinc-500/30",
    },
};

export function SentRequestCard({ request }: SentRequestCardProps) {
    const router = useRouter();
    const config = statusConfig[request.status] || statusConfig.REQUESTED;
    const StatusIcon = config.icon;

    const travelerName = request.traveller
        ? `${request.traveller.firstName || ""} ${request.traveller.lastName || ""}`.trim() || "Anonymous"
        : "Anonymous";

    const handleViewDetails = () => {
        router.push(`/requests/${request.id}`);
    };

    const needsAction = ["ACCEPTED", "DELIVERED"].includes(request.status);

    return (
        <div
            className={cn(
                "bg-zinc-900/50 border rounded-xl p-5 transition-colors cursor-pointer hover:border-zinc-600",
                needsAction ? "border-primary/50 ring-1 ring-primary/20" : "border-zinc-800"
            )}
            onClick={handleViewDetails}
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                        <User className="w-5 h-5 text-zinc-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-zinc-100">{travelerName}</h3>
                        <p className="text-xs text-zinc-500">
                            {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                        </p>
                    </div>
                </div>

                {/* Status Badge */}
                <div className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
                    config.bgColor,
                    config.color,
                    config.borderColor
                )}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {config.label}
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
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Weight className="w-4 h-4 text-amber-400" />
                        <span className="text-sm text-zinc-300">
                            {(request.offeredWeight / 1000).toFixed(1)}kg
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-400" />
                        <span className="text-sm font-medium text-green-400">
                            ${(request.offeredPrice / 100).toFixed(2)}
                        </span>
                    </div>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-600" />
            </div>

            {/* Package Description (truncated) */}
            <p className="text-sm text-zinc-400 line-clamp-1 mb-4">
                {request.packageDescription}
            </p>

            {/* Rejection Reason */}
            {request.status === "REJECTED" && request.rejectionReason && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
                    <p className="text-xs text-red-400">
                        <span className="font-medium">Rejection reason:</span> {request.rejectionReason}
                    </p>
                </div>
            )}

            {/* Action Prompt */}
            {needsAction && (
                <div className="pt-4 border-t border-zinc-800">
                    {request.status === "ACCEPTED" && (
                        <Button className="w-full bg-green-600 hover:bg-green-500">
                            <CreditCard className="w-4 h-4 mr-2" />
                            Complete Payment
                        </Button>
                    )}
                    {request.status === "DELIVERED" && (
                        <Button className="w-full bg-cyan-600 hover:bg-cyan-500">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Confirm Receipt
                        </Button>
                    )}
                </div>
            )}

            {/* Chat Button for active requests */}
            {["PAID", "IN_TRANSIT", "DELIVERED"].includes(request.status) && (
                <div className="pt-4 border-t border-zinc-800">
                    <Button
                        variant="outline"
                        className="w-full border-zinc-700"
                        onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/messages/delivery_${request.id}`);
                        }}
                    >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Open Chat
                    </Button>
                </div>
            )}
        </div>
    );
}
