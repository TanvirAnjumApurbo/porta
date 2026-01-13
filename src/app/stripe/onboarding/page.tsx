"use client";

import { useEffect, useState } from "react";
import { loadConnectAndInitialize } from "@stripe/connect-js";
import {
  ConnectAccountOnboarding,
  ConnectComponentsProvider,
} from "@stripe/react-connect-js";
import { getOnboardingSession } from "@/server/actions/stripe";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function StripeOnboardingPage() {
  const [stripeConnectInstance, setStripeConnectInstance] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initStripe = async () => {
      try {
        const result = await getOnboardingSession();
        if (!result.success || !result.clientSecret) {
          throw new Error(result.error || "Failed to initialize Stripe");
        }

        const instance = loadConnectAndInitialize({
          publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
          fetchClientSecret: async () => result.clientSecret!,
          appearance: {
            variables: {
              colorPrimary: "#2563eb", // blue-600
              colorBackground: "#18181b", // zinc-900 (dark mode)
              colorText: "#ffffff",
            },
            overlays: "dialog",
          },
        });

        setStripeConnectInstance(instance);
      } catch (err) {
        console.error(err);
        setError("Failed to load secure onboarding. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    initStripe();
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white p-4">
        <p className="text-red-400 mb-4">{error}</p>
        <Link href="/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Custom Header */}
      <header className="border-b border-zinc-800 p-4 sticky top-0 bg-zinc-950/80 backdrop-blur-md z-10 mx-auto max-w-2xl mt-10 rounded-t-xl border-x border-t">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="hover:bg-zinc-800">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold">Verify Identity for Payouts</h1>
        </div>
      </header>
      
      {/* Onboarding Container */}
      <main className="max-w-2xl mx-auto border-x border-b border-zinc-800 bg-zinc-900/50 p-6 rounded-b-xl min-h-[500px]">
        {loading || !stripeConnectInstance ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-zinc-500 text-sm">Initializing secure connection...</p>
          </div>
        ) : (
          <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
            <ConnectAccountOnboarding
              onExit={() => {
                console.log("Onboarding exited");
                router.push('/dashboard');
              }}
            />
          </ConnectComponentsProvider>
        )}
      </main>
    </div>
  );
}
