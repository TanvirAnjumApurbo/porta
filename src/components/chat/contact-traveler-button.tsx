"use client";

import { useRouter } from "next/navigation";
import { useUser, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useState } from "react";

interface ContactTravelerButtonProps {
    travelerId: string;
    travelerName: string;
    travelPostId: string;
}

export function ContactTravelerButton({
    travelerId,
    travelerName,
    travelPostId,
}: ContactTravelerButtonProps) {
    const router = useRouter();
    const { isSignedIn, user } = useUser();
    const [isLoading, setIsLoading] = useState(false);

    // Don't show button if user is the traveler
    if (isSignedIn && user?.id === travelerId) {
        return null;
    }

    const handleClick = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent dialog trigger

        if (!isSignedIn) {
            return; // SignInButton wrapper will handle this
        }

        try {
            setIsLoading(true);

            // Create or get existing channel via API
            const res = await fetch("/api/chat/channel", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ travelerId, travelPostId }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Failed to create channel");
            }

            const { channelId } = await res.json();
            router.push(`/messages/${channelId}`);
        } catch (error) {
            console.error("Error starting conversation:", error);
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

    return (
        <Button
            onClick={handleClick}
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
        >
            <MessageCircle className="w-4 h-4 mr-2" />
            {isLoading ? "Connecting..." : "Contact Traveler"}
        </Button>
    );
}
