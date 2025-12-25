import Link from "next/link";
import { ArrowRight, Package } from "lucide-react";

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none opacity-50" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10 grid md:grid-cols-2 gap-12 items-center">
        
        {/* Left Content */}
        <div className="flex flex-col gap-6 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 w-fit mx-auto md:mx-0">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-zinc-400">Live: 1,204 Travelers Airborne</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
            Global Logistics <br /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-cyan-400">
              In Your Luggage.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-400 max-w-lg mx-auto md:mx-0">
            Send items faster and cheaper with travelers already flying there. Monetize your extra bag space securely.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 justify-center md:justify-start">
            <Link 
              href="/requests/new"
              className="w-full sm:w-auto px-8 py-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_-5px_var(--primary)]"
            >
              Post a Request <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              href="/travel"
              className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium rounded-lg transition-all"
            >
              I'm Traveling
            </Link>
          </div>

          {/* Mini Trust Signals */}
          <div className="flex items-center gap-6 justify-center md:justify-start pt-8 opacity-70">
            <div className="flex -space-x-3">
              {[1,2,3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-900" />
              ))}
            </div>
            <p className="text-sm text-zinc-500">Trusted by 10k+ users</p>
          </div>
        </div>

        {/* Right Visual (Abstract Representation) */}
        <div className="relative hidden md:block">
          <div className="relative w-full h-[500px] animate-float">
            {/* Main Card (Abstract Luggage/Package) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-96 glass-card rounded-2xl flex flex-col items-center justify-center border border-white/10 z-20">
               <Package className="w-24 h-24 text-primary mb-6 opacity-80" />
               <div className="w-48 h-2 bg-white/10 rounded-full mb-3" />
               <div className="w-32 h-2 bg-white/10 rounded-full" />
               
               {/* Floating Badge */}
               <div className="absolute -right-6 top-10 glass px-4 py-2 rounded-lg text-sm font-semibold text-green-400 border border-green-500/30">
                 Saved $120
               </div>
            </div>

            {/* Orbiting Elements */}
            <div className="absolute top-10 right-10 w-20 h-20 bg-indigo-500/20 blur-xl rounded-full" />
            <div className="absolute bottom-10 left-10 w-32 h-32 bg-cyan-500/20 blur-xl rounded-full" />
          </div>
        </div>

      </div>
    </section>
  );
}
