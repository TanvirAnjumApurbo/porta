import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/landing/hero";
import { Stats } from "@/components/landing/stats";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Gallery } from "@/components/landing/gallery";
import { Features } from "@/components/landing/features";
import { Trust } from "@/components/landing/trust";
import { CTA } from "@/components/landing/cta";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      <Navbar />
      <Hero />
      <Stats />
      <HowItWorks />
      <Gallery />
      <Features />
      <Trust />
      <CTA />
      <Footer />
    </main>
  );
}
