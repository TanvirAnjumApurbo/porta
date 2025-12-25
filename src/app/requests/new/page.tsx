export default function CreateRequestPage() {
  return (
    <main className="min-h-screen pt-24 px-6 bg-[var(--background)]">
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
