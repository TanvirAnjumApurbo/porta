import { redirect } from "next/navigation";
import { XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PaymentCancelPageProps {
  searchParams: Promise<{
    request_id?: string;
  }>;
}

export default async function PaymentCancelPage({ searchParams }: PaymentCancelPageProps) {
  const params = await searchParams;
  const requestId = params.request_id;

  if (!requestId) {
    redirect("/requests");
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 text-center">
        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10 text-red-400" />
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-2">Payment Cancelled</h1>
        <p className="text-zinc-400 mb-6">
          Your payment was cancelled. No charges have been made to your card.
        </p>

        <div className="bg-zinc-800/50 rounded-lg p-4 mb-6">
          <p className="text-sm text-zinc-400">
            You can try again anytime. The delivery request is still active.
          </p>
        </div>

        <div className="space-y-3">
          <Link href={`/requests/${requestId}`}>
            <Button className="w-full bg-primary hover:bg-primary/90">
              Return to Request
            </Button>
          </Link>
          <Link href="/requests">
            <Button variant="outline" className="w-full border-zinc-700">
              View All Requests
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
