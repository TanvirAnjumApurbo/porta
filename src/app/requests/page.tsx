import { Suspense } from "react";
import { Navbar } from "@/components/navbar";
import { RequestsTabs } from "@/components/requests/requests-tabs";
import { Package } from "lucide-react";

export default function RequestsPage({
    searchParams,
}: {
    searchParams: Promise<{ tab?: string }>;
}) {
    return (
        <main className="min-h-screen bg-[var(--background)]">
            <Navbar />
            <div className="pt-24 px-4 sm:px-6 max-w-5xl mx-auto pb-12">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Package className="w-6 h-6 text-primary" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold">Orders & Deliveries</h1>
                    </div>
                    <p className="text-zinc-400 text-sm sm:text-base">
                        Manage your delivery requests - incoming and sent
                    </p>
                </div>

                <Suspense fallback={<RequestsPageSkeleton />}>
                    <RequestsTabsWrapper searchParams={searchParams} />
                </Suspense>
            </div>
        </main>
    );
}

async function RequestsTabsWrapper({
    searchParams,
}: {
    searchParams: Promise<{ tab?: string }>;
}) {
    const params = await searchParams;
    const defaultTab = params.tab === "sent" ? "sent" : "incoming";
    return <RequestsTabs defaultTab={defaultTab} />;
}

function RequestsPageSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <div className="h-10 w-32 bg-zinc-800 rounded-lg animate-pulse" />
                <div className="h-10 w-32 bg-zinc-800 rounded-lg animate-pulse" />
            </div>
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-40 bg-zinc-900 rounded-xl animate-pulse" />
                ))}
            </div>
        </div>
    );
}
