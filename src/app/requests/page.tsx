import { Navbar } from "@/components/navbar";

export default function BrowseRequestsPage() {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      <Navbar />
      <div className="pt-24 px-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Browse Requests</h1>
            <p className="text-zinc-400">Find items that need delivering to your destination.</p>
          </div>
          <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition-colors">
            Filter
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass-card p-6 rounded-xl hover:border-primary/50 transition-colors cursor-pointer group">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-white/5 rounded-lg" />
                <span className="text-green-400 font-bold">$40 Reward</span>
              </div>
              <h3 className="font-bold mb-1 group-hover:text-primary transition-colors">IKEA Desk Lamp</h3>
              <p className="text-sm text-zinc-500 mb-4">From London → Dhaka</p>
              <div className="h-2 w-24 bg-white/5 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
