"use client";

import { useRouter } from "next/navigation";
import { useUser, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { MessageCircle, CheckCircle, Clock, XCircle, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import { createDeliveryRequest, checkDeliveryRequestStatus } from "@/server/actions/delivery";

export function ContactTravelerButton({
    travelerId,
    travelerName,
    travelPostId,
    postStatus = "OPEN",
}: {
    travelerId: string;
    travelerName: string;
    travelPostId: string;
    postStatus?: "OPEN" | "LOCKED" | "COMPLETED" | "CANCELLED";
}) {
    const router = useRouter();
    const { isSignedIn, user } = useUser();
    const [isLoading, setIsLoading] = useState(false);
    const [requestStatus, setRequestStatus] = useState<"IDLE" | "SENT" | "EXISTING" | "REJECTED">("IDLE");

    // Don't show button if user is the traveler
    if (isSignedIn && user?.id === travelerId) {
        return null;
    }

    // Check status on mount
    useEffect(() => {
        if (!isSignedIn) return;

        const checkStatus = async () => {
            try {
                const status = await checkDeliveryRequestStatus(travelPostId);
                if (status === "REQUESTED") setRequestStatus("SENT");
                else if (status === "REJECTED") setRequestStatus("REJECTED");
                else if (status === "NEGOTIATING" || status === "CONFIRMED" || status === "IN_PROGRESS" || status === "COMPLETED") {
                    setRequestStatus("EXISTING");
                }
                // CANCELLED status allows re-request (default IDLE state)
            } catch (error) {
                console.error("Error checking status:", error);
            }
        };

        checkStatus();
    }, [isSignedIn, travelPostId]);

    const handleClick = async (e: React.MouseEvent) => {
        e.stopPropagation();

        if (!isSignedIn) return;

        try {
            setIsLoading(true);

            const result = await createDeliveryRequest({
                travelPostId,
                travelerId,
            });

            if (result.success) {
                setRequestStatus("SENT");
                // If it was rejected/cancelled, now it is SENT/REQUESTED again.
            }
        } catch (error) {
            console.error("Error sending request:", error);
            alert("Failed to send request. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isSignedIn) {
        return (
            <SignInButton mode="modal" forceRedirectUrl={`/travelers`}>
                <Button
                    className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contact Traveler
                </Button>
            </SignInButton>
        );
    }

    // Show locked state for fully booked posts
    if (postStatus === "LOCKED") {
        return (
            <Button
                disabled
                className="bg-zinc-700 text-zinc-400 cursor-not-allowed"
            >
                <Lock className="w-4 h-4 mr-2" />
                Fully Booked
            </Button>
        );
    }

    if (requestStatus === "SENT" || requestStatus === "EXISTING") {
        return (
            <Button
                disabled
                className="bg-green-600 text-white cursor-default opacity-100"
            >
                <Clock className="w-4 h-4 mr-2" />
                Request Sent
            </Button>
        );
    }

    if (requestStatus === "REJECTED") {
        return (
            <Button
                onClick={handleClick}
                disabled={isLoading}
                variant="destructive"
                className="cursor-pointer"
            >
                <XCircle className="w-4 h-4 mr-2" />
                Request Rejected (Retry?)
            </Button>
        );
    }

    return (
        <Button
            onClick={handleClick}
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
        >
            <MessageCircle className="w-4 h-4 mr-2" />
            {isLoading ? "Sending..." : "Contact Traveler"}
        </Button>
    );
}
