"use client";

import { MessageSquare, ShoppingBag, Handshake } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const steps = [
  {
    id: 1,
    title: "The Agreement",
    desc: "Shopper requests an item. Traveler accepts. Money is frozen in Escrow.",
    icon: MessageSquare,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    borderColor: "border-blue-400",
  },
  {
    id: 2,
    title: "The Purchase",
    desc: "Traveler buys the item to ensure safety. Uploads receipt to lock the deal.",
    icon: ShoppingBag,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    borderColor: "border-purple-400",
  },
  {
    id: 3,
    title: "The Handover",
    desc: "Meet in public. Shopper inspects item. Funds released via OTP.",
    icon: Handshake,
    color: "text-green-400",
    bg: "bg-green-400/10",
    borderColor: "border-green-400",
  },
];

function AnimatedLine({ isVisible }: { isVisible: boolean }) {
  return (
    <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 overflow-hidden">
      {/* Background line (dashed) */}
      <div className="absolute inset-0 border-t border-white/10 border-dashed" />
      
      {/* Animated fill line */}
      <div 
        className={`absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 transition-all duration-[2000ms] ease-out ${
          isVisible ? "w-full" : "w-0"
        }`}
      />
      
      {/* Glow effect */}
      <div 
        className={`absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500/50 via-purple-500/50 to-green-500/50 blur-sm transition-all duration-[2000ms] ease-out ${
          isVisible ? "w-full" : "w-0"
        }`}
      />
    </div>
  );
}

export function HowItWorks() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Animate steps appearing one by one
          steps.forEach((_, index) => {
            setTimeout(() => {
              setActiveStep(index + 1);
            }, 500 + index * 400);
          });
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      ref={sectionRef}
      id="how-it-works" 
      className="py-24 relative border-t border-white/5 bg-zinc-900/30"
    >
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Trustless by Design</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Our "Traveler-Buy" model ensures no one carries unknown packages. 
            Money is safe until you are happy.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Animated Connector Line */}
          <AnimatedLine isVisible={isVisible} />

          {steps.map((step, index) => (
            <div 
              key={step.id} 
              className={`relative z-10 flex flex-col items-center text-center group transition-all duration-500 ${
                activeStep > index ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              {/* Icon with animated border */}
              <div className="relative mb-6">
                <div 
                  className={`w-24 h-24 rounded-2xl ${step.bg} border border-white/5 flex items-center justify-center transition-all duration-500 group-hover:scale-110 ${
                    activeStep > index ? "border-2 " + step.borderColor : ""
                  }`}
                >
                  <step.icon className={`w-10 h-10 ${step.color}`} />
                </div>
                
                {/* Step number badge */}
                <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full ${step.bg} border ${step.borderColor} flex items-center justify-center text-sm font-bold ${step.color}`}>
                  {step.id}
                </div>
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
