import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Navbar } from "@/components/navbar";
import { NotificationsList } from "@/components/notifications/notifications-list";
import { Bell } from "lucide-react";

export default async function NotificationsPage() {
    const { userId } = await auth();

    if (!userId) {
        redirect("/sign-in");
    }

    return (
        <main className="min-h-screen bg-[var(--background)]">
            <Navbar />
            <div className="pt-24 px-4 sm:px-6 max-w-3xl mx-auto pb-12">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Bell className="w-6 h-6 text-primary" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold">Notifications</h1>
                    </div>
                    <p className="text-zinc-400 text-sm sm:text-base">
                        Stay updated on your requests and deliveries
                    </p>
                </div>

                <Suspense fallback={<NotificationsPageSkeleton />}>
                    <NotificationsList />
                </Suspense>
            </div>
        </main>
    );
}

function NotificationsPageSkeleton() {
    return (
        <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-20 bg-zinc-900 rounded-xl animate-pulse" />
            ))}
        </div>
    );
}
