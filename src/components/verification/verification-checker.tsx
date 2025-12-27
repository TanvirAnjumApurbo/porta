"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { getVerificationStatus } from "@/server/actions/verification";
import { VerificationModal } from "./verification-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Clock, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export function VerificationChecker() {
  const { isSignedIn, isLoaded } = useUser();
  const pathname = usePathname();
  const [status, setStatus] = useState<"IDLE" | "PENDING" | "APPROVED" | "REJECTED" | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      checkStatus();
    } else {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn]);

  const checkStatus = async () => {
    try {
      const data = await getVerificationStatus();
      if (data) {
        setStatus(data.verificationStatus);
      } else {
        setStatus("IDLE");
      }
    } catch (error) {
      console.error("Failed to fetch verification status", error);
    } finally {
      setLoading(false);
    }
  };

  // Don't show on admin routes
  if (pathname.startsWith("/admin")) return null;
  if (!isLoaded || !isSignedIn || loading) return null;
  if (status === "APPROVED") return null;

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm animate-in fade-in slide-in-from-bottom-5">
        <Card className="border-white shadow-2xl">
          <CardHeader className="pb-2">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-primary/10 rounded-full">
                {status === "PENDING" ? (
                  <Clock className="w-5 h-5 text-primary" />
                ) : (
                  <ShieldAlert className="w-5 h-5 text-destructive" />
                )}
              </div>
              <div className="space-y-1">
                <CardTitle className="text-base">
                  {status === "PENDING" 
                    ? "Verification in Review" 
                    : "Identity Verification Required"}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {status === "PENDING" 
                    ? "We are reviewing your details. You will be notified soon."
                    : "To post requests or travel, you must verify your identity first."}
                </p>
              </div>
            </div>
          </CardHeader>
          {status !== "PENDING" && (
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={() => setIsModalOpen(true)}
              >
                Verify Identity Now
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>

      <VerificationModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); checkStatus(); }} />
    </>
  );
}
