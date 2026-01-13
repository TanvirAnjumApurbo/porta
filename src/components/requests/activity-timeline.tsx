"use client";

import { format } from "date-fns";
import {
    Send,
    CheckCircle,
    XCircle,
    CreditCard,
    Truck,
    PackageCheck,
    PartyPopper,
    Ban,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityLog {
    id: string;
    action: string;
    createdAt: Date;
    metadata?: Record<string, any> | null;
    performer?: {
        firstName?: string | null;
        lastName?: string | null;
    } | null;
}

interface ActivityTimelineProps {
    logs: ActivityLog[];
}

const actionConfig: Record<string, {
    icon: typeof Send;
    color: string;
    bgColor: string;
    label: string;
}> = {
    REQUEST_SENT: {
        icon: Send,
        color: "text-blue-400",
        bgColor: "bg-blue-500/10",
        label: "Request sent",
    },
    REQUEST_ACCEPTED: {
        icon: CheckCircle,
        color: "text-green-400",
        bgColor: "bg-green-500/10",
        label: "Request accepted",
    },
    REQUEST_REJECTED: {
        icon: XCircle,
        color: "text-red-400",
        bgColor: "bg-red-500/10",
        label: "Request rejected",
    },
    PAYMENT_MADE: {
        icon: CreditCard,
        color: "text-emerald-400",
        bgColor: "bg-emerald-500/10",
        label: "Payment completed",
    },
    DELIVERY_STARTED: {
        icon: Truck,
        color: "text-purple-400",
        bgColor: "bg-purple-500/10",
        label: "Delivery started",
    },
    DELIVERY_MARKED: {
        icon: PackageCheck,
        color: "text-cyan-400",
        bgColor: "bg-cyan-500/10",
        label: "Marked as delivered",
    },
    DELIVERY_CONFIRMED: {
        icon: CheckCircle,
        color: "text-green-400",
        bgColor: "bg-green-500/10",
        label: "Delivery confirmed",
    },
    PAYMENT_RELEASED: {
        icon: PartyPopper,
        color: "text-amber-400",
        bgColor: "bg-amber-500/10",
        label: "Payment released",
    },
    REQUEST_CANCELLED: {
        icon: Ban,
        color: "text-zinc-400",
        bgColor: "bg-zinc-500/10",
        label: "Request cancelled",
    },
};

export function ActivityTimeline({ logs }: ActivityTimelineProps) {
    return (
        <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-5 top-0 bottom-0 w-px bg-zinc-800" />

            <div className="space-y-4">
                {logs.map((log, index) => {
                    const config = actionConfig[log.action] || {
                        icon: Send,
                        color: "text-zinc-400",
                        bgColor: "bg-zinc-500/10",
                        label: log.action,
                    };
                    const Icon = config.icon;

                    const performerName = log.performer
                        ? `${log.performer.firstName || ""} ${log.performer.lastName || ""}`.trim() || "System"
                        : "System";

                    return (
                        <div key={log.id} className="relative flex gap-4">
                            {/* Icon */}
                            <div
                                className={cn(
                                    "relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                                    config.bgColor
                                )}
                            >
                                <Icon className={cn("w-4 h-4", config.color)} />
                            </div>

                            {/* Content */}
                            <div className="flex-1 pb-4">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <p className="font-medium text-zinc-200">{config.label}</p>
                                        <p className="text-sm text-zinc-500">by {performerName}</p>
                                    </div>
                                    <time className="text-xs text-zinc-600 shrink-0">
                                        {format(new Date(log.createdAt), "MMM d, h:mm a")}
                                    </time>
                                </div>

                                {/* Metadata */}
                                {log.metadata && Object.keys(log.metadata).length > 0 && (
                                    <div className="mt-2 text-xs text-zinc-500 bg-zinc-800/50 rounded p-2">
                                        {log.action === "PAYMENT_MADE" && log.metadata.amount && (
                                            <span>Amount: ${(log.metadata.amount / 100).toFixed(2)}</span>
                                        )}
                                        {log.action === "REQUEST_REJECTED" && log.metadata.reason && (
                                            <span>Reason: {log.metadata.reason}</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
