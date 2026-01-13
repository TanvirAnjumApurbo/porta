import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronDown } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image with Ken Burns Effect */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/wing-airplane-with-city-background.jpg"
          alt="Global logistics - airplane wing with city background"
          fill
          className="object-cover animate-kenburns"
          priority
          quality={90}
        />
        {/* Dark Overlay Gradients - Reduced opacity on left to show more image */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0c]/80 via-[#0a0a0c]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-[#0a0a0c]/30" />
      </div>
      
      {/* Background Glows */}
      <div className="absolute top-1/4 left-10 w-[600px] h-[300px] bg-primary/20 blur-[150px] rounded-full pointer-events-none opacity-60" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[200px] bg-cyan-500/15 blur-[120px] rounded-full pointer-events-none opacity-50" />
      
      {/* Content Container - Aligned more to the left */}
      <div className="w-full px-6 md:px-12 lg:px-20 relative z-10 pt-20">
        <div className="max-w-3xl">
          {/* Main Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05] mb-6 animate-fade-in-up">
            Global Logistics{" "}
            <br className="hidden sm:block" />
            <span className="gradient-text">In Your Luggage</span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-lg md:text-xl lg:text-2xl text-zinc-300 max-w-xl mb-10 animate-fade-in-up animate-delay-100 font-medium drop-shadow-md">
            Send items faster and cheaper with travelers already flying there. 
            Monetize your extra bag space securely.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-start gap-4 animate-fade-in-up animate-delay-200">
            <Link 
              href="/requests/new"
              className="group w-full sm:w-auto px-8 py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-[0_0_40px_-10px_var(--primary)] hover:shadow-[0_0_60px_-10px_var(--primary)] hover:-translate-y-0.5"
            >
              Post a Request 
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/travel"
              className="w-full sm:w-auto px-8 py-4 bg-white/10 border border-white/20 hover:bg-white/20 text-white font-semibold rounded-xl transition-all backdrop-blur-md hover:-translate-y-0.5 shadow-lg flex items-center justify-center"
            >
              I'm Traveling
            </Link>
          </div>

          {/* Trust Signals */}
          <div className="flex flex-wrap items-center gap-6 mt-12 animate-fade-in-up animate-delay-300">
            <div className="flex -space-x-3">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
                alt="User"
                className="w-10 h-10 rounded-full border-2 border-[#0a0a0c] object-cover"
              />
              <img 
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face"
                alt="User"
                className="w-10 h-10 rounded-full border-2 border-[#0a0a0c] object-cover"
              />
              <img 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
                alt="User"
                className="w-10 h-10 rounded-full border-2 border-[#0a0a0c] object-cover"
              />
            </div>
            <div className="text-sm shadow-black/50 drop-shadow-md">
              <span className="text-white font-semibold">10,000+</span>
              <span className="text-zinc-200"> trusted users worldwide</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-fade-in-up animate-delay-400">
        <a 
          href="#how-it-works" 
          className="flex flex-col items-center gap-2 text-zinc-400 hover:text-white transition-colors group"
        >
          <span className="text-xs uppercase tracking-widest drop-shadow-md">Scroll</span>
          <ChevronDown className="w-5 h-5 animate-bounce drop-shadow-md" />
        </a>
      </div>
    </section>
  );
}
