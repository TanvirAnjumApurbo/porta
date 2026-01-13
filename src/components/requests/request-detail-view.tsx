"use client";

import { useState, useEffect } from "react";
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
    ArrowLeft,
    MessageCircle,
    Shield,
    Loader2,
    AlertCircle,
    ShoppingBag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
    markDelivered,
    confirmDelivery,
    markProductPurchased,
} from "@/server/actions/delivery";
import { ActivityTimeline } from "./activity-timeline";
import { ReviewDialog } from "@/components/reviews/review-dialog";
import { OTPVerificationDialog } from "./otp-verification-dialog";
import { checkReviewExists } from "@/server/actions/reviews";
import { ReportIssueDialog } from "./report-issue-dialog";

interface RequestDetailViewProps {
    request: any;
    isTraveler: boolean;
    isCustomer: boolean;
}

// Simplified 5-step flow (IN_TRANSIT is treated as PAID for display)
const statusSteps = [
    { key: "REQUESTED", label: "Requested", icon: Clock },
    { key: "ACCEPTED", label: "Accepted", icon: CheckCircle },
    { key: "PAID", label: "Paid", icon: CreditCard },
    { key: "PURCHASED", label: "Bought", icon: ShoppingBag },
    { key: "DELIVERED", label: "Delivered", icon: PackageCheck },
    { key: "COMPLETED", label: "Completed", icon: PartyPopper },
];

export function RequestDetailView({
    request,
    isTraveler,
    isCustomer,
}: RequestDetailViewProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showReviewDialog, setShowReviewDialog] = useState(false);
    const [hasReviewed, setHasReviewed] = useState(false);

    // Check if user already reviewed this delivery
    useEffect(() => {
        if (isCustomer && request.status === "COMPLETED") {
            checkReviewExists(request.id).then(setHasReviewed);
        }
    }, [isCustomer, request.id, request.status]);

    // Handle IN_TRANSIT as equivalent to PURCHASED step for display purposes (it comes after purchased)
    // If status is IN_TRANSIT, it should highlight PURCHASED step as cleared too
    const getDisplayStatus = (status: string) => {
        if (status === "IN_TRANSIT") return "PURCHASED";
        return status;
    };
    const displayStatus = getDisplayStatus(request.status);
    const currentStepIndex = statusSteps.findIndex((s) => s.key === displayStatus);
    const isRejected = request.status === "REJECTED";
    const isCancelled = request.status === "CANCELLED";
    const isCompleted = request.status === "COMPLETED";

    const travelerName = request.traveller
        ? `${request.traveller.firstName || ""} ${request.traveller.lastName || ""}`.trim() || "Anonymous"
        : "Anonymous";

    const customerName = request.customer
        ? `${request.customer.firstName || ""} ${request.customer.lastName || ""}`.trim() || "Anonymous"
        : "Anonymous";

    const handleAction = async (action: "pay" | "mark" | "confirm" | "purchase") => {
        setIsLoading(true);
        setError(null);

        try {
            let result;

            switch (action) {
                case "pay":
                    // Call the checkout API to create a Stripe session
                    const response = await fetch("/api/stripe/checkout", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ deliveryRequestId: request.id }),
                    });
                    const data = await response.json();
                    
                    if (data.url) {
                        // Redirect to Stripe Checkout
                        window.location.href = data.url;
                        return;
                    } else if (data.error) {
                        setError(data.error);
                    }
                    break;
                case "purchase":
                    result = await markProductPurchased(request.id);
                    break;
                case "mark":
                    result = await markDelivered(request.id);
                    break;
                case "confirm":
                    result = await confirmDelivery(request.id);
                    if (result?.success) {
                        // Show review dialog after successful confirmation
                        setShowReviewDialog(true);
                    }
                    break;
            }

            if (result && !result.success) {
                setError(result.error || "Action failed");
            } else {
                router.refresh();
            }
        } catch (err) {
            console.error("Action error:", err);
            setError("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <button
                onClick={() => router.push("/requests")}
                className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Requests
            </button>

            {/* Status Header */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-xl font-bold">Request Details</h1>
                    <StatusBadge status={request.status} />
                </div>

                {/* Progress Steps */}
                {!isRejected && !isCancelled && (
                    <div className="relative">
                        {/* Progress Line */}
                        <div className="absolute top-5 left-5 right-5 h-0.5 bg-zinc-800" />
                        <div
                            className="absolute top-5 left-5 h-0.5 bg-primary transition-all duration-500"
                            style={{
                                width: `${Math.max(0, (currentStepIndex / (statusSteps.length - 1)) * 100)}%`,
                                maxWidth: "calc(100% - 40px)",
                            }}
                        />

                        <div className="relative flex justify-between">
                            {statusSteps.map((step, index) => {
                                const isActive = currentStepIndex >= index;
                                const isCurrent = currentStepIndex === index;
                                const Icon = step.icon;

                                return (
                                    <div key={step.key} className="flex flex-col items-center">
                                        <div
                                            className={cn(
                                                "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                                                isActive
                                                    ? "bg-primary border-primary text-white"
                                                    : "bg-zinc-900 border-zinc-700 text-zinc-500",
                                                isCurrent && "scale-110 shadow-lg shadow-primary/30"
                                            )}
                                        >
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <span
                                            className={cn(
                                                "text-[10px] mt-2 font-medium",
                                                isActive ? "text-zinc-200" : "text-zinc-600"
                                            )}
                                        >
                                            {step.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Rejection Notice */}
                {isRejected && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mt-4">
                        <div className="flex items-start gap-3">
                            <XCircle className="w-5 h-5 text-red-400 mt-0.5" />
                            <div>
                                <p className="font-medium text-red-400">Request Rejected</p>
                                {request.rejectionReason && (
                                    <p className="text-sm text-red-300 mt-1">{request.rejectionReason}</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Request Details */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 space-y-6">
                {/* Trip Info */}
                <div>
                    <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                        Trip Details
                    </h2>
                    <div className="bg-zinc-800/50 rounded-lg p-4 space-y-3">
                        <div className="flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-primary" />
                            <div>
                                <span className="font-medium text-white">{request.travelPost.departureCity}</span>
                                <span className="mx-2 text-zinc-600">→</span>
                                <span className="font-medium text-white">{request.travelPost.destinationCity}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-zinc-400">
                            <Calendar className="w-4 h-4" />
                            <span>
                                {format(new Date(request.travelPost.travelDate), "EEEE, MMMM d, yyyy")}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Package Info */}
                <div>
                    <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                        Package Details
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <Package className="w-5 h-5 text-blue-400 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-xs text-zinc-500 uppercase font-medium">Description</p>
                                <p className="text-zinc-200">{request.packageDescription}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-zinc-800/50 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <Weight className="w-4 h-4 text-amber-400" />
                                    <span className="text-xs text-zinc-500 uppercase">Weight</span>
                                </div>
                                <p className="text-xl font-bold text-white">
                                    {(request.offeredWeight / 1000).toFixed(1)}
                                    <span className="text-sm text-zinc-400 ml-1">kg</span>
                                </p>
                            </div>

                            <div className="bg-zinc-800/50 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <DollarSign className="w-4 h-4 text-primary" />
                                    <span className="text-xs text-zinc-500 uppercase">Price</span>
                                </div>
                                <p className="text-xl font-bold text-primary">
                                    ${(request.offeredPrice / 100).toFixed(2)}
                                </p>
                            </div>
                        </div>

                        {request.message && (
                            <div className="bg-zinc-800/30 rounded-lg p-4 border-l-2 border-primary">
                                <p className="text-xs text-zinc-500 uppercase font-medium mb-1">Message</p>
                                <p className="text-zinc-300 italic">"{request.message}"</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Parties */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-800/50 rounded-lg p-4">
                        <p className="text-xs text-zinc-500 uppercase font-medium mb-2">Traveler</p>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-zinc-700 overflow-hidden flex items-center justify-center">
                                {request.traveller?.userPhotoUrl ? (
                                    <img src={request.traveller.userPhotoUrl} alt="Traveler" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-4 h-4 text-zinc-400" />
                                )}
                            </div>
                            <span className="font-medium text-white">{travelerName}</span>
                            {isTraveler && (
                                <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded">You</span>
                            )}
                        </div>
                    </div>

                    <div className="bg-zinc-800/50 rounded-lg p-4">
                        <p className="text-xs text-zinc-500 uppercase font-medium mb-2">Customer</p>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-zinc-700 overflow-hidden flex items-center justify-center">
                                {request.customer?.userPhotoUrl ? (
                                    <img src={request.customer.userPhotoUrl} alt="Customer" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-4 h-4 text-zinc-400" />
                                )}
                            </div>
                            <span className="font-medium text-white">{customerName}</span>
                            {isCustomer && (
                                <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded">You</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Payment Status (for traveler) */}
                {isTraveler && ["PAID", "PURCHASED", "IN_TRANSIT", "DELIVERED", "CONFIRMED", "COMPLETED"].includes(request.status) && (
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <Shield className="w-5 h-5 text-primary" />
                            <div>
                                <p className="font-medium text-primary">Payment Guaranteed</p>
                                <p className="text-sm text-zinc-300">
                                    ${(request.offeredPrice / 100).toFixed(2)} is secured in escrow
                                    {request.status === "COMPLETED" ? " and has been released to you" : " and will be released upon delivery confirmation"}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                    <p className="text-red-300">{error}</p>
                </div>
            )}

            {/* Action Buttons */}
            {!isRejected && !isCancelled && (
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                    {/* Customer Actions */}
                    {isCustomer && request.status === "ACCEPTED" && (
                        <div className="space-y-4">
                            <div className="text-center">
                                <h3 className="font-semibold text-lg mb-1">Complete Payment</h3>
                                <p className="text-sm text-zinc-400">
                                    Pay ${(request.offeredPrice / 100).toFixed(2)} to confirm your delivery
                                </p>
                            </div>
                            <div className="bg-zinc-800/50 rounded-lg p-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-400">Delivery Fee</span>
                                    <span className="text-white">${(request.offeredPrice / 100).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xs text-zinc-500">
                                    <span>Platform fee (5%)</span>
                                    <span>-${((request.offeredPrice * 0.05) / 100).toFixed(2)}</span>
                                </div>
                                <div className="border-t border-zinc-700 pt-2 flex justify-between text-sm">
                                    <span className="text-zinc-400">Traveler receives</span>
                                    <span className="text-green-400">${((request.offeredPrice * 0.95) / 100).toFixed(2)}</span>
                                </div>
                            </div>
                            <Button
                                className="w-full bg-green-600 hover:bg-green-500 h-12 text-lg"
                                onClick={() => handleAction("pay")}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                ) : (
                                    <CreditCard className="w-5 h-5 mr-2" />
                                )}
                                Pay ${(request.offeredPrice / 100).toFixed(2)}
                            </Button>
                            <p className="text-xs text-zinc-500 text-center flex items-center justify-center gap-1">
                                <Shield className="w-3 h-3" />
                                Secure payment via Stripe
                            </p>
                        </div>
                    )}

                    {isCustomer && request.status === "DELIVERED" && (
                        <div className="space-y-4">
                            <div className="text-center">
                                <h3 className="font-semibold text-lg mb-1">Confirm Delivery</h3>
                                <p className="text-sm text-zinc-400">
                                    Confirm that you've received your package to release payment to the traveler
                                </p>
                            </div>
                            <Button
                                className="w-full bg-cyan-600 hover:bg-cyan-500 h-12 text-lg"
                                onClick={() => handleAction("confirm")}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                ) : (
                                    <CheckCircle className="w-5 h-5 mr-2" />
                                )}
                                Confirm Receipt
                            </Button>
                        </div>
                    )}

                    {/* Traveler Actions */}
                    {isTraveler && request.status === "PAID" && (
                        <div className="space-y-4">
                            <div className="text-center">
                                <h3 className="font-semibold text-lg mb-1">Confirm Purchase</h3>
                                <p className="text-sm text-zinc-400">
                                    Confirm that you have purchased the requested item
                                </p>
                            </div>
                            <Button
                                className="w-full bg-blue-600 hover:bg-blue-500 h-12 text-lg"
                                onClick={() => handleAction("purchase")}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                ) : (
                                    <ShoppingBag className="w-5 h-5 mr-2" />
                                )}
                                Confirm Product Purchased
                            </Button>
                        </div>
                    )}

                    {isTraveler && (request.status === "PURCHASED" || request.status === "IN_TRANSIT") && (
                        <div className="space-y-4">
                            <div className="text-center">
                                <h3 className="font-semibold text-lg mb-1">Final Delivery Step</h3>
                                <p className="text-sm text-zinc-400">
                                    Meet the customer and ask for the OTP sent to their email.
                                </p>
                            </div>
                            <OTPVerificationDialog requestId={request.id}>
                                <Button
                                    className="w-full bg-primary hover:bg-primary/90 h-12 text-lg text-primary-foreground"
                                >
                                    <PackageCheck className="w-5 h-5 mr-2" />
                                    Verify Delivery & Complete
                                </Button>
                            </OTPVerificationDialog>
                        </div>
                    )}

                    {/* Waiting States */}
                    {isCustomer && (request.status === "PAID" || request.status === "PURCHASED" || request.status === "IN_TRANSIT") && (
                        <div className="text-center py-4">
                            <Package className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                            <p className="text-zinc-400">
                                {request.status === "PAID" 
                                    ? "Waiting for traveler to purchase product..." 
                                    : "Waiting for traveler to complete delivery..."}
                            </p>
                        </div>
                    )}

                    {isTraveler && request.status === "DELIVERED" && (
                        <div className="text-center py-4">
                            <Clock className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                            <p className="text-zinc-400">Waiting for customer to confirm delivery...</p>
                        </div>
                    )}

                    {/* Completed State */}
                    {isCompleted && (
                        <div className="text-center py-4">
                            <PartyPopper className="w-12 h-12 text-primary mx-auto mb-3" />
                            <h3 className="font-semibold text-lg text-primary mb-1">Delivery Complete!</h3>
                            <p className="text-zinc-400 mb-4">Thank you for using Porta</p>
                            
                            {/* Leave Review Button for Customer */}
                            {isCustomer && !hasReviewed && (
                                <Button
                                    className="bg-amber-600 hover:bg-amber-500"
                                    onClick={() => setShowReviewDialog(true)}
                                >
                                    ⭐ Leave a Review
                                </Button>
                            )}
                            {isCustomer && hasReviewed && (
                                <p className="text-sm text-zinc-500">✓ You've reviewed this delivery</p>
                            )}
                        </div>
                    )}

                    {/* Chat Button - Always available after payment */}
                    {["PAID", "PURCHASED", "IN_TRANSIT", "DELIVERED", "COMPLETED"].includes(request.status) && (
                        <Button
                            variant="outline"
                            className="w-full mt-4 border-zinc-700"
                            onClick={() => router.push(`/messages/delivery_${request.id}`)}
                        >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Open Chat
                        </Button>
                    )}

                    {/* Report Issue Button - Available for active deliveries */}
                    {!["REQUESTED", "REJECTED", "CANCELLED"].includes(request.status) && (
                        <div className="mt-4">
                            <ReportIssueDialog deliveryRequestId={request.id} />
                        </div>
                    )}
                </div>
            )}

            {/* Activity Timeline */}
            {request.activityLogs && request.activityLogs.length > 0 && (
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                    <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
                        Activity History
                    </h2>
                    <ActivityTimeline logs={request.activityLogs} />
                </div>
            )}

            {/* Review Dialog */}
            <ReviewDialog
                open={showReviewDialog}
                onOpenChange={setShowReviewDialog}
                deliveryRequestId={request.id}
                travelerName={travelerName}
                onSuccess={() => {
                    setHasReviewed(true);
                    router.refresh();
                }}
            />
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
        REQUESTED: { label: "Pending", color: "text-amber-400", bgColor: "bg-amber-500/10" },
        ACCEPTED: { label: "Accepted", color: "text-green-400", bgColor: "bg-green-500/10" },
        PAID: { label: "Paid", color: "text-blue-400", bgColor: "bg-blue-500/10" },
        PURCHASED: { label: "Purchased", color: "text-indigo-400", bgColor: "bg-indigo-500/10" },
        IN_TRANSIT: { label: "In Transit", color: "text-purple-400", bgColor: "bg-purple-500/10" },
        DELIVERED: { label: "Delivered", color: "text-cyan-400", bgColor: "bg-cyan-500/10" },
        CONFIRMED: { label: "Confirmed", color: "text-green-400", bgColor: "bg-green-500/10" },
        COMPLETED: { label: "Completed", color: "text-emerald-400", bgColor: "bg-emerald-500/10" },
        REJECTED: { label: "Rejected", color: "text-red-400", bgColor: "bg-red-500/10" },
        CANCELLED: { label: "Cancelled", color: "text-zinc-400", bgColor: "bg-zinc-500/10" },
    };

    const config = statusConfig[status] || statusConfig.REQUESTED;

    return (
        <span className={cn("px-3 py-1 rounded-full text-sm font-medium", config.bgColor, config.color)}>
            {config.label}
        </span>
    );
}
