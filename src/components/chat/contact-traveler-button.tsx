"use client";

import { useRouter } from "next/navigation";
import { useUser, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { MessageCircle, CheckCircle, Clock, XCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { createDeliveryRequest, checkDeliveryRequestStatus } from "@/server/actions/delivery";
// I don't see sonner. "stream-chat-react" is there. I'll stick to simple state or alert for now to be safe, or just button state.

export function ContactTravelerButton({
    travelerId,
    travelerName,
    travelPostId,
}: {
    travelerId: string;
    travelerName: string;
    travelPostId: string;
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
                else if (status === "CANCELLED") setRequestStatus("IDLE"); // Allow re-request if cancelled (and not yet "revived" by user action) - actually server action handles revival, so IDLE is fine if we want them to click again. The issue descriptions says "Invisible Rejection", so maybe showing "Rejected" is better? 
                // Wait, server action `createDeliveryRequest` revives CANCELLED/REJECTED. 
                // So if it is REJECTED, we can show "Request Rejected" but allow clicking to "Retry".
                // But if it is CANCELLED (by rejection), the status in DB is "CANCELLED".
                // "REJECTED" is a new enum I added.
                // Rejection logic in `manageDeliveryRequest`: sets status to "CANCELLED". 
                // I should change that to "REJECTED" in `manageDeliveryRequest` too!
                // For now, if "CANCELLED" or "REJECTED", treat as retryable so IDLE or specific state.
                else if (status === "REJECTED") setRequestStatus("REJECTED");
                else if (status === "NEGOTIATING" || status === "CONFIRMED") setRequestStatus("EXISTING");
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
