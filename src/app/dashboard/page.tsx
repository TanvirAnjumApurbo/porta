import { Navbar } from "@/components/navbar";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      <Navbar />
      <div className="pt-24 px-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Active Requests Skeleton */}
          <div className="p-6 glass-card rounded-xl">
            <h2 className="text-xl font-semibold mb-4">My Requests</h2>
            <div className="h-32 bg-white/5 rounded-lg animate-pulse flex items-center justify-center text-zinc-500">
              No active requests
            </div>
          </div>

          {/* Active Offers Skeleton */}
          <div className="p-6 glass-card rounded-xl">
            <h2 className="text-xl font-semibold mb-4">My Trips</h2>
            <div className="h-32 bg-white/5 rounded-lg animate-pulse flex items-center justify-center text-zinc-500">
              No upcoming trips
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
