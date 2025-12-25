import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      <Navbar />
      <Hero />
      <HowItWorks />
      
      {/* Footer Placeholder */}
      <footer className="py-8 text-center text-zinc-600 text-sm border-t border-white/5">
        &copy; {new Date().getFullYear()} Porta. All rights reserved.
      </footer>
    </main>
  );
}
