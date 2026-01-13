"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CreditCard, CheckCircle, Loader2, ExternalLink, AlertCircle } from "lucide-react";

interface StripeConnectSetupProps {
    className?: string;
}

export function StripeConnectSetup({ className }: StripeConnectSetupProps) {
    const [status, setStatus] = useState<{
        hasAccount: boolean;
        onboardingComplete: boolean;
        chargesEnabled: boolean;
        payoutsEnabled: boolean;
    } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isStarting, setIsStarting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        checkStatus();
    }, []);

    const checkStatus = async () => {
        try {
            const response = await fetch("/api/stripe/connect");
            const data = await response.json();
            
            if (response.ok) {
                setStatus(data);
            } else {
                setError(data.error || "Failed to check status");
            }
        } catch (err) {
            setError("Failed to check payment setup status");
        } finally {
            setIsLoading(false);
        }
    };

    const router = useRouter();

    const startOnboarding = () => {
        setIsStarting(true);
        router.push("/stripe/onboarding");
    };

    if (isLoading) {
        return (
            <div className={`bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 ${className}`}>
                <div className="flex items-center justify-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
                    <span className="text-zinc-400">Checking payment setup...</span>
                </div>
            </div>
        );
    }

    if (status?.onboardingComplete) {
        return (
            <div className={`bg-green-500/10 border border-green-500/20 rounded-xl p-6 ${className}`}>
                <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-green-400">Payment Setup Complete</h3>
                        <p className="text-sm text-green-300 mt-1">
                            You're ready to receive payments. When customers pay for deliveries, 
                            you'll receive 95% of the payment (5% platform fee).
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-amber-500/10 border border-amber-500/20 rounded-xl p-6 ${className}`}>
            <div className="flex items-start gap-3">
                <CreditCard className="w-5 h-5 text-amber-400 mt-0.5" />
                <div className="flex-1">
                    <h3 className="font-semibold text-amber-400">Set Up Payment Receiving</h3>
                    <p className="text-sm text-amber-200 mt-1 mb-4">
                        Complete your payment setup with Stripe to receive payments from customers. 
                        This only takes a few minutes.
                    </p>

                    {error && (
                        <div className="flex items-center gap-2 text-red-400 text-sm mb-4">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    <Button
                        onClick={startOnboarding}
                        disabled={isStarting}
                        className="bg-amber-600 hover:bg-amber-500"
                    >
                        {isStarting ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                            <ExternalLink className="w-4 h-4 mr-2" />
                        )}
                        {status?.hasAccount ? "Continue Setup" : "Start Setup"}
                    </Button>

                    <p className="text-xs text-zinc-500 mt-3">
                        Secure setup powered by Stripe. You'll need to provide basic business information.
                    </p>
                </div>
            </div>
        </div>
    );
}
