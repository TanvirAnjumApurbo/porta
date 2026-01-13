import Link from "next/link";
import Image from "next/image";
import { Facebook, Twitter, Instagram, Linkedin, Mail, MapPin, Phone } from "lucide-react";

const footerLinks = {
  product: [
    { label: "How It Works", href: "#how-it-works" },
    { label: "Browse Travelers", href: "/travelers" },
    { label: "Post a Request", href: "/requests/new" },
    { label: "Become a Traveler", href: "/travel" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Press", href: "/press" },
    { label: "Blog", href: "/blog" },
  ],
  legal: [
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Cookie Policy", href: "/cookies" },
    { label: "Refund Policy", href: "/refunds" },
  ],
  support: [
    { label: "Help Center", href: "/help" },
    { label: "Contact Us", href: "/contact" },
    { label: "Safety Guidelines", href: "/safety" },
    { label: "Community", href: "/community" },
  ],
};

const socialLinks = [
  { icon: Facebook, href: "https://facebook.com/portasbs", label: "Facebook" },
  { icon: Twitter, href: "https://twitter.com/portasbs", label: "Twitter" },
  { icon: Instagram, href: "https://instagram.com/portasbs", label: "Instagram" },
  { icon: Linkedin, href: "https://linkedin.com/company/porta-sbs", label: "LinkedIn" },
];

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-zinc-900/50">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2">
            <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
              <Image
                src="/icon.svg"
                alt="Porta Icon"
                width={40}
                height={40}
                className="group-hover:scale-110 transition-transform duration-300"
              />
              <span className="text-2xl font-bold tracking-tight font-[family-name:var(--font-inter)]">
                porta
              </span>
            </Link>
            <p className="text-sm text-zinc-400 mb-6 max-w-xs">
              Turning empty luggage space into global logistics. Ship smarter, not harder.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary/20 hover:border-primary/30 transition-all group"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5 text-zinc-400 group-hover:text-primary transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Product</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-12 pt-8 border-t border-white/5">
          <div className="flex flex-wrap items-center gap-6 text-sm text-zinc-500">
            <a href="mailto:hello@porta.sbs" className="flex items-center gap-2 hover:text-primary transition-colors">
              <Mail className="w-4 h-4" />
              hello@porta.sbs
            </a>
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Dhaka, Bangladesh
            </span>
            <a href="tel:+8801712345678" className="flex items-center gap-2 hover:text-primary transition-colors">
              <Phone className="w-4 h-4" />
              +880 1712-345678
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
            <p>&copy; {new Date().getFullYear()} Porta. All rights reserved.</p>
            <p className="flex items-center gap-1">
              Made with <span className="text-red-500">♥</span> for the global community
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
