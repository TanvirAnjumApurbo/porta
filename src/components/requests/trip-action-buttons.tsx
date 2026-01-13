"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { MessageCircle, Send, Lock, Clock, CheckCircle, Eye, Loader2, ShieldAlert } from "lucide-react";
import { SendRequestModal } from "./send-request-modal";
import { checkDeliveryRequestStatus, getOrCreateChatChannel } from "@/server/actions/delivery";
import { getUserVerificationStatusClient } from "@/server/actions/verification";

interface TripActionButtonsProps {
    travelPostId: string;
    travelerId: string;
    travelerName: string;
    tripRoute: string;
    tripDate: string;
    maxWeight: number; // in kg
    postStatus?: "OPEN" | "LOCKED" | "COMPLETED" | "CANCELLED";
}

type RequestState = {
    status: "IDLE" | "REQUESTED" | "ACCEPTED" | "PAID" | "IN_TRANSIT" | "DELIVERED" | "CONFIRMED" | "COMPLETED" | "REJECTED" | "CANCELLED";
    requestId?: string;
};

export function TripActionButtons({
    travelPostId,
    travelerId,
    travelerName,
    tripRoute,
    tripDate,
    maxWeight,
    postStatus = "OPEN",
}: TripActionButtonsProps) {
    const router = useRouter();
    const { isSignedIn, user, isLoaded } = useUser();
    const [requestState, setRequestState] = useState<RequestState>({ status: "IDLE" });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreatingChat, setIsCreatingChat] = useState(false);
    const [isCheckingStatus, setIsCheckingStatus] = useState(true);
    const [isVerified, setIsVerified] = useState<boolean | null>(null);

    // Don't show buttons if user is the traveler
    const isOwnTrip = isLoaded && isSignedIn && user?.id === travelerId;

    // Check request status and verification status on mount
    useEffect(() => {
        if (!isSignedIn || isOwnTrip) {
            setIsCheckingStatus(false);
            return;
        }

        const checkStatus = async () => {
            try {
                // Check verification status
                const verificationResult = await getUserVerificationStatusClient();
                setIsVerified(verificationResult?.isVerified ?? false);

                // Check request status
                const result = await checkDeliveryRequestStatus(travelPostId);
                if (result) {
                    setRequestState({
                        status: result.status as RequestState["status"],
                        requestId: result.requestId,
                    });
                }
            } catch (error) {
                console.error("Error checking status:", error);
            } finally {
                setIsCheckingStatus(false);
            }
        };

        checkStatus();
    }, [isSignedIn, travelPostId, isOwnTrip]);

    // Handle chat button click
    const handleChatClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isSignedIn) return;

        try {
            setIsCreatingChat(true);
            const result = await getOrCreateChatChannel({
                travelPostId,
                travelerId,
            });

            if (result.success && result.channelId) {
                router.push(`/messages/${result.channelId}`);
            }
        } catch (error) {
            console.error("Error creating chat:", error);
            alert("Failed to start chat. Please try again.");
        } finally {
            setIsCreatingChat(false);
        }
    };

    // Handle send request button click
    const handleSendRequestClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsModalOpen(true);
    };

    // Handle view request click
    const handleViewRequestClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        router.push(`/requests/${requestState.requestId}`);
    };

    // Don't render for own trips
    if (isOwnTrip) {
        return null;
    }

    // Show loading state while checking status OR while user data is loading OR while verification status is unknown for signed-in users
    if (!isLoaded || isCheckingStatus || (isSignedIn && isVerified === null)) {
        return (
            <div className="flex items-center gap-2">
                <div className="h-9 w-20 bg-zinc-800 animate-pulse rounded-md" />
                <div className="h-9 w-28 bg-zinc-800 animate-pulse rounded-md" />
            </div>
        );
    }

    // Not signed in - show sign in buttons
    if (!isSignedIn) {
        return (
            <div className="flex items-center gap-2">
                <SignInButton mode="modal" forceRedirectUrl={`/travelers`}>
                    <Button
                        variant="outline"
                        size="sm"
                        className="border-zinc-700 hover:bg-zinc-800 text-zinc-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <MessageCircle className="w-4 h-4 mr-1.5" />
                        Chat
                    </Button>
                </SignInButton>
                <SignInButton mode="modal" forceRedirectUrl={`/travelers`}>
                    <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Send className="w-4 h-4 mr-1.5" />
                        Send Request
                    </Button>
                </SignInButton>
            </div>
        );
    }

    // Signed in but not verified - show verification required button
    if (isSignedIn && isVerified === false) {
        const handleVerifyClick = () => {
            // Find the verification card by ID and click its button
            const verifyButton = document.querySelector('#verification-prompt button') as HTMLButtonElement;
            if (verifyButton) {
                verifyButton.click();
            } else {
                // Fallback: alert the user
                alert("Please complete your identity verification using the card at the bottom of the screen.");
            }
        };

        return (
            <div 
                className="flex items-center"
                onClickCapture={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleVerifyClick();
                }}
            >
                <Button
                    size="sm"
                    type="button"
                    className="bg-primary hover:bg-primary/90"
                >
                    <ShieldAlert className="w-4 h-4 mr-1.5" />
                    Get Verified to Continue
                </Button>
            </div>
        );
    }

    // Trip is fully booked
    if (postStatus === "LOCKED") {
        return (
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    className="border-zinc-700 hover:bg-zinc-800 text-zinc-300"
                    onClick={handleChatClick}
                    disabled={isCreatingChat}
                >
                    {isCreatingChat ? (
                        <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    ) : (
                        <MessageCircle className="w-4 h-4 mr-1.5" />
                    )}
                    Chat
                </Button>
                <Button
                    size="sm"
                    disabled
                    className="bg-zinc-700 text-zinc-400 cursor-not-allowed"
                >
                    <Lock className="w-4 h-4 mr-1.5" />
                    Fully Booked
                </Button>
            </div>
        );
    }

    // Request status-based rendering
    const renderRequestButton = () => {
        switch (requestState.status) {
            case "REQUESTED":
                return (
                    <Button
                        size="sm"
                        disabled
                        className="bg-amber-600/20 text-amber-400 border border-amber-500/30 cursor-default"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Clock className="w-4 h-4 mr-1.5" />
                        Request Pending
                    </Button>
                );

            case "ACCEPTED":
                return (
                    <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-500 text-white"
                        onClick={handleViewRequestClick}
                    >
                        <CheckCircle className="w-4 h-4 mr-1.5" />
                        Pay Now
                    </Button>
                );

            case "PAID":
            case "IN_TRANSIT":
            case "DELIVERED":
            case "CONFIRMED":
            case "COMPLETED":
                return (
                    <Button
                        size="sm"
                        variant="outline"
                        className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                        onClick={handleViewRequestClick}
                    >
                        <Eye className="w-4 h-4 mr-1.5" />
                        View Request
                    </Button>
                );

            case "REJECTED":
                return (
                    <Button
                        size="sm"
                        variant="destructive"
                        onClick={handleSendRequestClick}
                    >
                        <Send className="w-4 h-4 mr-1.5" />
                        Request Again
                    </Button>
                );

            case "CANCELLED":
            case "IDLE":
            default:
                return (
                    <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90"
                        onClick={handleSendRequestClick}
                    >
                        <Send className="w-4 h-4 mr-1.5" />
                        Send Request
                    </Button>
                );
        }
    };

    return (
        <>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    className="border-zinc-700 hover:bg-zinc-800 text-zinc-300"
                    onClick={handleChatClick}
                    disabled={isCreatingChat}
                >
                    {isCreatingChat ? (
                        <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    ) : (
                        <MessageCircle className="w-4 h-4 mr-1.5" />
                    )}
                    Chat
                </Button>
                {renderRequestButton()}
            </div>

            <SendRequestModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                travelPostId={travelPostId}
                travelerId={travelerId}
                travelerName={travelerName}
                tripRoute={tripRoute}
                tripDate={tripDate}
                maxWeight={maxWeight}
            />
        </>
    );
}
