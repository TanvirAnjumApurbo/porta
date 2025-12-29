import { Navbar } from "@/components/navbar";
import { getTravelPosts } from "@/server/actions/travel";
import { Plane, ArrowRight } from "lucide-react";
import Link from "next/link";
import { TravelersFilter } from "@/components/travel/travelers-filter";

export default async function BrowseTravelersPage() {
  const posts = await getTravelPosts();

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <Navbar />
      <div className="pt-24 px-4 sm:px-6 max-w-7xl mx-auto pb-12">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Browse Travelers</h1>
            <p className="text-zinc-400 text-sm sm:text-base">Find travelers heading to your destination.</p>
          </div>
          <Link 
            href="/travel" 
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-semibold rounded-lg transition-all flex items-center gap-2 w-fit"
          >
            <Plane className="w-4 h-4" />
            Post Trip
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="glass-card p-12 rounded-xl text-center">
            <Plane className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Travelers Yet</h2>
            <p className="text-zinc-500 mb-6">Be the first to post a trip and help others get their items delivered.</p>
            <Link 
              href="/travel" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-full transition-all"
            >
              Post Your Trip <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <TravelersFilter posts={posts} />
        )}
      </div>
    </main>
  );
}
