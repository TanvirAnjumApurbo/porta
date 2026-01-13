import { Navbar } from "@/components/navbar";
import { redirect } from "next/navigation";
import { getVerificationStatus } from "@/server/actions/verification";
import { auth } from "@clerk/nextjs/server";
import { TravelPostForm } from "@/components/travel/travel-post-form";

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
      <div className="pt-24 px-4 sm:px-6 max-w-2xl mx-auto pb-12">
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">I am Traveling</h1>
          <p className="text-zinc-400 text-sm sm:text-base">Monetize your extra luggage space.</p>
        </div>

        <div className="glass-card p-6 sm:p-8 rounded-2xl border border-white/10">
          <TravelPostForm />
        </div>
      </div>
    </main>
  );
}

