"use client";

import { useState } from "react";
import Link from "next/link";
import { Plane, Menu, X, MessageSquare, Package, Users, User } from "lucide-react";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/components/notifications/notification-bell";

import { useChatClient } from "@/components/chat/chat-provider";

export function Navbar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { unreadCount } = useChatClient();
  const { user } = useUser();

  return (
    <nav className="fixed top-0 left-0 w-full z-50 border-b border-white/10 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative w-10 h-10 sm:w-12 sm:h-12 group-hover:scale-110 transition-transform duration-300">
            <img 
              src="/icon.svg" 
              alt="porta" 
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-xl sm:text-2xl font-bold tracking-tight font-[family-name:var(--font-inter)]">
            porta
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/travelers" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            Travelers
          </Link>
          <SignedIn>
            <Link href="/requests" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors flex items-center gap-1.5">
              <Package className="w-4 h-4" />
              Orders & Deliveries
            </Link>
            <Link href="/messages" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors flex items-center gap-1.5 relative">
              <MessageSquare className="w-4 h-4" />
              Messages
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-3 min-w-[18px] h-[18px] bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white px-1 border border-[var(--background)]">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>
          </SignedIn>
        </div>

        {/* Auth Buttons & Mobile Menu Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
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
            {/* Profile Button */}
            {user && (
              <Link 
                href={`/profile/${user.id}`}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-muted-foreground hover:text-white"
                title="My Profile"
              >
                <User className="w-5 h-5" />
              </Link>
            )}

            {/* Notification Bell */}
            <NotificationBell />
            
            {/* User Button */}
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8 sm:w-9 sm:h-9 ring-2 ring-primary/20"
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
        isMobileOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="px-4 py-4 space-y-2">
          <Link
            href="/travelers"
            className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
            onClick={() => setIsMobileOpen(false)}
          >
            <Users className="w-4 h-4" />
            Browse Travelers
          </Link>
          <SignedIn>
            <Link
              href="/requests"
              className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
              onClick={() => setIsMobileOpen(false)}
            >
              <Package className="w-4 h-4" />
              Orders & Deliveries
            </Link>
            <Link
              href="/messages"
              className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-white hover:bg-white/5 transition-colors justify-between"
              onClick={() => setIsMobileOpen(false)}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Messages
              </div>
              {unreadCount > 0 && (
                <span className="min-w-[18px] h-[18px] bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white px-1">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>
            <Link
              href="/notifications"
              className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
              onClick={() => setIsMobileOpen(false)}
            >
              Notifications
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
              onClick={() => setIsMobileOpen(false)}
            >
              Dashboard
            </Link>
            {user && (
              <Link
                href={`/profile/${user.id}`}
                className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
                onClick={() => setIsMobileOpen(false)}
              >
                <User className="w-4 h-4" />
                My Profile
              </Link>
            )}
          </SignedIn>
          <SignedOut>
            <div className="pt-2 border-t border-white/10">
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
