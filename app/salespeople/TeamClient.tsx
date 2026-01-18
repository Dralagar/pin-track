"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { SalespersonProfile } from "@/lib/types";

type Props = {
  initial: SalespersonProfile[];
};

function formatCurrency(v: number) {
  return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(v);
}

export default function TeamClient({ initial }: Props) {
  const [profiles, setProfiles] = useState<SalespersonProfile[]>(initial);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/salespeople/profiles", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Failed to load profiles");
      setProfiles(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load profiles");
    } finally {
      setLoading(false);
    }
  }

  const sorted = useMemo(
    () => profiles.slice().sort((a, b) => b.todayRevenue - a.todayRevenue),
    [profiles]
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-emerald-300">PinTrack</p>
            <h1 className="mt-2 text-3xl font-semibold">Team</h1>
            <p className="mt-1 text-slate-300">Salesperson profiles, performance, and stock allocations.</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/inventory"
              className="rounded-full border border-white/20 px-5 py-2 text-sm hover:border-white/40"
            >
              Inventory
            </Link>
            <button
              onClick={refresh}
              disabled={loading}
              className="rounded-full border border-white/20 px-5 py-2 text-sm hover:border-white/40 disabled:opacity-60"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </header>

        {error ? <p className="text-sm text-rose-300">{error}</p> : null}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sorted.map((profile) => (
            <Link
              key={profile.salesperson.id}
              href={`/salespeople/${profile.salesperson.id}`}
              className="group rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-emerald-400 hover:bg-white/10"
            >
              <div className="flex items-center gap-4">
                <div className="grid h-14 w-14 place-items-center rounded-xl bg-emerald-500 text-xl font-bold text-slate-950">
                  {profile.salesperson.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{profile.salesperson.name}</p>
                  <p className="text-sm text-slate-300">
                    {profile.salesperson.role === "BOSS" 
                      ? "Boss" 
                      : profile.salesperson.role === "NIGHT_SHIFT"
                      ? `Night Shift${profile.salesperson.nightPickTime ? ` (${profile.salesperson.nightPickTime})` : ""}`
                      : "Salesperson"}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Today</span>
                  <span className="font-semibold">{profile.todayPins} pins</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Revenue</span>
                  <span className="font-semibold text-emerald-300">{formatCurrency(profile.todayRevenue)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Commission</span>
                  <span className="font-semibold">{formatCurrency(profile.commissionEarned)}</span>
                </div>
                {profile.creditOutstanding > 0 ? (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">Credit</span>
                    <span className="font-semibold text-rose-300">{formatCurrency(profile.creditOutstanding)}</span>
                  </div>
                ) : null}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">View profile</p>
                <span className="text-emerald-300 transition-transform group-hover:translate-x-1">→</span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
