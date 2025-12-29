import { Navbar } from "@/components/navbar";

export default function BrowseRequestsPage() {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      <Navbar />
      <div className="pt-24 px-4 sm:px-6 max-w-7xl mx-auto pb-12">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Browse Requests</h1>
            <p className="text-zinc-400 text-sm sm:text-base">Find items that need delivering to your destination.</p>
          </div>
          <button className="w-full sm:w-auto px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition-colors">
            Filter
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass-card p-4 sm:p-6 rounded-xl hover:border-primary/50 transition-colors cursor-pointer group">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/5 rounded-lg" />
                <span className="text-green-400 font-bold text-sm sm:text-base">$40 Reward</span>
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
