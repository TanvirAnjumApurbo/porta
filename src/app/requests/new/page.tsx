import { redirect } from "next/navigation";
import { getVerificationStatus } from "@/server/actions/verification";
import { auth } from "@clerk/nextjs/server";
import { Navbar } from "@/components/navbar";

export default async function CreateRequestPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const userStatus = await getVerificationStatus();

  if (!userStatus || !userStatus.isVerified) {
    // Optionally redirect to a specific "verification needed" page, 
    // but since we have a global modal/banner, redirecting to dashboard or home 
    // where they can see the banner is a good start.
    // Or we can render a "Verify First" state here.
    return (
        <main className="min-h-screen pt-24 px-6 bg-[var(--background)]">
            <Navbar />
            <div className="max-w-2xl mx-auto text-center mt-20">
                <h1 className="text-3xl font-bold text-red-500 mb-4">Verification Required</h1>
                <p className="text-zinc-400 mb-8">
                    You must verify your identity before you can post a request.
                    Please check the verification alert at the bottom of your screen to proceed.
                </p>
            </div>
        </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 px-6 bg-[var(--background)]">
      <Navbar />
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Post a Request</h1>
          <p className="text-zinc-400">Ask a traveler to bring you an item.</p>
        </div>

        {/* Skeleton Card */}
        <div className="glass-card p-8 rounded-2xl min-h-[400px] flex items-center justify-center border-dashed border-2 border-white/10">
          <div className="text-center opacity-50">
            <p className="text-xl font-medium mb-2">Wizard Placeholder</p>
            <p className="text-sm">Step 1: Item Details</p>
            <p className="text-sm">Step 2: Route</p>
            <p className="text-sm">Step 3: Summary</p>
          </div>
        </div>
      </div>
    </main>
  );
}
