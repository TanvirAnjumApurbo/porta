import { Navbar } from "@/components/navbar";

export default function FindTravelersPage() {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      <Navbar />
      <div className="pt-24 px-4 sm:px-6 max-w-7xl mx-auto pb-12">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Find Travelers</h1>
            <p className="text-zinc-400 text-sm sm:text-base">Connect with travelers flying to your destination.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full lg:w-auto">
             <input 
               type="text" 
               placeholder="Destination (e.g. Dhaka)" 
               className="flex-1 lg:flex-none bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm" 
             />
             <button className="w-full sm:w-auto px-4 py-2 bg-primary text-white rounded-lg text-sm transition-colors shadow-[0_0_15px_-3px_var(--primary)]">
               Search
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass-card p-4 sm:p-6 rounded-xl hover:border-primary/50 transition-colors cursor-pointer group">
              <div className="flex items-center gap-3 sm:gap-4 mb-4">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/30 text-sm">
                  JD
                </div>
                <div>
                  <h3 className="font-bold group-hover:text-primary transition-colors">John Doe</h3>
                  <p className="text-xs text-zinc-500">Trusted Traveler</p>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Route</span>
                  <span className="font-medium">JFK → DAC</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Date</span>
                  <span className="font-medium">Oct 12, 2025</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Capacity</span>
                  <span className="font-medium text-green-400">5kg Available</span>
                </div>
              </div>

              <button className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium transition-colors">
                Contact Traveler
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
