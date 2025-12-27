"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { 
  LayoutDashboard, 
  Users, 
  ShieldCheck, 
  Settings, 
  LogOut,
  Plane,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/verifications", label: "Verifications", icon: ShieldCheck },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { signOut } = useClerk();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const NavContent = () => (
    <>
      {/* Header */}
      <div className="p-6 border-b border-border">
        <Link href="/admin/dashboard" className="flex items-center gap-3" onClick={() => setIsMobileOpen(false)}>
          <div className="p-2 bg-red-600/20 rounded-lg">
            <Plane className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <span className="text-lg font-bold">Porta</span>
            <span className="text-xs text-red-400 font-mono block">ADMIN</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-600/10 transition-all w-full">
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to log out of the admin dashboard?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => signOut({ redirectUrl: "/" })}
                className="bg-red-600 hover:bg-red-700"
              >
                Logout
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border h-16 flex items-center justify-between px-4">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <div className="p-1.5 bg-red-600/20 rounded-lg">
            <Plane className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <span className="text-base font-bold">Porta</span>
            <span className="text-[10px] text-red-400 font-mono block leading-none">ADMIN</span>
          </div>
        </Link>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black/50" 
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={cn(
        "lg:hidden fixed top-16 left-0 bottom-0 z-50 w-64 bg-card border-r border-border flex flex-col transition-transform duration-300",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <NavContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 bg-card border-r border-border flex-col">
        <NavContent />
      </aside>
    </>
  );
}
