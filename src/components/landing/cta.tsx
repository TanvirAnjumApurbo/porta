import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-cyan-500/20 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />
      
      {/* Animated Background Orbs */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-primary/30 blur-[100px] rounded-full animate-float pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-cyan-500/20 blur-[120px] rounded-full animate-float pointer-events-none" style={{ animationDelay: "2s" }} />

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <div className="text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/20 border border-primary/30 mb-8 animate-pulse-glow">
            <Image 
              src="/icon.svg" 
              alt="Porta" 
              width={48} 
              height={48}
              className="object-contain"
            />
          </div>

          {/* Headline */}
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Ready to Transform How You{" "}
            <span className="gradient-text">Ship Globally?</span>
          </h2>

          {/* Subtext */}
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10">
            Join thousands of users who are already saving money and earning extra income with Porta.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/requests/new"
              className="w-full sm:w-auto px-8 py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-[0_0_40px_-10px_var(--primary)] hover:shadow-[0_0_60px_-10px_var(--primary)] hover:-translate-y-0.5"
            >
              Post a Request
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/travel"
              className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold rounded-xl transition-all hover:-translate-y-0.5"
            >
              Become a Traveler
            </Link>
          </div>

          {/* Trust Note */}
          <p className="mt-8 text-sm text-zinc-500">
            No credit card required • Free to get started • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
}
