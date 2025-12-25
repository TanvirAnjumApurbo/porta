import { MessageSquare, ShoppingBag, Handshake } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      id: 1,
      title: "The Agreement",
      desc: "Shopper requests an item. Traveler accepts. Money is frozen in Escrow.",
      icon: MessageSquare,
      color: "text-blue-400",
      bg: "bg-blue-400/10"
    },
    {
      id: 2,
      title: "The Purchase",
      desc: "Traveler buys the item to ensure safety. Uploads receipt to lock the deal.",
      icon: ShoppingBag,
      color: "text-purple-400",
      bg: "bg-purple-400/10"
    },
    {
      id: 3,
      title: "The Handover",
      desc: "Meet in public. Shopper inspects item. Funds released via OTP.",
      icon: Handshake,
      color: "text-green-400",
      bg: "bg-green-400/10"
    }
  ];

  return (
    <section id="how-it-works" className="py-24 relative border-t border-white/5 bg-zinc-900/30">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Trustless by Design</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Our "Traveler-Buy" model ensures no one carries unknown packages. 
            Money is safe until you are happy.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-green-500/20 border-t border-white/5 border-dashed" />

          {steps.map((step) => (
            <div key={step.id} className="relative z-10 flex flex-col items-center text-center group">
              <div className={`w-24 h-24 rounded-2xl ${step.bg} border border-white/5 flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-300`}>
                <step.icon className={`w-10 h-10 ${step.color}`} />
              </div>
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed max-w-xs">{step.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
