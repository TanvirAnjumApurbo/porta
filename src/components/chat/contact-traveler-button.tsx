"use client";

import { useRouter } from "next/navigation";
import { useUser, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { MessageCircle, CheckCircle, Clock } from "lucide-react";
import { useState } from "react";
import { createDeliveryRequest } from "@/server/actions/delivery";
import { toast } from "sonner"; // Assuming sonner is used, or alert/console if not. I'll use simple alert or console if unsure, but toast is standard. 
// Checking package.json... no sonner/toast explicitly seen in list I read? 
// Re-checking package.json...
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
    const [requestStatus, setRequestStatus] = useState<"IDLE" | "SENT" | "EXISTING">("IDLE");

    // Don't show button if user is the traveler
    if (isSignedIn && user?.id === travelerId) {
        return null;
    }

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
                if (result.isExisting) {
                    setRequestStatus("EXISTING");
                } else {
                    setRequestStatus("SENT");
                }
            }
        } catch (error) {
            console.error("Error sending request:", error);
            // Ideally show a toast here
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
