import Link from "next/link";
import { Plane, LogIn } from "lucide-react";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 border-b border-white/10 glass">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-2 bg-primary/20 rounded-lg group-hover:bg-primary/30 transition-colors">
            <Plane className="w-6 h-6 text-primary" />
          </div>
          <span className="text-xl font-bold tracking-tight">Porta</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/requests" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">
            Browse Requests
          </Link>
          <Link href="/search" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">
            Find Travelers
          </Link>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-4">
          <SignedOut>
            <SignInButton mode="modal" forceRedirectUrl="/auth-callback">
              <button className="text-sm font-medium hover:text-primary transition-colors">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal" forceRedirectUrl="/auth-callback">
              <button className="px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-semibold rounded-full transition-all shadow-[0_0_15px_-3px_var(--primary)] hover:shadow-[0_0_20px_-3px_var(--primary)]">
                Get Started
              </button>
            </SignUpButton>
          </SignedOut>
          
          <SignedIn>
            <Link href="/dashboard" className="text-sm font-medium mr-4 hover:text-primary">
              Dashboard
            </Link>
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10 ring-2 ring-primary/20"
                }
              }}
            />
          </SignedIn>
        </div>
      </div>
    </nav>
  );
}
