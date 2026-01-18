"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState, useEffect } from "react";

import type { Salesperson } from "@/lib/types";

type NavItem = {
  label: string;
  href: string;
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

  useEffect(() => {
    fetch("/api/auth/current-user")
      .then((res) => res.json())
      .then((data) => setCurrentUser(data.user))
      .catch(() => setCurrentUser(null));
  }, []);

  const items: NavItem[] = useMemo(
    () => [
      { label: "Dashboard", href: "/" },
      { label: "Team", href: "/salespeople", bossOnly: true },
      { label: "Pins", href: "/pins" },
      { label: "New Pin", href: "/pins/new", match: (p) => p === "/pins/new" },
      { label: "Stocks", href: "/inventory" },
      { label: "Reconciliation", href: "/reconciliation" },
    ],
    []
  );

  const visibleItems = useMemo(() => {
    // Show all non-boss items immediately, filter boss items once user is loaded
    if (!currentUser) {
      return items.filter((i) => !i.bossOnly);
    }
    const boss = isBoss(currentUser);
    return items.filter((i) => !i.bossOnly || boss);
  }, [currentUser, items]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 hover:bg-white/10"
            onClick={() => setOpen(false)}
          >
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-500 text-sm font-bold text-slate-950">
              PT
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-white">PinTrack</p>
              <p className="text-xs text-slate-400">Sales · Stock · Reconciliation</p>
            </div>
          </Link>
        </div>

        <nav className="hidden items-center gap-2 md:flex">
          {visibleItems.map((item) => {
            const active = isActive(item, pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  active
                    ? "rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950"
                    : "rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200 hover:border-white/30 hover:bg-white/5"
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            aria-label="Open navigation"
            onClick={() => setOpen((v) => !v)}
            className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-200 hover:border-white/30"
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-white/10 bg-slate-950/90 md:hidden">
          <div className="mx-auto max-w-6xl px-6 py-4">
            <div className="grid gap-2">
              {visibleItems.map((item) => {
                const active = isActive(item, pathname);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={
                      active
                        ? "rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950"
                        : "rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-slate-200 hover:border-white/30"
                    }
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
