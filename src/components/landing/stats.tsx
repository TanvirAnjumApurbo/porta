"use client";

import { useEffect, useRef, useState } from "react";
import { Globe, Package, Users, TrendingDown } from "lucide-react";

interface StatItemProps {
  icon: React.ReactNode;
  value: number;
  suffix?: string;
  label: string;
  delay: number;
}

function StatItem({ icon, value, suffix = "", label, delay }: StatItemProps) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        current += increment;
        if (current >= value) {
          setCount(value);
          clearInterval(interval);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timer);
  }, [isVisible, value, delay]);

  return (
    <div
      ref={ref}
      className="relative flex flex-col items-center text-center p-6 glass-card rounded-2xl hover-scale"
    >
      <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
        {icon}
      </div>
      <div className="text-4xl md:text-5xl font-bold counter-animate mb-2">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm text-zinc-400 uppercase tracking-wider">{label}</div>
    </div>
  );
}

export function Stats() {
  const stats = [
    {
      icon: <Users className="w-7 h-7 text-primary" />,
      value: 50000,
      suffix: "+",
      label: "Active Travelers",
      delay: 0,
    },
    {
      icon: <Globe className="w-7 h-7 text-cyan-400" />,
      value: 180,
      suffix: "+",
      label: "Countries",
      delay: 150,
    },
    {
      icon: <Package className="w-7 h-7 text-purple-400" />,
      value: 250000,
      suffix: "+",
      label: "Packages Delivered",
      delay: 300,
    },
    {
      icon: <TrendingDown className="w-7 h-7 text-green-400" />,
      value: 70,
      suffix: "%",
      label: "Average Savings",
      delay: 450,
    },
  ];

  return (
    <section className="py-20 relative">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, index) => (
            <StatItem key={index} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
}
