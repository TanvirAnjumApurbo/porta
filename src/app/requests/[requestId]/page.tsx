import { Suspense } from "react";
import { redirect, notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Navbar } from "@/components/navbar";
import { RequestDetailView } from "@/components/requests/request-detail-view";
import { getDeliveryRequest } from "@/server/actions/delivery";
import { Loader2 } from "lucide-react";

interface RequestDetailPageProps {
    params: Promise<{
        requestId: string;
    }>;
}

export default async function RequestDetailPage({ params }: RequestDetailPageProps) {
    const { requestId } = await params;
    const { userId } = await auth();

    if (!userId) {
        redirect("/sign-in");
    }

    const request = await getDeliveryRequest(requestId);

    if (!request) {
        notFound();
    }

    const isTraveler = request.travellerId === userId;
    const isCustomer = request.customerId === userId;

    return (
        <main className="min-h-screen bg-[var(--background)]">
            <Navbar />
            <div className="pt-24 px-4 sm:px-6 max-w-3xl mx-auto pb-12">
                <Suspense fallback={<RequestDetailSkeleton />}>
                    <RequestDetailView
                        request={request}
                        isTraveler={isTraveler}
                        isCustomer={isCustomer}
                    />
                </Suspense>
            </div>
        </main>
    );
}

function RequestDetailSkeleton() {
    return (
        <div className="space-y-6">
            <div className="h-8 w-48 bg-zinc-800 rounded animate-pulse" />
            <div className="h-64 bg-zinc-900 rounded-xl animate-pulse" />
            <div className="h-48 bg-zinc-900 rounded-xl animate-pulse" />
        </div>
    );
}
