import { Navbar } from "@/components/navbar";
import { redirect } from "next/navigation";
import { getVerificationStatus } from "@/server/actions/verification";
import { auth } from "@clerk/nextjs/server";

export default async function TravelPage() {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) return redirectToSignIn();

  const userStatus = await getVerificationStatus();

  if (!userStatus || !userStatus.isVerified) {
    return (
        <main className="min-h-screen bg-[var(--background)]">
            <Navbar />
            <div className="pt-24 px-6 max-w-2xl mx-auto text-center mt-20">
                <h1 className="text-3xl font-bold text-red-500 mb-4">Verification Required</h1>
                <p className="text-zinc-400 mb-8">
                    You must verify your identity before you can post a trip.
                    Please check the verification alert at the bottom of your screen to proceed.
                </p>
            </div>
        </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <Navbar />
      <div className="pt-24 px-6 max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">I am Traveling</h1>
          <p className="text-zinc-400">Monetize your extra luggage space.</p>
        </div>

        {/* Skeleton Form */}
        <div className="glass-card p-8 rounded-2xl flex flex-col gap-6 border border-white/10">
          <div className="h-12 bg-white/5 rounded-lg w-full animate-pulse" />
          <div className="h-12 bg-white/5 rounded-lg w-full animate-pulse" />
          <div className="h-40 bg-white/5 rounded-lg w-full animate-pulse" />
          <div className="h-12 bg-primary/20 rounded-lg w-full flex items-center justify-center text-primary font-bold">
            Post Trip (Placeholder)
          </div>
        </div>
      </div>
    </main>
  );
}
