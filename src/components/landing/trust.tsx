import { ShieldCheck, CreditCard, UserCheck, Lock, Award, HeadphonesIcon } from "lucide-react";

const trustItems = [
  {
    icon: ShieldCheck,
    title: "Escrow Protection",
    description: "Funds are held securely until delivery is confirmed by both parties.",
  },
  {
    icon: UserCheck,
    title: "Identity Verified",
    description: "All travelers undergo thorough ID verification before accepting requests.",
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    description: "Bank-level encryption protects all financial transactions.",
  },
  {
    icon: Lock,
    title: "Privacy First",
    description: "Your personal data is encrypted and never shared with third parties.",
  },
  {
    icon: Award,
    title: "Rated Community",
    description: "Review system ensures you connect with trusted, reliable users.",
  },
  {
    icon: HeadphonesIcon,
    title: "24/7 Support",
    description: "Our support team is always available to assist with any issues.",
  },
];

export function Trust() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/10 blur-[150px] rounded-full -translate-y-1/2 pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-cyan-500/10 blur-[150px] rounded-full -translate-y-1/2 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-green-400 text-sm font-semibold uppercase tracking-wider mb-4 block">
            Trust & Security
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Your Safety is Our <span className="text-green-400">Priority</span>
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            We've built multiple layers of protection to ensure every transaction is safe and secure.
          </p>
        </div>

        {/* Trust Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trustItems.map((item, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-green-500/30 transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                <item.icon className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-green-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 opacity-50">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <ShieldCheck className="w-5 h-5" />
            <span>SSL Secured</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Lock className="w-5 h-5" />
            <span>GDPR Compliant</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <CreditCard className="w-5 h-5" />
            <span>Stripe Payments</span>
          </div>
        </div>
      </div>
    </section>
  );
}
