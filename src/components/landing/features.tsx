import { Zap, Shield, Wallet, Globe2 } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Skip traditional shipping delays. Your package travels with someone already on the way.",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    border: "border-yellow-400/20",
  },
  {
    icon: Shield,
    title: "Fully Secured",
    description: "Escrow payments, identity verification, and in-app tracking for complete peace of mind.",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20",
  },
  {
    icon: Wallet,
    title: "Save Up to 70%",
    description: "Cut shipping costs dramatically by utilizing unused luggage space from travelers.",
    color: "text-green-400",
    bg: "bg-green-400/10",
    border: "border-green-400/20",
  },
  {
    icon: Globe2,
    title: "Global Reach",
    description: "Access to 180+ countries through our worldwide network of verified travelers.",
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    border: "border-purple-400/20",
  },
];

export function Features() {
  return (
    <section className="py-24 relative bg-zinc-900/30 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-primary text-sm font-semibold uppercase tracking-wider mb-4 block">
            Why Choose Porta
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            The Future of <span className="gradient-text">Global Shipping</span>
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Experience a revolutionary way to send and receive packages worldwide.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group relative p-6 rounded-2xl glass-card border ${feature.border} hover:border-white/20 transition-all duration-300 hover:-translate-y-1`}
            >
              {/* Icon */}
              <div className={`w-14 h-14 rounded-xl ${feature.bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className={`w-7 h-7 ${feature.color}`} />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold mb-3 group-hover:text-white transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {feature.description}
              </p>

              {/* Hover Glow Effect */}
              <div className={`absolute inset-0 ${feature.bg} opacity-0 group-hover:opacity-20 rounded-2xl blur-xl transition-opacity duration-300 -z-10`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
