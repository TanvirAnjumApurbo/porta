import { Package, MapPin, Calendar, CheckCircle, Clock, Truck } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

interface ProfileDeliveryHistoryProps {
    deliveries: Array<{
        id: string;
        status: string;
        updatedAt: Date;
        offeredPrice: number;
        travelPost: {
            departureCity: string;
            destinationCity: string;
            departureCountry: string;
            destinationCountry: string;
            travelDate: string;
        } | null;
        customer: {
            firstName: string | null;
            lastName: string | null;
        } | null;
        transaction?: {
            travelerPayout: number | null;
            status: string;
        } | null;
    }>;
    isOwner: boolean;
    userId: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    COMPLETED: { label: "Completed", color: "text-emerald-400", icon: CheckCircle },
    PAID: { label: "Paid", color: "text-blue-400", icon: Clock },
    IN_TRANSIT: { label: "In Transit", color: "text-purple-400", icon: Truck },
    DELIVERED: { label: "Delivered", color: "text-cyan-400", icon: Package },
};

export function ProfileDeliveryHistory({ deliveries, isOwner, userId }: ProfileDeliveryHistoryProps) {
    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Delivery History
            </h2>

            {deliveries.length === 0 ? (
                <div className="text-center py-8">
                    <Package className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                    <p className="text-zinc-500">No deliveries yet</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {deliveries.map((delivery) => {
                        const config = statusConfig[delivery.status] || {
                            label: delivery.status,
                            color: "text-zinc-400",
                            icon: Package,
                        };
                        const StatusIcon = config.icon;
                        const customerName = delivery.customer
                            ? `${delivery.customer.firstName || ""} ${delivery.customer.lastName || ""}`.trim() || "Anonymous"
                            : "Anonymous";

                        return (
                            <Link
                                key={delivery.id}
                                href={`/requests/${delivery.id}`}
                                className="block bg-zinc-800/50 rounded-lg p-4 hover:bg-zinc-800 transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                        {/* Route */}
                                        <div className="flex items-center gap-2 text-sm font-medium text-white">
                                            <MapPin className="w-4 h-4 text-primary shrink-0" />
                                            <span className="truncate">
                                                {delivery.travelPost?.departureCity} → {delivery.travelPost?.destinationCity}
                                            </span>
                                        </div>

                                        {/* Date & Customer */}
                                        <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {delivery.travelPost?.travelDate
                                                    ? format(new Date(delivery.travelPost.travelDate), "MMM d, yyyy")
                                                    : "—"
                                                }
                                            </span>
                                            <span>• For {customerName}</span>
                                        </div>
                                    </div>

                                    {/* Status & Payout */}
                                    <div className="text-right shrink-0 ml-4">
                                        <div className={`flex items-center gap-1 text-sm ${config.color}`}>
                                            <StatusIcon className="w-4 h-4" />
                                            <span>{config.label}</span>
                                        </div>
                                        {isOwner && delivery.transaction?.travelerPayout && (
                                            <p className="text-xs text-green-400 mt-1">
                                                +${(delivery.transaction.travelerPayout / 100).toFixed(2)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}

            {deliveries.length > 0 && (
                <div className="mt-4 text-center">
                    <Link
                        href="/requests"
                        className="text-sm text-primary hover:underline"
                    >
                        View all requests →
                    </Link>
                </div>
            )}
        </div>
    );
}
