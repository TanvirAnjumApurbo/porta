"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminVerifyUser } from "@/server/actions/verification";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2 } from "lucide-react";

interface VerificationActionsProps {
  userId: string;
}

export function VerificationActions({ userId }: VerificationActionsProps) {
  const router = useRouter();
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await adminVerifyUser(userId, "APPROVED");
      router.refresh();
    } catch (error) {
      console.error("Failed to approve", error);
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    setIsRejecting(true);
    try {
      await adminVerifyUser(userId, "REJECTED");
      router.refresh();
    } catch (error) {
      console.error("Failed to reject", error);
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <div className="flex gap-2 w-full">
      <Button 
        onClick={handleApprove} 
        disabled={isApproving || isRejecting}
        className="flex-1 bg-green-600 hover:bg-green-700"
      >
        {isApproving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
        Approve
      </Button>
      <Button 
        onClick={handleReject} 
        disabled={isApproving || isRejecting}
        variant="destructive"
        className="flex-1"
      >
        {isRejecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4 mr-1" />}
        Reject
      </Button>
    </div>
  );
}
