import { SignOutButton } from "@clerk/nextjs";

export default function AdminDashboardPage() {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      <div className="bg-red-900/20 border-b border-red-500/20 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-red-400 font-mono text-sm font-bold">
            ADMIN ENVIRONMENT
          </div>
          <SignOutButton redirectUrl="/">
            <button className="px-4 py-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-200 text-xs font-semibold rounded border border-red-500/30 transition-colors">
              LOGOUT
            </button>
          </SignOutButton>
        </div>
      </div>
      
      <div className="pt-12 px-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Overview</h1>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 glass-card rounded-xl">
            <p className="text-zinc-400 text-sm">Total Users</p>
            <p className="text-2xl font-bold">12,304</p>
          </div>
          <div className="p-6 glass-card rounded-xl">
            <p className="text-zinc-400 text-sm">Escrow Volume</p>
            <p className="text-2xl font-bold">$45,200</p>
          </div>
          <div className="p-6 glass-card rounded-xl">
            <p className="text-zinc-400 text-sm">Disputes</p>
            <p className="text-2xl font-bold text-red-400">3</p>
          </div>
        </div>
      </div>
    </main>
  );
}
