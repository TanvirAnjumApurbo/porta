"use client";

import { useState } from "react";
import Link from "next/link";
import { Plane, Menu, X } from "lucide-react";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 border-b border-white/10 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-2 bg-primary/20 rounded-lg group-hover:bg-primary/30 transition-colors">
            <Plane className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
          <span className="text-lg sm:text-xl font-bold tracking-tight">Porta</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/requests" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">
            Browse Requests
          </Link>
          <Link href="/travelers" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">
            Browse Travelers
          </Link>
        </div>

        {/* Auth Buttons & Mobile Menu Toggle */}
        <div className="flex items-center gap-2 sm:gap-4">
          <SignedOut>
            <SignInButton mode="modal" forceRedirectUrl="/auth-callback">
              <button className="text-sm font-medium hover:text-primary transition-colors hidden sm:block">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal" forceRedirectUrl="/auth-callback">
              <button className="px-3 sm:px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-semibold rounded-full transition-all shadow-[0_0_15px_-3px_var(--primary)] hover:shadow-[0_0_20px_-3px_var(--primary)]">
                Get Started
              </button>
            </SignUpButton>
          </SignedOut>
          
          <SignedIn>
            <Link href="/dashboard" className="text-sm font-medium mr-2 sm:mr-4 hover:text-primary hidden sm:block">
              Dashboard
            </Link>
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8 sm:w-10 sm:h-10 ring-2 ring-primary/20"
                }
              }}
            />
          </SignedIn>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            aria-label="Toggle menu"
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={cn(
        "md:hidden absolute top-16 left-0 right-0 bg-[var(--background)] border-b border-white/10 transition-all duration-300 overflow-hidden",
        isMobileOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="px-4 py-4 space-y-2">
          <Link 
            href="/requests" 
            className="block px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
            onClick={() => setIsMobileOpen(false)}
          >
            Browse Requests
          </Link>
          <Link 
            href="/travelers" 
            className="block px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
            onClick={() => setIsMobileOpen(false)}
          >
            Browse Travelers
          </Link>
          <SignedIn>
            <Link 
              href="/dashboard" 
              className="block px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-white hover:bg-white/5 transition-colors sm:hidden"
              onClick={() => setIsMobileOpen(false)}
            >
              Dashboard
            </Link>
          </SignedIn>
          <SignedOut>
            <div className="sm:hidden pt-2 border-t border-white/10">
              <SignInButton mode="modal" forceRedirectUrl="/auth-callback">
                <button 
                  className="block w-full px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-white hover:bg-white/5 transition-colors text-left"
                  onClick={() => setIsMobileOpen(false)}
                >
                  Sign In
                </button>
              </SignInButton>
            </div>
          </SignedOut>
        </div>
      </div>
    </nav>
  );
}
