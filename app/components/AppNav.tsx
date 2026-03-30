"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Users, 
  Pin, 
  PlusCircle, 
  Package, 
  RefreshCw,
  Menu,
  X,
  Home
} from "lucide-react";

import type { Salesperson } from "@/lib/types";

type NavItem = {
  label: string;
  href: string;
  icon?: React.ReactNode;
  match?: (pathname: string) => boolean;
  bossOnly?: boolean;
};

function isActive(item: NavItem, pathname: string) {
  if (item.match) return item.match(pathname);
  if (item.href === "/") return pathname === "/";
  return pathname === item.href || pathname.startsWith(item.href + "/");
}

function isBoss(user: Salesperson | null): boolean {
  return user?.role === "BOSS";
}

export default function AppNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<Salesperson | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/current-user")
      .then((res) => res.json())
      .then((data) => {
        setCurrentUser(data.user);
        setLoading(false);
      })
      .catch(() => {
        setCurrentUser(null);
        setLoading(false);
      });
  }, []);

  const items: NavItem[] = useMemo(
    () => [
      { 
        label: "Dashboard", 
        href: "/dashboard", 
        icon: <LayoutDashboard className="w-4 h-4" />,
        match: (p) => p === "/dashboard" || p.startsWith("/dashboard/")
      },
      { 
        label: "Pins", 
        href: "/pins", 
        icon: <Pin className="w-4 h-4" />,
        match: (p) => p === "/pins" || p.startsWith("/pins/") && !p.includes("/new")
      },
      { 
        label: "New Pin", 
        href: "/pins/new", 
        icon: <PlusCircle className="w-4 h-4" />,
        match: (p) => p === "/pins/new" 
      },
      { 
        label: "Stocks", 
        href: "/inventory", 
        icon: <Package className="w-4 h-4" />,
        match: (p) => p === "/inventory" || p.startsWith("/inventory/")
      },
      { 
        label: "Team", 
        href: "/salespeople", 
        icon: <Users className="w-4 h-4" />,
        bossOnly: true 
      },
      { 
        label: "Reconciliation", 
        href: "/reconciliation", 
        icon: <RefreshCw className="w-4 h-4" />,
        match: (p) => p === "/reconciliation" || p.startsWith("/reconciliation/")
      },
    ],
    []
  );

  const visibleItems = useMemo(() => {
    // Show all non-boss items immediately, filter boss items once user is loaded
    if (loading) {
      return items.filter((i) => !i.bossOnly);
    }
    const boss = isBoss(currentUser);
    return items.filter((i) => !i.bossOnly || boss);
  }, [currentUser, items, loading]);

  // Close mobile menu when route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 py-3 sm:py-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 transition-all hover:bg-white/10 hover:scale-105"
          onClick={() => setOpen(false)}
        >
          <div className="grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-sm font-bold text-slate-950 shadow-lg">
            PT
          </div>
          <div className="leading-tight hidden sm:block">
            <p className="text-sm font-semibold text-white">PinTrack</p>
            <p className="text-xs text-slate-400">Sales · Stock · Reconciliation</p>
          </div>
          <div className="leading-tight sm:hidden">
            <p className="text-sm font-semibold text-white">PinTrack</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {visibleItems.map((item) => {
            const active = isActive(item, pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-2 transition-all duration-200 ${
                  active
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/20"
                    : "border border-white/15 text-slate-200 hover:border-white/30 hover:bg-white/5"
                } rounded-full px-3 lg:px-4 py-1.5 lg:py-2 text-sm font-medium`}
              >
                {item.icon && (
                  <span className={active ? "text-slate-950" : "text-slate-400 group-hover:text-slate-200"}>
                    {item.icon}
                  </span>
                )}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Menu Button */}
        <button
          type="button"
          aria-label={open ? "Close navigation" : "Open navigation"}
          onClick={() => setOpen(!open)}
          className="md:hidden flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-200 hover:border-white/30 transition-all"
        >
          {open ? (
            <>
              <X className="w-4 h-4" />
              <span className="text-xs">Close</span>
            </>
          ) : (
            <>
              <Menu className="w-4 h-4" />
              <span className="text-xs">Menu</span>
            </>
          )}
        </button>
      </div>

      {/* Mobile Navigation Dropdown */}
      {open && (
        <div className="border-t border-white/10 bg-slate-950/95 backdrop-blur-lg md:hidden animate-in slide-in-from-top-2 duration-200">
          <div className="mx-auto max-w-7xl px-4 py-4">
            <div className="grid gap-2">
              {visibleItems.map((item) => {
                const active = isActive(item, pathname);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 transition-all ${
                      active
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950"
                        : "border border-white/15 bg-white/5 text-slate-200 hover:border-white/30 hover:bg-white/10"
                    } rounded-xl px-4 py-3 text-sm font-medium`}
                  >
                    {item.icon && (
                      <span className={active ? "text-slate-950" : "text-slate-400"}>
                        {item.icon}
                      </span>
                    )}
                    {item.label}
                  </Link>
                );
              })}
              
              {/* User info in mobile menu */}
              {currentUser && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="px-4 py-2">
                    <p className="text-xs text-slate-400">Logged in as</p>
                    <p className="text-sm font-medium text-white">{currentUser.name}</p>
                    <p className="text-xs text-slate-400 capitalize">{currentUser.role?.toLowerCase() || "salesperson"}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}