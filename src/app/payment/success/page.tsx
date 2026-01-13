import { redirect } from "next/navigation";
import { Suspense } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PaymentSuccessPageProps {
  searchParams: Promise<{
    session_id?: string;
    request_id?: string;
  }>;
}

export default async function PaymentSuccessPage({ searchParams }: PaymentSuccessPageProps) {
  const params = await searchParams;
  const requestId = params.request_id;

  if (!requestId) {
    redirect("/requests");
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <Suspense fallback={<LoadingState />}>
        <SuccessContent requestId={requestId} />
      </Suspense>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="text-center">
      <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
      <p className="text-zinc-400">Processing payment...</p>
    </div>
  );
}

function SuccessContent({ requestId }: { requestId: string }) {
  return (
    <div className="max-w-md w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 text-center">
      <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-10 h-10 text-green-400" />
      </div>
      
      <h1 className="text-2xl font-bold text-white mb-2">Payment Successful!</h1>
      <p className="text-zinc-400 mb-6">
        Your payment has been secured in escrow. The traveler will receive the funds after you confirm delivery.
      </p>

      <div className="bg-zinc-800/50 rounded-lg p-4 mb-6">
        <p className="text-sm text-zinc-500 mb-1">What happens next?</p>
        <ul className="text-sm text-zinc-300 text-left space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-primary">1.</span>
            <span>Chat with your traveler to coordinate pickup/delivery</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">2.</span>
            <span>Traveler will mark the package as delivered</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">3.</span>
            <span>Confirm receipt to release payment to the traveler</span>
          </li>
        </ul>
      </div>

      <div className="space-y-3">
        <Link href={`/requests/${requestId}`}>
          <Button className="w-full bg-primary hover:bg-primary/90">
            View Request Details
          </Button>
        </Link>
        <Link href={`/messages/delivery_${requestId}`}>
          <Button variant="outline" className="w-full border-zinc-700">
            Open Chat
          </Button>
        </Link>
      </div>
    </div>
  );
}
