import { Navbar } from "@/components/navbar";
import { getMyTravelPosts } from "@/server/actions/travel";
import { TripCard } from "@/components/travel/trip-card";
import { Plane } from "lucide-react";

export default async function DashboardPage() {
  const myTrips = await getMyTravelPosts();

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <Navbar />
      <div className="pt-24 px-6 max-w-7xl mx-auto pb-12">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Active Requests (Placeholder for now) */}
          <div className="p-6 glass-card rounded-xl h-fit">
            <h2 className="text-xl font-semibold mb-4">My Requests</h2>
            <div className="h-32 bg-white/5 rounded-lg border border-dashed border-white/10 flex items-center justify-center text-zinc-500">
              No active requests
            </div>
          </div>

          {/* Active Offers / My Trips */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold px-1">My Trips</h2>
            {myTrips.length === 0 ? (
                <div className="p-6 glass-card rounded-xl text-center">
                    <Plane className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                    <p className="text-zinc-500 mb-2">You haven't posted any trips yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {myTrips.map(post => (
                        <TripCard key={post.id} post={post} isOwnPost={true} />
                    ))}
                </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
